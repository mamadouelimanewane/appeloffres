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
  // abréviations (ex. ARTP : « 07 oct 2026 »)
  janv: "01", jan: "01", fevr: "02", févr: "02", fev: "02", fév: "02", mar: "03", avr: "04", juil: "07", aou: "08", aoû: "08",
  sept: "09", sep: "09", oct: "10", nov: "11", dec: "12", déc: "12",
};

/** « 22 Septembre 2026 » ou « 12 novembre 2025 à 9h 30mn » → ISO ; null sinon. */
export function dateFrancaise(texte: string): string | null {
  const m = /(\d{1,2})(?:er)?\s+([A-Za-zéèûôîà]+)\.?\s+(\d{4})/.exec(texte);
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

/** « 18-Oct-2026 12:00 (GMT 2.00) » → « 2026-10-18 ». */
export function dateAnglaise(texte: string): string | null {
  const m = /(\d{1,2})-([A-Za-z]{3})-(\d{4})/.exec(texte);
  return m && MOIS_EN[m[2]] ? dateFrancaise(`${m[1]} ${MOIS_EN[m[2]]} ${m[3]}`) : null;
}

const TYPES_UNGM: Record<string, string> = {
  "Request for quotation": "Demande de cotation",
  "Request for proposal": "Demande de propositions",
  "Invitation to bid": "Appel d'offres",
  "Call for individual consultants": "Recrutement de consultant",
  "Request for EOI": "Appel à manifestation d'intérêt",
  "Request for information": "Demande d'informations",
};

const AGENCES_ONU: Record<string, string> = {
  UNDP: "PNUD", WFP: "PAM", UNIDO: "ONUDI", ILO: "OIT", WHO: "OMS", IOM: "OIM", UNHCR: "HCR", UNFPA: "UNFPA", UNICEF: "UNICEF", FAO: "FAO", UNOPS: "UNOPS", "UN Women": "ONU Femmes", UNESCO: "UNESCO", UNEP: "PNUE", IFAD: "FIDA",
};

/**
 * UNGM (portail commun des agences de l'ONU) : réponse HTML de /Public/Notice/Search.
 * On garde les avis destinés au Sénégal, et ceux « à destinations multiples »
 * qui citent le Sénégal ou Dakar dans leur titre.
 */
export function parseUngm(html: string): AvisCollecte[] {
  const sortie: AvisCollecte[] = [];
  for (const bloc of html.split(/<div[^>]+data-noticeid=/i).slice(1)) {
    const id = /^["']?(\d+)/.exec(bloc)?.[1];
    const titre = nettoyer(/<span class="ungm-title[^"]*">([\s\S]*?)<\/span>/.exec(bloc)?.[1] ?? "");
    if (!id || !titre) continue;
    const cellules = [...bloc.matchAll(/<div[^>]*class="[^"]*tableCell[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => nettoyer(m[1]));
    const iLimite = cellules.findIndex((c) => /\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2}/.test(c));
    if (iLimite < 0) continue;
    const [publie, agence, type, reference] = cellules.slice(iLimite + 1, iLimite + 5);
    const pays = cellules.at(-1) ?? "";
    const pourLeSenegal = /^S[ée]n[ée]gal$/i.test(pays) || (/Multiple/i.test(pays) && /s[ée]n[ée]gal|dakar/i.test(titre));
    if (!pourLeSenegal) continue;
    const nomAgence = AGENCES_ONU[agence] ?? agence;
    sortie.push({
      source: "ungm",
      reference: reference || id,
      // sans le sigle et la référence en tête (« LRFP-2026-9206486– Mise en place… »)
      objet: titre.replace(/^(ITB|RFQ|RFP|EOI|LRFPS?|LRFQ)\b[\s:\-–]*(\d[\d\s-]*[–-]\s*)?/i, ""),
      type: TYPES_UNGM[type] ?? type ?? null,
      publieLe: dateAnglaise(publie ?? ""),
      dateLimite: dateAnglaise(cellules[iLimite]),
      url: `https://www.ungm.org/Public/Notice/${id}`,
      autorite: nomAgence ? `${nomAgence} (Nations unies)` : null,
    });
  }
  return sortie;
}

const SENEGAL = /s[ée]n[ée]gal|dakar|kaolack|ziguinchor|saint-louis|thi[èe]s|tambacounda|si[èe]ge/i;
const AUTRES_PAYS_UEMOA = /b[ée]nin|cotonou|c[ôo]te d.ivoire|abidjan|burkina|ouagadougou|bobo|mali\b|bamako|niger\b|niamey|togo|lom[ée]|bissau/i;

/**
 * BCEAO (siège à Dakar) : rubrique « Appel d'offres – En cours ». On écarte
 * les avis qui ne concernent qu'un autre pays de l'UEMOA.
 */
export function parseBceao(html: string): AvisCollecte[] {
  const iClos = html.search(/<h2[^>]*>[^<]*<span>\s*Clos/i);
  const enCours = iClos > 0 ? html.slice(0, iClos) : html;
  const sortie: AvisCollecte[] = [];
  for (const bloc of enCours.split(/<div class="itemDoc views-row">/).slice(1)) {
    const lien = /<a href="([^"]+)"/.exec(bloc)?.[1];
    const objet = nettoyer(/<span class="ttr">([\s\S]*?)<\/span>/.exec(bloc)?.[1] ?? "");
    if (!lien || !objet) continue;
    if (AUTRES_PAYS_UEMOA.test(objet) && !SENEGAL.test(objet)) continue;
    const sousTitre = /<span class="subTtr">([\s\S]*?)<\/span>/.exec(bloc)?.[1] ?? "";
    const reference = nettoyer(sousTitre.split(/Date limite/i)[0]);
    sortie.push({
      source: "bceao",
      reference: reference || "non communiquée",
      objet: objet.replace(/^RELANCE\s*-\s*/i, "") + (/^RELANCE/i.test(objet) ? " (relance)" : ""),
      type: /^AO\//.test(reference) ? "Appel d'offres" : /^DP\//.test(reference) ? "Demande de propositions" : /^AC\//.test(reference) ? "Appel à la concurrence" : null,
      publieLe: dateFrancaise(nettoyer(/<span class="infoFile">([\s\S]*?)<\/span>/.exec(bloc)?.[1] ?? "")),
      dateLimite: dateFrancaise(nettoyer(sousTitre.split(/Date limite/i)[1] ?? "")),
      url: lien,
      autorite: "BCEAO",
    });
  }
  return sortie;
}

