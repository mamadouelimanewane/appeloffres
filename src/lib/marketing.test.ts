import test from "node:test";
import assert from "node:assert/strict";
import { appliquerPaiement, creerCompte, type Compte } from "./compte.ts";
import { confirmer, creerTransaction, montant } from "./paiement.ts";
import { appliquerCode, audience, creerCodePromo, enregistrerUtilisation, etatCode, indicateurs, lienAffilie, normaliserCode, personnaliser } from "./marketing.ts";

const le = (iso: string) => new Date(iso + "T10:00:00Z");
const compte = (id: string, secteur: "BTP" | "Informatique", creeLe = "2026-10-01", email?: string): Compte =>
  creerCompte({ nom: "Awa Diop", entreprise: `Ent ${id}`, telephone: "77 123 45 67", region: "Dakar", secteurs: [secteur], email }, le(creeLe), id);

test("code promo : normalisation et validation", () => {
  assert.equal(normaliserCode(" promo btp "), "PROMO-BTP");
  assert.equal(normaliserCode("ab"), null);
  assert.equal(normaliserCode("PROMO_BTP"), null);
  const p = creerCodePromo({ code: "promo-btp", remise: 20, limite: 2 }, [], le("2026-10-07"));
  assert.equal(p.code, "PROMO-BTP");
  assert.throws(() => creerCodePromo({ code: "PROMO-BTP", remise: 10 }, [p], le("2026-10-07")), /existe déjà/);
  assert.throws(() => creerCodePromo({ code: "X-100", remise: 100 }, [], le("2026-10-07")), /entre 1 et 90/);
  assert.throws(() => creerCodePromo({ code: "X-LIM", remise: 10, limite: 0 }, [], le("2026-10-07")), /entier positif/);
});

test("code promo : remise appliquée, arrondie au profit du client", () => {
  const p = creerCodePromo({ code: "PROMO-BTP", remise: 20 }, [], le("2026-10-07"));
  const r = appliquerCode(35_000, "promo-btp", [p], le("2026-10-07"));
  assert.equal(r.montant, 28_000);
  assert.equal(r.remise, 7_000);
  // 15 % de 35 000 = 29 750 → 29 700
  const q = creerCodePromo({ code: "Q15", remise: 15 }, [], le("2026-10-07"));
  assert.equal(appliquerCode(35_000, "Q15", [q], le("2026-10-07")).montant, 29_700);
  assert.throws(() => appliquerCode(35_000, "INCONNU", [p], le("2026-10-07")), /inconnu/);
});

test("code promo : épuisé, expiré, désactivé", () => {
  let p = creerCodePromo({ code: "UNE-FOIS", remise: 10, limite: 1, expireLe: "2026-10-31" }, [], le("2026-10-07"));
  assert.equal(etatCode(p, le("2026-10-31")), "actif"); // jour d'expiration inclus
  assert.equal(etatCode(p, le("2026-11-01")), "expire");
  p = enregistrerUtilisation(p);
  assert.equal(etatCode(p, le("2026-10-07")), "epuise");
  assert.throws(() => enregistrerUtilisation(p), /épuisé/);
  assert.throws(() => appliquerCode(35_000, "UNE-FOIS", [p], le("2026-10-07")), /nombre maximal/);
  assert.equal(etatCode({ ...p, utilisations: 0, actif: false }, le("2026-10-07")), "desactive");
});

test("ciblage : secteur, segment et consentement WhatsApp", () => {
  const essai = compte("a", "BTP");
  const expire = compte("b", "BTP", "2026-08-01");
  const payant = appliquerPaiement(compte("c", "BTP"), "pro", 1, le("2026-10-02"));
  const it = compte("d", "Informatique");
  const stop = { ...compte("e", "BTP"), alertes: { ...compte("e", "BTP").alertes, actives: false } };
  const tous = [essai, expire, payant, it, stop];
  const ids = (cs: Compte[]) => cs.map((c) => c.id).sort().join(",");
  const now = le("2026-10-07");
  assert.equal(ids(audience(tous, { canal: "whatsapp", segment: "sans-abonnement-payant", secteurs: ["BTP"] }, now)), "a,b");
  assert.equal(ids(audience(tous, { canal: "whatsapp", segment: "essai-en-cours", secteurs: ["BTP"] }, now)), "a");
  assert.equal(ids(audience(tous, { canal: "whatsapp", segment: "expires", secteurs: [] }, now)), "b");
  assert.equal(ids(audience(tous, { canal: "whatsapp", segment: "payants", secteurs: [] }, now)), "c");
  assert.equal(ids(audience(tous, { canal: "whatsapp", segment: "tous", secteurs: [] }, now)), "a,b,c,d"); // e a dit STOP
  assert.equal(ids(audience([...tous, compte("f", "BTP", "2026-10-01", "f@ex.sn")], { canal: "email", segment: "tous", secteurs: [] }, now)), "f");
});

