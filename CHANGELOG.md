# Changelog — veille-pqc

## [0.4.0] — 2026-05-16 — Refonte complète avec interface moderne

### ✨ Nouvelles fonctionnalités

#### Sources
- **+8 sources RSS** : ANSSI (FR), BSI Press (EN), BSI Publications (EN), OQS Blog, PQShield, Thales Cybersecurity, GitHub Bouncy Castle Kotlin, IETF PQUIP
- **+4 sources Webpage** : NSA PQC Resources, ANSSI PQC Guide (FR), BSI PQC Info, NIST PQC Finalists
- Support multilingue : champ `language` sur Item et SourceConfig

#### Scoring
- Domain boosts ajoutés pour : IACR eprint (+8), ANSSI cyber.gouv.fr (+8), ANSSI ssi.gouv.fr (+8), BSI bsi.bund.de (+8)
- Nouveaux keywords : anssi, bsi, quantum-resistant, lattice-based, sntrup761, hybrid kem, tls hybrid

#### Modèle de données
- Item : +4 champs (priority, first_seen, language, content_type)
- SourceConfig : +3 champs (enabled, language, content_type)
- SQLite : +4 colonnes avec migrations automatiques

#### Backend API
- Nouveau : **FastAPI** servant `/api/items`, `/api/stats`, `/api/sources`, `/api/health`
- Tri multi-critères : score, date, trending (<48h + score≥20)
- Pagination : 25-100 items/page
- Filtrage : catégorie, secteur, priorité, recherche texte
- CORS activé pour GitHub Pages

#### Frontend
- Nouveau : **React 18 + TypeScript + Vite + Tailwind CSS**
- 3 vues de tri : Score (défaut), Date, Tendances
- Filtres : recherche libre, catégorie, secteur
- Badges colorés : critical (rouge), high (orange), medium (jaune), low (vert)
- Badge "NEW" pour items <48h
- Mode statique pour GitHub Pages (zéro backend)
- Mode API pour développement local

#### CLI
- Nouvelle commande : `veille-pqc serve` — lance l'API FastAPI
- Nouvelle commande : `veille-pqc export-static-json` — exporte JSON statique pour GitHub Pages

#### CI/CD
- GitHub Actions : ajout étapes build frontend React
- GitHub Actions : ajout étape export JSON statique
- Frontend précompilé livré dans `dist_bundle/app/`

### 🐛 Correctifs

- **HTML Stats** : casse des priorités ("HIGH" → "high") — totaux erronés corrigés
- **HTML Stats** : ajout de la carte "Critical"
- **RSS** : ajout retry wrapper (3 tentatives, 2s délai) via tenacity
- **Propagation metadata** : language et content_type transmis RSS/webpage → Item → DB

### ⚙️ Amélioration interne

- Filtrage des sources `enabled: False` dans orchestration
- Calcul de `priority` stocké dans Item (plus de recalcul)
- Logging amélioré dans RSS collector

### 📦 Dépendances

**Ajoutées** :
- fastapi >= 0.115.0
- uvicorn[standard] >= 0.32.0
- (frontend) React 18, TypeScript, Vite, Tailwind CSS

**Inchangées** :
- httpx, beautifulsoup4, feedparser, pydantic, PyYAML, rapidfuzz, tenacity, typer, python-dateutil, pandas, streamlit

### 📖 Documentation

- `IMPLEMENTATION_SUMMARY.md` — résumé complet de l'implémentation
- `DEPLOYMENT.md` — guide de déploiement sur GitHub Pages
- `frontend/README.md` — instructions frontend
- `.env.example` — template variables SMTP

### 🔄 Migration depuis 0.3.0

```bash
# Étapes recommandées :
1. pip install -e . --upgrade  # installe fastapi/uvicorn
2. veille-pqc run             # crée les nouvelles colonnes SQLite
3. cd frontend && npm install # installe dépendances React
4. git push                   # déclenche le workflow GitHub Actions
```

Aucune rupture de compatibilité. Les anciens rapports HTML restent disponibles.

### ⚠️ Limitations connues

- Mode API requiert backend FastAPI en production (GitHub Pages utilise le mode statique)
- Pagination en mode statique côté client (tous les items chargés à la fois)
- Tri "trending" basé sur `first_seen` qui n'est populée que depuis cette version

### 🚀 Prochaines étapes possibles

- Slack/Teams webhooks pour notifications de tendances
- Agrégation par domaine métier (vues sectorialisées)
- Dashboard admin pour gérer sources sans YAML
- Export PDF via API
- Caching Redis pour le backend
- Support de plus de sources (GitHub Issues, Gists, APIs spécialisées)

---

## [0.3.0] — Avant

- CLI via Typer
- Collecte RSS + webpage scraping
- Stockage SQLite
- Rapports HTML/CSV/Markdown
- Dashboard Streamlit local
- Email SMTP optionnel
- GitHub Actions CI/CD de base
- GitHub Pages pour rapport HTML statique

---

## Format

Respecte [Semantic Versioning](https://semver.org/fr/) et [Keep a Changelog](https://keepachangelog.com/fr/).
