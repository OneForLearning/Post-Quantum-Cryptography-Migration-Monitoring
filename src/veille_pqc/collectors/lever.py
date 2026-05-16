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


def _is_remote(locations: list[dict[str, str]]) -> str:
    for loc in locations:
        if isinstance(loc, dict) and "remote" in loc.get("name", "").lower():
            return loc.get("name", "")
    return ""


def collect(source: SourceConfig) -> list[Item]:
    items = []
    for token in source.tokens:
        try:
            url = f"https://api.lever.co/v0/postings/{token}?mode=json"
            data = _fetch(url)
            postings = data.get("postings", [])

            for posting in postings:
                locations = posting.get("locations", [])
                location_name = _is_remote(locations)

                if not location_name:
                    continue

                title = posting.get("text", "")
                if not title:
                    continue

                if source.include_patterns and not any(pattern.lower() in title.lower() for pattern in source.include_patterns):
                    continue

                seniority = _detect_seniority(title)
                summary = posting.get("description", "")[:500]
                created_ms = posting.get("createdAt", 0)
                published = datetime.fromtimestamp(created_ms / 1000, tz=timezone.utc) if created_ms else datetime.now(timezone.utc)

                items.append(
                    Item(
                        source_name=source.name,
                        title=title,
                        url=posting.get("hostedUrl", ""),
                        summary=summary,
                        published=published,
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
