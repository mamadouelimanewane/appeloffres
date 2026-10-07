import test from "node:test";
import assert from "node:assert/strict";
import { dateVerifiee, montantVerifie, nombreVerifie, preparerTexte, validerExtraction } from "./extraction.ts";

const AVIS = `AVIS D'APPEL D'OFFRES N° F_CMU_012. L'Agence de la CMU sollicite des offres pour l'acquisition de matériel informatique.
Montant prévisionnel : 45 000 000 FCFA. Garantie de soumission : 900 000 FCFA.
Les offres doivent être déposées au plus tard le 15 octobre 2026 à 10h00 au service des marchés.`;

test("date acceptée seulement si elle figure dans l'avis", () => {
  assert.equal(dateVerifiee("15 octobre 2026", AVIS), "2026-10-15");
  assert.equal(dateVerifiee("15/10/2026", AVIS), "2026-10-15"); // autre forme de la même date
  assert.equal(dateVerifiee("20 octobre 2026", AVIS), null); // inventée
  assert.equal(dateVerifiee("bientôt", AVIS), null);
  assert.equal(dateVerifiee(null, AVIS), null);
});

test("dates : formes variées et anglaises, toujours vérifiées dans le texte", () => {
  const anglais = "Tenders must be submitted before 26 October 2026 at 04:00 (Brussels time).";
  assert.equal(dateVerifiee("26 October 2026", anglais), "2026-10-26");
  assert.equal(dateVerifiee("2026-10-26", anglais), "2026-10-26");
  assert.equal(dateVerifiee("October 26, 2026", "Deadline: October 26, 2026"), "2026-10-26");
  assert.equal(dateVerifiee("27 October 2026", anglais), null);
  assert.equal(dateVerifiee("mercredi 04 novembre 2026 à 09h30", "au plus tard le mercredi 4 novembre 2026"), "2026-11-04");
  assert.equal(dateVerifiee("04/11/2026", "date limite : 4-11-2026"), "2026-11-04");
  assert.equal(dateVerifiee("1er novembre 2026", "le 1er novembre 2026"), "2026-11-01");
});

test("montant accepté seulement s'il figure dans l'avis", () => {
  assert.equal(montantVerifie("45 000 000", AVIS), 45_000_000);
  assert.equal(montantVerifie("45.000.000 FCFA", AVIS), 45_000_000);
  assert.equal(montantVerifie(900000, AVIS), 900_000);
  assert.equal(montantVerifie("50 000 000", AVIS), null); // inventé
  assert.equal(montantVerifie("12", AVIS), null); // pas un montant
});

test("validation complète : rien d'inventé ne passe", () => {
  const reponse = JSON.stringify({
    estUnAvis: true, objet: "Acquisition de matériel informatique", acheteur: "Agence de la CMU", reference: "F_CMU_012",
    typeProcedure: "Appel d'offres", dateLimite: "15 octobre 2026", heureLimite: "10h00", montantEstime: "45 000 000",
    garantieSoumission: "1 000 000", piecesExigees: ["NINEA", "Attestation fiscale", ""], lieuDepot: "Service des marchés", resume: "Achat d'ordinateurs.",
  });
  const e = validerExtraction("Voici le json : " + reponse, AVIS);
  assert.equal(e.dateLimite, "2026-10-15");
  assert.equal(e.montantEstimeFcfa, 45_000_000);
  assert.equal(e.garantieSoumissionFcfa, null, "1 000 000 n'est pas dans l'avis");
  assert.deepEqual(e.piecesExigees, ["NINEA", "Attestation fiscale"]);
  assert.equal(e.heureLimite, "10h00");
});

test("exigences de qualification : montants et nombres vérifiés dans le texte", () => {
  const texte = `Chiffre d'affaires moyen des trois dernières années au moins égal à 200 000 000 FCFA.
    Ligne de crédit d'au moins 50 000 000 FCFA. Avoir exécuté au moins deux (02) marchés similaires. Visite de site le 5 octobre 2026.`;
  const e = validerExtraction(JSON.stringify({
    exigences: { chiffreAffairesMin: "200 000 000", ligneCreditMin: "60 000 000", marchesSimilairesMin: 2, experienceMinAnnees: 7, personnelCle: ["Chef de chantier"], materiel: [] },
    autresDates: [{ libelle: "Visite de site", date: "5 octobre 2026" }, { libelle: "Ouverture des plis", date: "9 octobre 2026" }],
  }), texte);
  assert.equal(e.exigences.chiffreAffairesMinFcfa, 200_000_000);
  assert.equal(e.exigences.ligneCreditMinFcfa, null, "60 000 000 n'est pas dans le texte");
  assert.equal(e.exigences.marchesSimilairesMin, 2);
  assert.equal(e.exigences.experienceMinAnnees, null, "7 n'est pas dans le texte");
  assert.deepEqual(e.exigences.personnelCle, ["Chef de chantier"]);
  assert.deepEqual(e.autresDates, [{ libelle: "Visite de site", date: "2026-10-05" }]);
});

test("nombres écrits en lettres reconnus", () => {
  assert.equal(nombreVerifie(3, "au moins trois marchés similaires"), 3);
  assert.equal(nombreVerifie("5", "cinq (05) années d'expérience"), 5);
  assert.equal(nombreVerifie(4, "deux marchés"), null);
});

test("réponse illisible : erreur explicite, pas de données fantômes", () => {
  assert.throws(() => validerExtraction("Je ne sais pas.", AVIS));
});

test("texte trop long : coupé et signalé", () => {
  const { texte, tronque } = preparerTexte("a ".repeat(20), 10);
  assert.equal(texte.length, 10);
  assert.equal(tronque, true);
  assert.equal(preparerTexte("court").tronque, false);
});
