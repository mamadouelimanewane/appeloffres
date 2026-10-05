/**
 * Analyse des avis d'attribution du portail DCMP (copies archivées).
 * Les avis sont rédigés librement : chaque champ vaut null quand il n'est pas
 * identifié avec certitude, et le texte complet est toujours conservé.
 */
import { dateIso, nettoyer } from "./dcmp.ts";

export interface Lot {
  designation: string;
  montantFcfa: number | null;
  nombreOffres: number | null;
  attributaire: string;
  delai: string | null;
}

export interface Attribution {
  objet: string | null;
  autorite: string | null;
  reference: string | null;
  statut: "provisoire" | "définitive" | null;
  datePublicationAo: string | null; // ISO
  nombreOffres: number | null;
  attributaire: string | null;
  montantFcfa: number | null;
  lots: Lot[];
  texte: string;
}

/** « 56.922.185 F CFA » ou « 56 922 185 » → 56922185 ; null si ce n'est pas un montant plausible. */
export function montantFcfa(texte: string): number | null {
  const m = /(\d{1,3}(?:[ . ]\d{3})+|\d{4,})/.exec(texte);
  if (!m) return null;
  const n = Number(m[1].replace(/[ . ]/g, ""));
  return Number.isFinite(n) && n >= 10_000 ? n : null;
}

const apres = (texte: string, motif: RegExp): string | null => motif.exec(texte)?.[1]?.trim() || null;

/** Écarte les captures qui ne sont pas un nom d'entreprise (« 6. », « DRP », « : »…). */
function nomValide(nom: string | null): string | null {
  if (!nom) return null;
  const n = nom.replace(/^[\s:;.,-]+|[\s:;,-]+$/g, "").trim();
  if (n.length < 3 || !/[A-Za-zÀ-ÿ]{2}/.test(n) || /^(DRP|N°|Néant|n[ée]ant|aucun|infructueux)$/i.test(n)) return null;
  return n;
}

/** Tableau « Désignations | Montant | Nombre d'offres | Attributions | Délais ». */
function lireLots(html: string): Lot[] {
  // l'en-tête peut être encodé (« D&eacute;signations ») et entouré de <span>
  const debut = html.search(/D(?:é|e|&eacute;)signations?\s*(?:<\/span>\s*)?<\/t[dh]>/i);
  if (debut < 0) return [];
  const fin = html.indexOf("</table>", debut);
  const lots: Lot[] = [];
  for (const [, ligne] of html.slice(debut, fin > 0 ? fin : undefined).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const c = [...ligne.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((x) => nettoyer(x[1]));
    if (c.length < 4 || /^D[ée]signation/i.test(c[0]) || !c[3]) continue;
    const brut = Number(c[1].replace(/[ . ]/g, ""));
    lots.push({
      designation: c[0],
      montantFcfa: Number.isFinite(brut) && brut > 0 ? brut : null, // 0 = montant non publié
      nombreOffres: /^\d+$/.test(c[2]) ? Number(c[2]) : null,
      attributaire: c[3],
      delai: c[4] || null,
    });
  }
  return lots;
}

export function parseAttribution(html: string): Attribution {
  // Corps de l'avis : à partir du titre (objet), jusqu'au pied de page
  const iTitre = html.search(/class="Title"/i);
  const corpsHtml = html.slice(iTitre >= 0 ? iTitre : 0, html.search(/Copyright/i) > 0 ? html.search(/Copyright/i) : undefined);
  const titre = /class="Title"[^>]*>([\s\S]*?)<\/td>/i.exec(corpsHtml)?.[1];
  const texte = nettoyer(corpsHtml.replace(/^class="Title"[^>]*>/i, ""));

  const objet =
    (titre ? nettoyer(titre) : null) ||
    apres(texte, /D[ée]nomination du march[ée]\s*:\s*[«"]?\s*(.+?)\s*[»"]?\s*(?:\.\s*\(|Nombre d.offres|$)/i);

  // Acheteur : entre la devise nationale et le titre, ou entre l'objet et « AVIS D'ATTRIBUTION »
  const iAvis = texte.search(/AVIS D.ATTRIBUTION/i);
  let autorite = apres(texte, /Une Foi\s+(.+?)\s+AVIS D.ATTRIBUTION/i);
  if (!autorite && objet && iAvis > 0 && texte.startsWith(objet)) {
    const entre = texte.slice(objet.length, iAvis).trim();
    if (entre.length >= 3 && entre.length <= 200) autorite = entre;
  }

  const reference =
    apres(texte, /Num[ée]ro du march[ée]\s*:\s*N°\s*([^\s].*?)\s+D[ée]nomination/i) ??
    apres(texte, /R[ée]f[ée]rence de publication\s*:\s*Publication N°\s*(\S+)/i) ??
    apres(texte, /Appel d.offres N°\s*(\S+)/i);

  const statut = /ATTRIBUTION\s+PROVISOIRE/i.test(texte) ? "provisoire" : /ATTRIBUTION\s+D[ÉE]FINITIVE/i.test(texte) ? "définitive" : null;

  const dateTexte = apres(texte, /Dates? de publication de l.Appel d.offres\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);
  const nombre = apres(texte, /Nombre d.offres re[çc]ues(?: et identit[ée] des candidats)?\s*:?\s*(\d+)/i);

  const lots = lireLots(corpsHtml);
  const attributaireTexte = nomValide(
    apres(texte, /attributaires?\s+(?:provisoires?|d[ée]finitifs?)\s*:\s*(.+?)(?:\s+\d\.\s|\s+D[ée]lais|\s+La publication|$)/i) ??
    apres(texte, /Montant TTC\s+(.+?)\s+(?:Adresse|Rue|Avenue|BP|B\.P|Sacr|Dakar|Immeuble|Zone|Cit[ée]|[A-Z][a-zé]+,|\d{2,3}\s*\d{2,3}\s*\d{2})/),
  );
  const attributairesLots = [...new Set(lots.map((l) => nomValide(l.attributaire)).filter((n): n is string => !!n))];

  const montantTexte =
    apres(texte, /Montant des offres retenues[^:]*:\s*([^A-Za-z]{4,30})/i) ?? apres(texte, /([\d .]{6,20})\s*F\s*CFA/i);
  const montantLots = lots.reduce((s, l) => s + (l.montantFcfa ?? 0), 0);

  return {
    objet,
    autorite,
    reference,
    statut,
    datePublicationAo: dateTexte ? dateIso(dateTexte) : null,
    nombreOffres: nombre ? Number(nombre) : lots.length ? Math.max(...lots.map((l) => l.nombreOffres ?? 0)) || null : null,
    attributaire: attributaireTexte ?? (attributairesLots.length ? attributairesLots.join(" ; ") : null),
    montantFcfa: (montantTexte ? montantFcfa(montantTexte) : null) ?? (montantLots > 0 ? montantLots : null),
    lots,
    texte,
  };
}
