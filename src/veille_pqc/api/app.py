from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class ItemResponse(BaseModel):
    source_name: str
    title: str
    url: str
    summary: str
    published: str | None
    category: str
    sector_tags: list[str]
    priority: str
    first_seen: str | None
    language: str
    matched_keywords: list[str]
    score: int


class StatsResponse(BaseModel):
    total: int
    critical: int
    high: int
    medium: int
    low: int
    categories: dict[str, int]
    sectors: dict[str, int]
    languages: dict[str, int]


def create_app(db_path: str = "data/veille_pqc.db") -> FastAPI:
    app = FastAPI(title="Veille PQC API", version="0.4.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def get_db():
        db = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row
        return db

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/items", response_model=dict)
    def get_items(
        sort: str = Query("score", regex="^(score|date|trending)$"),
        order: str = Query("desc", regex="^(asc|desc)$"),
        category: str | None = Query(None),
        sector: str | None = Query(None),
        priority: str | None = Query(None),
        search: str | None = Query(None),
        page: int = Query(1, ge=1),
        per_page: int = Query(25, ge=1, le=100),
    ):
        db = get_db()
        query = "SELECT * FROM items WHERE 1=1"
        params = []

        if category:
            query += " AND category = ?"
            params.append(category)

        if sector:
            query += " AND sector_tags_json LIKE ?"
            params.append(f'%"{sector}"%')

        if priority:
            query += " AND priority = ?"
            params.append(priority)

        if search:
            query += " AND (title LIKE ? OR summary LIKE ? OR matched_keywords_json LIKE ?)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])

        # Tri
        if sort == "trending":
            threshold_date = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
            query += f" AND first_seen >= ? AND score >= 20"
            params.append(threshold_date)
            query += " ORDER BY score DESC, published DESC"
        elif sort == "date":
            query += " ORDER BY published " + ("ASC" if order == "asc" else "DESC")
        else:  # score (défaut)
            query += " ORDER BY score " + ("ASC" if order == "asc" else "DESC") + ", published DESC"

        # Pagination
        offset = (page - 1) * per_page
        query += f" LIMIT {per_page} OFFSET {offset}"

        cursor = db.execute(query, params)
        rows = cursor.fetchall()

        items = []
        for row in rows:
            items.append({
                "source_name": row["source_name"],
                "title": row["title"],
                "url": row["url"],
                "summary": row["summary"],
                "published": row["published"],
                "category": row["category"],
                "sector_tags": json.loads(row["sector_tags_json"]),
                "priority": row["priority"],
                "first_seen": row["first_seen"],
                "language": row["language"],
                "matched_keywords": json.loads(row["matched_keywords_json"]),
                "score": row["score"],
            })

        # Compte total pour pagination
        count_query = "SELECT COUNT(*) as cnt FROM items WHERE 1=1"
        count_params = []
        if category:
            count_query += " AND category = ?"
            count_params.append(category)
        if sector:
            count_query += " AND sector_tags_json LIKE ?"
            count_params.append(f'%"{sector}"%')
        if priority:
            count_query += " AND priority = ?"
            count_params.append(priority)
        if search:
            count_query += " AND (title LIKE ? OR summary LIKE ? OR matched_keywords_json LIKE ?)"
            search_term = f"%{search}%"
            count_params.extend([search_term, search_term, search_term])

        count = db.execute(count_query, count_params).fetchone()["cnt"]
        db.close()

        return {
            "items": items,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": count,
                "pages": (count + per_page - 1) // per_page,
            },
        }

    @app.get("/api/stats", response_model=StatsResponse)
    def get_stats():
        db = get_db()

        # Totaux par priorité
        cursor = db.execute("""
            SELECT priority, COUNT(*) as cnt
            FROM items
            GROUP BY priority
        """)
        priority_counts = {row["priority"]: row["cnt"] for row in cursor.fetchall()}

        total = db.execute("SELECT COUNT(*) as cnt FROM items").fetchone()["cnt"]
        critical = priority_counts.get("critical", 0)
        high = priority_counts.get("high", 0)
        medium = priority_counts.get("medium", 0)
        low = priority_counts.get("low", 0)

        # Par catégorie
        cursor = db.execute("""
            SELECT category, COUNT(*) as cnt
            FROM items
            GROUP BY category
            ORDER BY cnt DESC
        """)
        categories = {row["category"]: row["cnt"] for row in cursor.fetchall()}

        # Par secteur (déserialize JSON)
        cursor = db.execute("SELECT sector_tags_json FROM items")
        sector_count = {}
        for row in cursor.fetchall():
            sectors = json.loads(row["sector_tags_json"]) or []
            for sector in sectors:
                sector_count[sector] = sector_count.get(sector, 0) + 1

        # Par langue
        cursor = db.execute("""
            SELECT language, COUNT(*) as cnt
            FROM items
            GROUP BY language
            ORDER BY cnt DESC
        """)
        languages = {row["language"]: row["cnt"] for row in cursor.fetchall()}

        db.close()

        return StatsResponse(
            total=total,
            critical=critical,
            high=high,
            medium=medium,
            low=low,
            categories=categories,
            sectors=sector_count,
            languages=languages,
        )

    @app.get("/api/sources", response_model=dict)
    def get_sources():
        """Liste des sources configurées."""
        from veille_pqc.config_loader import load_config
        cfg = load_config("config/sources.yaml")
        return {
            "sources": [
                {
                    "name": src.name,
                    "type": src.type,
                    "url": str(src.url),
                    "enabled": src.enabled,
                    "language": src.language,
                    "tags": src.tags,
                }
                for src in cfg.sources
            ]
        }

    return app


if __name__ == "__main__":
    import uvicorn
    app = create_app()
    uvicorn.run(app, host="0.0.0.0", port=8000)