test("message personnalisé", () => {
  assert.equal(personnaliser("Bonjour {nom}, {entreprise} peut gagner plus.", compte("a", "BTP")), "Bonjour Awa, Ent a peut gagner plus.");
});

test("indicateurs : conversion, encaissements et coût d'acquisition sur 30 jours", () => {
  const now = le("2026-10-07");
  const cs = [compte("a", "BTP"), compte("b", "BTP"), compte("c", "BTP", "2026-07-01"), compte("d", "BTP")];
  const t1 = confirmer(creerTransaction({ compteId: "a", offre: "pro", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-10-02"), "T1"), le("2026-10-02"));
  const t2 = confirmer(creerTransaction({ compteId: "a", offre: "pro", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-10-05"), "T2"), le("2026-10-05"));
  const t3 = confirmer(creerTransaction({ compteId: "c", offre: "veille", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-07-02"), "T3"), le("2026-07-02"));
  const t4 = creerTransaction({ compteId: "b", offre: "pro", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-10-06"), "T4"); // en attente
  const k = indicateurs(cs, [t1, t2, t3, t4], 70_000, now);
  assert.equal(k.inscrits, 4);
  assert.equal(k.inscrits30j, 3);
  assert.equal(k.payants, 2);
  assert.equal(k.tauxConversion, 50);
  assert.equal(k.encaisse30j, 70_000);
  assert.equal(k.cac, 70_000); // un seul nouveau client payant sur 30 jours (a)
  assert.equal(indicateurs([], [], 0, now).tauxConversion, null);
  assert.equal(indicateurs(cs, [t1], 0, now).cac, null);
});

test("lien d'affiliation", () => {
  assert.equal(lienAffilie("https://appeloffres.vercel.app/", "PROMO-BTP"), "https://appeloffres.vercel.app/inscription?ref=PROMO-BTP");
});

test("paiement avec code promo : montant réduit, prix d'origine conservé", () => {
  const p = creerCodePromo({ code: "PROMO-BTP", remise: 20 }, [], le("2026-10-07"));
  const r = appliquerCode(montant("pro", 3), "promo-btp", [p], le("2026-10-07"));
  const t = creerTransaction({ compteId: "a", offre: "pro", mois: 3, moyen: "wave", telephone: "+221771234567" }, le("2026-10-07"), "T", { code: r.code.code, montant: r.montant });
  assert.equal(t.montant, 84_000);
  assert.equal(t.montantAvantRemise, 105_000);
  assert.equal(t.codePromo, "PROMO-BTP");
  const sans = creerTransaction({ compteId: "a", offre: "pro", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-10-07"), "T2");
  assert.equal(sans.montant, 35_000);
  assert.equal(sans.codePromo, null);
  // Une page modifiée ne peut pas imposer un montant supérieur au prix ou nul
  assert.throws(() => creerTransaction({ compteId: "a", offre: "pro", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-10-07"), "T3", { code: "X", montant: 0 }), /incohérent/);
  assert.throws(() => creerTransaction({ compteId: "a", offre: "pro", mois: 1, moyen: "wave", telephone: "+221771234567" }, le("2026-10-07"), "T4", { code: "X", montant: 40_000 }), /incohérent/);
});

test("affiliation : le code parrain est enregistré à l'inscription", () => {
  const c = creerCompte({ nom: "Awa Diop", entreprise: "Diop BTP", telephone: "77 123 45 67", region: "Dakar", secteurs: ["BTP"], parrain: " promo-btp " }, le("2026-10-07"), "x");
  assert.equal(c.parrain, "PROMO-BTP");
  assert.equal(compte("y", "BTP").parrain, null);
});
