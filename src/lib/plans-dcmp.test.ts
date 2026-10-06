import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parsePlanDcmp } from "./plans-dcmp.ts";

const plan = parsePlanDcmp(readFileSync(new URL("./fixtures/plan-dcmp.html", import.meta.url), "utf8"));

test("en-tête du plan : acheteur, année, référence, date de version", () => {
  assert.match(plan.autorite ?? "", /Université numérique Cheikh Hamidou KANE/);
  assert.equal(plan.annee, "2024");
  assert.equal(plan.plan, "P_UVS_2024_15");
  assert.equal(plan.versionDu, "2024-05-13");
});

test("réalisations : référence, objet, type, mode, dates, direction", () => {
  assert.ok(plan.realisations.length >= 5);
  const r = plan.realisations.find((x) => x.reference === "C_UNCHK_021");
  assert.ok(r);
  assert.match(r.objet, /^Recrutement d'un cabinet pour l'accompagnement/);
  assert.equal(r.typeMarche, "Prestations Intellectuelles/Consultants");
  assert.equal(r.mode, "Appel public à manifestation d'intérêt");
  assert.equal(r.lancement, "2024-03-25");
  assert.equal(r.attribution, "2024-04-30");
  assert.equal(r.direction, "Universite Numérique Cheikh Hamidou KANE");
  assert.equal(r.plan, "P_UVS_2024_15");
});

test("toutes les lignes retenues ont une référence de marché valide", () => {
  assert.ok(plan.realisations.every((x) => /^[CFTS]_/.test(x.reference ?? "")));
});

test("fil d'Ariane avec catégorie d'acheteur", () => {
  const p = parsePlanDcmp(
    `<p>Plans de passation &gt; Etat (Administration centrale ) &gt; Ministère des Affaires Etrangères 2019 Informations g&eacute;n&eacute;rales R&eacute;f&eacute;rences: P_MAESE_2019_5</p>`,
  );
  assert.equal(p.autorite, "Ministère des Affaires Etrangères");
  assert.equal(p.categorie, "Etat (Administration centrale )");
  assert.equal(p.annee, "2019");
});

test("année déduite de la référence du plan si l'en-tête est illisible", () => {
  assert.equal(parsePlanDcmp("<p>R&eacute;f&eacute;rences: P_ABC_2018_3</p>").annee, "2018");
});

test("une page sans plan ne produit rien", () => {
  const vide = parsePlanDcmp("<html><body>Erreur</body></html>");
  assert.deepEqual(vide.realisations, []);
  assert.equal(vide.autorite, null);
});
