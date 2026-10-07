/**
 * Conversion entre les lignes de la base (snake_case) et les objets de
 * l'application (Compte, Transaction…). Fonctions pures, testées.
 */
import type { Compte, PreferencesAlertes } from "../compte.ts";
import type { CodeOffre } from "../offres.ts";
import type { MoyenPaiement, StatutTransaction, Transaction } from "../paiement.ts";
import type { CodePromo } from "../marketing.ts";

export interface LigneCompte {
  id: string;
  nom: string;
  entreprise: string;
  telephone: string;
  email: string | null;
  region: string;
  cree_le: string;
  abonnement_offre: CodeOffre | "essai";
  abonnement_jusquau: string;
  alertes: PreferencesAlertes;
  parrain: string | null;
}

export const versCompte = (l: LigneCompte): Compte => ({
  id: l.id,
  nom: l.nom,
  entreprise: l.entreprise,
  telephone: l.telephone,
  email: l.email,
  region: l.region,
  creeLe: new Date(l.cree_le).toISOString(),
  abonnement: { offre: l.abonnement_offre, jusquau: l.abonnement_jusquau.slice(0, 10) },
  alertes: { ...{ actives: true, whatsapp: l.telephone, secteurs: [], motsCles: [] }, ...(l.alertes as Partial<PreferencesAlertes>) },
  parrain: l.parrain,
});

export const ligneCompte = (c: Compte): LigneCompte => ({
  id: c.id,
  nom: c.nom,
  entreprise: c.entreprise,
  telephone: c.telephone,
  email: c.email,
  region: c.region,
  cree_le: c.creeLe,
  abonnement_offre: c.abonnement.offre,
  abonnement_jusquau: c.abonnement.jusquau,
  alertes: c.alertes,
  parrain: c.parrain ?? null,
});

/** Seuls champs qu'un client peut modifier lui-même (voir les droits dans supabase/schema.sql). */
export const modificationsClient = (c: Compte) => ({ nom: c.nom, entreprise: c.entreprise, region: c.region, alertes: c.alertes });

export interface LigneTransaction {
  ref: string;
  compte_id: string;
  offre: CodeOffre;
  mois: number;
  montant: number;
  moyen: MoyenPaiement;
  telephone: string;
  statut: StatutTransaction;
  cree_le: string;
  payee_le: string | null;
  code_promo: string | null;
  montant_avant_remise: number | null;
}

export const versTransaction = (l: LigneTransaction): Transaction => ({
  ref: l.ref,
  compteId: l.compte_id,
  offre: l.offre,
  mois: l.mois,
  montant: l.montant,
  moyen: l.moyen,
  telephone: l.telephone,
  statut: l.statut,
  creeLe: new Date(l.cree_le).toISOString(),
  payeeLe: l.payee_le ? new Date(l.payee_le).toISOString() : null,
  codePromo: l.code_promo,
  montantAvantRemise: l.montant_avant_remise,
});

export const ligneTransaction = (t: Transaction): LigneTransaction => ({
  ref: t.ref,
  compte_id: t.compteId,
  offre: t.offre,
  mois: t.mois,
  montant: t.montant,
  moyen: t.moyen,
  telephone: t.telephone,
  statut: t.statut,
  cree_le: t.creeLe,
  payee_le: t.payeeLe,
  code_promo: t.codePromo ?? null,
  montant_avant_remise: t.montantAvantRemise ?? null,
});

export interface LigneCode {
  code: string;
  remise: number;
  limite: number | null;
  utilisations: number;
  expire_le: string | null;
  actif: boolean;
  cree_le: string;
}

export const versCode = (l: LigneCode): CodePromo => ({
  code: l.code,
  remise: l.remise,
  limite: l.limite,
  utilisations: l.utilisations,
  expireLe: l.expire_le ? l.expire_le.slice(0, 10) : null,
  actif: l.actif,
  creeLe: new Date(l.cree_le).toISOString(),
});

export const ligneCode = (p: CodePromo): LigneCode => ({
  code: p.code,
  remise: p.remise,
  limite: p.limite,
  utilisations: p.utilisations,
  expire_le: p.expireLe,
  actif: p.actif,
  cree_le: p.creeLe,
});

export interface LigneMessage {
  id: string;
  compte_id: string;
  a: string;
  texte: string;
  avis_ids: string[];
  envoye_le: string;
}

export interface MessageEnvoye {
  id: string;
  compteId: string;
  a: string;
  texte: string;
  avisIds: string[];
  envoyeLe: string;
}

export const versMessage = (l: LigneMessage): MessageEnvoye => ({
  id: l.id,
  compteId: l.compte_id,
  a: l.a,
  texte: l.texte,
  avisIds: l.avis_ids ?? [],
  envoyeLe: new Date(l.envoye_le).toISOString(),
});

/** Adresse de retour après connexion : seulement un chemin interne (pas de redirection vers un autre site). */
export function suiteSure(suite: unknown, defaut = "/compte"): string {
  return typeof suite === "string" && /^\/(?![/\\])/.test(suite) ? suite : defaut;
}
