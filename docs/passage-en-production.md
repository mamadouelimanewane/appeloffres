# Passer du mode démonstration aux vrais services

Aujourd'hui (`MODE_DEMO = true` dans `src/lib/demo/base.ts`), comptes, paiements et messages WhatsApp sont **simulés** et restent dans le navigateur. Les règles métier, elles, sont définitives et testées :

| Règle | Fichier | Tests |
|---|---|---|
| Comptes, essai gratuit de 14 jours, droits par offre, prolongation après paiement | `src/lib/compte.ts` | `compte.test.ts` |
| Offres et prix | `src/lib/offres.ts` | — |
| Montants (12 mois = 10 payés), transactions confirmées une seule fois | `src/lib/paiement.ts` | `compte.test.ts` |
| Choix des avis à envoyer, rédaction du message WhatsApp | `src/lib/alertes.ts` | `compte.test.ts` |

Chaque fonction de `src/lib/demo/base.ts` a la forme de l'appel serveur qui la remplacera.

## 1. Comptes (Supabase, comme pour marchepublic)

- Tables : `comptes` (champs de `Compte`), `transactions`, `messages_envoyes`, avec RLS : chacun ne lit que ses lignes.
- Connexion : Supabase Auth par **OTP SMS** (fournisseur SMS sénégalais ou Twilio) à la place du code `123456`.
- À remplacer : `inscrire`, `demanderCode`, `seConnecter`, `seDeconnecter`, `mettreAJour`, `useCompte`.

## 2. Paiement (agrégateur type PayTech)

1. Ouvrir un compte marchand chez l'agrégateur (pièces de l'entreprise exigées) et obtenir les clés **API_KEY / API_SECRET**, à mettre dans les variables d'environnement Vercel, **jamais** dans le code.
2. Route serveur `POST /api/paiement` : crée la transaction en base (`creerTransaction`), appelle l'API de demande de paiement de l'agrégateur, renvoie l'adresse de sa page de paiement → remplace `demanderPaiement`.
3. Route serveur `POST /api/paiement/notification` (IPN) : vérifie la signature de l'agrégateur, puis `confirmer` + `appliquerPaiement` → remplace `confirmerPaiementSimule`. `confirmer` refuse une seconde confirmation : une notification reçue deux fois ne prolonge pas deux fois.
4. Supprimer la page `/paiement/[ref]` simulée (ou la garder comme page de retour « paiement en cours de vérification »).

## 3. Alertes WhatsApp (API WhatsApp Business)

1. Compte Meta Business vérifié, numéro WhatsApp dédié, **modèle de message** approuvé (les messages d'initiative de l'entreprise doivent utiliser un modèle).
2. Consentement : case à cocher explicite à l'inscription ; le mot STOP désactive `alertes.actives`.
3. Tâche quotidienne (après la collecte du workflow GitHub, ou une fonction planifiée Vercel) : pour chaque compte actif, `avisPourAlerte` puis envoi, et enregistrement dans `messages_envoyes` (c'est ce qui empêche les doublons).
4. Remplacer `envoyerWhatsAppSimule`.

## Ordre conseillé

Comptes (Supabase) → paiement → WhatsApp. Le paiement et WhatsApp demandent des démarches administratives (compte marchand, compte Meta Business) qui prennent plusieurs jours : à lancer tôt.
