/**
 * Achats récurrents : marchés qu'un même acheteur inscrit à son plan de
 * passation plusieurs années de suite. Sert à prévenir les PME avant même
 * la publication du plan de l'année.
 */
import { secteurDe, type Secteur } from "./data.ts";
import type { PlanDcmp } from "./plans-dcmp.ts";

export interface Recurrent {
  id: string;
  autorite: string;
  categorie: string | null;
  objet: string; // libellé le plus récent
  secteur: Secteur;
  typeMarche: string | null;
  mode: string | null;
  annees: string[]; // années où l'achat figure au plan, croissantes
  moisHabituel: number | null; // 1-12 : mois de lancement le plus fréquent
}

/** Libellé ramené à l'essentiel pour reconnaître le même achat d'une année à l'autre. */
export function cleObjet(objet: string): string {
  return objet
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/[^a-z ]+/g, " ")
    .replace(/\b(de|des|du|la|le|les|l|d|et|pour|au|aux|en|a|un|une|s)\b/g, " ")
    .replace(/s\b/g, "") // pluriels simples : « véhicules » = « véhicule »
    .replace(/\s+/g, " ")
    .trim();
}

function plusFrequent<T>(valeurs: T[]): T | null {
  const n = new Map<T, number>();
  for (const v of valeurs) n.set(v, (n.get(v) ?? 0) + 1);
  let meilleur: T | null = null;
  let max = 0;
  for (const [v, k] of n) if (k > max) [meilleur, max] = [v, k];
  return meilleur;
}

export function achatsRecurrents(plans: PlanDcmp[], anneesMin = 2): Recurrent[] {
  // Dernière version du plan de chaque acheteur pour chaque année
  const derniers = new Map<string, PlanDcmp>();
  for (const p of plans) {
    if (!p.autorite || !p.annee) continue;
    const k = `${p.autorite}|${p.annee}`;
    const d = derniers.get(k);
    if (!d || (p.versionDu ?? "") > (d.versionDu ?? "")) derniers.set(k, p);
  }

  const groupes = new Map<string, { plan: PlanDcmp; objet: string; type: string | null; mode: string | null; mois: number | null }[]>();
  for (const p of derniers.values()) {
    for (const r of p.realisations) {
      const cle = `${p.autorite}|${cleObjet(r.objet)}`;
      if (cle.endsWith("|")) continue;
      const g = groupes.get(cle) ?? [];
      g.push({ plan: p, objet: r.objet, type: r.typeMarche, mode: r.mode, mois: r.lancement ? Number(r.lancement.slice(5, 7)) : null });
      groupes.set(cle, g);
    }
  }

  const sortie: Recurrent[] = [];
  for (const [cle, g] of groupes) {
    const annees = [...new Set(g.map((x) => x.plan.annee!))].sort();
    if (annees.length < anneesMin) continue;
    const recent = g.reduce((a, b) => ((b.plan.annee ?? "") > (a.plan.annee ?? "") ? b : a));
    sortie.push({
      id: cle,
      autorite: recent.plan.autorite!,
      categorie: recent.plan.categorie,
      // sans l'année d'origine (« … - gestion 2021 ») : c'est une prévision pour les années à venir
      objet: recent.objet.replace(/[\s,–-]*(?:au titre de |pour )?(?:la |l')?(?:gestion|exercice|ann[ée]e)?\s*(?:19|20)\d{2}\b/gi, "").replace(/[\s,–-]+$/, "").trim() || recent.objet,
      secteur: secteurDe(`${recent.type ?? ""} ${recent.objet}`),
      typeMarche: plusFrequent(g.map((x) => x.type).filter(Boolean)),
      mode: plusFrequent(g.map((x) => x.mode).filter(Boolean)),
      annees,
      moisHabituel: plusFrequent(g.map((x) => x.mois).filter((m): m is number => m !== null && m >= 1 && m <= 12)),
    });
  }
  return sortie.sort((a, b) => b.annees.length - a.annees.length || a.autorite.localeCompare(b.autorite));
}
