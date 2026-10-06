/** Offres commerciales, partagées par l'accueil, l'abonnement et le paiement. */
export type CodeOffre = "veille" | "pro";

export interface Offre {
  code: CodeOffre;
  nom: string;
  prixMensuel: number; // FCFA
  detail: string;
  points: string[];
  vedette: boolean;
}

export const OFFRES: Offre[] = [
  { code: "veille", nom: "Veille", prixMensuel: 15_000, detail: "Pour ne plus rater d'appel d'offres", points: ["Appels d'offres ouverts", "Marchés à venir et achats récurrents", "Liste des pièces à fournir", "Alertes WhatsApp"], vedette: false },
  { code: "pro", nom: "Pro", prixMensuel: 35_000, detail: "Pour répondre plus souvent, et mieux", points: ["Tout Veille", "Qui gagne quoi : prix et concurrents", "Mémoire technique assisté", "Suivi de tous vos dossiers"], vedette: true },
];

export const ESSAI_JOURS = 14;

export const offre = (code: CodeOffre): Offre => OFFRES.find((o) => o.code === code)!;

/** Fonctions réservées à l'offre Pro (et à l'essai gratuit). */
export type Fonction = "memoire" | "qui-gagne-detail";
export const FONCTIONS_PRO: Fonction[] = ["memoire", "qui-gagne-detail"];
