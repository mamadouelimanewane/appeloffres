/**
 * Extraction assistée par IA des informations d'un avis d'appel d'offres.
 * Ce fichier ne dépend d'aucun fournisseur d'IA : il fabrique la consigne et,
 * surtout, CONTRÔLE la réponse. Une date ou un montant n'est accepté que s'il
 * figure réellement dans le texte de l'avis : l'IA ne peut rien inventer.
 */
import { dateIso } from "../dcmp.ts";
import { dateFrancaise } from "../sources.ts";

export interface ExtractionIa {
  estUnAvis: boolean;
  objet: string | null;
  acheteur: string | null;
  reference: string | null;
  typeProcedure: string | null;
  dateLimite: string | null; // ISO
  heureLimite: string | null; // « 10h00 »
  montantEstimeFcfa: number | null;
  garantieSoumissionFcfa: number | null;
  piecesExigees: string[];
  lieuDepot: string | null;
  resume: string | null;
  /** Conditions de qualification (pour « Ce marché est-il pour moi ? »). */
  exigences: Exigences;
  /** Autres dates utiles : visite de site, questions, ouverture des plis… (vérifiées dans le texte). */
  autresDates: { libelle: string; date: string }[];
}

export interface Exigences {
  chiffreAffairesMinFcfa: number | null;
  ligneCreditMinFcfa: number | null;
  marchesSimilairesMin: number | null;
  experienceMinAnnees: number | null;
  personnelCle: string[];
  materiel: string[];
}

/** Version du schéma d'extraction : un avis lu avec une version plus ancienne est relu. */
export const VERSION_EXTRACTION = 2;

export const CONSIGNE_SYSTEME = `Tu lis des avis d'appels d'offres publics du Sénégal et tu en extrais les informations en json.
Règles impératives :
- N'invente rien. Si une information n'est pas écrite dans le texte, mets null (ou [] pour une liste).
- Recopie les dates telles qu'elles apparaissent dans le texte (ex. "15 octobre 2026" ou "15/10/2026").
- "dateLimite" est la date limite de DÉPÔT des offres. Si le texte est un avis de report, un additif ou un rectificatif, donne la NOUVELLE date limite, pas l'ancienne.
- Recopie les montants en chiffres tels qu'ils apparaissent (ex. "1 000 000").
- "estUnAvis" vaut false si le texte n'est pas un avis d'appel d'offres, de demande de prix ou de manifestation d'intérêt (actualité, offre d'emploi, attribution, résultat…).
- "piecesExigees" : pièces administratives ou documents que le candidat doit fournir, en phrases courtes.
- "resume" : 2 phrases simples en français pour un chef de PME : ce qui est demandé et la condition la plus importante.
- "exigences" : conditions de qualification du candidat. S'il y a plusieurs lots, prends celles du lot le moins exigeant.
  "chiffreAffairesMin" (chiffre d'affaires moyen minimal exigé), "ligneCreditMin" (ligne de crédit ou capacité de financement minimale),
  "marchesSimilairesMin" (nombre minimal de marchés similaires exécutés, en chiffre), "experienceMinAnnees" (années d'expérience minimales, en chiffre),
  "personnelCle" (postes exigés, ex. "Chef de chantier, BTS génie civil, 5 ans"), "materiel" (matériel exigé).
- "autresDates" : autres dates utiles écrites dans le texte, ex. visite de site, date limite des demandes d'éclaircissement, ouverture des plis.
Réponds uniquement avec un objet json de cette forme :
{"estUnAvis": true, "objet": "...", "acheteur": "...", "reference": "...", "typeProcedure": "...", "dateLimite": "15 octobre 2026", "heureLimite": "10h00", "montantEstime": "45 000 000", "garantieSoumission": "900 000", "piecesExigees": ["..."], "lieuDepot": "...", "resume": "...",
 "exigences": {"chiffreAffairesMin": "200 000 000", "ligneCreditMin": "50 000 000", "marchesSimilairesMin": 2, "experienceMinAnnees": 3, "personnelCle": ["..."], "materiel": ["..."]},
 "autresDates": [{"libelle": "Visite de site", "date": "5 octobre 2026"}]}`;

