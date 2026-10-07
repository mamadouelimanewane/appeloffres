-- Appeldoffres.sn — schéma de la base Supabase (PostgreSQL)
-- À exécuter une fois : Supabase → SQL Editor → New query → coller → Run.
-- Peut être relancé sans danger (« if not exists »).
--
-- Sécurité :
--  * chaque client ne lit que SES lignes (Row Level Security) ;
--  * un client ne peut modifier que son nom, son entreprise, sa région et ses
--    alertes — jamais son abonnement (prolongé uniquement par le serveur après paiement) ;
--  * les transactions, codes promo et campagnes sont écrits uniquement par le
--    serveur (clé service_role, jamais envoyée au navigateur).

-- 1. Comptes clients (un par utilisateur Supabase Auth) ---------------------
create table if not exists public.comptes (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null check (length(trim(nom)) > 0),
  entreprise text not null check (length(trim(entreprise)) > 0),
  telephone text not null unique check (telephone ~ '^\+2217[05678][0-9]{7}$'),
  email text,
  region text not null default 'Dakar',
  cree_le timestamptz not null default now(),
  abonnement_offre text not null default 'essai' check (abonnement_offre in ('essai', 'veille', 'pro')),
  abonnement_jusquau date not null,
  alertes jsonb not null default '{"actives": true, "whatsapp": "", "secteurs": [], "motsCles": []}',
  parrain text
);

alter table public.comptes enable row level security;

drop policy if exists "lire son compte" on public.comptes;
create policy "lire son compte" on public.comptes for select to authenticated using (id = auth.uid());

drop policy if exists "modifier son compte" on public.comptes;
create policy "modifier son compte" on public.comptes for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Colonnes modifiables par le client lui-même (pas l'abonnement, pas le téléphone de connexion)
revoke update on public.comptes from authenticated, anon;
grant update (nom, entreprise, region, alertes) on public.comptes to authenticated;
revoke insert, delete on public.comptes from authenticated, anon;

-- 2. Paiements -------------------------------------------------------------------
create table if not exists public.transactions (
  ref text primary key,
  compte_id uuid not null references public.comptes (id) on delete cascade,
  offre text not null check (offre in ('veille', 'pro')),
  mois int not null check (mois in (1, 3, 12)),
  montant int not null check (montant > 0),
  moyen text not null check (moyen in ('wave', 'orange_money')),
  telephone text not null,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'payee', 'annulee')),
  cree_le timestamptz not null default now(),
  payee_le timestamptz,
  code_promo text,
  montant_avant_remise int
);
create index if not exists transactions_compte on public.transactions (compte_id);

alter table public.transactions enable row level security;
drop policy if exists "lire ses paiements" on public.transactions;
create policy "lire ses paiements" on public.transactions for select to authenticated using (compte_id = auth.uid());
revoke insert, update, delete on public.transactions from authenticated, anon;

-- 3. Codes promo (gérés depuis la console admin, lus par le serveur) ------------
create table if not exists public.codes_promo (
  code text primary key check (code ~ '^[A-Z0-9][A-Z0-9-]{2,19}$'),
  remise int not null check (remise between 1 and 90),
  limite int check (limite is null or limite > 0),
  utilisations int not null default 0,
  expire_le date,
  actif boolean not null default true,
  cree_le timestamptz not null default now()
);
alter table public.codes_promo enable row level security; -- aucune règle : invisible pour les clients

-- Compte une utilisation (appelé par le serveur après un paiement confirmé)
create or replace function public.compter_utilisation_code(p_code text)
returns void language sql security definer set search_path = public as $$
  update public.codes_promo set utilisations = utilisations + 1 where code = p_code;
$$;
revoke all on function public.compter_utilisation_code(text) from public, anon, authenticated;

-- 4. Messages WhatsApp envoyés (boîte « Mes alertes ») --------------------------
create table if not exists public.messages_envoyes (
  id uuid primary key default gen_random_uuid(),
  compte_id uuid not null references public.comptes (id) on delete cascade,
  a text not null,
  texte text not null,
  avis_ids text[] not null default '{}',
  envoye_le timestamptz not null default now()
);
create index if not exists messages_compte on public.messages_envoyes (compte_id, envoye_le);

alter table public.messages_envoyes enable row level security;
drop policy if exists "lire ses messages" on public.messages_envoyes;
create policy "lire ses messages" on public.messages_envoyes for select to authenticated using (compte_id = auth.uid());
drop policy if exists "simuler ses alertes" on public.messages_envoyes;
create policy "simuler ses alertes" on public.messages_envoyes for insert to authenticated with check (compte_id = auth.uid());

-- 5. Campagnes marketing (console admin) ----------------------------------------
create table if not exists public.campagnes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  canal text not null check (canal in ('whatsapp', 'email')),
  segment text not null,
  secteurs text[] not null default '{}',
  message text not null,
  destinataires int not null,
  envoyee_le timestamptz not null default now()
);
alter table public.campagnes enable row level security; -- aucune règle : serveur uniquement