/** ARTP (régulateur des télécoms) : liste « Date limite : … » + titre de l'avis. */
export function parseArtp(html: string, base = "https://artp.sn/"): AvisCollecte[] {
  const sortie: AvisCollecte[] = [];
  for (const bloc of html.split(/class="card-text date-ao"\s*>/).slice(1)) {
    const lien = /<h3 class="card-title">\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(bloc);
    if (!lien) continue;
    const objet = nettoyer(lien[2]);
    const type = /attribution/i.test(objet) ? "Avis d'attribution"
      : /rectificatif|additif/i.test(objet) ? "Additif"
      : /renseignements? (de|et de) prix/i.test(objet) ? "Demande de renseignements et de prix"
      : /international/i.test(objet) ? "Appel d'offres international"
      : "Appel d'offres";
    sortie.push({
      source: "artp",
      reference: /N°\s*([A-Z]_ARTP_\d+)/.exec(objet)?.[1] ?? "non communiquée",
      objet,
      type,
      publieLe: null,
      dateLimite: dateFrancaise(nettoyer(bloc.slice(0, bloc.indexOf("</div>")))),
      url: absolue(base, lien[1]),
      autorite: "ARTP",
    });
  }
  return sortie;
}

/**
 * PFONGUE (plate-forme des ONG européennes au Sénégal) : flux RSS du site (SPIP).
 * Les annonces mêlent offres d'emploi et appels d'offres : on ne garde que les
 * seconds. La date limite est dans le PDF joint, d'où dateLimite = null.
 */
export function parsePfongue(rss: string): AvisCollecte[] {
  const sortie: AvisCollecte[] = [];
  for (const [, item] of rss.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)) {
    const titre = nettoyer(/<title>([\s\S]*?)<\/title>/.exec(item)?.[1] ?? "");
    const lien = /<link>([^<]+)<\/link>/.exec(item)?.[1]?.trim();
    if (!lien || !/^(Appel d.offres|Appel [àa] (manifestation|candidature)|Demande de (cotation|prix|propositions)|Avis d.appel|Consultation)/i.test(titre)) continue;
    const date = /<dc:date>(\d{4}-\d{2}-\d{2})/.exec(item)?.[1] ?? null;
    sortie.push({
      source: "pfongue",
      reference: "non communiquée",
      objet: titre.replace(/^(Appel d.offres|Avis d.appel d.offres)\s*[_:–-]\s*/i, ""),
      type: /cotation/i.test(titre) ? "Demande de cotation" : /manifestation/i.test(titre) ? "Appel à manifestation d'intérêt" : "Appel d'offres",
      publieLe: date,
      dateLimite: null,
      url: lien,
      autorite: "ONG (plate-forme PFONGUE)",
    });
  }
  return sortie;
}

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
