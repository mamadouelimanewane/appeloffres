import test from "node:test";
import assert from "node:assert/strict";
import { evaluerEligibilite, lireNombre, type CapacitesEntreprise } from "./eligibilite.ts";
import type { Exigences } from "./ia/extraction.ts";

const ex = (champs: Partial<Exigences>): Exigences => ({ chiffreAffairesMinFcfa: null, ligneCreditMinFcfa: null, marchesSimilairesMin: null, experienceMinAnnees: null, personnelCle: [], materiel: [], ...champs });
const pme = (champs: Partial<CapacitesEntreprise>): CapacitesEntreprise => ({ chiffreAffairesFcfa: null, capaciteCreditFcfa: null, marchesSimilaires: null, anneesExperience: null, ...champs });

test("lecture des nombres saisis librement", () => {
  assert.equal(lireNombre("150 000 000 FCFA"), 150_000_000);
  assert.equal(lireNombre("12"), 12);
  assert.equal(lireNombre(""), null);
});

test("vert : toutes les conditions chiffrées sont remplies", () => {
  const v = evaluerEligibilite(ex({ chiffreAffairesMinFcfa: 100_000_000, marchesSimilairesMin: 2 }), pme({ chiffreAffairesFcfa: 150_000_000, marchesSimilaires: 3 }));
  assert.equal(v.couleur, "vert");
  assert.ok(v.criteres.every((c) => c.statut === "ok"));
});

test("rouge : une condition non remplie, avec un conseil", () => {
  const v = evaluerEligibilite(ex({ ligneCreditMinFcfa: 150_000_000 }), pme({ capaciteCreditFcfa: 40_000_000 }));
  assert.equal(v.couleur, "rouge");
  assert.equal(v.criteres[0].statut, "manque");
  assert.ok(v.criteres[0].conseil);
});

test("orange : information manquante dans le profil, ou personnel à vérifier", () => {
  assert.equal(evaluerEligibilite(ex({ chiffreAffairesMinFcfa: 1_000_000 }), pme({})).couleur, "orange");
  assert.equal(evaluerEligibilite(ex({ personnelCle: ["Ingénieur génie civil"] }), pme({})).couleur, "orange");
});

test("inconnu : avis non lu ou sans condition chiffrée", () => {
  assert.equal(evaluerEligibilite(null, pme({})).couleur, "inconnu");
  assert.equal(evaluerEligibilite(ex({}), pme({})).couleur, "inconnu");
});
