/**
 * Analyse d'une page « Plans de passation › détail par autorité » du portail
 * DCMP (copies archivées). Même format de sortie que le lecteur de PPM PDF.
 */
import { dateIso, nettoyer } from "./dcmp.ts";
import type { Realisation } from "./ppm.ts";

export interface PlanDcmp {
  autorite: string | null;
  /** Catégorie d'acheteur quand le portail l'indique (ex. « Etat (Administration centrale ) »). */
  categorie: string | null;
  annee: string | null;
  plan: string | null;
  versionDu: string | null; // date de la dernière version, ISO
  realisations: Realisation[];
}

export function parsePlanDcmp(html: string): PlanDcmp {
  const texte = nettoyer(html);
  // Fil d'Ariane : « Plans de passation > [catégorie] > Acheteur 2024 Informations générales »
  const entete = /Plans de passation\s*>\s*([^>]*?)\s*>\s*(.+?)\s+(\d{4})\s+Informations g/i.exec(texte);
  const plan = /R[ée]f[ée]rences?\s*:\s*(P_[A-Za-z0-9_-]+)/.exec(texte)?.[1] ?? null;
  const anneeDuPlan = plan ? /_(20\d{2})_/.exec(plan)?.[1] ?? null : null;
  const version = /Version\s*:\s*\d+\s+du\s+(\d{2}\/\d{2}\/\d{4})/.exec(texte)?.[1];

  const realisations: Realisation[] = [];
  let direction: string | null = null;
  for (const [, ligne] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cellules = [...ligne.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)];
    // Intitulé de direction : une seule cellule sur toute la largeur du tableau
    if (cellules.length === 1 && /colspan="?7/.test(cellules[0][1])) {
      direction = nettoyer(cellules[0][2]) || direction;
      continue;
    }
    if (cellules.length < 6) continue;
    const c = cellules.map((x) => nettoyer(x[2]));
    if (!/^[CFTS]_\S+$/.test(c[0])) continue;
    realisations.push({
      plan,
      direction,
      reference: c[0],
      objet: c[1],
      typeMarche: c[2] || null,
      financement: [],
      mode: c[3] || null,
      lancement: dateIso(c[4]),
      attribution: dateIso(c[5]),
      demarrage: null,
      achevement: null,
      etat: null,
    });
  }

  return {
    autorite: entete?.[2] ?? null,
    categorie: entete?.[1] || null,
    annee: entete?.[3] ?? anneeDuPlan,
    plan,
    versionDu: version ? dateIso(version) : null,
    realisations,
  };
}
