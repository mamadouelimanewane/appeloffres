import test from "node:test";
import assert from "node:assert/strict";
import { aRenouveler, couvertureDossier, statutPiece, type PieceCoffre } from "./coffre.ts";
import type { Appel } from "./data.ts";

const piece = (type: string, expireLe: string | null): PieceCoffre => ({ type, libelle: type, delivreeLe: null, expireLe });
const appel = (dateLimite: string | null): Appel => ({
  id: "a", source: "s", sourceLibelle: "S", reference: "R", titre: "Objet", autorite: "A", secteur: "Services", region: null, mode: null,
  budgetEstime: 5_000_000, garantieSoumission: 0, publieLe: null, dateLimite, url: null,
});

test("statut : valide, bientôt (30 jours), expirée, sans date", () => {
  assert.equal(statutPiece(piece("quitus", "2026-12-31"), "2026-10-07"), "valide");
  assert.equal(statutPiece(piece("quitus", "2026-11-01"), "2026-10-07"), "bientot");
  assert.equal(statutPiece(piece("quitus", "2026-10-01"), "2026-10-07"), "expiree");
  assert.equal(statutPiece(piece("ninea", null), "2026-10-07"), "sans_date");
});

test("couverture : une pièce valide aujourd'hui mais expirée à la date limite est signalée", () => {
  const coffre = [piece("quitus", "2026-10-20"), piece("css", "2026-12-01"), piece("ninea", null)];
  const c = couvertureDossier(coffre, appel("2026-10-28"), "2026-10-07");
  assert.equal(c.quitus.valideAuDepot, false);
  assert.equal(c.css.valideAuDepot, true);
  assert.equal(c.ninea.valideAuDepot, true); // pièce sans expiration
  assert.equal(c.ipres.presente, false);
});

test("à renouveler : expirées et bientôt, les plus urgentes d'abord", () => {
  const liste = aRenouveler([piece("css", "2026-11-01"), piece("quitus", "2026-09-30"), piece("ipres", "2027-06-01")], "2026-10-07");
  assert.deepEqual(liste.map((p) => p.type), ["quitus", "css"]);
});
