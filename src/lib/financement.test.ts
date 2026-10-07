import test from "node:test";
import assert from "node:assert/strict";
import { coutCaution } from "./financement.ts";

test("coût d'une caution : commission annuelle au prorata, par trimestre entamé", () => {
  // 15 000 000 à 2 % par an pendant 4 mois → 2 trimestres → 15 000 000 × 2 % × 2/4 = 150 000
  assert.equal(coutCaution(15_000_000, 2, 4), 150_000);
  assert.equal(coutCaution(15_000_000, 2, 3), 75_000);
  assert.equal(coutCaution(1_000_000, 2, 1, 25_000), 30_000);
});

test("saisies invalides : coût nul plutôt qu'un chiffre absurde", () => {
  assert.equal(coutCaution(0, 2, 4), 0);
  assert.equal(coutCaution(1_000_000, -1, 4), 0);
  assert.equal(coutCaution(1_000_000, 2, 0), 0);
});
