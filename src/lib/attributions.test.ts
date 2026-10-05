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

test("avis rédigé (ministère) : objet, offres, attributaire, montant, référence", () => {
  const a = parseAttribution(fixture("att1.html"));
  assert.match(a.objet ?? "", /fermes agricoles/i);
  assert.equal(a.nombreOffres, 6);
  assert.match(a.attributaire ?? "", /DIOUBO SARL/);
  assert.equal(a.montantFcfa, 56922185);
  assert.equal(a.datePublicationAo, "2017-02-17");
  assert.match(a.reference ?? "", /T.?_?DEAI.?_?019/);
  assert.match(a.autorite ?? "", /Agriculture/);
});

test("second avis rédigé : parc informatique, 17 offres", () => {
  const a = parseAttribution(fixture("att2.html"));
  assert.match(a.objet ?? "", /MAT[EÉ]RIEL/i);
  assert.equal(a.nombreOffres, 17);
  assert.equal(a.montantFcfa, 37134600);
  assert.match(a.attributaire ?? "", /S\.B\.S INFORMATIQUE/);
});

test("gabarit du portail avec tableau de lots : plusieurs lots, acheteur, statut", () => {
  const a = parseAttribution(fixture("att-lots.html"));
  assert.equal(a.objet, "Fourniture de matériel de transport");
  assert.equal(a.autorite, "Agence d'Assistance à la Sécurité de proximité (AASP)");
  assert.equal(a.statut, "définitive");
  assert.equal(a.reference, "F_ASP_007");
  assert.equal(a.lots.length, 2);
  assert.deepEqual(a.lots[0], { designation: "véhicule Pick Up double cabine", montantFcfa: 125145000, nombreOffres: 4, attributaire: "EMG Universal Auto", delai: "30 jour(s)" });
  assert.equal(a.montantFcfa, 125145000 + 63550000);
  assert.equal(a.attributaire, "EMG Universal Auto");
});

test("lots à montant 0 : montant non publié (null), pas zéro", () => {
  const a = parseAttribution(fixture("att-lots2.html"));
  assert.ok(a.lots.length >= 3);
  assert.ok(a.lots.some((l) => l.montantFcfa === null));
  assert.match(a.attributaire ?? "", /COMTECHS/);
  assert.equal(a.statut, "provisoire");
});

test("formulation « Nom et adresse des attributaires provisoires »", () => {
  const a = parseAttribution(fixture("att-provisoire.html"));
  assert.equal(a.attributaire, "GROUPEMENT GIE TAIF/IBRAHIMA SARR");
  assert.equal(a.montantFcfa, 1226756800);
  assert.equal(a.nombreOffres, 6);
  assert.match(a.autorite ?? "", /SAED/);
});

test("le texte est toujours conservé, sans le pied de page", () => {
  const a = parseAttribution(fixture("att3.html"));
  assert.ok(a.texte.length > 100);
  assert.ok(!/Copyright/.test(a.texte));
});

test("une capture qui n'est pas un nom d'entreprise est rejetée", () => {
  const a = parseAttribution(`<td class="Title">Objet</td><p>AVIS D'ATTRIBUTION PROVISOIRE 5. Nom et adresse des attributaires provisoires : 6. Délais de livraison : 3 mois</p>Copyright`);
  assert.equal(a.attributaire, null);
});

test("une page vide ne produit ni erreur ni valeur inventée", () => {
  const a = parseAttribution("<html></html>");
  assert.equal(a.objet, null);
  assert.equal(a.montantFcfa, null);
  assert.equal(a.attributaire, null);
  assert.deepEqual(a.lots, []);
});
