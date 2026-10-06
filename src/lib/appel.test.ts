import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { estUnTest, parseAppelAvis, parseAppelRealisations, plansAretenir, type PlanAppel } from "./appel.ts";

const fixture = (nom: string) => JSON.parse(readFileSync(new URL(`./fixtures/${nom}`, import.meta.url), "utf8"));

test("APPEL : les avis de test de la plateforme sont écartés", () => {
  assert.equal(estUnTest("Ministère de la dématerialisation (TESTS APPEL)"), true);
  assert.equal(estUnTest("SICAP SA"), false);
  const avis = parseAppelAvis(fixture("appel-tdo.json"));
  assert.equal(avis.length, 4); // 10 avis dans le jeu d'essai, dont 6 de test
  assert.ok(avis.every((a) => !/TEST/i.test(a.autorite ?? "")));
});

test("APPEL : acheteur, mode de passation, dates, référence", () => {
  const avis = parseAppelAvis(fixture("appel-tdo.json"));
  const a = avis.find((x) => x.autorite === "Ville de Rufisque");
  assert.ok(a);
  assert.equal(a.source, "appel");
  assert.match(a.dateLimite ?? "", /^\d{4}-\d{2}-\d{2}$/);
  assert.match(a.publieLe ?? "", /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(a.type);
  assert.match(a.url, /^https:\/\/www\.achatspublics\.sn\/consultations\/tenders/);
});

test("plans : dernière version par acheteur et par année, sans les tests", () => {
  const p = (org: string, year: number, version: number): PlanAppel => ({ uid: `${org}${year}${version}`, reference: `${org}_${year}_${version}`, version, year, organization: { name: org } });
  const retenus = plansAretenir([p("SENELEC", 2026, 1), p("SENELEC", 2026, 3), p("SENELEC", 2025, 5), p("Ministère (TESTS APPEL)", 2026, 1)], [2026]);
  assert.deepEqual(retenus.map((x) => x.reference), ["SENELEC_2026_3"]);
});

test("réalisations : date de lancement prévue, mode, type, direction", () => {
  const plan: PlanAppel = { uid: "u", reference: "COUD_2026_1", version: 1, year: 2026, organization: { name: "Centre des Oeuvres universitaires de Dakar" } };
  const r = parseAppelRealisations(plan, fixture("appel-realisations.json"));
  assert.ok(r.length >= 3);
  const a = r.find((x) => x.reference === "T_COUD_COUD_1516");
  assert.ok(a);
  assert.equal(a.lancement, "2026-08-07");
  assert.equal(a.mode, "Appel d'offres ouvert");
  assert.equal(a.typeMarche, "Travaux");
  assert.equal(a.autorite, "Centre des Oeuvres universitaires de Dakar");
  assert.equal(a.plan, "COUD_2026_1");
  assert.equal(a.montantFcfa, null); // montant 0 = non renseigné
});
