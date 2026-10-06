import test from "node:test";
import assert from "node:assert/strict";
import { fournisseurIa } from "./fournisseurs.ts";

test("sans clé : IA désactivée", () => {
  assert.equal(fournisseurIa({}), null);
  assert.equal(fournisseurIa({ IA_FOURNISSEUR: "deepseek" }), null);
});

test("clé DeepSeek seule : DeepSeek, modèle économique par défaut", () => {
  const f = fournisseurIa({ DEEPSEEK_API_KEY: "x" });
  assert.equal(f?.nom, "DeepSeek");
  assert.equal(f?.modele, "deepseek-flash");
});

test("variables vides (cas de GitHub Actions) : la clé présente est quand même utilisée", () => {
  const f = fournisseurIa({ DEEPSEEK_API_KEY: "x", IA_FOURNISSEUR: "", IA_MODELE: "" });
  assert.equal(f?.nom, "DeepSeek");
  assert.equal(f?.modele, "deepseek-flash");
});

test("choix explicite de Claude, avec modèle choisi", () => {
  const f = fournisseurIa({ IA_FOURNISSEUR: "claude", ANTHROPIC_API_KEY: "x", IA_MODELE: "claude-sonnet-5-5" });
  assert.equal(f?.nom, "Claude");
  assert.equal(f?.modele, "claude-sonnet-5-5");
});
