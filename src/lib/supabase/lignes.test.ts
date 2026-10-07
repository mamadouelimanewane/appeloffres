import test from "node:test";
import assert from "node:assert/strict";
import { creerCompte } from "../compte.ts";
import { confirmer, creerTransaction } from "../paiement.ts";
import { creerCodePromo } from "../marketing.ts";
import { ligneCode, ligneCompte, ligneTransaction, modificationsClient, suiteSure, versCode, versCompte, versMessage, versTransaction } from "./lignes.ts";

const le = (iso: string) => new Date(iso + "T10:00:00Z");

test("compte : aller-retour base ↔ application", () => {
  const c = creerCompte({ nom: "Awa Diop", entreprise: "Diop BTP", telephone: "77 123 45 67", email: "awa@ex.sn", region: "Thiès", secteurs: ["BTP"], parrain: "promo-btp" }, le("2026-10-07"), "uuid-1");
  assert.deepEqual(versCompte(ligneCompte(c)), c);
  // Postgres renvoie les dates avec un fuseau ; la date d'abonnement reste au format yyyy-mm-dd
  const l = { ...ligneCompte(c), cree_le: "2026-10-07 10:00:00+00", abonnement_jusquau: "2026-10-20" };
  assert.equal(versCompte(l).creeLe, "2026-10-07T10:00:00.000Z");
  assert.equal(versCompte(l).abonnement.jusquau, "2026-10-20");
});

test("compte : le client ne peut envoyer que ses champs modifiables", () => {
  const c = creerCompte({ nom: "Awa Diop", entreprise: "Diop BTP", telephone: "77 123 45 67", region: "Dakar", secteurs: ["BTP"] }, le("2026-10-07"), "uuid-1");
  assert.deepEqual(Object.keys(modificationsClient(c)).sort(), ["alertes", "entreprise", "nom", "region"]);
});

test("transaction : aller-retour, avec et sans code promo", () => {
  const t = confirmer(creerTransaction({ compteId: "uuid-1", offre: "pro", mois: 3, moyen: "wave", telephone: "+221771234567" }, le("2026-10-07"), "PAY1", { code: "PROMO-BTP", montant: 84_000 }), le("2026-10-07"));
  assert.deepEqual(versTransaction(ligneTransaction(t)), t);
  const sans = creerTransaction({ compteId: "uuid-1", offre: "veille", mois: 1, moyen: "orange_money", telephone: "+221771234567" }, le("2026-10-07"), "PAY2");
  assert.deepEqual(versTransaction(ligneTransaction(sans)), sans);
});

test("code promo : aller-retour", () => {
  const p = creerCodePromo({ code: "PROMO-BTP", remise: 20, limite: 100, expireLe: "2026-12-31" }, [], le("2026-10-07"));
  assert.deepEqual(versCode(ligneCode(p)), p);
});

test("message : conversion", () => {
  const m = versMessage({ id: "m1", compte_id: "uuid-1", a: "+221771234567", texte: "Bonjour", avis_ids: ["a1"], envoye_le: "2026-10-07 10:00:00+00" });
  assert.deepEqual(m, { id: "m1", compteId: "uuid-1", a: "+221771234567", texte: "Bonjour", avisIds: ["a1"], envoyeLe: "2026-10-07T10:00:00.000Z" });
});

test("redirection après connexion : chemins internes seulement", () => {
  assert.equal(suiteSure("/abonnement?offre=pro"), "/abonnement?offre=pro");
  assert.equal(suiteSure("https://pirate.example"), "/compte");
  assert.equal(suiteSure("//pirate.example"), "/compte");
  assert.equal(suiteSure("/\\pirate.example"), "/compte");
  assert.equal(suiteSure(undefined), "/compte");
});
