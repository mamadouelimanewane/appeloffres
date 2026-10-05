/**
 * Analyse des avis d'attribution du portail DCMP (copies archivées).
 * Les avis sont rédigés librement : chaque champ vaut null quand il n'est pas
 * identifié avec certitude, et le texte complet est toujours conservé.
 */
import { dateIso, nettoyer } from "./dcmp.ts";

export interface Attribution {
  objet: string | null;
  autorite: string | null;
  reference: string | null;
  datePublicationAo: string | null; // ISO
  nombreOffres: number | null;
  attributaire: string | null;
  montantFcfa: number | null;
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

export function parseAttribution(html: string): Attribution {
  const complet = nettoyer(html);
  const debut = complet.search(/publication attribution/i);
  const fin = complet.search(/Copyright/i);
  const texte = complet.slice(debut >= 0 ? debut + "publication attribution".length : 0, fin > 0 ? fin : undefined).trim();

  const objet =
    apres(texte, /D[ée]nomination du march[ée]\s*:\s*[«"]?\s*(.+?)\s*[»"]?\s*(?:\.\s*\(|Nombre d.offres|$)/i) ??
    apres(texte, /^(.+?)\s+(?:REPUBLIQUE DU SENEGAL|Minist[èe]re|Agence|AVIS D)/i);

  const autorite = apres(texte, /Une Foi\s+(.+?)\s+AVIS D.ATTRIBUTION/i);

  const reference =
    apres(texte, /Num[ée]ro du march[ée]\s*:\s*N°\s*([^\s].*?)\s+D[ée]nomination/i) ??
    apres(texte, /R[ée]f[ée]rence de publication\s*:\s*Publication N°\s*(\S+)/i);

  const dateTexte = apres(texte, /Dates? de publication de l.Appel d.offres\s*:\s*(\d{2}\/\d{2}\/\d{4})/i);
  const nombre = apres(texte, /Nombre d.offres re[çc]ues\s*:?\s*(\d+)/i) ?? apres(texte, /Nombre d.offres re[çc]ues et identit[ée] des candidats\s*:\s*(\d+)/i);

  const definitif = apres(texte, /Attributaire d[ée]finitif\s*:\s*(.+?)(?:\s+\d\.\s|\s+D[ée]lais|\s+La publication|$)/i);
  const provisoire = apres(texte, /Montant TTC\s+(.+?)\s+(?:Adresse|Rue|Avenue|BP|B\.P|Sacr|Dakar|Immeuble|Zone|Cit[ée]|[A-Z][a-zé]+,|\d{2,3}\s*\d{2,3}\s*\d{2})/);

  const montantTexte =
    apres(texte, /Montant des offres retenues[^:]*:\s*([^A-Za-z]{4,30})/i) ?? apres(texte, /([\d .]{6,20})\s*F\s*CFA/i);

  return {
    objet,
    autorite,
    reference,
    datePublicationAo: dateTexte ? dateIso(dateTexte) : null,
    nombreOffres: nombre ? Number(nombre) : null,
    attributaire: definitif ?? provisoire,
    montantFcfa: montantTexte ? montantFcfa(montantTexte) : null,
    texte,
  };
}
