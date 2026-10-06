/**
 * Sonde la liste des sites candidats (sources/sites-candidats.json) :
 * le site répond-il ? autorise-t-il les robots ? expose-t-il une recherche
 * WordPress ? y trouve-t-on des appels d'offres récents ?
 *   node --experimental-strip-types scripts/sonder-sites.ts
 * Résultat : sources/sondage.json (et le résumé à l'écran).
 */
import { readFileSync, writeFileSync } from "node:fs";

const chemin = (rel: string) => new URL(rel, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const liste = JSON.parse(readFileSync(chemin("../sources/sites-candidats.json"), "utf8")).categories as Record<string, string[]>;
const UA = { "User-Agent": "SoumissionPME-collecte/0.1" };

async function get(url: string, ms = 15_000): Promise<{ statut: number; texte: string } | null> {
  try {
    const r = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(ms) });
    return { statut: r.status, texte: await r.text() };
  } catch {
    return null;
  }
}

interface Resultat {
  domaine: string;
  categorie: string;
  joignable: boolean;
  base: string | null; // https://domaine ou https://www.domaine
  robotsInterdit: boolean;
  wordpress: boolean;
  avisRecents: number; // articles « appel d'offres » publiés ces 120 derniers jours
  typesAvis: string[]; // rubriques WordPress dédiées aux avis (rest_base)
  dernier: string | null;
  exemple: string | null;
}

const RUBRIQUE_AVIS = /avis|march[eé]|appel|tender|procurement|consultation|offre/i;

/** robots.txt interdit-il tout le site à tous les robots ? */
export function robotsInterditTout(robots: string): boolean {
  let pourTous = false;
  for (const ligne of robots.split(/\r?\n/).map((l) => l.trim())) {
    if (/^user-agent:\s*\*/i.test(ligne)) pourTous = true;
    else if (/^user-agent:/i.test(ligne)) pourTous = false;
    else if (pourTous && /^disallow:\s*\/\s*$/i.test(ligne)) return true;
  }
  return false;
}

async function sonder(domaine: string, categorie: string): Promise<Resultat> {
  const r: Resultat = { domaine, categorie, joignable: false, base: null, robotsInterdit: false, wordpress: false, avisRecents: 0, typesAvis: [], dernier: null, exemple: null };
  for (const base of [`https://${domaine}`, `https://www.${domaine}`]) {
    const accueil = await get(base + "/");
    if (accueil && accueil.statut < 500) {
      r.joignable = true;
      r.base = base;
      break;
    }
  }
  if (!r.base) return r;
  const robots = await get(r.base + "/robots.txt", 10_000);
  r.robotsInterdit = !!robots && robots.statut === 200 && robotsInterditTout(robots.texte);
  if (r.robotsInterdit) return r;
  const depuis = new Date(Date.now() - 120 * 86_400_000).toISOString().slice(0, 19);
  const wp = await get(`${r.base}/wp-json/wp/v2/posts?search=${encodeURIComponent("appel d'offres")}&per_page=20&after=${depuis}&_fields=date,title,link`);
  if (wp && wp.statut === 200 && wp.texte.trim().startsWith("[")) {
    r.wordpress = true;
    // Rubriques dédiées aux marchés (ex. « avis-marche-public », « tenders ») : lues en entier par le collecteur
    const types = await get(`${r.base}/wp-json/wp/v2/types`);
    try {
      r.typesAvis = Object.entries(JSON.parse(types?.texte ?? "{}") as Record<string, { rest_base: string }>)
        .filter(([cle]) => RUBRIQUE_AVIS.test(cle) && !/emploi|job|candidat/i.test(cle))
        .map(([, v]) => v.rest_base);
    } catch {}
    try {
      const articles = JSON.parse(wp.texte) as { date: string; title: { rendered: string }; link: string }[];
      r.avisRecents = articles.length;
      r.dernier = articles[0]?.date?.slice(0, 10) ?? null;
      r.exemple = articles[0]?.title?.rendered?.slice(0, 90) ?? null;
    } catch {}
  }
  return r;
}

const taches = Object.entries(liste).flatMap(([categorie, domaines]) => [...new Set(domaines)].map((d) => ({ d, categorie })));
const resultats: Resultat[] = [];
let suivant = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (suivant < taches.length) {
      const { d, categorie } = taches[suivant++];
      resultats.push(await sonder(d, categorie));
    }
  }),
);

resultats.sort((a, b) => b.avisRecents - a.avisRecents || Number(b.wordpress) - Number(a.wordpress) || a.domaine.localeCompare(b.domaine));
writeFileSync(chemin("../sources/sondage.json"), JSON.stringify({ sondeLe: new Date().toISOString(), resultats }, null, 1));
const n = (f: (r: Resultat) => boolean) => resultats.filter(f).length;
console.log(`${resultats.length} sites sondés : ${n((r) => r.joignable)} joignables, ${n((r) => r.robotsInterdit)} interdisent les robots, ${n((r) => r.wordpress)} WordPress lisibles, ${n((r) => r.avisRecents > 0)} avec des appels d'offres récents`);
for (const r of resultats.filter((x) => x.avisRecents > 0)) console.log(`  ${r.domaine} (${r.categorie}) : ${r.avisRecents} — dernier ${r.dernier} — ${r.exemple}`);
for (const r of resultats.filter((x) => x.typesAvis.length)) console.log(`  rubrique dédiée : ${r.domaine} → ${r.typesAvis.join(", ")}`);
