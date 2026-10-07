/** Estimation du coût d'une caution (garantie) : commission annuelle au prorata de la durée. Fonction pure. */
export function coutCaution(montantFcfa: number, tauxAnnuelPourcent: number, dureeMois: number, fraisFixesFcfa = 0): number {
  if (!(montantFcfa > 0) || !(tauxAnnuelPourcent >= 0) || !(dureeMois > 0)) return 0;
  // Les banques facturent souvent au minimum un trimestre : on arrondit la durée au trimestre supérieur.
  const trimestres = Math.ceil(dureeMois / 3);
  return Math.round((montantFcfa * (tauxAnnuelPourcent / 100) * trimestres) / 4 + fraisFixesFcfa);
}

/** Durée par défaut d'une garantie de soumission : validité des offres (souvent 90 jours) + marge. */
export const DUREE_SOUMISSION_MOIS = 4;
