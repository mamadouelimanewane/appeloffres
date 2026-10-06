import test from "node:test";
import assert from "node:assert/strict";
import { dateVerifiee, montantVerifie, preparerTexte, validerExtraction } from "./extraction.ts";

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

test("réponse illisible : erreur explicite, pas de données fantômes", () => {
  assert.throws(() => validerExtraction("Je ne sais pas.", AVIS));
});

test("texte trop long : coupé et signalé", () => {
  const { texte, tronque } = preparerTexte("a ".repeat(20), 10);
  assert.equal(texte.length, 10);
  assert.equal(tronque, true);
  assert.equal(preparerTexte("court").tronque, false);
});
