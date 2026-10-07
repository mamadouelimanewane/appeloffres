/**
 * Marketing & croissance : codes promo, ciblage des campagnes et indicateurs.
 * Fonctions pures (comme compte.ts et paiement.ts) : le stockage est assuré par
 * le navigateur en mode démonstration, puis par la base (Supabase) en production.
 */
import { statutAbonnement, type Compte } from "./compte.ts";
import type { Transaction } from "./paiement.ts";
import type { Secteur } from "./data.ts";

// --- Codes promo ------------------------------------------------------------

export interface CodePromo {
  code: string; // MAJUSCULES, chiffres et tirets
  remise: number; // pourcentage, 1 à 90
  limite: number | null; // nombre d'utilisations ; null = illimité
  utilisations: number;
  expireLe: string | null; // ISO yyyy-mm-dd inclus ; null = sans fin
  actif: boolean;
  creeLe: string;
}

/** « promo btp » → « PROMO-BTP » ; null si le code est vide ou contient d'autres caractères. */
export function normaliserCode(saisie: string): string | null {
  const c = saisie.trim().toUpperCase().replace(/\s+/g, "-");
  return /^[A-Z0-9][A-Z0-9-]{2,19}$/.test(c) ? c : null;
}

export function creerCodePromo(
  d: { code: string; remise: number; limite?: number | null; expireLe?: string | null },
  existants: CodePromo[],
  maintenant: Date,
): CodePromo {
  const code = normaliserCode(d.code);
  if (!code) throw new Error("Code invalide : 3 à 20 caractères, lettres, chiffres et tirets.");
  if (existants.some((e) => e.code === code)) throw new Error(`Le code ${code} existe déjà.`);
  if (!Number.isInteger(d.remise) || d.remise < 1 || d.remise > 90) throw new Error("La remise doit être comprise entre 1 et 90 %.");
  const limite = d.limite ?? null;
  if (limite !== null && (!Number.isInteger(limite) || limite < 1)) throw new Error("La limite d'utilisations doit être un nombre entier positif.");
  return { code, remise: d.remise, limite, utilisations: 0, expireLe: d.expireLe || null, actif: true, creeLe: maintenant.toISOString() };
}

export type EtatCode = "actif" | "desactive" | "epuise" | "expire";

export function etatCode(p: CodePromo, maintenant: Date): EtatCode {
  if (!p.actif) return "desactive";
  if (p.limite !== null && p.utilisations >= p.limite) return "epuise";
  if (p.expireLe && p.expireLe < maintenant.toISOString().slice(0, 10)) return "expire";
  return "actif";
}

const MOTIFS: Record<Exclude<EtatCode, "actif">, string> = {
  desactive: "Ce code n'est plus valable.",
  epuise: "Ce code a atteint son nombre maximal d'utilisations.",
  expire: "Ce code a expiré.",
};

/** Montant après remise, arrondi à la centaine de FCFA inférieure (au profit du client). */
export function appliquerCode(montant: number, saisie: string, codes: CodePromo[], maintenant: Date): { montant: number; remise: number; code: CodePromo } {
  const code = normaliserCode(saisie);
  const p = code ? codes.find((c) => c.code === code) : undefined;
  if (!p) throw new Error("Code promo inconnu.");
  const e = etatCode(p, maintenant);
  if (e !== "actif") throw new Error(MOTIFS[e]);
  const net = Math.floor((montant * (100 - p.remise)) / 100 / 100) * 100;
  return { montant: net, remise: montant - net, code: p };
}

/** À appeler une seule fois, après confirmation du paiement (comme `confirmer`). */
export function enregistrerUtilisation(p: CodePromo): CodePromo {
  if (p.limite !== null && p.utilisations >= p.limite) throw new Error("Code épuisé.");
  return { ...p, utilisations: p.utilisations + 1 };
}

// --- Ciblage des campagnes ---------------------------------------------------

export type Canal = "whatsapp" | "email";
export type Segment = "tous" | "sans-abonnement-payant" | "essai-en-cours" | "expires" | "payants";

export const SEGMENTS: Record<Segment, string> = {
  tous: "Tous les inscrits",
  "sans-abonnement-payant": "Jamais abonnés (essai seulement)",
  "essai-en-cours": "Essai gratuit en cours",
  expires: "Abonnement ou essai expiré",
  payants: "Abonnés payants actifs",
};

export interface Ciblage {
  canal: Canal;
  segment: Segment;
  secteurs: Secteur[]; // vide = tous les secteurs
}

/**
 * Destinataires d'une campagne. WhatsApp : uniquement les comptes qui ont
 * gardé les alertes actives (consentement ; le mot STOP les désactive).
 * Email : uniquement les comptes qui ont donné une adresse.
 */
export function audience(comptes: Compte[], c: Ciblage, maintenant: Date): Compte[] {
  return comptes.filter((x) => {
    if (c.canal === "whatsapp" && !x.alertes.actives) return false;
    if (c.canal === "email" && !x.email) return false;
    if (c.secteurs.length && !x.alertes.secteurs.some((s) => c.secteurs.includes(s))) return false;
    const s = statutAbonnement(x, maintenant);
    switch (c.segment) {
      case "tous":
        return true;
      case "sans-abonnement-payant":
        return s.offre === "essai";
      case "essai-en-cours":
        return s.offre === "essai" && s.actif;
      case "expires":
        return !s.actif;
      case "payants":
        return s.offre !== "essai" && s.actif;
    }
  });
}

/** Remplace {nom} et {entreprise} dans le message. */
export function personnaliser(modele: string, c: Compte): string {
  return modele.replace(/\{nom\}/g, c.nom.split(" ")[0]).replace(/\{entreprise\}/g, c.entreprise);
}

// --- Indicateurs -------------------------------------------------------------

export interface Indicateurs {
  inscrits: number;
  inscrits30j: number;
  payants: number; // comptes ayant au moins un paiement confirmé
  tauxConversion: number | null; // payants / inscrits, en %
  encaisse30j: number; // FCFA
  cac: number | null; // budget / nouveaux clients payants sur 30 jours
}

export function indicateurs(comptes: Compte[], transactions: Transaction[], budget30j: number, maintenant: Date): Indicateurs {
  const depuis = maintenant.getTime() - 30 * 86_400_000;
  const payees = transactions.filter((t) => t.statut === "payee" && t.payeeLe);
  const payants = new Set(payees.map((t) => t.compteId));
  const premierPaiement = new Map<string, number>();
  for (const t of payees) {
    const d = Date.parse(t.payeeLe!);
    premierPaiement.set(t.compteId, Math.min(d, premierPaiement.get(t.compteId) ?? Infinity));
  }
  const nouveauxPayants = [...premierPaiement.values()].filter((d) => d >= depuis).length;
  return {
    inscrits: comptes.length,
    inscrits30j: comptes.filter((c) => Date.parse(c.creeLe) >= depuis).length,
    payants: payants.size,
    tauxConversion: comptes.length ? Math.round((payants.size / comptes.length) * 1000) / 10 : null,
    encaisse30j: payees.filter((t) => Date.parse(t.payeeLe!) >= depuis).reduce((s, t) => s + t.montant, 0),
    cac: budget30j > 0 && nouveauxPayants > 0 ? Math.round(budget30j / nouveauxPayants) : null,
  };
}

/** Lien de parrainage : /inscription?ref=CODE (le code promo sert aussi d'identifiant d'affilié). */
export function lienAffilie(origine: string, code: string): string {
  return `${origine.replace(/\/$/, "")}/inscription?ref=${encodeURIComponent(code)}`;
}
