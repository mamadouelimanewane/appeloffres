"use client";
import { useEffect, useState } from "react";

/** État persistant dans le navigateur (v0 sans base de données). */
export function useLocal<T>(cle: string, defaut: T): [T, (v: T) => void, boolean] {
  const [valeur, setValeur] = useState<T>(defaut);
  const [pret, setPret] = useState(false);
  useEffect(() => {
    try {
      const brut = localStorage.getItem(cle);
      if (brut) {
        const lu = JSON.parse(brut);
        // Objet enregistré avec une version plus ancienne : on complète avec les nouveaux champs par défaut
        const fusion = defaut && typeof defaut === "object" && !Array.isArray(defaut) && lu && typeof lu === "object" && !Array.isArray(lu);
        setValeur(fusion ? { ...defaut, ...lu } : lu);
      }
    } catch {}
    setPret(true);
  }, [cle]);
  const enregistrer = (v: T) => {
    setValeur(v);
    try {
      localStorage.setItem(cle, JSON.stringify(v));
    } catch {}
  };
  return [valeur, enregistrer, pret];
}

/** Lecture ponctuelle (hors React), tolérante aux erreurs. */
export function lireLocal<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}

export interface Profil {
  entreprise: string;
  secteur: string;
  region: string;
  ninea: string;
  anneesExperience: string;
  references: string;
  moyens: string;
  /** Capacités, pour « Ce marché est-il pour moi ? » (saisie libre, ex. « 150 000 000 ») */
  chiffreAffaires: string;
  capaciteCredit: string;
  marchesSimilaires: string;
}

export const PROFIL_VIDE: Profil = { entreprise: "", secteur: "BTP", region: "Dakar", ninea: "", anneesExperience: "", references: "", moyens: "", chiffreAffaires: "", capaciteCredit: "", marchesSimilaires: "" };
