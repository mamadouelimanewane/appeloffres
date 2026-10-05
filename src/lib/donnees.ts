import avisJson from "@/data/avis.json";
import aVenirJson from "@/data/a-venir.json";
import type { Appel, Secteur } from "./data";

/** Données produites par scripts/publier-donnees.ts à partir des collectes. */
export const APPELS = avisJson.avis as Appel[];
export const AVIS_MIS_A_JOUR_LE = avisJson.misAJourLe;

export interface AVenir {
  id: string;
  autorite: string | null;
  plan: string | null;
  direction: string | null;
  reference: string | null;
  objet: string;
  typeMarche: string | null;
  secteur: Secteur;
  financement: string[];
  mode: string | null;
  lancement: string | null;
  attribution: string | null;
  etat: string | null;
}

export const A_VENIR = aVenirJson.realisations as AVenir[];
export const A_VENIR_MIS_A_JOUR_LE = aVenirJson.misAJourLe;
