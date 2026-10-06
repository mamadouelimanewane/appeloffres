# Collecteur assisté par IA

## Ce qu'il fait

Chaque matin, après la collecte, `scripts/enrichir-ia.ts` ouvre le document de chaque **nouvel** avis (page web ou PDF), en extrait le texte et le fait lire par une IA, qui renvoie : date et heure limites, lieu de dépôt, montant estimé, garantie de soumission, pièces exigées, résumé en deux phrases, et si le document est bien un avis.

Garde-fous (`src/lib/ia/extraction.ts`, testés) :
- une **date** ou un **montant** n'est retenu que s'il figure dans le texte de l'avis (sinon : vide) ;
- les données de l'IA **complètent** la source, sans jamais écraser une information collectée ;
- un avis n'est **jamais envoyé deux fois** (cache `data/ia/cache.json`) ;
- **plafond** de 40 avis par jour ; seules les sources sans données structurées sont lues (pas APPEL, ONU, Banque mondiale) ;
- seul le **texte public des avis** est envoyé, jamais les fiches des entreprises clientes ;
- sur le site, l'encadré « Ce que dit l'avis » porte la mention « Lu par IA » et renvoie à l'avis officiel.

Sans clé, l'étape est simplement sautée.

## Mettre la clé DeepSeek (à faire par vous)

1. Créez un compte sur [platform.deepseek.com](https://platform.deepseek.com) (offre de bienvenue : jetons gratuits pendant 30 jours, sans carte bancaire selon les informations publiées).
2. Menu **API Keys** → **Create new API key**. Copiez la clé (elle ne s'affiche qu'une fois). **Ne la partagez avec personne, ni dans une conversation.**
3. Sur GitHub, dépôt `appeloffres` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** :
   - Name : `DEEPSEEK_API_KEY`
   - Secret : la clé.
4. C'est tout : la collecte du lendemain matin lira les avis avec DeepSeek. Pour tester tout de suite : onglet **Actions** → « Collecte quotidienne » → **Run workflow**.

Pour l'utiliser sur votre ordinateur : copiez `.env.example` en `.env.local`, collez la clé après `DEEPSEEK_API_KEY=`, puis `npm run ia`. Le fichier `.env.local` n'est jamais envoyé sur GitHub.

## Passer à Claude plus tard

Ajoutez le secret `ANTHROPIC_API_KEY` (clé créée sur console.anthropic.com), puis, dans **Settings → Secrets and variables → Actions → Variables**, la variable `IA_FOURNISSEUR` = `claude` (et facultativement `IA_MODELE`, par ex. `claude-sonnet-5-5` pour un coût réduit ; par défaut `claude-opus-5-5`). Aucune ligne de code à changer.

## Tester sans clé

`IA_FOURNISSEUR=simulation` : aucun appel extérieur, la chaîne complète est exercée (téléchargement, PDF, contrôle, cache). **Effacer `data/ia/cache.json` ensuite** pour ne pas publier de lectures simulées.
