/**
 * Coffre-fort des pièces administratives : dates de validité et rapprochement
 * avec les pièces exigées par chaque marché. Fonctions pures.
 * Les durées de validité varient selon les administrations : on ne les devine
 * pas, l'entreprise saisit la date d'expiration écrite sur le document.
 */
import { piecesPour, type Appel } from "./data.ts";

export interface PieceCoffre {
  /** Identifiant de la pièce, aligné sur PIECES (data.ts) quand il existe. */
  type: string;
  libelle: string;
  delivreeLe: string | null; // ISO
  expireLe: string | null; // ISO ; null = sans date d'expiration (ex. NINEA)
  note?: string;
}

/** Pièces proposées dans le coffre (les identifiants rejoignent la liste des pièces des marchés). */
export const TYPES_COFFRE: { type: string; libelle: string; expire: boolean }[] = [
  { type: "ninea", libelle: "NINEA", expire: false },
  { type: "rccm", libelle: "Registre du commerce (RCCM)", expire: true },
  { type: "quitus", libelle: "Attestation de régularité fiscale", expire: true },
  { type: "css", libelle: "Attestation de la Caisse de sécurité sociale", expire: true },
  { type: "ipres", libelle: "Attestation IPRES", expire: true },
  { type: "faillite", libelle: "Attestation de non-faillite", expire: true },
  { type: "credit", libelle: "Attestation de ligne de crédit", expire: true },
  { type: "inspection", libelle: "Attestation de l'Inspection du travail", expire: true },
  { type: "arcop", libelle: "Attestation de paiement de la redevance ARCOP", expire: true },
  { type: "statuts", libelle: "Statuts de l'entreprise", expire: false },
  { type: "etats", libelle: "États financiers certifiés", expire: true },
];

export type StatutPiece = "valide" | "bientot" | "expiree" | "sans_date";

const jours = (de: string, a: string) => Math.round((Date.parse(a + "T00:00:00Z") - Date.parse(de + "T00:00:00Z")) / 86_400_000);

/** Statut d'une pièce à une date donnée ; « bientôt » = expire dans 30 jours ou moins. */
export function statutPiece(p: PieceCoffre, aujourdhui: string): StatutPiece {
  if (!p.expireLe) return "sans_date";
  const reste = jours(aujourdhui, p.expireLe);
  if (reste < 0) return "expiree";
  return reste <= 30 ? "bientot" : "valide";
}

export interface CouverturePiece {
  type: string;
  presente: boolean;
  /** Valide le jour du dépôt des offres (date limite du marché) ? null si date limite ou expiration inconnue. */
  valideAuDepot: boolean | null;
  expireLe: string | null;
}

/** Pour chaque pièce exigée par le marché : est-elle dans le coffre, et valide à la date limite ? */
export function couvertureDossier(coffre: PieceCoffre[], a: Appel, aujourdhui: string): Record<string, CouverturePiece> {
  const sortie: Record<string, CouverturePiece> = {};
  for (const exigee of piecesPour(a)) {
    const p = coffre.find((x) => x.type === exigee.id);
    if (!p) {
      sortie[exigee.id] = { type: exigee.id, presente: false, valideAuDepot: null, expireLe: null };
      continue;
    }
    const echeance = a.dateLimite ?? aujourdhui;
    sortie[exigee.id] = {
      type: exigee.id,
      presente: true,
      valideAuDepot: p.expireLe ? p.expireLe >= echeance : TYPES_COFFRE.find((t) => t.type === p.type)?.expire === false ? true : null,
      expireLe: p.expireLe,
    };
  }
  return sortie;
}

/** Pièces à renouveler : expirées ou expirant dans 30 jours, les plus urgentes d'abord. */
export function aRenouveler(coffre: PieceCoffre[], aujourdhui: string): PieceCoffre[] {
  return coffre
    .filter((p) => ["expiree", "bientot"].includes(statutPiece(p, aujourdhui)))
    .sort((x, y) => (x.expireLe ?? "").localeCompare(y.expireLe ?? ""));
}
