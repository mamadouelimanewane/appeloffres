import test from "node:test";
import assert from "node:assert/strict";
import { piecesPour, scorePreparation, joursRestants, secteurDe, selonDao, PIECES, type Appel } from "./data.ts";

const appel = (champs: Partial<Appel>): Appel => ({
  id: "t", source: "test", sourceLibelle: "Test", reference: "R", titre: "Objet", autorite: "A", secteur: "Services",
  region: null, mode: null, budgetEstime: null, garantieSoumission: null, publieLe: null, dateLimite: null, url: null, ...champs,
});

test("une demande de cotation sans garantie n'exige pas de garantie de soumission", () => {
  const ids = piecesPour(appel({ garantieSoumission: 0, budgetEstime: 9_800_000 })).map((p) => p.id);
  assert.ok(!ids.includes("garantie"));
});

test("si la garantie n'est pas connue, elle est proposée « selon le DAO »", () => {
  const a = appel({});
  const garantie = PIECES.find((p) => p.id === "garantie")!;
  assert.ok(piecesPour(a).includes(garantie));
  assert.equal(selonDao(garantie, a), true);
});

test("un marché de BTP exige matériel et personnel clé", () => {
  const ids = piecesPour(appel({ secteur: "BTP", budgetEstime: 48_000_000, garantieSoumission: 1_000_000 })).map((p) => p.id);
  assert.ok(ids.includes("materiel") && ids.includes("personnel"));
});

test("le score est proportionnel aux pièces cochées", () => {
  const a = appel({ budgetEstime: 9_800_000, garantieSoumission: 0 });
  const n = piecesPour(a).length;
  assert.equal(scorePreparation(a, []), 0);
  assert.equal(scorePreparation(a, piecesPour(a).map((p) => p.id)), 100);
  assert.equal(scorePreparation(a, [piecesPour(a)[0].id]), Math.round(100 / n));
});

test("jours restants : négatif quand la date est dépassée", () => {
  assert.ok(joursRestants("2026-10-01", new Date("2026-10-05T10:00:00")) < 0);
  assert.equal(joursRestants("2026-10-10", new Date("2026-10-05T10:00:00")), 6);
});

test("secteur déduit du type et de l'objet", () => {
  assert.equal(secteurDe("Travaux d'entretien des routes revêtues"), "BTP");
  assert.equal(secteurDe("Fournitures Acquisition de batteries d'onduleurs"), "Fournitures");
  assert.equal(secteurDe("Appel à manifestation d'intérêt Recrutement d'un consultant"), "Études");
  assert.equal(secteurDe("Sélection de deux développeurs Full Stack"), "Informatique");
  assert.equal(secteurDe("Nettoiement des locaux"), "Services");
});
