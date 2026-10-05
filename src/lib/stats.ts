import type { Secteur } from "./data";

/** Une attribution (ou un lot) prête à afficher. */
export interface Gagne {
  id: string;
  objet: string;
  avis: string | null; // objet de l'avis quand la ligne est un lot
  autorite: string | null;
  attributaire: string | null;
  montantFcfa: number | null;
  nombreOffres: number | null;
  annee: string | null;
  secteur: Secteur;
}

export function mediane(valeurs: number[]): number | null {
  if (valeurs.length === 0) return null;
  const v = [...valeurs].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
}

export interface Resume {
  marches: number;
  montantMedian: number | null;
  montantMin: number | null;
  montantMax: number | null;
  offresMedianes: number | null;
  /** part des marchés (avec nombre d'offres connu) n'ayant reçu qu'une offre */
  partUneOffre: number | null;
}

export function resumer(lignes: Gagne[]): Resume {
  const montants = lignes.map((l) => l.montantFcfa).filter((n): n is number => n !== null);
  const offres = lignes.map((l) => l.nombreOffres).filter((n): n is number => n !== null && n > 0);
  return {
    marches: lignes.length,
    montantMedian: mediane(montants),
    montantMin: montants.length ? Math.min(...montants) : null,
    montantMax: montants.length ? Math.max(...montants) : null,
    offresMedianes: mediane(offres),
    partUneOffre: offres.length ? Math.round((offres.filter((n) => n === 1).length / offres.length) * 100) : null,
  };
}

/** Nom d'entreprise normalisé pour regrouper « Office Choice » et « OFFICE  CHOICE ». */
export function cleEntreprise(nom: string): string {
  return nom.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Z0-9]+/g, " ").replace(/\b(SARL|SUARL|SA|SAS|GIE|ETS|STE)\b/g, "").replace(/\s+/g, " ").trim();
}

export function principauxGagnants(lignes: Gagne[], n = 10): { nom: string; marches: number; montant: number }[] {
  const g = new Map<string, { nom: string; marches: number; montant: number }>();
  for (const l of lignes) {
    if (!l.attributaire) continue;
    for (const nom of l.attributaire.split(" ; ")) {
      const cle = cleEntreprise(nom);
      if (!cle) continue;
      const e = g.get(cle) ?? { nom: nom.trim(), marches: 0, montant: 0 };
      e.marches++;
      e.montant += l.montantFcfa ?? 0;
      g.set(cle, e);
    }
  }
  return [...g.values()].sort((a, b) => b.marches - a.marches || b.montant - a.montant).slice(0, n);
}
