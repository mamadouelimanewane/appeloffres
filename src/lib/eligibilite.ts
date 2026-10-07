/**
 * « Ce marché est-il pour moi ? » : comparaison des conditions de qualification
 * d'un avis (lues par l'IA et vérifiées) avec le profil de l'entreprise.
 * Fonction pure, sans IA : le verdict est explicable critère par critère.
 */
import type { Exigences } from "./ia/extraction";

export interface CapacitesEntreprise {
  chiffreAffairesFcfa: number | null; // chiffre d'affaires annuel moyen
  capaciteCreditFcfa: number | null; // ligne de crédit / financement mobilisable
  marchesSimilaires: number | null; // marchés similaires exécutés et attestés
  anneesExperience: number | null;
}

export type StatutCritere = "ok" | "manque" | "a_renseigner" | "a_verifier";

export interface Critere {
  libelle: string;
  exige: string;
  possede: string | null;
  statut: StatutCritere;
  conseil?: string;
}

export interface Verdict {
  couleur: "vert" | "orange" | "rouge" | "inconnu";
  titre: string;
  criteres: Critere[];
}

const fcfa = (n: number) => `${n.toLocaleString("fr-FR").replace(/ /g, " ")} FCFA`;

/** Lit un nombre saisi librement (« 150 000 000 », « 150000000 », « 12 ») ; null si vide ou illisible. */
export function lireNombre(saisie: string | null | undefined): number | null {
  const chiffres = (saisie ?? "").replace(/[^\d]/g, "");
  return chiffres ? Number(chiffres) : null;
}

function comparer(libelle: string, exige: number | null, possede: number | null, format: (n: number) => string, conseilManque: string): Critere | null {
  if (exige === null) return null;
  if (possede === null) return { libelle, exige: format(exige), possede: null, statut: "a_renseigner", conseil: "Renseignez cette information dans « Mon entreprise »." };
  return possede >= exige
    ? { libelle, exige: format(exige), possede: format(possede), statut: "ok" }
    : { libelle, exige: format(exige), possede: format(possede), statut: "manque", conseil: conseilManque };
}

export function evaluerEligibilite(e: Exigences | null | undefined, c: CapacitesEntreprise): Verdict {
  if (!e) return { couleur: "inconnu", titre: "Conditions de qualification non lues pour cet avis", criteres: [] };
  const criteres = [
    comparer("Chiffre d'affaires moyen", e.chiffreAffairesMinFcfa, c.chiffreAffairesFcfa, fcfa, "Un groupement avec une entreprise plus grande peut permettre d'atteindre ce seuil (chiffres d'affaires cumulés)."),
    comparer("Ligne de crédit / capacité de financement", e.ligneCreditMinFcfa, c.capaciteCreditFcfa, fcfa, "Demandez à votre banque une attestation de ligne de crédit du montant exigé."),
    comparer("Marchés similaires exécutés", e.marchesSimilairesMin, c.marchesSimilaires, (n) => `${n}`, "Rassemblez vos procès-verbaux de réception ou attestations de bonne exécution, ou envisagez un groupement."),
    comparer("Années d'expérience", e.experienceMinAnnees, c.anneesExperience, (n) => `${n} an${n > 1 ? "s" : ""}`, "L'expérience d'un partenaire de groupement peut compter."),
  ].filter((x): x is Critere => x !== null);
  if (e.personnelCle.length) criteres.push({ libelle: "Personnel clé", exige: e.personnelCle.join(" ; "), possede: null, statut: "a_verifier", conseil: "Vérifiez que vous disposez de ces profils (CV et diplômes)." });
  if (e.materiel.length) criteres.push({ libelle: "Matériel", exige: e.materiel.join(" ; "), possede: null, statut: "a_verifier", conseil: "Justificatifs de propriété ou contrats de location." });

  if (criteres.length === 0) return { couleur: "inconnu", titre: "L'avis ne précise pas de conditions de qualification chiffrées", criteres };
  if (criteres.some((x) => x.statut === "manque")) return { couleur: "rouge", titre: "Votre entreprise ne remplit pas toutes les conditions", criteres };
  if (criteres.some((x) => x.statut === "a_renseigner" || x.statut === "a_verifier")) return { couleur: "orange", titre: "Possible : quelques points à compléter ou vérifier", criteres };
  return { couleur: "vert", titre: "Votre entreprise remplit les conditions chiffrées", criteres };
}
