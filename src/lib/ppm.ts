/**
 * Lecture d'un plan de passation des marchés (PPM) exporté de la plateforme
 * APPEL au format PDF, à partir des mots et de leurs positions (pdfjs).
 * Fonction pure : l'extraction PDF est faite par scripts/ppm.ts.
 */
import { dateIso } from "./dcmp.ts";

export interface Mot { p: number; x: number; y: number; t: string }

export interface Realisation {
  plan: string | null;
  direction: string | null;
  reference: string | null;
  objet: string;
  typeMarche: string | null;
  financement: string[];
  mode: string | null;
  lancement: string | null;
  attribution: string | null;
  demarrage: string | null;
  achevement: string | null;
  etat: string | null; // « Retard 71 jours », « Reste 19 jours », « Publié le … »
}

// Abscisses des colonnes (points PDF), relevées sur l'en-tête du tableau.
const COL = {
  ref: [40, 110], objet: [110, 245], type: [245, 345], financement: [345, 455], mode: [455, 512],
  lancement: [512, 556], attribution: [556, 602], demarrage: [602, 647], achevement: [647, 700], etat: [740, 900],
} as const;
type Col = keyof typeof COL;
const colonne = (x: number): Col | null => (Object.keys(COL) as Col[]).find((c) => x >= COL[c][0] && x < COL[c][1]) ?? null;

// Abscisses où commencent les colonnes : une ligne qui n'en touche aucune est un intitulé centré.
const DEBUTS = [51, 117, 250, 347, 352, 458, 516, 561, 607, 652, 751];

const ECART_LIGNES = 13; // au-delà, on change de réalisation
const MARGE = 11; // tolérance verticale autour d'un bloc

const joindre = (mots: Mot[]) => mots.sort((a, b) => a.y - b.y || a.x - b.x).map((m) => m.t.trim()).join(" ").replace(/\s+/g, " ").replace(/\s+-\s+(?=\d)/g, "-").trim();

