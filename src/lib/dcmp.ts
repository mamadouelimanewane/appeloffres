/**
 * Lecture des pages publiques du portail des marchés publics (DCMP).
 * Fonctions pures : le réseau est géré par scripts/collecte-dcmp.ts.
 */

export interface AvisListe {
  cle: string; // identifiant interne du portail (paramètre `key`)
  reference: string;
  objet: string;
  publieLe: string | null; // ISO
  dateLimite: string | null; // ISO
  /** Incohérence dans la source (ex. date limite avant la publication). */
  anomalie: string | null;
  url: string;
}

export const BASE_DCMP = "http://www.marchespublics.sn";

const ENTITES: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">",
  "&eacute;": "é", "&egrave;": "è", "&ecirc;": "ê", "&agrave;": "à", "&acirc;": "â", "&ccedil;": "ç",
  "&ocirc;": "ô", "&icirc;": "î", "&ucirc;": "û", "&ugrave;": "ù", "&euml;": "ë", "&iuml;": "ï",
  "&deg;": "°", "&rsquo;": "'", "&lsquo;": "'", "&laquo;": "«", "&raquo;": "»", "&ldquo;": '"', "&rdquo;": '"',
  "&ndash;": "-", "&mdash;": "-", "&bull;": "•", "&hellip;": "…", "&euro;": "€", "&oelig;": "œ",
  "&Eacute;": "É", "&Egrave;": "È", "&Agrave;": "À", "&Ccedil;": "Ç", "&ouml;": "ö", "&uuml;": "ü",
};

function decoderEntites(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/gi, (e) => ENTITES[e] ?? ENTITES[e.toLowerCase()] ?? " ");
}

export function nettoyer(fragment: string): string {
  const sansBalises = fragment
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    // liens cachés (spam injecté dans certaines pages archivées du portail)
    .replace(/<a\b[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/a>/gi, " ")
    .replace(/<[^>]*>/g, " ");
  // Deux passes : certains avis sont encodés deux fois (« &amp;#039; »).
  return decoderEntites(decoderEntites(sansBalises)).replace(/\s+/g, " ").trim();
}

/** « 27/08/2024 » → « 2024-08-27 » ; null si illisible ou impossible. */
export function dateIso(texte: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texte.trim());
  if (!m) return null;
  const [, j, mo, a] = m;
  const d = new Date(`${a}-${mo}-${j}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.getUTCDate() !== Number(j)) return null;
  return `${a}-${mo}-${j}`;
}

export function urlFiche(cle: string): string {
  return `${BASE_DCMP}/index.php?option=com_loffres&task=txt&key=${cle}&Itemid=104`;
}

/** Extrait les lignes du tableau « Référence / Libellé / Publié le / Date limite / Détail ». */
export function parseListe(html: string): AvisListe[] {
  const sortie: AvisListe[] = [];
  const vus = new Set<string>();
  for (const [, ligne] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cle = /task=txt&(?:amp;)?key=(\d+)/.exec(ligne)?.[1];
    if (!cle || vus.has(cle)) continue;
    const cellules = [...ligne.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => nettoyer(c[1]));
    if (cellules.length < 4) continue;
    vus.add(cle);
    const publieLe = dateIso(cellules[2]);
    const dateLimite = dateIso(cellules[3]);
    let anomalie: string | null = null;
    if (!publieLe || !dateLimite) anomalie = "date illisible";
    else if (dateLimite < publieLe) anomalie = "date limite antérieure à la publication";
    sortie.push({ cle, reference: cellules[0], objet: cellules[1], publieLe, dateLimite, anomalie, url: urlFiche(cle) });
  }
  return sortie;
}

export interface Fiche {
  texte: string;
  documents: string[];
}

/** Texte de l'avis et pièces jointes d'une fiche de détail. */
export function parseFiche(html: string): Fiche {
  const debut = html.search(/Texte de l.avis/i);
  const zone = debut >= 0 ? html.slice(debut) : html;
  const fin = zone.search(/<div class="footer"|Copyright/i);
  const corps = fin > 0 ? zone.slice(0, fin) : zone;
  const documents = [...corps.matchAll(/href="([^"]+\.(?:pdf|docx?|xlsx?|zip))"/gi)].map((m) => new URL(m[1].replace(/&amp;/g, "&"), BASE_DCMP + "/").toString());
  return { texte: nettoyer(corps).replace(/^Texte de l.avis[^ ]*( d.appel d.offres)?/i, "").trim(), documents: [...new Set(documents)] };
}
