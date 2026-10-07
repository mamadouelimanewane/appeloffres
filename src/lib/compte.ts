/**
 * Comptes clients et abonnements. Fonctions pures : le stockage est assuré
 * par src/lib/demo/base.ts (navigateur) en mode démonstration, et sera
 * remplacé par une vraie base (ex. Supabase) sans changer ces règles.
 */
import { ESSAI_JOURS, FONCTIONS_PRO, type CodeOffre, type Fonction } from "./offres.ts";
import type { Secteur } from "./data.ts";

export interface Abonnement {
  offre: CodeOffre | "essai";
  jusquau: string; // ISO yyyy-mm-dd inclus
}

export interface PreferencesAlertes {
  actives: boolean;
  whatsapp: string; // numéro au format +221XXXXXXXXX
  secteurs: Secteur[];
  motsCles: string[];
}

export interface Compte {
  id: string;
  nom: string;
  entreprise: string;
  telephone: string; // +221XXXXXXXXX
  email: string | null;
  region: string;
  creeLe: string; // ISO
  abonnement: Abonnement;
  alertes: PreferencesAlertes;
  /** Code d'affiliation du lien d'inscription (/inscription?ref=CODE), s'il y en avait un. */
  parrain?: string | null;
}

const jour = (d: Date) => d.toISOString().slice(0, 10);
const plusJours = (iso: string, n: number) => jour(new Date(Date.parse(iso + "T00:00:00Z") + n * 86_400_000));

/** « 77 123 45 67 », « 00221771234567 » → « +221771234567 » ; null si ce n'est pas un mobile sénégalais. */
export function normaliserTelephone(saisie: string): string | null {
  const chiffres = saisie.replace(/[^\d+]/g, "").replace(/^00/, "+");
  const local = chiffres.replace(/^\+?221/, "");
  return /^7[05678]\d{7}$/.test(local) ? `+221${local}` : null;
}

export interface Inscription {
  nom: string;
  entreprise: string;
  telephone: string;
  email?: string;
  region: string;
  secteurs: Secteur[];
  parrain?: string | null;
}

export function creerCompte(d: Inscription, maintenant: Date, id: string): Compte {
  const telephone = normaliserTelephone(d.telephone);
  if (!telephone) throw new Error("Numéro de téléphone sénégalais invalide.");
  if (!d.nom.trim() || !d.entreprise.trim()) throw new Error("Nom et entreprise sont obligatoires.");
  const aujourdhui = jour(maintenant);
  return {
    id,
    nom: d.nom.trim(),
    entreprise: d.entreprise.trim(),
    telephone,
    email: d.email?.trim() || null,
    region: d.region,
    creeLe: maintenant.toISOString(),
    // Essai gratuit de l'offre Pro, jour de l'inscription compris
    abonnement: { offre: "essai", jusquau: plusJours(aujourdhui, ESSAI_JOURS - 1) },
    alertes: { actives: true, whatsapp: telephone, secteurs: d.secteurs, motsCles: [] },
    parrain: d.parrain?.trim().toUpperCase() || null,
  };
}

export interface Statut {
  offre: CodeOffre | "essai";
  actif: boolean;
  joursRestants: number; // 0 = dernier jour ; négatif = expiré
  libelle: string;
}

export function statutAbonnement(c: Compte, maintenant: Date): Statut {
  const restants = Math.round((Date.parse(c.abonnement.jusquau + "T00:00:00Z") - Date.parse(jour(maintenant) + "T00:00:00Z")) / 86_400_000);
  const actif = restants >= 0;
  const nom = c.abonnement.offre === "essai" ? "Essai gratuit" : c.abonnement.offre === "pro" ? "Pro" : "Veille";
  return { offre: c.abonnement.offre, actif, joursRestants: restants, libelle: actif ? nom : `${nom} expiré` };
}

/** L'essai gratuit donne accès à tout ; Veille n'ouvre pas les fonctions Pro. */
export function peutUtiliser(c: Compte | null, f: Fonction, maintenant: Date): boolean {
  if (!c) return false;
  const s = statutAbonnement(c, maintenant);
  if (!s.actif) return false;
  return s.offre !== "veille" || !FONCTIONS_PRO.includes(f);
}

/**
 * Prolonge l'abonnement après un paiement confirmé : 30 jours par mois payé,
 * à partir de la fin de l'abonnement en cours s'il n'est pas expiré (pas de jour perdu).
 */
export function appliquerPaiement(c: Compte, offreAchetee: CodeOffre, mois: number, maintenant: Date): Compte {
  const aujourdhui = jour(maintenant);
  const memeOffre = c.abonnement.offre === offreAchetee;
  const depart = memeOffre && c.abonnement.jusquau >= aujourdhui ? plusJours(c.abonnement.jusquau, 1) : aujourdhui;
  return { ...c, abonnement: { offre: offreAchetee, jusquau: plusJours(depart, 30 * mois - 1) } };
}
