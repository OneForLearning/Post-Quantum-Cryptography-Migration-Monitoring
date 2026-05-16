from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

from veille_pqc.models import Item, SourceConfig


SENIORITY_PATTERNS = re.compile(r"\b(senior|lead|principal|staff|director|junior|intern|associate)\b", re.I)


@retry(stop=stop_after_attempt(3), wait=wait_fixed(2), retry=retry_if_exception_type(Exception))
def _fetch(url: str) -> dict[str, Any]:
    with httpx.Client(timeout=15) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.json()


def _detect_seniority(title: str) -> str:
    match = SENIORITY_PATTERNS.search(title)
    return match.group(1).lower() if match else ""


def _is_remote(location: str) -> bool:
    return "remote" in location.lower()


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text)


def collect(source: SourceConfig) -> list[Item]:
    items = []
    for token in source.tokens:
        try:
            url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true"
            data = _fetch(url)
            jobs = data.get("jobs", [])

            for job in jobs:
                location = job.get("location", {})
                location_name = location.get("name", "") if isinstance(location, dict) else str(location)

                if not _is_remote(location_name):
                    continue

                title = job.get("title", "")
                if not title:
                    continue

                if source.include_patterns and not any(pattern.lower() in title.lower() for pattern in source.include_patterns):
                    continue

                seniority = _detect_seniority(title)
                summary = _strip_html(job.get("content", ""))[:500]

                items.append(
                    Item(
                        source_name=source.name,
                        title=title,
                        url=job.get("absolute_url", ""),
                        summary=summary,
                        published=datetime.fromisoformat(job.get("updated_at", "").replace("Z", "+00:00")) if job.get("updated_at") else datetime.now(timezone.utc),
                        tags=source.tags.copy(),
                        content_type="job",
                        language=source.language,
                        raw={"company": token, "location": location_name, "seniority": seniority},
                    )
                )

                if len(items) >= source.max_items:
                    break

        except Exception:
            continue

    return items[: source.max_items]
