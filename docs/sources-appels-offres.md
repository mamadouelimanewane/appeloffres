# Sources d'appels d'offres et de projets d'appels d'offres — Sénégal

Recherche du 2026-10-05 (recherche web ; contenus à vérifier sur les sites eux-mêmes avant tout usage).

## 1. Sources officielles et régulateurs (priorité 1)

| Source | Ce qu'on y trouve | Remarque |
|---|---|---|
| [marchespublics.sn](https://www.marchespublics.sn/) (DCMP, ministère des Finances) | Appels d'offres, plans de passation, avis généraux, avis d'attribution. Environ 899 appels, 797 plans, 183 avis généraux et 714 attributions à la date de la recherche. | Source centrale. Pas de fichier robots.txt exploitable. |
| [arcop.sn](https://arcop.sn/) (ARCOP, ex-ARMP) | Régulation, décisions, revues de conformité, avis généraux de passation, dossiers types. | L'ARMP est devenue ARCOP. L'ancien site [armp.sn](http://www.armp.sn) existe encore. robots.txt permissif (sauf zones techniques). |
| [achatspublics.sn](https://www.achatspublics.sn/) (plateforme APPEL) | Portail officiel de dématérialisation (phase pilote selon la presse). | À suivre : il peut devenir LA source unique. robots.txt permissif. |
| [marches.senegalpme.sn](https://marches.senegalpme.sn/appels-doffres/) | Appels d'offres relayés pour les PME. | Cible et public identiques aux nôtres. |

### Structure technique du portail DCMP (relevée sur une copie archivée)

- Site Joomla ancien, pages en windows-1252, sans API.
- Listes : `index.php?option=com_loffres&task=ltype&id=1..4&Itemid=104` : **une seule page contient toute la liste** (référence, libellé, publié le, date limite, lien de fiche). Environ 1 358 à 1 976 avis par type.
- Fiche : `...&task=txt&key=<n>&Itemid=104` (texte de l'avis ; structure à valider en direct).
- Autres modules : `com_attribution` (attributions), `com_plan` (plans par autorité et par année), `com_avisgeneral`, `com_blacklist` (liste rouge), `com_documents`.
- Constats : ~7 % de dates incohérentes dans la source (signalées par `anomalie`) ; une copie de 2024 contenait des liens de spam cachés → toujours nettoyer le contenu collecté.
- Outil : `npm run collecte:dcmp` (voir `scripts/collecte-dcmp.ts`). État au 2026-10-05 : le portail officiel refusait les connexions (testé depuis ce poste et depuis un serveur externe) ; le circuit a été validé sur la copie archivée (6 931 avis jusqu'en 2024).

### Sources déjà collectées (`npm run collecte`)

| Source | État | Remarque |
|---|---|---|
| Senelec | lu en direct (20 avis) | tableau unique avec liens PDF |
| AGEROUTE | lu en direct (267 avis) | 3 rubriques : travaux, fournitures, manifestations d'intérêt ; pagination éventuelle à vérifier |
| Port Autonome de Dakar | lu en direct (14 avis) | le pare-feu rejette les identifiants de navigateur trop chargés : utiliser `SoumissionPME-collecte/0.1` |
| achatspublics.sn (APPEL) | **liste réservée aux comptes fournisseurs** (API répond 401) | pas de contournement. Référentiels, avis généraux et contenus sont publics ; les appels d'offres exigent un compte. Piste produit : chaque PME connecte son propre compte. |
| marchespublics.sn (DCMP) | portail injoignable le 2026-10-05 | collecteur prêt (`npm run collecte:dcmp`), validé sur archive |

## 2. Projets d'appels d'offres (anticipation)

### Où trouver les plans de passation (PPM) — recherche du 2026-10-05

| Où | Contenu | État |
|---|---|---|
| DCMP, rubrique « Plans de passation » (`com_plan`) | Plans par catégorie d'autorité (État, collectivités, établissements, sociétés nationales, agences…), par année et par version, avec le détail des réalisations. Au dernier relevé archivé : 53 autorités centrales, 535 collectivités, 118 établissements, 37 sociétés nationales, 39 agences… | Portail injoignable ; ~1 946 pages de détail archivées (téléchargement en cours) |
| Sites des autorités | Ex. **Senelec** : [PPM 2026 version 2, validé le 13/03/2026](https://www.senelec.sn/media/marches/documents/PPM_SENELEC_2026_VERSION_2_VALIDE_LE_13_03_2026.pdf), PDF texte de 312 réalisations (référence, objet, type, financement, mode de passation, dates de lancement / attribution / démarrage / achèvement, retards). **AGEROUTE** publie une page [avis général de passation](https://ageroute.sn/avis-general-de-passations-de-marche/). | Lisible dès maintenant |
| Bailleurs | Banque mondiale : plans de passation par projet (PDF publics sur documents.worldbank.org, ex. projet santé P182029, plan de mars 2026 à septembre 2027) ; STEP. | Public, à intégrer |
| Plateforme APPEL (achatspublics.sn) | Les plans y sont saisis (l'export de Senelec en provient), mais l'API répond 401 sans compte. | Réservé aux comptes |
| Marchés du Sénégal (concurrent) | Reprend 59 PPM, 160 avis généraux et 33 640 avis du portail DCMP. | Ne pas aspirer ; la source est la DCMP |

Valeur produit : le PPM annonce 2 à 12 mois à l'avance quel marché sera lancé, par quelle procédure, avec quelle date, ce qu'aucune alerte sur appels d'offres ne donne. C'est un vrai différenciateur « préparez-vous avant l'avis ».

- **Plans de passation des marchés** (publiés sur marchespublics.sn) : listent les marchés prévus par chaque autorité contractante, donc avant l'avis officiel.
- **Avis généraux de passation (AGPM)** : à publier chaque année avant le 15 janvier pour les marchés à appel d'offres ouvert ; annoncent la nature des travaux, fournitures et services à venir.
- **Avis à manifestation d'intérêt** (consultants) : voir les bailleurs ci-dessous.

C'est la meilleure piste pour une fonction « prévenir la PME 2 à 6 mois avant ».

## 3. Autorités contractantes et entreprises publiques

Port Autonome de Dakar ([portdakar.sn](https://www.portdakar.sn/fr/opportunite-daffaire/appels-d-offres)), AGEROUTE ([ageroute.sn](https://ageroute.sn/avis-dappel-doffres-de-travaux/)), ONAS ([onas.sn](https://onas.sn)), SONES ([sones.sn](http://sones.sn/)), SENELEC ([senelec.sn](https://www.senelec.sn/marches/passation/?tab=appels)), ADM ([adm.sn](https://www.adm.sn)), Agropole ([agropole.sn](https://agropole.sn/appels-doffres/)). À compléter : AIBD, Sonatel, SENUM, ANSD, ministères, communes et agences.

## 4. Bailleurs et organisations internationales

- Banque mondiale : [STEP / opportunités](https://projects.banquemondiale.org/fr/projects-operations/opportunities), filtrable par pays.
- BAD : [avis d'appel à manifestation d'intérêt](https://www.afdb.org/fr/documents/project-related-procurement/procurement-notices/request-for-expression-of-interest).
- Nations Unies : UNGM (non vérifié dans cette recherche), [UNCDF](https://www.uncdf.org/fr/procurement), PNUD.
- À ajouter : AFD, Union européenne, BOAD, BID.

## 5. Presse et agrégateurs

- Presse : [Le Soleil](https://lesoleil.sn/marche-public/avis-dappel-doffres/) (les avis légaux y sont obligatoires), Sud Quotidien.
- Agrégateurs : [Marchés du Sénégal](https://marchesdusenegal.com/), [SenOffre](https://senoffre.com/), [Pi Business Info](https://www.pibusinessinfo.com/avis-dappels-doffres/), [Afritenders](https://afritenders.com/tenders/pays/senegal), [GlobalTenders](https://www.globaltenders.com/government-tenders-senegal).

## 6. Textes de référence à intégrer au produit

- [Code des marchés publics 2022](https://www.droit-afrique.com/uploads/Senegal-Code-2022-marches-publics.pdf)
- [Dossiers types ARMP](http://www.armp.sn/index.php?option=com_content&view=article&id=917&Itemid=947) : base idéale pour vérifier nos listes de pièces.
- NINEA : [e-NINEA](https://e-ninea.ansd.sn/).

## 7. Constats stratégiques

1. **Concurrence directe sur la veille** : Marchés du Sénégal annonce plus de 34 000 marchés, plus de 50 sources, des alertes et un compte gratuit. Une veille seule ne suffit pas à justifier un abonnement. Notre valeur doit être l'aide au dossier : pièces, conformité, mémoire technique, suivi.
2. **Plateforme APPEL** : si la soumission devient électronique, un produit d'accompagnement des PME sur cette plateforme sera très demandé.
3. **« RNP »** : je n'ai trouvé aucun registre de ce nom. À préciser avec vous (registre des prestataires ? autre sigle ?).
4. **Collecte** : lire les pages publiques est techniquement possible, mais les conditions d'utilisation de chaque site doivent être lues, et l'idéal est un accord écrit avec la DCMP/ARCOP (partenariat plutôt que collecte sauvage).
