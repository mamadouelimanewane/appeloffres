/**
 * Collecte des avis publics du portail DCMP.
 *
 *   node --experimental-strip-types scripts/collecte-dcmp.ts [--details] [--limite=50] [--base=URL]
 *
 * - Liste : une requête par type d'avis (ltype 1 à 4).
 * - --details : récupère aussi le texte et les pièces jointes de chaque fiche
 *   (une requête par fiche, avec pause), en reprenant là où l'exécution
 *   précédente s'est arrêtée.
 * - --base : permet de viser une copie (ex. archive) pour les essais.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { BASE_DCMP, parseFiche, parseListe, type AvisListe, type Fiche } from "../src/lib/dcmp.ts";

const args = process.argv.slice(2);
const opt = (nom: string) => args.find((a) => a.startsWith(`--${nom}=`))?.split("=").slice(1).join("=");
const base = (opt("base") ?? BASE_DCMP).replace(/\/$/, "");
const avecDetails = args.includes("--details");
const limite = Number(opt("limite") ?? 50);
const pauseMs = Number(opt("pause") ?? 1500);
const sortie = new URL("../data/dcmp/appels.json", import.meta.url);
const SOURCE_ID = "dcmp";

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function telecharger(url: string): Promise<string> {
  const reponse = await fetch(url, {
    headers: { "User-Agent": "SoumissionPME-collecte/0.1" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status} pour ${url}`);
  return new TextDecoder("windows-1252").decode(await reponse.arrayBuffer());
}

interface Enregistrement extends AvisListe {
  type: number;
  vuLe: string;
  fiche?: Fiche & { recupereLe: string };
}

const chemin = sortie.pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(dirname(chemin), { recursive: true });
const base_existante: Record<string, Enregistrement> = existsSync(chemin) ? JSON.parse(readFileSync(chemin, "utf8")).avis : {};
const aujourdhui = new Date().toISOString().slice(0, 10);

let nouveaux = 0;
for (const type of [1, 2, 3, 4]) {
  const url = `${base}/index.php?option=com_loffres&task=ltype&id=${type}&Itemid=104`;
  let html: string;
  try {
    html = await telecharger(url);
  } catch (e) {
    console.error(`Type ${type} : échec (${(e as Error).message}). Le portail est peut-être indisponible.`);
    continue;
  }
  const avis = parseListe(html);
  for (const a of avis) {
    const id = `${SOURCE_ID}:${a.cle}`;
    if (!base_existante[id]) nouveaux++;
    base_existante[id] = { ...base_existante[id], ...a, type, vuLe: base_existante[id]?.vuLe ?? aujourdhui };
  }
  console.log(`Type ${type} : ${avis.length} avis lus`);
  await dormir(pauseMs);
}

function enregistrer() {
  writeFileSync(chemin, JSON.stringify({ source: SOURCE_ID, misAJourLe: new Date().toISOString(), avis: base_existante }, null, 1));
}
enregistrer();

if (avecDetails) {
  const afaire = Object.values(base_existante).filter((a) => !a.fiche).slice(0, limite);
  let ok = 0;
  for (const a of afaire) {
    try {
      const fiche = parseFiche(await telecharger(`${base}/index.php?option=com_loffres&task=txt&key=${a.cle}&Itemid=104`));
      base_existante[`${SOURCE_ID}:${a.cle}`].fiche = { ...fiche, recupereLe: new Date().toISOString() };
      ok++;
    } catch (e) {
      console.error(`Fiche ${a.cle} : ${(e as Error).message}`);
    }
    if (ok % 10 === 0) enregistrer();
    await dormir(pauseMs);
  }
  enregistrer();
  console.log(`Fiches récupérées : ${ok}/${afaire.length}`);
}

console.log(`Total ${Object.keys(base_existante).length} avis (${nouveaux} nouveaux). Fichier : ${chemin}`);
