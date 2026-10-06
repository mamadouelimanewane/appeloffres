import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dateAnglaise, dateFrancaise, parseAgeroute, parseArtp, parseBceao, parsePfongue, parseBanqueMondiale, parsePad, parseSenelec, parseUngm } from "./sources.ts";

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

test("UNGM : avis des agences de l'ONU pour le Sénégal seulement", () => {
  const avis = parseUngm(fixture("ungm.html"));
  // 4 avis « Senegal » + 1 avis multi-pays de l'OIT dont le titre cite le Sénégal ;
  // les autres avis multi-pays sont écartés
  assert.equal(avis.length, 5);
  assert.ok(avis.some((a) => a.autorite === "OIT (Nations unies)" && /Sénégal/i.test(a.objet)));
  assert.ok(avis.some((a) => /^Mise en place d’un Accord à Long Terme/.test(a.objet)));
  const fao = avis.find((a) => a.autorite === "FAO (Nations unies)");
  assert.ok(fao);
  assert.match(fao.objet, /^Acquisition de réactifs et consommables de laboratoires/);
  assert.equal(fao.type, "Appel d'offres");
  assert.equal(fao.dateLimite, "2026-10-15");
  assert.equal(fao.publieLe, "2026-10-01");
  assert.equal(fao.url, "https://www.ungm.org/Public/Notice/316511");
  assert.ok(avis.some((a) => a.autorite === "ONUDI (Nations unies)"));
  assert.ok(!avis.some((a) => /ARMENIA/i.test(a.objet)));
});

test("BCEAO : avis en cours concernant le Sénégal, sans ceux des autres pays de l'UEMOA", () => {
  const avis = parseBceao(fixture("bceao.html"));
  assert.equal(avis.length, 4);
  const kaolack = avis.find((a) => /Kaolack/.test(a.objet));
  assert.ok(kaolack);
  assert.equal(kaolack.reference, "AC/K01/AAK/002/2026");
  assert.equal(kaolack.publieLe, "2026-10-05");
  assert.equal(kaolack.dateLimite, "2026-10-26");
  assert.ok(!avis.some((a) => /Bénin/.test(a.objet)), "l'avis pour le Bénin est écarté");
  assert.ok(avis.every((a) => (a.dateLimite ?? "") >= "2026-10-05"), "aucun avis clos");
  assert.ok(avis.some((a) => /\(relance\)$/.test(a.objet)));
});

test("ARTP : date limite abrégée, type, référence, lien", () => {
  const avis = parseArtp(fixture("artp.html"));
  assert.equal(avis.length, 12);
  const a = avis[0];
  assert.equal(a.dateLimite, "2026-10-07");
  assert.equal(a.reference, "S_ARTP_036");
  assert.equal(a.type, "Appel d'offres international");
  assert.match(a.url, /^https:\/\/artp\.sn\/espace-professionnels\/appels-d-offres\//);
  assert.ok(avis.some((x) => x.type === "Additif"));
});

test("dateFrancaise lit aussi les mois abrégés", () => {
  assert.equal(dateFrancaise("07 oct 2026"), "2026-10-07");
  assert.equal(dateFrancaise("16 avr 2026"), "2026-04-16");
  assert.equal(dateFrancaise("2 sept. 2026"), "2026-09-02");
});

test("PFONGUE : appels d'offres des ONG, sans les offres d'emploi", () => {
  const avis = parsePfongue(fixture("pfongue.xml"));
  assert.equal(avis.length, 2);
  assert.ok(avis.every((a) => !/EMPLOI/i.test(a.objet)));
  const hi = avis.find((a) => /COUVERTURE SANTE/.test(a.objet));
  assert.ok(hi);
  assert.match(hi.objet, /^MISE EN PLACE D'UNE COUVERTURE SANTE/);
  assert.equal(hi.publieLe, "2026-09-30");
  assert.equal(hi.dateLimite, null);
  assert.match(hi.url, /^https:\/\/www\.pfongue\.org\//);
});

test("dateAnglaise lit le format UNGM", () => {
  assert.equal(dateAnglaise("18-Oct-2026 12:00 (GMT 2.00)"), "2026-10-18");
  assert.equal(dateAnglaise("bientôt"), null);
});

test("une page sans avis donne une liste vide, sans erreur", () => {
  assert.deepEqual(parseUngm("<html></html>"), []);
  assert.deepEqual(parseBanqueMondiale({}), []);
  assert.deepEqual(parseSenelec("<html></html>"), []);
  assert.deepEqual(parsePad("<html></html>"), []);
  assert.deepEqual(parseAgeroute("<html></html>"), []);
});
