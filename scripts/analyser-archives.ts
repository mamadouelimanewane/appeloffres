/**
 * Transforme les pages archivées (data/archive/<type>/) en données structurées.
 *   node --experimental-strip-types scripts/analyser-archives.ts [--type=attribution]
 * Sortie : data/dcmp/<type>s.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseAttribution } from "../src/lib/attributions.ts";
import { parsePlanDcmp } from "../src/lib/plans-dcmp.ts";

const type = process.argv.find((a) => a.startsWith("--type="))?.split("=")[1] ?? "attribution";
const chemin = (rel: string) => new URL(rel, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const dossier = chemin(`../data/archive/${type}/`);
const indexChemin = dossier + "index.json";
if (!existsSync(indexChemin)) throw new Error(`Rien à analyser : ${indexChemin} absent. Lancer d'abord archive-dcmp.ts --type=${type}`);

const index: Record<string, { fichier: string; copieLe: string; url: string }> = JSON.parse(readFileSync(indexChemin, "utf8"));
const sortie: unknown[] = [];

for (const [cle, { fichier, copieLe, url }] of Object.entries(index)) {
  const html = new TextDecoder("windows-1252").decode(readFileSync(dossier + fichier));
  if (type === "attribution") {
    const idAvis = /idavis=(\d+)/.exec(cle)?.[1] ?? cle;
    sortie.push({ id: `dcmp:attribution:${idAvis}`, copieLe, source: url.replace(/^https?:\/\/web\.archive\.org\/web\/\d+(?:id_)?\//, ""), ...parseAttribution(html) });
  } else if (type === "plan") {
    const p = parsePlanDcmp(html);
    if (p.realisations.length) sortie.push({ id: `dcmp:plan:${p.plan ?? cle}`, copieLe, source: url.replace(/^https?:\/\/web\.archive\.org\/web\/\d+(?:id_)?\//, ""), ...p });
  } else {
    throw new Error(`Type non pris en charge pour l'instant : ${type}`);
  }
}

// Un même avis est parfois publié plusieurs fois : on garde une seule occurrence.
const uniques = new Map<string, unknown>();
for (const x of sortie as Record<string, unknown>[]) {
  // pour un plan, la même référence (P_..._version) peut avoir été archivée plusieurs fois
  const cle = type === "attribution" ? [x.reference, x.objet, x.attributaire].join("|") : String(x.id);
  if (!uniques.has(cle)) uniques.set(cle, x);
}
console.log(`${sortie.length - uniques.size} doublons retirés`);
sortie.length = 0;
sortie.push(...uniques.values());

mkdirSync(chemin("../data/dcmp/"), { recursive: true });
const fichierSortie = chemin(`../data/dcmp/${type}s.json`);
writeFileSync(fichierSortie, JSON.stringify(sortie, null, 1));

if (type === "attribution") {
  const a = sortie as ReturnType<typeof parseAttribution>[];
  const avec = (champ: keyof ReturnType<typeof parseAttribution>) => a.filter((x) => x[champ] !== null).length;
  console.log(`${a.length} avis analysés → ${fichierSortie}`);
  console.log(`Taux d'extraction : objet ${avec("objet")}, autorité ${avec("autorite")}, référence ${avec("reference")}, offres ${avec("nombreOffres")}, attributaire ${avec("attributaire")}, montant ${avec("montantFcfa")}`);
}
