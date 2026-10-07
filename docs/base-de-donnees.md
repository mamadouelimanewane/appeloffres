# Base de données Supabase — mise en route

Le site fonctionne en **deux modes**, sans changer une ligne de code :

| Variables `NEXT_PUBLIC_SUPABASE_*` | Mode | Comptes, paiements, codes promo |
|---|---|---|
| absentes | démonstration | dans le navigateur (`src/lib/demo/base.ts`) |
| présentes | **base réelle** | dans Supabase (PostgreSQL) |

Connexion des clients en mode base réelle : **lien envoyé par email** (pas de mot de passe).

## 1. Créer les tables (une fois)

Supabase → **SQL Editor** → **New query** → coller tout le fichier `supabase/schema.sql` → **Run**.
Le script peut être relancé sans danger.

## 2. Régler la connexion par email

**Authentication → URL Configuration**
- *Site URL* : `https://appeloffres.vercel.app`
- *Redirect URLs* : ajouter `https://appeloffres.vercel.app/**` et `http://localhost:3100/**`

**Authentication → Emails → Templates** — dans **Magic Link** *et* **Confirm signup**, remplacer le lien par :

```html
<h2>Votre lien de connexion Appeldoffres.sn</h2>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Se connecter</a></p>
<p>Ce lien est valable une heure et ne peut servir qu'une fois.</p>
```

Ce format permet d'ouvrir le lien sur un autre appareil que celui de la demande (ex. demande sur ordinateur, lien ouvert sur le téléphone).

**Important — envoi des emails** : le service d'envoi intégré à Supabase est limité à quelques emails par heure, pour les essais. Avant d'ouvrir aux clients : **Authentication → Emails → SMTP Settings** avec un fournisseur (Brevo, Resend… offres gratuites suffisantes au début).

## 3. Variables d'environnement

Valeurs dans Supabase → **Project Settings → API**.

| Variable | Valeur | Où |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Vercel + `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé **anon / publishable** | Vercel + `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | clé **service_role / secret** — ne jamais la partager | Vercel + `.env.local` |
| `PAIEMENT_SIMULE` | `1` tant que PayTech n'est pas branché | Vercel + `.env.local` |

Vercel → appeloffres → **Settings → Environment Variables**, cocher Production (et Preview si besoin), puis **Redeploy**.

Sans `PAIEMENT_SIMULE=1`, la confirmation de paiement est refusée : personne ne peut s'abonner sans payer réellement.

## 4. Vérifier

1. `/inscription` : le champ email devient obligatoire, le bandeau « Mode démonstration » disparaît.
2. S'inscrire avec une vraie adresse → email reçu → clic → arrivée sur le compte, essai de 14 jours.
3. Supabase → **Table Editor → comptes** : la ligne est créée.
4. `/super-admin` → Marketing : « Base de données connectée », créer un code promo → visible dans la table `codes_promo`.

## Sécurité (testée)

- Chaque client ne lit que **ses** lignes (compte, paiements, messages).
- Un client peut modifier son nom, son entreprise, sa région et ses alertes, **jamais son abonnement** : il n'est prolongé que par le serveur, après paiement confirmé.
- Les montants sont recalculés par le serveur (`/api/paiement`) : le navigateur n'envoie que l'offre, la durée et le code promo.
- Codes promo et campagnes : invisibles pour les clients ; gérés par la console admin (`/super-admin/api`, même mot de passe que la console).
- La clé `service_role` n'est utilisée que côté serveur (`src/lib/supabase/serveur.ts`, importé avec `server-only`).

## Ce qui reste dans le navigateur

Fiche entreprise (`/profil`), dossiers suivis et coffre des pièces restent enregistrés sur l'appareil : prochaine étape de la migration.