/** Texte envoyé à l'IA : au plus `max` caractères, en signalant la coupe (jamais en silence). */
export function preparerTexte(texte: string, max = 24_000): { texte: string; tronque: boolean } {
  const propre = texte.replace(/\s+/g, " ").trim();
  return propre.length <= max ? { texte: propre, tronque: false } : { texte: propre.slice(0, max), tronque: true };
}

const seulementChiffres = (s: string) => s.replace(/\D/g, "");
const MOIS_LETTRES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Une date renvoyée par l'IA, si elle est lisible ET présente dans le texte source. */
export function dateVerifiee(brute: unknown, source: string): string | null {
  if (typeof brute !== "string" || !brute.trim()) return null;
  const b = brute.trim();
  const chiffres = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/.exec(b);
  const iso = /^\d{4}-\d{2}-\d{2}/.test(b)
    ? b.slice(0, 10)
    : chiffres
      ? dateIso(`${chiffres[1].padStart(2, "0")}/${chiffres[2].padStart(2, "0")}/${chiffres[3]}`)
      : dateFrancaise(b) ?? dateAnglaiseLongue(b);
  if (!iso) return null;
  // Présence dans le texte, sous n'importe quelle forme courante de la même date :
  // 04/11/2026, 4-11-2026, 4 novembre 2026, 1er novembre 2026, 4 November 2026, November 4, 2026…
  const [a, m, j] = iso.split("-");
  const jour = String(Number(j));
  const moisNoms = [MOIS_LETTRES[Number(m) - 1], MOIS_ANGLAIS[Number(m) - 1], MOIS_ANGLAIS[Number(m) - 1].slice(0, 3)].map(sansAccents).join("|");
  const s = sansAccents(source);
  const motifs = [
    new RegExp(`\\b0?${jour}\\s*[/.-]\\s*0?${Number(m)}\\s*[/.-]\\s*${a}\\b`),
    new RegExp(`\\b0?${jour}(?:er|st|nd|rd|th)?\\s+(?:${moisNoms})\\.?,?\\s+${a}\\b`),
    new RegExp(`\\b(?:${moisNoms})\\.?\\s+0?${jour}(?:st|nd|rd|th)?,?\\s+${a}\\b`),
  ];
  return motifs.some((r) => r.test(s)) ? iso : null;
}

