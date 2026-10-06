import test from "node:test";
import assert from "node:assert/strict";
import { appliquerPaiement, creerCompte, normaliserTelephone, peutUtiliser, statutAbonnement } from "./compte.ts";
import { annuler, confirmer, creerTransaction, montant } from "./paiement.ts";
import { avisPourAlerte, messageWhatsApp } from "./alertes.ts";
import type { Appel } from "./data.ts";

const le = (iso: string) => new Date(iso + "T10:00:00Z");
const compte = () => creerCompte({ nom: "Awa Diop", entreprise: "Diop BTP", telephone: "77 123 45 67", region: "Dakar", secteurs: ["BTP"] }, le("2026-10-06"), "c1");

test("téléphone : formats sénégalais acceptés, autres refusés", () => {
  assert.equal(normaliserTelephone("77 123 45 67"), "+221771234567");
  assert.equal(normaliserTelephone("00221 70 123 45 67"), "+221701234567");
  assert.equal(normaliserTelephone("+221 78-123-45-67"), "+221781234567");
  assert.equal(normaliserTelephone("33 123 45 67"), null); // fixe
  assert.equal(normaliserTelephone("771234"), null);
});

test("inscription : essai gratuit de 14 jours, jour d'inscription compris", () => {
  const c = compte();
  assert.equal(c.abonnement.offre, "essai");
  assert.equal(c.abonnement.jusquau, "2026-10-19");
  assert.equal(statutAbonnement(c, le("2026-10-19")).joursRestants, 0);
  assert.equal(statutAbonnement(c, le("2026-10-20")).actif, false);
  assert.throws(() => creerCompte({ nom: "", entreprise: "X", telephone: "771234567", region: "Dakar", secteurs: [] }, le("2026-10-06"), "c2"));
});

test("droits : l'essai et Pro ouvrent le mémoire, Veille non, expiré non", () => {
  const c = compte();
  assert.equal(peutUtiliser(c, "memoire", le("2026-10-10")), true);
  const veille = appliquerPaiement(c, "veille", 1, le("2026-10-10"));
  assert.equal(peutUtiliser(veille, "memoire", le("2026-10-10")), false);
  assert.equal(peutUtiliser(c, "memoire", le("2026-11-01")), false);
  assert.equal(peutUtiliser(null, "memoire", le("2026-10-10")), false);
});

test("paiement : 30 jours par mois, sans perdre les jours restants de la même offre", () => {
  const pro = appliquerPaiement(compte(), "pro", 1, le("2026-10-10"));
  assert.equal(pro.abonnement.jusquau, "2026-11-08"); // 10/10 → 08/11 inclus = 30 jours
  const renouvele = appliquerPaiement(pro, "pro", 1, le("2026-11-01"));
  assert.equal(renouvele.abonnement.jusquau, "2026-12-08");
  const apresExpiration = appliquerPaiement(pro, "pro", 1, le("2026-12-20"));
  assert.equal(apresExpiration.abonnement.jusquau, "2027-01-18");
});

test("montants : 12 mois = 10 mois payés", () => {
  assert.equal(montant("pro", 1), 35_000);
  assert.equal(montant("veille", 3), 45_000);
  assert.equal(montant("pro", 12), 350_000);
});

test("transaction : confirmée une seule fois, durée contrôlée", () => {
  const t = creerTransaction({ compteId: "c1", offre: "pro", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-10-06"), "T1");
  const payee = confirmer(t, le("2026-10-06"));
  assert.equal(payee.statut, "payee");
  assert.throws(() => confirmer(payee, le("2026-10-06")));
  assert.throws(() => annuler(payee));
  assert.throws(() => creerTransaction({ compteId: "c1", offre: "pro", mois: 2, moyen: "wave", telephone: "x" }, le("2026-10-06"), "T2"));
});

const avis = (id: string, champs: Partial<Appel>): Appel => ({
  id, source: "s", sourceLibelle: "S", reference: "R", titre: "Objet", autorite: "Acheteur", secteur: "Services",
  region: null, mode: null, budgetEstime: null, garantieSoumission: null, publieLe: null, dateLimite: "2026-10-20", url: null, ...champs,
});

test("alertes : secteur suivi ou mot-clé, ouverts seulement, sans doublon", () => {
  const c = { ...compte(), alertes: { ...compte().alertes, motsCles: ["véhicule"] } };
  const liste = [
    avis("a", { secteur: "BTP" }),
    avis("b", { titre: "Acquisition de VEHICULES 4x4", secteur: "Fournitures" }),
    avis("c", { secteur: "Études" }),
    avis("d", { secteur: "BTP", dateLimite: "2026-10-01" }),
    avis("e", { secteur: "BTP" }),
  ];
  assert.deepEqual(avisPourAlerte(c, liste, new Set(["e"]), "2026-10-06").map((x) => x.id), ["a", "b"]);
  assert.deepEqual(avisPourAlerte({ ...c, alertes: { ...c.alertes, actives: false } }, liste, new Set(), "2026-10-06"), []);
});

test("message WhatsApp : prénom, liens, 5 avis au plus, désinscription", () => {
  const m = messageWhatsApp(compte(), Array.from({ length: 7 }, (_, i) => avis(`x${i}`, { titre: `Marché ${i}` })), "https://exemple.sn");
  assert.match(m, /^Bonjour Awa/);
  assert.equal((m.match(/https:\/\/exemple\.sn\/appels\/x/g) ?? []).length, 5);
  assert.match(m, /et 2 autre\(s\)/);
  assert.match(m, /limite 20\/10\/2026/);
  assert.match(m, /STOP/);
});
