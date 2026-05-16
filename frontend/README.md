# Veille PQC — Frontend React

Interface web moderne pour la surveillance de la cryptographie post-quantique.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'app s'ouvre sur http://localhost:5173 et proxy les requêtes API vers http://localhost:8000/api.

## Build

```bash
npm run build
```

Génère les fichiers statiques dans `dist/`.

## Mode statique (GitHub Pages)

Le frontend peut fonctionner en mode statique en lisant un fichier `data.json` au lieu de faire des requêtes API. Cela permet un déploiement sans backend sur GitHub Pages.

Générez le JSON avec :
```bash
veille-pqc export-static-json --out dist_bundle/data.json
```

Copiez ensuite les fichiers du build du frontend vers `dist_bundle/` et déployez sur GitHub Pages.
