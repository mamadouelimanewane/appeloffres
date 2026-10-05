/**
 * Lecteurs des sites d'autorités contractantes (Senelec, Port de Dakar,
 * AGEROUTE). Fonctions pures : le réseau est géré par scripts/collecte.ts.
 */
import { dateIso, nettoyer } from "./dcmp.ts";

export interface AvisCollecte {
  source: string;
  reference: string;
  objet: string;
  type: string | null;
  publieLe: string | null;
  dateLimite: string | null;
  url: string; // page ou document officiel
  /** Acheteur, quand la source le précise (sinon déduit de la source). */
  autorite?: string | null;
}

const MOIS: Record<string, string> = {
  janvier: "01", fevrier: "02", février: "02", mars: "03", avril: "04", mai: "05", juin: "06", juillet: "07",
  aout: "08", août: "08", septembre: "09", octobre: "10", novembre: "11", decembre: "12", décembre: "12",
};

/** « 22 Septembre 2026 » ou « 12 novembre 2025 à 9h 30mn » → ISO ; null sinon. */
export function dateFrancaise(texte: string): string | null {
  const m = /(\d{1,2})(?:er)?\s+([A-Za-zéèûôîà]+)\s+(\d{4})/.exec(texte);
  if (!m) return null;
  const mois = MOIS[m[2].toLowerCase()];
  if (!mois) return null;
  return dateIso(`${m[1].padStart(2, "0")}/${mois}/${m[3]}`);
}

const absolue = (base: string, lien: string) => new URL(lien.replace(/&amp;/g, "&"), base).toString();

/** Senelec : tableau « Référence / Objet / Type / Date limite / lien ». */
export function parseSenelec(html: string, base = "https://www.senelec.sn/"): AvisCollecte[] {
  const sortie: AvisCollecte[] = [];
  for (const [, ligne] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const c = [...ligne.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((x) => x[1]);
    const lien = /href="([^"]+)"/.exec(ligne)?.[1];
    if (c.length < 4 || !lien) continue;
    sortie.push({
      source: "senelec", reference: nettoyer(c[0]), objet: nettoyer(c[1]), type: nettoyer(c[2]) || null,
      publieLe: null, dateLimite: dateIso(nettoyer(c[3])), url: absolue(base, lien),
    });
  }
  return sortie;
}

/** Port Autonome de Dakar : blocs « views-row ». */
export function parsePad(html: string, base = "https://www.portdakar.sn/"): AvisCollecte[] {
  const sortie: AvisCollecte[] = [];
  for (const bloc of html.split(/<div class="views-row /).slice(1)) {
    const titre = /<span class="field-content"><a href="([^"]+)">([\s\S]*?)<\/a>/.exec(bloc);
    if (!titre) continue;
    const champ = (nom: string) => nettoyer(new RegExp(`views-field-${nom}[\\s\\S]*?<div class="field-content">([\\s\\S]*?)</div>`).exec(bloc)?.[1] ?? "");
    const pdf = /<a href="([^"]+\.pdf)"/i.exec(bloc)?.[1];
    sortie.push({
      source: "pad", reference: titre[1].split("/").pop() ?? "", objet: nettoyer(titre[2]),
      type: champ("field-type-de-marches-appel") || null, publieLe: null,
      dateLimite: dateFrancaise(champ("field-date-limite-appel")), url: absolue(base, pdf ?? titre[1]),
    });
  }
  return sortie;
}

const TYPES_BM: Record<string, string> = {
  "Invitation for Bids": "Appel d'offres",
  "Request for Expression of Interest": "Appel à manifestation d'intérêt",
  "Invitation for Prequalification": "Avis de préqualification",
  "General Procurement Notice": "Avis général de passation",
  "Contract Award": "Avis d'attribution",
};

/** Champs à demander explicitement (`fl=`), sinon l'interface omet date limite et acheteur. */
export const CHAMPS_BM = "id,notice_type,noticedate,submission_deadline_date,submission_deadline_time,contact_organization,bid_description,project_name,bid_reference_no,procurement_method_name";

/**
 * Banque mondiale : interface publique search.worldbank.org/api/v2/procnotices.
 * Attention : `submission_date` y est la date de PUBLICATION ; la date limite
 * est `submission_deadline_date`, renvoyée seulement si demandée via CHAMPS_BM.
 */
export function parseBanqueMondiale(json: { procnotices?: Record<string, Record<string, string>> }): AvisCollecte[] {
  return Object.values(json.procnotices ?? {})
    .filter((n) => n.id && (n.bid_description || n.project_name))
    .map((n) => ({
      source: "banquemondiale",
      reference: n.bid_reference_no?.trim() || n.id,
      objet: nettoyer(n.bid_description || `Projet : ${n.project_name}`),
      type: TYPES_BM[n.notice_type] ?? n.notice_type ?? null,
      publieLe: n.noticedate ? dateFrancaise(n.noticedate.replace(/-/g, " ").replace(/\b(\w{3})\b/, (m) => MOIS_EN[m] ?? m)) : null,
      dateLimite: /^\d{4}-\d{2}-\d{2}/.test(n.submission_deadline_date ?? "") ? n.submission_deadline_date.slice(0, 10) : null,
      url: `https://projects.worldbank.org/fr/projects-operations/procurement-detail/${n.id}`,
      autorite: n.contact_organization?.trim() || null,
    }));
}

const MOIS_EN: Record<string, string> = {
  Jan: "janvier", Feb: "février", Mar: "mars", Apr: "avril", May: "mai", Jun: "juin",
  Jul: "juillet", Aug: "août", Sep: "septembre", Oct: "octobre", Nov: "novembre", Dec: "décembre",
};

/** AGEROUTE : fiches « file » du gestionnaire de documents WordPress. */
export function parseAgeroute(html: string): AvisCollecte[] {
  const sortie: AvisCollecte[] = [];
  for (const bloc of html.split(/<div class="file" /).slice(1)) {
    const lien = /<h3><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(bloc);
    if (!lien || lien[1].includes("{{")) continue; // modèle JavaScript de la page
    const desc = /<div class="file-desc">([\s\S]*?)<\/div>/.exec(bloc)?.[1] ?? "";
    const valeur = (nom: string) => nettoyer(new RegExp(`${nom}[^<]*</strong>([^<]*)`, "i").exec(desc)?.[1] ?? "");
    const reference = nettoyer(/R[ée]f[ée]rence:?\s*([^<]*)<\/strong>/i.exec(desc)?.[1] ?? "") || nettoyer(/R[ée]f[ée]rence:<\/strong>([^<]*)/i.exec(desc)?.[1] ?? "");
    sortie.push({
      source: "ageroute", reference, objet: nettoyer(lien[2]), type: valeur("Type d[^:<]{1,10}avis") || null,
      publieLe: dateFrancaise(valeur("Date de publication")), dateLimite: dateFrancaise(valeur("Date limite")), url: lien[1].replace(/&amp;/g, "&"),
    });
  }
  return sortie;
}
