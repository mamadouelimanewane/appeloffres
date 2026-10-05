/**
 * Collecte des sites d'autorités contractantes ouverts au public.
 *   node --experimental-strip-types scripts/collecte.ts [--source=senelec,pad,ageroute] [--pause=1500]
 * Résultat fusionné dans data/avis.json (clé = source + url, sans doublon).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { CHAMPS_BM, parseAgeroute, parseBanqueMondiale, parsePad, parseSenelec, type AvisCollecte } from "../src/lib/sources.ts";

const args = process.argv.slice(2);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const choisies = (opt("source") ?? "senelec,pad,ageroute,banquemondiale").split(",");
const pauseMs = Number(opt("pause") ?? 1500);
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function lire(url: string): Promise<string> {
  const r = await fetch(url, {
    headers: { "User-Agent": "SoumissionPME-collecte/0.1" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

interface Source { nom: string; pages: () => AsyncGenerator<AvisCollecte[]> }

const SOURCES: Source[] = [
  { nom: "senelec", pages: async function* () { yield parseSenelec(await lire("https://www.senelec.sn/marches/passation/?tab=appels")); } },
  {
    nom: "pad",
    pages: async function* () {
      const vus = new Set<string>();
      for (let p = 0; p < 15; p++) {
        const avis = parsePad(await lire(`https://www.portdakar.sn/fr/opportunite-daffaire/appels-d-offres?page=${p}`));
        const neufs = avis.filter((a) => !vus.has(a.url));
        if (neufs.length === 0) return;
        neufs.forEach((a) => vus.add(a.url));
        yield neufs;
        await dormir(pauseMs);
      }
    },
  },
  {
    // Interface officielle et publique de la Banque mondiale (avis récents, hors attributions).
    nom: "banquemondiale",
    pages: async function* () {
      const url = `https://search.worldbank.org/api/v2/procnotices?format=json&project_ctry_name_exact=Senegal&rows=500&srt=noticedate&order=desc&fl=${CHAMPS_BM}`;
      yield parseBanqueMondiale(JSON.parse(await lire(url))).filter((a) => a.type !== "Avis d'attribution");
    },
  },
  {
    nom: "ageroute",
    pages: async function* () {
      for (const u of ["avis-dappel-doffres-de-travaux", "avis-dappel-doffres-de-fournitures", "avis-de-manifestation-dinteret"]) {
        yield parseAgeroute(await lire(`https://ageroute.sn/${u}/`));
        await dormir(pauseMs);
      }
    },
  },
];

const chemin = new URL("../data/avis.json", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(dirname(chemin), { recursive: true });
const base: Record<string, AvisCollecte & { vuLe: string }> = existsSync(chemin) ? JSON.parse(readFileSync(chemin, "utf8")).avis : {};
const aujourdhui = new Date().toISOString().slice(0, 10);

for (const s of SOURCES.filter((x) => choisies.includes(x.nom))) {
  let lus = 0, nouveaux = 0;
  try {
    for await (const lot of s.pages()) {
      for (const a of lot) {
        const id = `${a.source}:${a.url}`;
        if (!base[id]) nouveaux++;
        base[id] = { ...a, vuLe: base[id]?.vuLe ?? aujourdhui };
        lus++;
      }
    }
  } catch (e) {
    console.error(`${s.nom} : arrêt (${(e as Error).message})`);
  }
  console.log(`${s.nom} : ${lus} avis lus, ${nouveaux} nouveaux`);
}
writeFileSync(chemin, JSON.stringify({ misAJourLe: new Date().toISOString(), avis: base }, null, 1));
console.log(`Total ${Object.keys(base).length} avis dans ${chemin}`);
