/**
 * Prépare les données affichées par l'application à partir des collectes :
 *   data/avis.json, data/ppm/*.json  →  src/data/avis.json, src/data/a-venir.json
 *   node --experimental-strip-types scripts/publier-donnees.ts [--date=2026-10-05]
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { secteurDe, type Appel } from "../src/lib/data.ts";
import type { AvisCollecte } from "../src/lib/sources.ts";
import type { Realisation } from "../src/lib/ppm.ts";
import type { Attribution } from "../src/lib/attributions.ts";
import type { Gagne } from "../src/lib/stats.ts";
import { achatsRecurrents } from "../src/lib/recurrents.ts";
import type { PlanDcmp } from "../src/lib/plans-dcmp.ts";

const chemin = (rel: string) => new URL(rel, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const aujourdhui = process.argv.find((a) => a.startsWith("--date="))?.split("=")[1] ?? new Date().toISOString().slice(0, 10);
const ilYa = (jours: number) => new Date(new Date(aujourdhui).getTime() - jours * 86_400_000).toISOString().slice(0, 10);

const SOURCES: Record<string, { libelle: string; autorite: string | null }> = {
  senelec: { libelle: "Senelec", autorite: "Senelec" },
  pad: { libelle: "Port Autonome de Dakar", autorite: "Port Autonome de Dakar" },
  ageroute: { libelle: "AGEROUTE", autorite: "AGEROUTE Sénégal" },
  banquemondiale: { libelle: "Banque mondiale", autorite: null },
  ungm: { libelle: "Nations unies (UNGM)", autorite: null },
  bceao: { libelle: "BCEAO", autorite: "BCEAO" },
  artp: { libelle: "ARTP", autorite: "ARTP" },
  pfongue: { libelle: "ONG (PFONGUE)", autorite: null },
  dcmp: { libelle: "DCMP (marchespublics.sn)", autorite: null },
};

const idDe = (source: string, url: string) => `${source}-${createHash("sha1").update(url).digest("hex").slice(0, 10)}`;

// 1. Avis : encore ouverts, ou récents quand la date limite n'est pas connue
const brut: Record<string, AvisCollecte> = existsSync(chemin("../data/avis.json")) ? JSON.parse(readFileSync(chemin("../data/avis.json"), "utf8")).avis : {};
const avis: Appel[] = Object.values(brut)
  .filter((a) => (a.dateLimite ? a.dateLimite >= aujourdhui : (a.publieLe ?? "") >= ilYa(45)))
  // Un avis de report ou un additif concerne un appel encore ouvert : on le garde.
  .filter((a) => !/attribution|annulation|infructueux/i.test(a.type ?? ""))
  .map((a) => ({
    id: idDe(a.source, a.url),
    source: a.source,
    sourceLibelle: SOURCES[a.source]?.libelle ?? (a.source.startsWith("wp:") ? "Sites institutionnels" : a.source),
    reference: a.reference,
    titre: a.objet,
    autorite: a.autorite ?? SOURCES[a.source]?.autorite ?? "Voir l'avis",
    secteur: secteurDe(`${a.type ?? ""} ${a.objet}`),
    region: null,
    mode: a.type,
    budgetEstime: null,
    garantieSoumission: null,
    publieLe: a.publieLe,
    dateLimite: a.dateLimite,
    url: a.url,
  }))
  .sort((x, y) => (x.dateLimite ?? "9999").localeCompare(y.dateLimite ?? "9999"));

// 2. Marchés à venir : réalisations des plans de passation non encore publiées.
//    Un avis collecté qui cite la référence du plan (ex. « T_DQSE_201 ») prouve la publication.
const texteDesAvis = Object.values(brut).map((a) => `${a.reference} ${a.objet}`).join("\n").toUpperCase();
const dejaPublie = (ref: string | null) => !!ref && ref.length >= 6 && texteDesAvis.includes(ref.toUpperCase());
const dossierPpm = chemin("../data/ppm/");
const realisations = (existsSync(dossierPpm) ? readdirSync(dossierPpm).filter((f) => f.endsWith(".json")) : [])
  .flatMap((f) => JSON.parse(readFileSync(dossierPpm + f, "utf8")) as (Realisation & { autorite: string | null })[]);
const publiees = realisations.filter((r) => dejaPublie(r.reference)).length;
const aVenir = realisations
  .filter((r) => !/Publié/.test(r.etat ?? "") && r.mode !== "Avenant" && !dejaPublie(r.reference))
  .map((r) => ({
    id: idDe("ppm", `${r.plan}:${r.reference}`),
    autorite: r.autorite,
    plan: r.plan,
    direction: r.direction,
    reference: r.reference,
    objet: r.objet,
    typeMarche: r.typeMarche,
    secteur: secteurDe(`${r.typeMarche ?? ""} ${r.objet}`),
    financement: r.financement,
    mode: r.mode,
    lancement: r.lancement,
    attribution: r.attribution,
    etat: r.etat,
  }))
  .sort((x, y) => (x.lancement ?? "").localeCompare(y.lancement ?? ""));

// 3. Marchés attribués (archives DCMP) : un lot = une ligne, pour des prix de référence précis.
//    On ne garde ni le texte complet ni les coordonnées des entreprises.
const fichierAttr = chemin("../data/dcmp/attributions.json");
const attributions = (existsSync(fichierAttr) ? JSON.parse(readFileSync(fichierAttr, "utf8")) : []) as (Attribution & { id: string })[];
const gagnes: Gagne[] = attributions.flatMap((a): Gagne[] => {
  const annee = a.datePublicationAo?.slice(0, 4) ?? null;
  const base = { avis: null, autorite: a.autorite, annee };
  if (a.lots.length > 1) {
    return a.lots.map((l, i) => ({
      ...base, id: `${a.id}:${i}`, objet: l.designation, avis: a.objet, attributaire: l.attributaire,
      montantFcfa: l.montantFcfa, nombreOffres: l.nombreOffres, secteur: secteurDe(`${l.designation} ${a.objet ?? ""}`),
    }));
  }
  if (!a.objet) return [];
  return [{ ...base, id: a.id, objet: a.objet, attributaire: a.attributaire, montantFcfa: a.montantFcfa, nombreOffres: a.nombreOffres, secteur: secteurDe(a.objet) }];
});

// 4. Achats récurrents (plans de passation archivés de la DCMP) : vus au moins 3 années.
const fichierPlans = chemin("../data/dcmp/plans.json");
const recurrents = existsSync(fichierPlans)
  ? achatsRecurrents(JSON.parse(readFileSync(fichierPlans, "utf8")) as PlanDcmp[], 3)
      .map(({ id, ...r }) => ({ ...r, id: createHash("sha1").update(id).digest("hex").slice(0, 10) }))
      .sort((a, b) => b.annees.at(-1)!.localeCompare(a.annees.at(-1)!) || b.annees.length - a.annees.length)
  : null;

mkdirSync(chemin("../src/data/"), { recursive: true });
if (recurrents) writeFileSync(chemin("../src/data/recurrents.json"), JSON.stringify({ misAJourLe: aujourdhui, recurrents }));
// Sans les archives (ex. collecte automatique sur GitHub), on garde les attributions déjà publiées.
if (existsSync(fichierAttr)) writeFileSync(chemin("../src/data/attributions.json"), JSON.stringify({ misAJourLe: aujourdhui, lignes: gagnes }));
writeFileSync(chemin("../src/data/avis.json"), JSON.stringify({ misAJourLe: aujourdhui, avis }, null, 1));
writeFileSync(chemin("../src/data/a-venir.json"), JSON.stringify({ misAJourLe: aujourdhui, realisations: aVenir }, null, 1));

const parSource: Record<string, number> = {};
avis.forEach((a) => (parSource[a.sourceLibelle] = (parSource[a.sourceLibelle] ?? 0) + 1));
console.log(`Avis publiés dans l'application : ${avis.length}`, parSource);
console.log(existsSync(fichierAttr) ? `Marchés attribués (lignes, lots compris) : ${gagnes.length}` : "Marchés attribués : archives absentes, fichier publié conservé");
console.log(recurrents ? `Achats récurrents (3 ans et plus) : ${recurrents.length}` : "Achats récurrents : plans archivés absents, fichier publié conservé");
console.log(`Marchés à venir : ${aVenir.length} (${publiees} réalisations retirées car un avis publié cite leur référence)`);
