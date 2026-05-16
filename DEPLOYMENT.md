# Guide de déploiement — veille-pqc v0.4.0

## Architecture

```
GitHub Actions workflow (daily) :
├─ Collecte (veille-pqc run)
├─ Rapports HTML/CSV/MD (publish-bundle)
├─ JSON statique (export-static-json → data.json)
├─ Build React frontend (npm run build)
├─ Upload à GitHub Pages
└─ Email (optionnel)

GitHub Pages publie :
├─ index.html (rapport HTML classique)
├─ veille_pqc.csv
├─ veille_pqc.md
├─ data.json (pour le frontend React)
└─ app/ (frontend React précompilé)
```

## Prérequis

- Python 3.11+
- Node.js 18+ (pour le frontend)
- Compte GitHub + repository

## Installation locale (développement)

### 1. Backend Python

```bash
# Clone & install
git clone <repo>
cd veillePQC
python -m venv .venv
source .venv/bin/activate  # ou . .venv\Scripts\activate sur Windows
pip install -e .
```

### 2. Frontend Node.js

```bash
cd frontend
npm install
```

### 3. Tester la collecte

```bash
veille-pqc run
# Vérifier reports/veille_pqc.md et data/veille_pqc.db
```

### 4. Tester le frontend (mode API)

Terminal 1 : lancez l'API
```bash
veille-pqc serve --port 8000
```

Terminal 2 : lancez le dev server
```bash
cd frontend
npm run dev
# http://localhost:5173 (proxy /api vers port 8000)
```

## Déploiement sur GitHub Pages

### Étape 1 : Préparer le repository

Sur GitHub :
- Créer un repository public (ex: `ccsArtifacts/veille-pqc`)
- Pousser ce projet dedans
- Aller dans **Settings → Pages**
- Source : choisir **GitHub Actions**
- Sauvegarder

### Étape 2 : Variables d'environnement (optionnel)

Si tu veux les emails automatiques, ajouter les **Repository Secrets** :

```
VEILLE_SMTP_HOST = smtp.gmail.com
VEILLE_SMTP_PORT = 587
VEILLE_SMTP_USER = ton-email@gmail.com
VEILLE_SMTP_PASSWORD = App Password Google
VEILLE_SMTP_FROM = ton-email@gmail.com
VEILLE_SMTP_STARTTLS = true
VEILLE_MAIL_TO = ton-email@gmail.com
```

Et la **Repository Variable** :
```
VEILLE_MAIL_ENABLED = true
```

### Étape 3 : Lancer le workflow

Première fois, déclencher manuellement :
- Aller dans **Actions**
- Sélectionner **Daily PQC Watch**
- Cliquer **Run workflow**

Le workflow :
1. Collecte les sources
2. Génère rapports + JSON statique
3. Build le frontend React
4. Déploie sur GitHub Pages
5. Envoie un email (si configuré)

**URL publique** : `https://<username>.github.io/<repo>/` ou `https://<username>.github.io/<repo>/app/` pour le React

### Étape 4 : Vérifier

```
https://ccsartifacts.github.io/veille-pqc/
├─ index.html (rapport HTML classique)
├─ app/index.html (frontend React)
└─ data.json (données statiques)
```

---

## Personnalisation

### Ajouter/retirer des sources

Éditer `config/sources.yaml` :
```yaml
sources:
  - name: Ma nouvelle source
    type: rss
    url: https://...
    max_items: 20
    enabled: true
    language: fr
    tags: [official, standards]
```

Puis pousser le commit → workflow relance automatiquement.

### Ajuster les scores/keywords

Dans `config/sources.yaml` section `keywords` :
```yaml
keywords:
  high_priority:
    - mon-keyword-important
  medium_priority:
    - keyword-moins-important
```

Dans `src/veille_pqc/scoring.py` :
```python
domain_boosts = {
    "my-domain.com": 9,  # augmente le score
    ...
}
```

### Changer la couleur des badges (frontend)

Dans `frontend/src/components/ItemRow.tsx` :
```tsx
const priorityColors: Record<string, { ... }> = {
  critical: { badge: 'bg-red-200 text-red-900' },
  // ... personnalise les couleurs Tailwind
}
```

---

## Architecture frontend

### Mode API (local)

Frontend fait requêtes vers `http://localhost:8000/api/items`, `http://localhost:8000/api/stats`.

**Avantages** : requêtes dynamiques, pagination côté serveur, filtres puissants.
**Inconvénients** : nécessite backend en production.

### Mode statique (GitHub Pages)

Frontend lit `data.json` généré par `veille-pqc export-static-json`.

**Avantages** : zéro serveur, déploiement sur GitHub Pages pur, rapide.
**Inconvénients** : pagination côté client, tri local, données regenerated 1x/jour.

Le frontend détecte automatiquement le mode selon l'environnement.

---

## Dépannage

### Les sources ne collectent rien

```bash
# Tester une source RSS
curl https://cyber.gouv.fr/flux-rss/actualites.xml | head -20

# Activer le debug
python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
veille-pqc run
```

### Frontend ne démarre pas

```bash
cd frontend
npm install  # refaire l'install des dépendances
npm run dev
```

### Pages GitHub ne met pas à jour

- Vérifier que **Source** est bien **GitHub Actions**
- Vérifier les **Deployments** dans l'onglet **Actions**
- Vider le cache du navigateur (Ctrl+Shift+R)

### Email ne s'envoie pas

- Vérifier que `VEILLE_MAIL_ENABLED = true` (Settings → Variables)
- Vérifier que tous les **VEILLE_SMTP_*** secrets sont présents
- Utiliser un **App Password** Google (pas le mot de passe du compte)

---

## Commits & Push

Tout changement en `main` déclenche le workflow CI (smoke test).

Pour que le déploiement quotidien fonctionne :

```bash
git add .
git commit -m "feat: add new sources and React frontend"
git push origin main
```

---

## Versions

| Version | Date | Changements |
|---------|------|------------|
| 0.3.0 | Avant | CLI + Streamlit + HTML Reports |
| **0.4.0** | 2026-05-16 | **+ 8 sources, + FastAPI, + React frontend** |

---

## Support

- **Issues de collecte** : Vérifier `config/sources.yaml` et `src/veille_pqc/collectors/`
- **Issues de frontend** : Vérifier `frontend/src/` et npm logs
- **Issues GitHub Actions** : Vérifier les **Logs** dans l'onglet **Actions**
- **Issues de déploiement** : Vérifier les **Environments** et les permissions **Secrets**