const sansAccents = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const MOIS_ANGLAIS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** « 26 October 2026 », « Oct 26, 2026 » → ISO ; null sinon. */
function dateAnglaiseLongue(t: string): string | null {
  const num = (nom: string) => MOIS_ANGLAIS.findIndex((m) => m.startsWith(nom.toLowerCase().slice(0, 3))) + 1;
  const a = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,})\.?,?\s+(\d{4})/.exec(t);
  const b = /([A-Za-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/.exec(t);
  const [j, nom, an] = a ? [a[1], a[2], a[3]] : b ? [b[2], b[1], b[3]] : [];
  if (!j || !nom || num(nom) < 1) return null;
  return dateIso(`${j.padStart(2, "0")}/${String(num(nom)).padStart(2, "0")}/${an}`);
}

/** Un montant renvoyé par l'IA, s'il est plausible ET présent (mêmes chiffres) dans le texte source. */
export function montantVerifie(brut: unknown, source: string): number | null {
  const texte = typeof brut === "number" ? String(brut) : typeof brut === "string" ? brut : "";
  const chiffres = seulementChiffres(texte);
  if (chiffres.length < 4) return null;
  const n = Number(chiffres);
  if (!Number.isFinite(n) || n < 10_000 || n > 1e13) return null;
  return seulementChiffres(source).includes(chiffres) ? n : null;
}

const texteOuNull = (v: unknown, max = 400): string | null => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** Transforme la réponse brute de l'IA en données sûres. Lève une erreur si ce n'est pas du json. */
export function validerExtraction(reponse: string, source: string): ExtractionIa {
  const debut = reponse.indexOf("{");
  const fin = reponse.lastIndexOf("}");
  if (debut < 0 || fin <= debut) throw new Error("réponse IA sans json");
  const j = JSON.parse(reponse.slice(debut, fin + 1)) as Record<string, unknown>;
  const pieces = Array.isArray(j.piecesExigees) ? j.piecesExigees.filter((p): p is string => typeof p === "string" && p.trim().length > 2).map((p) => p.trim().slice(0, 200)).slice(0, 25) : [];
  return {
    estUnAvis: j.estUnAvis !== false,
    objet: texteOuNull(j.objet),
    acheteur: texteOuNull(j.acheteur, 200),
    reference: texteOuNull(j.reference, 100),
    typeProcedure: texteOuNull(j.typeProcedure, 120),
    dateLimite: dateVerifiee(j.dateLimite, source),
    heureLimite: typeof j.heureLimite === "string" && /\d{1,2}\s*[h:]\s*\d{0,2}/i.test(j.heureLimite) ? j.heureLimite.trim().slice(0, 20) : null,
    montantEstimeFcfa: montantVerifie(j.montantEstime, source),
    garantieSoumissionFcfa: montantVerifie(j.garantieSoumission, source),
    piecesExigees: pieces,
    lieuDepot: texteOuNull(j.lieuDepot, 300),
    resume: texteOuNull(j.resume, 600),
    exigences: exigencesVerifiees(j.exigences, source),
    autresDates: autresDatesVerifiees(j.autresDates, source),
  };
}

const listeCourte = (v: unknown, max = 12): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 2).map((x) => x.trim().slice(0, 200)).slice(0, max) : [];

const NOMBRES_EN_LETTRES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze"];

/** Un petit nombre (marchés, années) n'est retenu que s'il figure dans le texte, en chiffres ou en lettres. */
export function nombreVerifie(brut: unknown, source: string): number | null {
  const n = typeof brut === "number" ? brut : typeof brut === "string" && /^\s*\d{1,2}\s*$/.test(brut) ? Number(brut) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 50) return null;
  const s = sansAccents(source);
  const enChiffres = new RegExp(`(^|[^\\d])0?${n}([^\\d]|$)`).test(s);
  const enLettres = n < NOMBRES_EN_LETTRES.length && new RegExp(`\\b${sansAccents(NOMBRES_EN_LETTRES[n])}\\b`).test(s);
  return enChiffres || enLettres ? n : null;
}

function exigencesVerifiees(v: unknown, source: string): Exigences {
  const e = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    chiffreAffairesMinFcfa: montantVerifie(e.chiffreAffairesMin, source),
    ligneCreditMinFcfa: montantVerifie(e.ligneCreditMin, source),
    marchesSimilairesMin: nombreVerifie(e.marchesSimilairesMin, source),
    experienceMinAnnees: nombreVerifie(e.experienceMinAnnees, source),
    personnelCle: listeCourte(e.personnelCle),
    materiel: listeCourte(e.materiel),
  };
}

function autresDatesVerifiees(v: unknown, source: string): { libelle: string; date: string }[] {
  if (!Array.isArray(v)) return [];
  const sortie: { libelle: string; date: string }[] = [];
  for (const x of v.slice(0, 8)) {
    if (!x || typeof x !== "object") continue;
    const { libelle, date } = x as Record<string, unknown>;
    const iso = dateVerifiee(date, source);
    if (iso && typeof libelle === "string" && libelle.trim()) sortie.push({ libelle: libelle.trim().slice(0, 80), date: iso });
  }
  return sortie;
}

/** Une entrée du cache des lectures IA (data/ia/cache.json), une par adresse d'avis. */
export interface EntreeCache {
  url: string;
  traiteLe: string;
  fournisseur: string;
  modele: string;
  tronque: boolean;
  extraction: ExtractionIa | null;
  /** Version du schéma (VERSION_EXTRACTION) au moment de la lecture. */
  version?: number;
  erreur: string | null;
}
