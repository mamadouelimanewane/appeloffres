# Soumission PME

Aide aux PME sénégalaises pour répondre aux marchés publics : appels d'offres ouverts collectés sur les sites officiels, marchés à venir (plans de passation), liste des pièces à fournir, suivi des dossiers et brouillon de mémoire technique.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:3100
npm test
```

Optionnel : `ANTHROPIC_API_KEY` dans `.env.local` pour la rédaction assistée du mémoire technique (sinon, un canevas est proposé).

## Mettre à jour les données

```bash
npm run collecte                                        # Senelec, AGEROUTE, Port de Dakar, Banque mondiale → data/avis.json
npm run ppm -- <pdf ou URL> --autorite=SENELEC          # plan de passation → data/ppm/*.json
node --experimental-strip-types scripts/publier-donnees.ts   # → src/data/*.json (lu par l'application)
```

Archives du portail DCMP (Internet Archive) : `sh scripts/archive-tout.sh`, puis `scripts/analyser-archives.ts`.

Sources, structure des sites et limites : `docs/sources-appels-offres.md`.

## Règles de collecte

Une requête à la fois, pause entre les requêtes, identifiant `SoumissionPME-collecte/0.1`, aucune page protégée par un compte. L'avis officiel fait toujours foi.
