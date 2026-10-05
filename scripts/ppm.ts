/**
 * Lit un plan de passation (PDF exporté d'APPEL) et produit un JSON.
 *   node --experimental-strip-types scripts/ppm.ts <fichier.pdf | URL> [--autorite=SENELEC] [--sortie=data/ppm/senelec-2026.json]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { lirePpm, type Mot } from "../src/lib/ppm.ts";

const args = process.argv.slice(2);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const source = args.find((a) => !a.startsWith("--"));
if (!source) throw new Error("Indiquer un fichier PDF ou une URL.");
const autorite = opt("autorite") ?? null;

const octets = /^https?:/.test(source)
  ? new Uint8Array(await (await fetch(source, { headers: { "User-Agent": "SoumissionPME-collecte/0.1" } })).arrayBuffer())
  : new Uint8Array(readFileSync(source));

const doc = await getDocument({ data: octets, verbosity: 0 }).promise;
const mots: Mot[] = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const { height } = page.getViewport({ scale: 1 });
  for (const it of (await page.getTextContent()).items) {
    if (!("str" in it) || !it.str.trim()) continue;
    mots.push({ p, x: Math.round(it.transform[4]), y: Math.round(height - it.transform[5]), t: it.str });
  }
}

const realisations = lirePpm(mots).map((r) => ({ autorite, source: /^https?:/.test(source) ? source : null, ...r }));
const sortie = opt("sortie") ?? `data/ppm/${(autorite ?? "plan").toLowerCase()}.json`;
mkdirSync(dirname(sortie), { recursive: true });
writeFileSync(sortie, JSON.stringify(realisations, null, 1));

const sans = (f: keyof (typeof realisations)[number]) => realisations.filter((r) => !r[f] || (Array.isArray(r[f]) && !(r[f] as unknown[]).length)).length;
console.log(`${doc.numPages} pages, ${realisations.length} réalisations → ${sortie}`);
console.log(`Champs manquants : référence ${sans("reference")}, type ${sans("typeMarche")}, mode ${sans("mode")}, lancement ${sans("lancement")}, financement ${sans("financement")}`);
