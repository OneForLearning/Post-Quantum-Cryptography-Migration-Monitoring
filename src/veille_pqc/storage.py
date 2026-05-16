from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from veille_pqc.models import Item


SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
    url TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    published TEXT,
    tags_json TEXT,
    score INTEGER,
    matched_keywords_json TEXT,
    category TEXT,
    sector_tags_json TEXT,
    raw_json TEXT
);
"""


def _ensure_schema(conn: sqlite3.Connection) -> None:
    conn.execute(SCHEMA)
    columns = {row[1] for row in conn.execute("PRAGMA table_info(items)")}
    if "category" not in columns:
        conn.execute("ALTER TABLE items ADD COLUMN category TEXT DEFAULT 'other'")
    if "sector_tags_json" not in columns:
        conn.execute("ALTER TABLE items ADD COLUMN sector_tags_json TEXT DEFAULT '[]'")
    if "priority" not in columns:
        conn.execute("ALTER TABLE items ADD COLUMN priority TEXT DEFAULT ''")
    if "first_seen" not in columns:
        conn.execute("ALTER TABLE items ADD COLUMN first_seen TEXT")
    if "language" not in columns:
        conn.execute("ALTER TABLE items ADD COLUMN language TEXT DEFAULT 'en'")
    if "content_type" not in columns:
        conn.execute("ALTER TABLE items ADD COLUMN content_type TEXT DEFAULT 'other'")
    conn.commit()


def open_db(db_path: str | Path) -> sqlite3.Connection:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    _ensure_schema(conn)
    return conn


def upsert_items(conn: sqlite3.Connection, items: list[Item]) -> int:
    inserted = 0
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    for item in items:
        cursor = conn.execute(
            """
            INSERT OR IGNORE INTO items (
                url, source_name, title, summary, published,
                tags_json, score, matched_keywords_json, category, sector_tags_json, raw_json,
                priority, first_seen, language, content_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item.url,
                item.source_name,
                item.title,
                item.summary,
                item.published.isoformat() if item.published else None,
                json.dumps(item.tags, ensure_ascii=False),
                item.score,
                json.dumps(item.matched_keywords, ensure_ascii=False),
                item.category,
                json.dumps(item.sector_tags, ensure_ascii=False),
                json.dumps(item.raw, ensure_ascii=False),
                item.priority,
                item.first_seen.isoformat() if item.first_seen else now.isoformat(),
                item.language,
                item.content_type,
            ),
        )
        if cursor.rowcount:
            inserted += 1
    conn.commit()
    return inserted
