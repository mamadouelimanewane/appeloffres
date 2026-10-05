/**
 * Télécharge, depuis Internet Archive, les copies des pages du portail DCMP :
 * attributions, plans de passation, avis généraux, fiches d'appels d'offres.
 *
 *   node --experimental-strip-types scripts/archive-dcmp.ts --type=attribution [--limite=200] [--pause=2500]
 *
 * Types : attribution | plan | avisgeneral | fiche
 * Les pages brutes sont enregistrées dans data/archive/<type>/<n>.html (reprise
 * automatique) ; l'analyse se fait ensuite hors ligne.
 * Politesse : une requête à la fois, pause entre requêtes, arrêt net après
 * plusieurs échecs consécutifs (pour ne pas surcharger le service).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const args = process.argv.slice(2);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const type = opt("type") ?? "attribution";
const limite = Number(opt("limite") ?? 200);
const pauseMs = Number(opt("pause") ?? 2500);

const MOTIFS: Record<string, RegExp> = {
  attribution: /option=com_attribution&task=view_texte/,
  plan: /option=com_plan&task=detailautorite/,
  avisgeneral: /option=com_avisgeneral&task=detailautorite/,
  fiche: /option=com_loffres&task=txt/,
};
if (!MOTIFS[type]) throw new Error(`Type inconnu : ${type}`);

const racine = new URL(`../data/archive/${type}/`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(racine, { recursive: true });
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

const COMPOSANT: Record<string, string> = { attribution: "com_attribution", plan: "com_plan", avisgeneral: "com_avisgeneral", fiche: "com_loffres" };
/** Connexion instable : jusqu'à 6 essais, attente croissante. */
async function avecReprises<T>(travail: () => Promise<T>, essais = 6): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await travail();
    } catch (e) {
      if (i >= essais) throw e;
      console.error(`Connexion impossible (essai ${i}/${essais}), nouvelle tentative…`);
      await dormir(i * 10_000);
    }
  }
}

const cacheCdx = racine + "cdx.txt";
let cdx: string;
if (existsSync(cacheCdx)) {
  cdx = readFileSync(cacheCdx, "utf8");
} else {
  cdx = await avecReprises(async () => {
    const r = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=marchespublics.sn&matchType=domain&filter=statuscode:200&filter=original:.*${COMPOSANT[type]}.*&collapse=urlkey&fl=timestamp,original&limit=500000`,
      { headers: { "User-Agent": "SoumissionPME-collecte/0.1" }, signal: AbortSignal.timeout(120_000) },
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  });
  writeFileSync(cacheCdx, cdx);
}

// Dernière copie de chaque page (les plus récentes en premier)
const copies = new Map<string, { t: string; url: string }>();
for (const ligne of cdx.trim().split("\n")) {
  const [t, url] = ligne.split(" ");
  if (!url || !MOTIFS[type].test(url.replace(/&amp;/g, "&"))) continue;
  const cle = url.replace(/^https?:\/\/[^/]+/, "").replace(/\s+/g, "").replace(/&amp;/g, "&");
  const ancien = copies.get(cle);
  if (!ancien || ancien.t < t) copies.set(cle, { t, url });
}
console.log(`${copies.size} pages archivées de type ${type}`);

const indexChemin = racine + "index.json";
const index: Record<string, { fichier: string; copieLe: string; url: string }> = existsSync(indexChemin) ? JSON.parse(readFileSync(indexChemin, "utf8")) : {};

let ok = 0, echecs = 0;
for (const [cle, { t, url }] of copies) {
  if (index[cle]) continue;
  if (ok >= limite || echecs >= 5) break;
  try {
    const octets = await avecReprises(async () => {
      const r = await fetch(`https://web.archive.org/web/${t}id_/${url}`, { headers: { "User-Agent": "SoumissionPME-collecte/0.1" }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return Buffer.from(await r.arrayBuffer());
    }, 2);
    const fichier = createHash("sha1").update(cle).digest("hex").slice(0, 12) + ".html";
    writeFileSync(racine + fichier, octets);
    index[cle] = { fichier, copieLe: t, url };
    ok++;
    echecs = 0;
    if (ok % 20 === 0) writeFileSync(indexChemin, JSON.stringify(index));
  } catch (e) {
    echecs++;
    console.error(`Échec (${echecs}/5) : ${(e as Error).message}`);
    await dormir(pauseMs * 4);
  }
  await dormir(pauseMs);
}
writeFileSync(indexChemin, JSON.stringify(index));
console.log(`${ok} pages téléchargées ; ${Object.keys(index).length}/${copies.size} au total.${echecs >= 5 ? " Arrêt : trop d'échecs, réessayer plus tard." : ""}`);