export function lirePpm(mots: Mot[]): Realisation[] {
  const plan = /N°\s*(P_[A-Z0-9_]+)/.exec(mots.map((m) => m.t).join(" "))?.[1] ?? null;
  const sortie: Realisation[] = [];
  let direction: string | null = null;

  const pages = [...new Set(mots.map((m) => m.p))].sort((a, b) => a - b);
  for (const p of pages) {
    const page = mots.filter((m) => m.p === p);
    const entete = page.find((m) => m.t.includes("achèvement"));
    if (!entete && p === pages[0]) continue; // page de garde sans tableau
    const pied = page.find((m) => /^Copyright/.test(m.t.trim()));
    const zone = page.filter((m) => (!entete || m.y > entete.y + 4) && (!pied || m.y < pied.y - 4));

    // 0. Intitulés de direction : lignes centrées, qui ne commencent à aucune colonne
    const intitules: { y: number; texte: string }[] = [];
    for (const y of [...new Set(zone.map((m) => m.y))]) {
      const ligne = zone.filter((m) => m.y === y);
      if (ligne.every((m) => m.x >= 245 && m.x < 512 && !DEBUTS.some((d) => Math.abs(m.x - d) <= 4)) && ligne.length <= 3) {
        intitules.push({ y, texte: joindre(ligne) });
      }
    }
    const corps = zone.filter((m) => !intitules.some((i) => i.y === m.y));

    // 1. Blocs de lignes de la colonne « objet »
    const lignesObjet = [...new Set(corps.filter((m) => colonne(m.x) === "objet").map((m) => m.y))].sort((a, b) => a - b);
    const blocs: { debut: number; fin: number; mots: Mot[] }[] = [];
    for (const y of lignesObjet) {
      const dernier = blocs.at(-1);
      if (dernier && y - dernier.fin <= ECART_LIGNES) dernier.fin = y;
      else blocs.push({ debut: y, fin: y, mots: [] });
    }

    // 2. Chaque mot va au bloc le plus proche (pour ne pas donner l'état d'une
    //    ligne à sa voisine). Un mot au-dessus du premier bloc d'une page
    //    appartient à la ligne coupée par le saut de page.
    const distance = (m: Mot, b: { debut: number; fin: number }) => (m.y < b.debut ? b.debut - m.y : m.y > b.fin ? m.y - b.fin : 0);
    const suiteDePage: Mot[] = [];
    for (const m of corps) {
      if (colonne(m.x) === "objet") continue;
      if (blocs.length === 0 || (m.y < blocs[0].debut - MARGE && !intitules.some((i) => i.y < m.y))) { suiteDePage.push(m); continue; }
      blocs.reduce((meilleur, x) => (distance(m, x) < distance(m, meilleur) ? x : meilleur)).mots.push(m);
    }
    for (const b of blocs) b.mots.push(...corps.filter((m) => colonne(m.x) === "objet" && m.y >= b.debut && m.y <= b.fin));

    // Ligne coupée par un saut de page : le premier bloc, sans référence ni date
    // et sans intitulé au-dessus, complète la dernière réalisation.
    const premier = blocs[0];
    const precedente = sortie.at(-1);
    const continuation = premier && precedente && !intitules.some((i) => i.y < premier.debut) && !premier.mots.some((m) => colonne(m.x) === "ref" || dateIso(m.t.trim()));
    if (continuation || (precedente && suiteDePage.length)) {
      const suite = [...suiteDePage, ...(continuation ? premier.mots : [])];
      const ajout = (c: Col) => joindre(suite.filter((m) => colonne(m.x) === c));
      if (ajout("objet")) precedente!.objet = `${precedente!.objet} ${ajout("objet")}`.trim();
      if (ajout("mode")) precedente!.mode = `${precedente!.mode ?? ""} ${ajout("mode")}`.trim();
      if (ajout("type")) precedente!.typeMarche = `${precedente!.typeMarche ?? ""} ${ajout("type")}`.trim();
      if (ajout("etat")) precedente!.etat = `${precedente!.etat ?? ""} ${ajout("etat")}`.trim();
      if (continuation) blocs.shift();
    }

    intitules.sort((a, b) => a.y - b.y);
    for (const b of blocs) {
      const avant = intitules.filter((i) => i.y < b.debut).at(-1);
      if (avant) direction = avant.texte;
      const par = (c: Col) => b.mots.filter((m) => colonne(m.x) === c);
      const premiereDate = (c: Col) => {
        const d = par(c).sort((x, y) => x.y - y.y).map((m) => dateIso(m.t.trim())).find(Boolean);
        return d ?? null;
      };
      const ref = par("ref").sort((x, y) => x.y - y.y).map((m) => m.t.trim()).join("");
      const financement = joindre(par("financement")).split(/\s*-\s+/).map((s) => s.trim()).filter(Boolean);
      sortie.push({
        plan,
        direction,
        reference: ref || null,
        objet: joindre(par("objet")),
        typeMarche: joindre(par("type")) || null,
        financement: [...new Set(financement)],
        mode: joindre(par("mode")) || null,
        lancement: premiereDate("lancement"),
        attribution: premiereDate("attribution"),
        demarrage: premiereDate("demarrage"),
        achevement: premiereDate("achevement"),
        etat: joindre(par("etat")) || null,
      });
    }
    // Intitulé en bas de page : il s'applique aux lignes de la page suivante.
    const dernierBloc = blocs.at(-1);
    const finDePage = intitules.filter((i) => !dernierBloc || i.y > dernierBloc.fin).at(-1);
    if (finDePage) direction = finDePage.texte;
  }
  return recollerModes(sortie);
}

/** Un début de mode (« Demande de ») resté sur la ligne précédente est rendu à la suivante. */
function recollerModes(liste: Realisation[]): Realisation[] {
  for (let i = 0; i < liste.length - 1; i++) {
    const m = /^(.*\S)\s+(Demande de|Appel d'Offres|Appel public à)$/.exec(liste[i].mode ?? "");
    const suivante = liste[i + 1];
    if (m && suivante.mode && !suivante.mode.startsWith(m[2])) {
      liste[i].mode = m[1];
      suivante.mode = `${m[2]} ${suivante.mode}`;
    }
  }
  return liste;
}
