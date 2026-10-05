import test from "node:test";
import assert from "node:assert/strict";
import { cleEntreprise, mediane, principauxGagnants, resumer, type Gagne } from "./stats.ts";

const g = (champs: Partial<Gagne>): Gagne => ({
  id: "x", objet: "o", avis: null, autorite: null, attributaire: null, montantFcfa: null, nombreOffres: null, annee: null, secteur: "Services", ...champs,
});

test("médiane paire, impaire et vide", () => {
  assert.equal(mediane([3, 1, 2]), 2);
  assert.equal(mediane([1, 2, 3, 4]), 3); // (2+3)/2 arrondi
  assert.equal(mediane([]), null);
});

test("résumé : montants et offres inconnus ignorés, part des offres uniques", () => {
  const r = resumer([g({ montantFcfa: 10, nombreOffres: 1 }), g({ montantFcfa: 30, nombreOffres: 5 }), g({})]);
  assert.equal(r.marches, 3);
  assert.equal(r.montantMedian, 20);
  assert.equal(r.offresMedianes, 3);
  assert.equal(r.partUneOffre, 50);
});

test("les variantes d'un même nom d'entreprise sont regroupées", () => {
  assert.equal(cleEntreprise("Office Choice SARL"), cleEntreprise("OFFICE  CHOICE"));
  const top = principauxGagnants([
    g({ attributaire: "Office Choice SARL", montantFcfa: 5 }),
    g({ attributaire: "OFFICE CHOICE", montantFcfa: 7 }),
    g({ attributaire: "Delta Médical" }),
  ]);
  assert.equal(top[0].marches, 2);
  assert.equal(top[0].montant, 12);
});

test("un avis à plusieurs gagnants compte pour chacun", () => {
  const top = principauxGagnants([g({ attributaire: "A ; B" })]);
  assert.equal(top.length, 2);
});
