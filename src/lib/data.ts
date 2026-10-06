export type Secteur = "BTP" | "Fournitures" | "Services" | "Informatique" | "Études";
export const SECTEURS: Secteur[] = ["BTP", "Fournitures", "Services", "Informatique", "Études"];

export interface Appel {
  id: string;
  source: string;
  sourceLibelle: string;
  reference: string;
  titre: string;
  autorite: string;
  secteur: Secteur;
  region: string | null;
  mode: string | null;
  /** null = non indiqué dans l'avis collecté */
  budgetEstime: number | null;
  garantieSoumission: number | null;
  publieLe: string | null; // ISO yyyy-mm-dd
  dateLimite: string | null; // ISO yyyy-mm-dd ; null = voir l'avis officiel
  url: string | null;
  /** Informations lues dans le document de l'avis par l'IA (dates et montants vérifiés dans le texte). */
  lectureIa?: {
    resume: string | null;
    piecesExigees: string[];
    heureLimite: string | null;
    /** Date limite écrite dans le document de l'avis (peut différer de la liste de la source). */
    dateLimiteAvis?: string | null;
    lieuDepot: string | null;
    modele: string;
    tronque: boolean;
  };
}

/** Secteur déduit du type de marché et de l'objet (mots-clés). */
export function secteurDe(texte: string): Secteur {
  const t = texte.toLowerCase();
  if (/informatique|logiciel|num[ée]rique|digital|syst[èe]me d.information|d[ée]veloppeur|r[ée]seau informatique|cyber|serveur/.test(t)) return "Informatique";
  if (/travaux|construction|r[ée]habilitation|bitum|route|piste|b[âa]timent|g[ée]nie civil|am[ée]nagement|bassin/.test(t)) return "BTP";
  if (/consultant|cabinet|[ée]tude|prestations intellectuelles|manifestation d.int[ée]r[êe]t|audit|expert|assistance technique|recrutement/.test(t)) return "Études";
  if (/fourniture|acquisition|achat|[ée]quipement|mat[ée]riel/.test(t)) return "Fournitures";
  return "Services";
}

export interface Piece {
  id: string;
  libelle: string;
  conseil: string;
  /** true = exigée, false = non exigée, null = dépend du DAO (information inconnue). */
  si?: (a: Appel) => boolean | null;
}

const auMoins = (v: number | null, seuil: number) => (v === null ? null : v >= seuil);

/**
 * Liste indicative. Les pièces exactes dépendent du dossier d'appel d'offres
 * (DAO) : toujours se référer à la clause « Instructions aux candidats ».
 */
export const PIECES: Piece[] = [
  { id: "ninea", libelle: "NINEA", conseil: "Numéro d'identification national des entreprises." },
  { id: "rccm", libelle: "Registre du commerce (RCCM)", conseil: "Extrait récent." },
  { id: "quitus", libelle: "Attestation de régularité fiscale", conseil: "À demander à la DGID ; vérifier sa durée de validité." },
  { id: "css", libelle: "Attestation de la Caisse de sécurité sociale", conseil: "Justifie que les cotisations sont à jour." },
  { id: "ipres", libelle: "Attestation IPRES", conseil: "Retraite : cotisations à jour." },
  { id: "faillite", libelle: "Attestation de non-faillite", conseil: "Délivrée par le greffe du tribunal." },
  { id: "capacite", libelle: "Références de marchés similaires", conseil: "Procès-verbaux de réception ou attestations de bonne exécution.", si: (a) => auMoins(a.budgetEstime, 15_000_000) },
  { id: "personnel", libelle: "Personnel clé (CV, diplômes)", conseil: "Conformes aux qualifications demandées.", si: (a) => a.secteur === "BTP" || a.secteur === "Études" || a.secteur === "Informatique" },
  { id: "materiel", libelle: "Liste du matériel et des engins", conseil: "Justificatifs de propriété ou de location.", si: (a) => a.secteur === "BTP" },
  { id: "credit", libelle: "Attestation de ligne de crédit / capacité financière", conseil: "Lettre de banque.", si: (a) => auMoins(a.budgetEstime, 30_000_000) },
  { id: "garantie", libelle: "Garantie de soumission", conseil: "Banque ou assurance agréée, au montant et à la durée demandés.", si: (a) => (a.garantieSoumission === null ? null : a.garantieSoumission > 0) },
  { id: "dqe", libelle: "Bordereau des prix / devis quantitatif", conseil: "Vérifier les calculs et l'arrondi ligne par ligne." },
  { id: "memoire", libelle: "Mémoire technique", conseil: "Méthodologie, planning, moyens, gestion des risques." },
];

/** Pièces à prévoir : exigées, ou possiblement exigées quand l'avis ne le précise pas. */
export function piecesPour(a: Appel): Piece[] {
  return PIECES.filter((p) => !p.si || p.si(a) !== false);
}

/** La pièce dépend-elle d'une information absente de l'avis collecté ? */
export function selonDao(p: Piece, a: Appel): boolean {
  return !!p.si && p.si(a) === null;
}

/** Pourcentage de pièces cochées parmi celles applicables. */
export function scorePreparation(a: Appel, cochees: string[]): number {
  const requises = piecesPour(a);
  if (requises.length === 0) return 100;
  const ok = requises.filter((p) => cochees.includes(p.id)).length;
  return Math.round((ok / requises.length) * 100);
}

/**
 * Jours de calendrier restants : 0 = c'est aujourd'hui, 1 = demain, négatif = dépassé.
 * `maintenant` injectable pour les tests.
 */
export function joursRestants(dateLimite: string, maintenant: Date = new Date()): number {
  const [a, m, j] = dateLimite.split("-").map(Number);
  const fin = Date.UTC(a, m - 1, j);
  const debut = Date.UTC(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  return Math.round((fin - debut) / 86_400_000);
}

export function fcfa(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ /g, " ") + " FCFA";
}

export function dateFr(iso: string): string {
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
}

/** « J-3 », ou « aujourd'hui » le jour même. */
export function compteARebours(jours: number): string {
  return jours === 0 ? "aujourd'hui" : `J-${jours}`;
}
