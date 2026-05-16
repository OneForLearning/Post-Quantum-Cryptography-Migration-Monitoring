from __future__ import annotations

import logging
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import feedparser
from tenacity import retry, stop_after_attempt, wait_fixed

from veille_pqc.models import Item, SourceConfig

logger = logging.getLogger(__name__)
MIN_DATE = datetime(2025, 1, 1, tzinfo=timezone.utc)


def _parse_date(entry: dict) -> datetime | None:
    for field in ("published", "updated"):
        if value := entry.get(field):
            try:
                dt = parsedate_to_datetime(value)
                return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
            except Exception:
                continue
    return None


@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def _fetch_feed(url: str):
    return feedparser.parse(url)


def collect(source: SourceConfig) -> list[Item]:
    try:
        feed = _fetch_feed(str(source.url))
    except Exception as e:
        logger.warning("Erreur lors de la collecte RSS de '%s': %s", source.name, e)
        return []

    items: list[Item] = []
    for entry in feed.entries[: source.max_items * 3]:  # on surcharge pour compenser le filtre date
        published = _parse_date(entry)
        # Filtre : on ignore les articles antérieurs à janvier 2025
        if published is not None and published < MIN_DATE:
            continue
        items.append(
            Item(
                source_name=source.name,
                title=entry.get("title", "(sans titre)"),
                url=entry.get("link", str(source.url)),
                summary=entry.get("summary", "") or entry.get("description", ""),
                published=published,
                tags=source.tags.copy(),
                language=source.language,
                content_type=source.content_type,
                raw={"feed_source": feed.feed.get("title", "")},
            )
        )
        if len(items) >= source.max_items:
            break
    return items
