/**
 * APPEL (achatspublics.sn), plateforme officielle de la commande publique.
 * Lecture de son interface publique pour visiteurs anonymes (`/anon/...`),
 * celle qu'utilise la page publique : appels d'offres et plans de passation.
 */
import type { AvisCollecte } from "./sources.ts";
import type { Realisation } from "./ppm.ts";

interface Libelle { libelle?: string | null; name?: string | null; code?: string | null }
const nom = (x?: Libelle | null) => (x?.libelle ?? x?.name ?? "").trim() || null;

/** Les comptes de test de la plateforme ne doivent jamais être montrés comme de vrais marchés. */
export const estUnTest = (organisation: string | null) => /\btests?\b/i.test(organisation ?? "");

export interface AvisAppel {
  uid: string;
  libelle: string;
  reference: string;
  status: string;
  organization?: Libelle;
  direction?: Libelle;
  passationMode?: Libelle;
  marketType?: Libelle;
  publicationDate?: string | null;
  submissionDate?: string | null;
  supplierProperties?: Libelle[];
}

export function parseAppelAvis(json: { data?: { content?: AvisAppel[] } }): AvisCollecte[] {
  return (json.data?.content ?? [])
    .filter((a) => a.status === "PUBLISHED" && a.libelle && !estUnTest(nom(a.organization)))
    .map((a) => ({
      source: "appel",
      reference: a.reference || "non communiquée",
      objet: a.libelle.trim(),
      type: nom(a.passationMode),
      publieLe: a.publicationDate?.slice(0, 10) ?? null,
      dateLimite: a.submissionDate?.slice(0, 10) ?? null,
      // La fiche s'ouvre dans une fenêtre de la page publique : on renvoie vers la liste
      url: `https://www.achatspublics.sn/consultations/tenders?ref=${encodeURIComponent(a.reference)}`,
      autorite: nom(a.organization),
    }));
}

export interface PlanAppel {
  uid: string;
  reference: string;
  version: number;
  year: number;
  status?: string | null;
  published?: boolean;
  organization?: Libelle;
}

/** Dernière version publiée du plan de chaque acheteur pour l'année demandée (hors comptes de test). */
export function plansAretenir(plans: PlanAppel[], annees: number[]): PlanAppel[] {
  const derniers = new Map<string, PlanAppel>();
  for (const p of plans) {
    const org = nom(p.organization);
    if (!annees.includes(p.year) || estUnTest(org) || p.published === false) continue;
    const cle = `${org}|${p.year}`;
    const d = derniers.get(cle);
    if (!d || p.version > d.version) derniers.set(cle, p);
  }
  return [...derniers.values()];
}

interface RealisationAppel {
  libelle: string;
  reference: string;
  direction?: Libelle;
  passationMode?: Libelle;
  marketType?: Libelle;
  fundingType?: string | null;
  consultationNoticeLaunchDate?: string | null;
  provisionalAwardNotificationDate?: string | null;
  executionStartDate?: string | null;
  amount?: number | null;
}

const FINANCEMENT: Record<string, string> = { INTERNAL: "Budget propre", EXTERNAL: "Financement extérieur", STATE: "Budget de l'État" };

export function parseAppelRealisations(plan: PlanAppel, json: { data?: { realisations?: { content?: RealisationAppel[] } } }): (Realisation & { autorite: string | null; montantFcfa: number | null })[] {
  return (json.data?.realisations?.content ?? []).map((r) => ({
    autorite: nom(plan.organization),
    plan: plan.reference,
    direction: nom(r.direction),
    reference: r.reference,
    objet: r.libelle.trim(),
    typeMarche: nom(r.marketType),
    financement: r.fundingType ? [FINANCEMENT[r.fundingType] ?? r.fundingType] : [],
    mode: nom(r.passationMode),
    lancement: r.consultationNoticeLaunchDate?.slice(0, 10) ?? null,
    attribution: r.provisionalAwardNotificationDate?.slice(0, 10) ?? null,
    demarrage: r.executionStartDate?.slice(0, 10) ?? null,
    achevement: null,
    etat: null,
    montantFcfa: r.amount && r.amount > 0 ? r.amount : null,
  }));
}
