/**
 * Enrichissement des avis par IA : date limite, montant, garantie, pièces exigées,
 * résumé — lus dans le document de l'avis (page ou PDF), puis CONTRÔLÉS.
 *   node --experimental-strip-types scripts/enrichir-ia.ts [--max=30] [--pause=1500]
 * Fournisseur choisi par variables d'environnement (voir src/lib/ia/fournisseurs.ts).
 * Sans clé : rien n'est fait. Résultats en cache : data/ia/cache.json (un avis
 * n'est jamais envoyé deux fois). Seul le texte PUBLIC des avis est envoyé.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { nettoyer } from "../src/lib/dcmp.ts";
import { CONSIGNE_SYSTEME, preparerTexte, validerExtraction, type EntreeCache } from "../src/lib/ia/extraction.ts";
import { fournisseurIa } from "../src/lib/ia/fournisseurs.ts";
import type { AvisCollecte } from "../src/lib/sources.ts";

const args = process.argv.slice(2);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const maxAppels = Number(opt("max") ?? 30);
const pauseMs = Number(opt("pause") ?? 1500);
const chemin = (rel: string) => new URL(rel, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Sources déjà structurées (champs fournis par leur interface) ou pages non lisibles sans navigateur
const SOURCES_IGNOREES = new Set(["appel", "ungm", "banquemondiale", "dcmp"]);

const ia = fournisseurIa();
if (!ia) {
  console.log("IA désactivée : aucune clé (DEEPSEEK_API_KEY ou ANTHROPIC_API_KEY). Rien à faire.");
  process.exit(0);
}

const fichierCache = chemin("../data/ia/cache.json");
mkdirSync(dirname(fichierCache), { recursive: true });
const cache: Record<string, EntreeCache> = existsSync(fichierCache) ? JSON.parse(readFileSync(fichierCache, "utf8")) : {};
const avis = Object.values(JSON.parse(readFileSync(chemin("../data/avis.json"), "utf8")).avis as Record<string, AvisCollecte>);

const aujourdhui = new Date().toISOString().slice(0, 10);
const ilYa45 = new Date(Date.now() - 45 * 86_400_000).toISOString().slice(0, 10);
const candidats = avis
  .filter((a) => !SOURCES_IGNOREES.has(a.source) && !cache[a.url])
  .filter((a) => (a.dateLimite ? a.dateLimite >= aujourdhui : (a.publieLe ?? "") >= ilYa45))
  // d'abord ceux à qui il manque la date limite : c'est là que l'IA est la plus utile
  .sort((x, y) => Number(!!x.dateLimite) - Number(!!y.dateLimite))
  .slice(0, maxAppels);

async function texteDuDocument(url: string): Promise<string> {
  const r = await fetch(url, { headers: { "User-Agent": "SoumissionPME-collecte/0.1" }, signal: AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const type = r.headers.get("content-type") ?? "";
  const octets = new Uint8Array(await r.arrayBuffer());
  if (/pdf/i.test(type) || /\.pdf($|\?)/i.test(url)) {
    const doc = await getDocument({ data: octets, verbosity: 0 }).promise;
    const pages: string[] = [];
    for (let p = 1; p <= Math.min(doc.numPages, 20); p++) {
      const contenu = await (await doc.getPage(p)).getTextContent();
      pages.push(contenu.items.map((it) => ("str" in it ? it.str : "")).join(" "));
    }
    return pages.join("\n");
  }
  const html = new TextDecoder("utf-8").decode(octets);
  // le corps principal si on le trouve, sinon toute la page
  const principal = /<(main|article)[\s\S]*?<\/\1>/i.exec(html)?.[0] ?? html;
  return nettoyer(principal);
}

/** Échec lié au document lui-même (vide, scanné, introuvable) : inutile de le relire chaque jour. */
function estDefinitive(erreur: string): boolean {
  return /texte insuffisant|HTTP 404|HTTP 410/i.test(erreur);
}

console.log(`IA : ${ia.nom} (${ia.modele}) — ${candidats.length} avis à analyser (plafond ${maxAppels})`);
let ok = 0, echecs = 0;
for (const a of candidats) {
  const entree: EntreeCache = { url: a.url, traiteLe: new Date().toISOString(), fournisseur: ia.nom, modele: ia.modele, tronque: false, extraction: null, erreur: null };
  try {
    const brut = await texteDuDocument(a.url);
    if (brut.replace(/\s/g, "").length < 200) throw new Error("texte insuffisant (document scanné ou vide)");
    const { texte, tronque } = preparerTexte(brut);
    entree.tronque = tronque;
    entree.extraction = validerExtraction(await ia.extraire(CONSIGNE_SYSTEME, texte), texte);
    ok++;
    const e = entree.extraction;
    console.log(`  ✔ ${a.objet.slice(0, 60)} → limite ${e.dateLimite ?? "?"}, ${e.piecesExigees.length} pièce(s)${e.estUnAvis ? "" : " [pas un avis]"}`);
  } catch (err) {
    entree.erreur = (err as Error).message.slice(0, 300);
    echecs++;
    console.log(`  ✖ ${a.objet.slice(0, 60)} : ${entree.erreur}`);
    // Compte sans crédit, clé refusée : inutile d'insister, et ces avis seront relus plus tard
    if (/HTTP (401|402|403)\b|Insufficient Balance|invalid.?api.?key|authentication/i.test(entree.erreur)) {
      console.log("IA : arrêt — vérifiez la clé et le crédit du compte du fournisseur.");
      break;
    }
    // Erreur passagère (quota, réseau, serveur, réponse vide) : pas de mémorisation, on réessaiera
    if (!estDefinitive(entree.erreur)) {
      await dormir(pauseMs);
      continue;
    }
  }
  cache[a.url] = entree;
  writeFileSync(fichierCache, JSON.stringify(cache, null, 1));
  await dormir(pauseMs);
}
console.log(`IA : ${ok} avis enrichis, ${echecs} échec(s). Cache : ${Object.keys(cache).length} avis.`);
