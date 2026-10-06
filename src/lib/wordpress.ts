/**
 * Lecteur générique des sites WordPress (très répandus dans l'administration
 * sénégalaise) : interface publique /wp-json/wp/v2/posts?search=…
 * Un seul lecteur sert pour tous les sites repérés par scripts/sonder-sites.ts.
 */
import { dateIso, nettoyer } from "./dcmp.ts";
import { dateFrancaise, type AvisCollecte } from "./sources.ts";

export interface ArticleWp {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  content?: { rendered: string };
}

const EST_UN_AVIS = /appel d.offres|avis d.appel|demande de (renseignements?( et)?( de)? prix|cotation|prix|propositions?)|\bDRP\b|\bAAO\b|\bAMI\b|manifestation d.int[ée]r[êe]t|sollicitation de (prix|manifestation)|consultation (restreinte|ouverte)|appel [àa] la concurrence|appel [àa] candidatures? pour (le recrutement d.un (cabinet|consultant|bureau))/i;
const PAS_UN_AVIS = /attribution|r[ée]sultats?|infructueu|annulation|offre d.emploi|recrutement d.un\(?e?\)? (agent|stagiaire|assistant|chauffeur|secr[ée]taire)|avis de recrutement|concours|bourse|\bstages?\b|^appels? [àa] candidatures?\s*$/i;
const CITE_LE_SENEGAL = /s[ée]n[ée]gal|dakar|thi[èe]s|saint-louis|kaolack|ziguinchor|touba|tambacounda|kolda|louga|matam|fatick|kaffrine|s[ée]dhiou|k[ée]dougou|diourbel/i;

/**
 * Date limite de dépôt trouvée dans le texte : après « date limite », « au plus tard »,
 * « dépôt des offres » ou « remise des offres ». Null si rien de fiable.
 */
export function extraireDateLimite(texte: string): string | null {
  const t = texte.replace(/\s+/g, " ");
  const repere = /(date limite[^.]{0,80}?|au plus tard (le )?|d[ée]p[ôo]t des (offres|dossiers|plis)[^.]{0,60}?|remise des (offres|plis)[^.]{0,60}?)/gi;
  for (const m of t.matchAll(repere)) {
    const suite = t.slice(m.index! + m[0].length, m.index! + m[0].length + 60);
    const chiffres = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/.exec(suite);
    if (chiffres) {
      const d = dateIso(`${chiffres[1].padStart(2, "0")}/${chiffres[2].padStart(2, "0")}/${chiffres[3]}`);
      if (d) return d;
    }
    const lettres = dateFrancaise(suite);
    if (lettres) return lettres;
  }
  return null;
}

/**
 * @param domaine   ex. « isra.sn » ; pour un site hors .sn, l'avis doit citer le Sénégal
 * @param acheteur  nom du site (champ « name » de /wp-json), affiché comme acheteur
 */
export function parseWordPress(articles: ArticleWp[], domaine: string, acheteur: string | null, rubriqueDediee = false): AvisCollecte[] {
  const sortie: AvisCollecte[] = [];
  const vus = new Set<string>();
  for (const a of articles) {
    if (vus.has(a.link)) continue;
    vus.add(a.link);
    const titre = nettoyer(a.title?.rendered ?? "");
    const texte = nettoyer(a.content?.rendered ?? "");
    // Dans une rubrique dédiée aux marchés, tout article est un avis (sauf attributions, résultats…)
    if (!titre || (!rubriqueDediee && !EST_UN_AVIS.test(`${titre} ${texte.slice(0, 400)}`)) || PAS_UN_AVIS.test(titre)) continue;
    // Site international : le Sénégal (ou une ville sénégalaise) doit être cité dans le titre.
    // Le texte ne suffit pas : certains sites (ex. Enabel) n'y indiquent pas le pays, ou le
    // citent seulement dans une liste en bas de page.
    if (!/\.sn$/.test(domaine) && !CITE_LE_SENEGAL.test(titre)) continue;
    sortie.push({
      source: `wp:${domaine}`,
      reference: /N[°o]\s*([A-Z0-9][A-Z0-9_\/.-]{3,})/.exec(`${titre} ${texte.slice(0, 600)}`)?.[1] ?? "non communiquée",
      objet: titre,
      type: /manifestation d.int/i.test(titre) ? "Appel à manifestation d'intérêt" : /renseignements?.{0,10}prix|cotation|\bDRP\b/i.test(titre) ? "Demande de renseignements et de prix" : "Appel d'offres",
      publieLe: a.date?.slice(0, 10) ?? null,
      dateLimite: extraireDateLimite(texte),
      url: a.link,
      autorite: acheteur,
    });
  }
  return sortie;
}
