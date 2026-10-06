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
}

export const CONSIGNE_SYSTEME = `Tu lis des avis d'appels d'offres publics du Sénégal et tu en extrais les informations en json.
Règles impératives :
- N'invente rien. Si une information n'est pas écrite dans le texte, mets null (ou [] pour une liste).
- Recopie les dates telles qu'elles apparaissent dans le texte (ex. "15 octobre 2026" ou "15/10/2026").
- Recopie les montants en chiffres tels qu'ils apparaissent (ex. "1 000 000").
- "estUnAvis" vaut false si le texte n'est pas un avis d'appel d'offres, de demande de prix ou de manifestation d'intérêt (actualité, offre d'emploi, attribution, résultat…).
- "piecesExigees" : pièces administratives ou documents que le candidat doit fournir, en phrases courtes.
- "resume" : 2 phrases simples en français pour un chef de PME : ce qui est demandé et la condition la plus importante.
Réponds uniquement avec un objet json de cette forme :
{"estUnAvis": true, "objet": "...", "acheteur": "...", "reference": "...", "typeProcedure": "...", "dateLimite": "15 octobre 2026", "heureLimite": "10h00", "montantEstime": "45 000 000", "garantieSoumission": "900 000", "piecesExigees": ["..."], "lieuDepot": "...", "resume": "..."}`;

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
  const iso = chiffres ? dateIso(`${chiffres[1].padStart(2, "0")}/${chiffres[2].padStart(2, "0")}/${chiffres[3]}`) : dateFrancaise(b) ?? (/^\d{4}-\d{2}-\d{2}$/.test(b) ? b : null);
  if (!iso) return null;
  // Présence dans le texte : sous la forme renvoyée, ou sous une autre forme courante de la même date
  const [a, m, j] = iso.split("-");
  const mois = MOIS_LETTRES[Number(m) - 1];
  const jour = Number(j) === 1 ? "1er" : String(Number(j));
  const formes = [b, `${j}/${m}/${a}`, `${Number(j)}/${m}/${a}`, `${j}-${m}-${a}`, `${j}.${m}.${a}`, `${jour} ${mois} ${a}`, `${j} ${mois} ${a}`];
  const s = source.toLowerCase();
  const trouvee = formes.some((f) => s.includes(f.toLowerCase())) || (dateFrancaise(b) !== null && s.includes(b.toLowerCase().replace(/^0/, "")));
  return trouvee ? iso : null;
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
  };
}

/** Une entrée du cache des lectures IA (data/ia/cache.json), une par adresse d'avis. */
export interface EntreeCache {
  url: string;
  traiteLe: string;
  fournisseur: string;
  modele: string;
  tronque: boolean;
  extraction: ExtractionIa | null;
  erreur: string | null;
}
