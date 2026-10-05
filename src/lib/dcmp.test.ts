import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dateIso, nettoyer, parseFiche, parseListe } from "./dcmp.ts";

const liste = readFileSync(new URL("./fixtures/dcmp-liste.html", import.meta.url), "utf8");

test("dateIso convertit jj/mm/aaaa et rejette les dates impossibles", () => {
  assert.equal(dateIso("27/08/2024"), "2024-08-27");
  assert.equal(dateIso("31/02/2024"), null);
  assert.equal(dateIso(""), null);
});

test("nettoyer retire les balises et décode les entités", () => {
  assert.equal(nettoyer("<td>March&eacute;s &amp; <b>achats</b></td>"), "Marchés & achats");
});

test("nettoyer retire les liens cachés (spam) et les doubles encodages", () => {
  assert.equal(nettoyer(`Avis<a href="http://x" style="display:none" rel="dofollow">Spam</a> d&amp;#039;attribution`), "Avis d'attribution");
});

test("parseListe lit les avis de la page réelle (jeu d'essai)", () => {
  const avis = parseListe(liste);
  assert.ok(avis.length >= 20, `attendu >= 20, obtenu ${avis.length}`);
  const a = avis.find((x) => x.reference === "C_P2RS_146");
  assert.ok(a);
  assert.equal(a.publieLe, "2024-08-16");
  assert.equal(a.dateLimite, "2024-08-27");
  assert.equal(a.anomalie, null);
  assert.match(a.url, /key=\d+/);
});

test("parseListe signale les incohérences de la source", () => {
  const a = parseListe(liste).find((x) => x.reference === "C_DAGE_293");
  assert.ok(a);
  assert.match(a.anomalie ?? "", /antérieure/);
});

test("parseListe ne produit pas de doublons", () => {
  const cles = parseListe(liste + liste).map((a) => a.cle);
  assert.equal(new Set(cles).size, cles.length);
});

test("parseFiche extrait le texte et les pièces jointes, sans le pied de page", () => {
  const f = parseFiche(`<td class="Title">Texte de l'avis d'appel d'offres</td><p>Fourniture de <b>vivres</b></p><a href="docs/dao.pdf">DAO</a><div class="footer">Copyright</div>`);
  assert.equal(f.texte, "Fourniture de vivres DAO");
  assert.deepEqual(f.documents, ["http://www.marchespublics.sn/docs/dao.pdf"]);
});
