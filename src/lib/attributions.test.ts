import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { montantFcfa, parseAttribution } from "./attributions.ts";

const fixture = (nom: string) => readFileSync(new URL(`./fixtures/${nom}`, import.meta.url), "utf8");

test("montantFcfa lit les formats courants et refuse les petits nombres", () => {
  assert.equal(montantFcfa("56.922.185 F CFA"), 56922185);
  assert.equal(montantFcfa("42 490 000"), 42490000);
  assert.equal(montantFcfa("Nombre : 17"), null);
});

test("avis récent : objet, offres, attributaire, montant", () => {
  const a = parseAttribution(fixture("att1.html"));
  assert.match(a.objet ?? "", /fermes agricoles/i);
  assert.equal(a.nombreOffres, 6);
  assert.match(a.attributaire ?? "", /DIOUBO SARL/);
  assert.equal(a.montantFcfa, 56922185);
  assert.equal(a.datePublicationAo, "2017-02-17");
  assert.match(a.reference ?? "", /T.?_?DEAI.?_?019/);
});

test("second gabarit : parc informatique, 17 offres", () => {
  const a = parseAttribution(fixture("att2.html"));
  assert.match(a.objet ?? "", /MATERIELS INFORMATIQUES/i);
  assert.equal(a.nombreOffres, 17);
  assert.equal(a.montantFcfa, 37134600);
  assert.match(a.attributaire ?? "", /S\.B\.S INFORMATIQUE/);
});

test("le texte est toujours conservé, sans le pied de page", () => {
  const a = parseAttribution(fixture("att3.html"));
  assert.ok(a.texte.length > 100);
  assert.ok(!/Copyright/.test(a.texte));
});

test("une page vide ne produit ni erreur ni valeur inventée", () => {
  const a = parseAttribution("<html></html>");
  assert.equal(a.objet, null);
  assert.equal(a.montantFcfa, null);
  assert.equal(a.attributaire, null);
});
