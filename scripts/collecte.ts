/**
 * Collecte des sites d'autorités contractantes ouverts au public.
 *   node --experimental-strip-types scripts/collecte.ts [--source=senelec,pad,ageroute] [--pause=1500]
 * Résultat fusionné dans data/avis.json (clé = source + url, sans doublon).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseWordPress, type ArticleWp } from "../src/lib/wordpress.ts";
import { nettoyer } from "../src/lib/dcmp.ts";
import { CHAMPS_BM, parseAgeroute, parseArtp, parseBanqueMondiale, parseBceao, parsePad, parsePfongue, parseSenelec, parseUngm, type AvisCollecte } from "../src/lib/sources.ts";

const args = process.argv.slice(2);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const choisies = (opt("source") ?? "senelec,pad,ageroute,banquemondiale,ungm,bceao,artp,pfongue,wordpress").split(",");
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
    // UNGM : portail public des agences de l'ONU. Comme la page publique, on lit
    // d'abord le jeton de session, puis on interroge la recherche (avis ouverts, Sénégal).
    nom: "ungm",
    pages: async function* () {
      const accueil = await fetch("https://www.ungm.org/Public/Notice", { headers: { "User-Agent": "SoumissionPME-collecte/0.1" }, signal: AbortSignal.timeout(45_000) });
      const cookies = (accueil.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
      const jeton = /name="__RequestVerificationToken" type="hidden" value="([^"]+)"/.exec(await accueil.text())?.[1];
      if (!jeton) throw new Error("jeton UNGM introuvable");
      for (let page = 0; page < 10; page++) {
        const r = await fetch("https://www.ungm.org/Public/Notice/Search", {
          method: "POST",
          headers: { "User-Agent": "SoumissionPME-collecte/0.1", "Content-Type": "application/json", RequestVerificationToken: jeton, Cookie: cookies },
          body: JSON.stringify({
            PageIndex: page, PageSize: 15, Title: "", Description: "", Reference: "", PublishedFrom: "", PublishedTo: "", DeadlineFrom: "", DeadlineTo: "",
            Countries: ["2472"], Agencies: [], UNSPSCs: [], NoticeTypes: [], SortField: "DatePublished", SortAscending: false, isPicker: false,
            IsSustainable: false, IsActive: true, NoticeDisplayType: null, NoticeSearchTotalLabelId: "noticeSearchTotal", TypeOfCompetitions: [],
          }),
          signal: AbortSignal.timeout(45_000),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const html = await r.text();
        const lignes = (html.match(/data-noticeid=/gi) ?? []).length;
        yield parseUngm(html);
        if (lignes < 15) return;
        await dormir(pauseMs);
      }
    },
  },
  {
    // Tous les sites WordPress repérés par scripts/sonder-sites.ts (recherche publique),
    // hors sites qui interdisent les robots. Un même lecteur pour tous.
    nom: "wordpress",
    pages: async function* () {
      const fichier = new URL("../sources/sondage.json", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
      if (!existsSync(fichier)) return;
      const sites = (JSON.parse(readFileSync(fichier, "utf8")).resultats as { domaine: string; base: string; wordpress: boolean; robotsInterdit: boolean; typesAvis?: string[] }[])
        .filter((s) => s.wordpress && !s.robotsInterdit && s.base)
        .filter((s, i, tous) => tous.findIndex((x) => x.domaine === s.domaine) === i);
      const depuis = new Date(Date.now() - 120 * 86_400_000).toISOString().slice(0, 19);
      for (const s of sites) {
        try {
          const nom = (JSON.parse(await lire(`${s.base}/wp-json`)) as { name?: string }).name?.trim() || null;
          const articles: ArticleWp[] = [];
          for (const terme of ["appel d'offres", "demande de renseignements", "manifestation d'intérêt", "avis d'appel"]) {
            const url = `${s.base}/wp-json/wp/v2/posts?search=${encodeURIComponent(terme)}&per_page=30&after=${depuis}&_fields=id,date,link,title,content`;
            articles.push(...(JSON.parse(await lire(url)) as ArticleWp[]));
            await dormir(pauseMs / 2);
          }
          const acheteur = nom ? nettoyer(nom) : s.domaine;
          yield parseWordPress(articles, s.domaine, acheteur);
          // Rubriques dédiées aux marchés : lues en entier (pas de recherche par mot-clé)
          for (const rubrique of s.typesAvis ?? []) {
            const url = `${s.base}/wp-json/wp/v2/${rubrique}?per_page=30&after=${depuis}&_fields=id,date,link,title,content`;
            yield parseWordPress(JSON.parse(await lire(url)) as ArticleWp[], s.domaine, acheteur, true);
            await dormir(pauseMs / 2);
          }
        } catch (e) {
          console.error(`  wordpress ${s.domaine} : ${(e as Error).message}`);
        }
        await dormir(pauseMs);
      }
    },
  },
  { nom: "pfongue", pages: async function* () { yield parsePfongue(await lire("https://www.pfongue.org/spip.php?page=backend")); } },
  { nom: "artp", pages: async function* () { yield parseArtp(await lire("https://artp.sn/espace-professionnels/appels-d-offres")); } },
  { nom: "bceao", pages: async function* () { yield parseBceao(await lire("https://www.bceao.int/fr/appels-offres/appels-offres-marches-publics-achats")); } },
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
