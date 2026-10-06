/**
 * Paiements mobiles (Wave, Orange Money) via un agrégateur.
 * Le mode démonstration simule la page de paiement de l'agrégateur ; en
 * production, `demanderPaiement` appellera l'API de PayTech (côté serveur, clés
 * secrètes) et la confirmation arrivera par sa notification (IPN).
 */
import { offre, type CodeOffre } from "./offres.ts";

export type MoyenPaiement = "wave" | "orange_money";
export const MOYENS: Record<MoyenPaiement, string> = { wave: "Wave", orange_money: "Orange Money" };

export type StatutTransaction = "en_attente" | "payee" | "annulee";

export interface Transaction {
  ref: string;
  compteId: string;
  offre: CodeOffre;
  mois: number;
  montant: number; // FCFA
  moyen: MoyenPaiement;
  telephone: string;
  statut: StatutTransaction;
  creeLe: string;
  payeeLe: string | null;
}

/** Remise de 2 mois offerts sur 12 (10 mois payés). */
export function montant(code: CodeOffre, mois: number): number {
  const prix = offre(code).prixMensuel;
  return mois >= 12 ? prix * (mois - 2) : prix * mois;
}

export function creerTransaction(p: { compteId: string; offre: CodeOffre; mois: number; moyen: MoyenPaiement; telephone: string }, maintenant: Date, ref: string): Transaction {
  if (![1, 3, 12].includes(p.mois)) throw new Error("Durée non proposée.");
  return { ref, ...p, montant: montant(p.offre, p.mois), statut: "en_attente", creeLe: maintenant.toISOString(), payeeLe: null };
}

/** Une transaction ne peut être confirmée ou annulée qu'une fois (protection contre les doubles notifications). */
export function confirmer(t: Transaction, maintenant: Date): Transaction {
  if (t.statut !== "en_attente") throw new Error(`Transaction déjà ${t.statut === "payee" ? "payée" : "annulée"}.`);
  return { ...t, statut: "payee", payeeLe: maintenant.toISOString() };
}

export function annuler(t: Transaction): Transaction {
  if (t.statut !== "en_attente") throw new Error("Transaction déjà traitée.");
  return { ...t, statut: "annulee" };
}

export function fcfaCourt(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ") + " FCFA";
}
