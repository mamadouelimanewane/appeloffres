import test from "node:test";
import assert from "node:assert/strict";
import { extraireDateLimite, parseWordPress, type ArticleWp } from "./wordpress.ts";

const article = (id: number, titre: string, contenu = "", date = "2026-09-20T10:00:00"): ArticleWp => ({
  id, date, link: `https://exemple.sn/?p=${id}`, title: { rendered: titre }, content: { rendered: `<p>${contenu}</p>` },
});

test("date limite : formats chiffrés et en lettres, après un repère explicite", () => {
  assert.equal(extraireDateLimite("Les offres devront parvenir au plus tard le 15 octobre 2026 à 10 h."), "2026-10-15");
  assert.equal(extraireDateLimite("Date limite de dépôt des offres : 22/10/2026 à 12h00"), "2026-10-22");
  assert.equal(extraireDateLimite("La remise des offres est fixée au 3 novembre 2026"), "2026-11-03");
  assert.equal(extraireDateLimite("Publié le 12/09/2026. Merci."), null); // pas de repère : pas de date inventée
});

test("ne garde que les vrais avis, sans attributions ni offres d'emploi", () => {
  const avis = parseWordPress(
    [
      article(1, "Avis d&rsquo;appel d&rsquo;offres : acquisition de véhicules", "Date limite de dépôt : 20/10/2026"),
      article(2, "Avis d'attribution provisoire du marché N° F_X_001"),
      article(3, "Offre d'emploi : comptable"),
      article(4, "Demande de renseignements et de prix pour le gardiennage"),
      article(5, "Visite du ministre à Kaolack"),
      article(6, "Avis à manifestation d'intérêt pour le recrutement d'un cabinet"),
    ],
    "exemple.sn",
    "Agence Exemple",
  );
  assert.deepEqual(avis.map((a) => a.objet), [
    "Avis d'appel d'offres : acquisition de véhicules",
    "Demande de renseignements et de prix pour le gardiennage",
    "Avis à manifestation d'intérêt pour le recrutement d'un cabinet",
  ]);
  assert.equal(avis[0].dateLimite, "2026-10-20");
  assert.equal(avis[0].source, "wp:exemple.sn");
  assert.equal(avis[0].autorite, "Agence Exemple");
  assert.equal(avis[1].type, "Demande de renseignements et de prix");
  assert.equal(avis[2].type, "Appel à manifestation d'intérêt");
});

test("rubrique dédiée aux marchés : un titre sans mot-clé est quand même un avis", () => {
  const art = [article(1, "Fourniture de matériel roulant"), article(2, "Avis d'attribution définitive")];
  assert.equal(parseWordPress(art, "cetud.sn", "CETUD").length, 0);
  const avis = parseWordPress(art, "cetud.sn", "CETUD", true);
  assert.deepEqual(avis.map((a) => a.objet), ["Fourniture de matériel roulant"]);
});

test("stages et appels à candidature sans objet de marché sont écartés", () => {
  const avis = parseWordPress([article(1, "Avis de stage"), article(2, "Appel à candidature"), article(3, "Appel à manifestation d’intérêt")], "cetud.sn", "CETUD", true);
  assert.deepEqual(avis.map((a) => a.objet), ["Appel à manifestation d’intérêt"]);
});

test("site international : un Sénégal cité seulement en bas de page ne suffit pas", () => {
  const loin = "Projet de renforcement des capacités. ".repeat(30) + "Pays : Tanzanie, Ouganda, Sénégal.";
  assert.equal(parseWordPress([article(1, "Tender: Women in Tech in Tanzania", loin)], "enabel.be", "Enabel", true).length, 0);
});

test("site hors .sn : seulement les avis qui concernent le Sénégal", () => {
  const avis = parseWordPress(
    [article(1, "Appel d'offres : fournitures pour le bureau de Dakar"), article(2, "Appel d'offres : fournitures pour le bureau de Nairobi")],
    "ong-internationale.org",
    null,
  );
  assert.equal(avis.length, 1);
  assert.match(avis[0].objet, /Dakar/);
});
