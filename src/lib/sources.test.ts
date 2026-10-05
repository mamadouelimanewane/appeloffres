import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dateFrancaise, parseAgeroute, parseBanqueMondiale, parsePad, parseSenelec } from "./sources.ts";

const fixture = (nom: string) => readFileSync(new URL(`./fixtures/${nom}`, import.meta.url), "utf8");

test("dateFrancaise lit les dates en toutes lettres", () => {
  assert.equal(dateFrancaise("22 Septembre 2026"), "2026-09-22");
  assert.equal(dateFrancaise("12 novembre 2025 à 9h 30mn"), "2025-11-12");
  assert.equal(dateFrancaise("1er août 2026"), "2026-08-01");
  assert.equal(dateFrancaise("bientôt"), null);
});

test("Senelec : référence, objet, type, date limite et lien du PDF", () => {
  const avis = parseSenelec(fixture("senelec.html"));
  assert.equal(avis.length, 8);
  const a = avis.find((x) => x.reference.includes("40"));
  assert.ok(a);
  assert.equal(a.source, "senelec");
  assert.equal(a.dateLimite, "2026-11-02");
  assert.match(a.type ?? "", /APPEL D.OFFRES/);
  assert.match(a.url, /^https:\/\/www\.senelec\.sn\/media\/marches\/appels\/.+\.pdf$/);
});

test("Port de Dakar : objet, mode, date limite et avis PDF", () => {
  const avis = parsePad(fixture("pad.html"));
  assert.equal(avis.length, 4);
  assert.match(avis[0].objet, /Harmonisation des supports/);
  assert.equal(avis[0].dateLimite, "2025-11-12");
  assert.equal(avis[0].type, "Fournitures");
  assert.match(avis[0].url, /\.pdf$/);
});

test("AGEROUTE : référence, dates de publication et limite", () => {
  const avis = parseAgeroute(fixture("ageroute.html"));
  assert.ok(avis.length >= 3);
  const a = avis[0];
  assert.equal(a.reference, "D/1828/A2");
  assert.equal(a.publieLe, "2026-09-22");
  assert.equal(a.dateLimite, "2026-10-22");
  assert.match(a.objet, /Travaux d'entretien des routes/);
  assert.match(a.type ?? "", /appel d.offres de travaux/i);
  assert.ok(avis.every((x) => !x.url.includes("{{")), "les modèles JavaScript sont ignorés");
});

test("Banque mondiale : types traduits, dates de publication et limite, acheteur", () => {
  const avis = parseBanqueMondiale(JSON.parse(fixture("banquemondiale.json")));
  assert.ok(avis.length >= 8);
  const ifb = avis.find((a) => a.type === "Appel d'offres" && a.autorite === "AGEROUTE");
  assert.ok(ifb);
  assert.equal(ifb.publieLe, "2026-09-25");
  assert.equal(ifb.dateLimite, "2026-11-10");
  // une attribution n'a pas de date limite : rien n'est inventé
  assert.equal(avis.find((a) => a.type === "Avis d'attribution")?.dateLimite, null);
  assert.match(ifb.url, /^https:\/\/projects\.worldbank\.org\/fr\/projects-operations\/procurement-detail\/OP\d+$/);
  assert.ok(avis.some((a) => a.type === "Appel à manifestation d'intérêt"));
  assert.ok(avis.some((a) => a.type === "Avis général de passation"));
});

test("une page sans avis donne une liste vide, sans erreur", () => {
  assert.deepEqual(parseBanqueMondiale({}), []);
  assert.deepEqual(parseSenelec("<html></html>"), []);
  assert.deepEqual(parsePad("<html></html>"), []);
  assert.deepEqual(parseAgeroute("<html></html>"), []);
});
