import test from "node:test";
import assert from "node:assert/strict";
import { attenteRestante, BLOCAGE_MS, decider, egal, noterEchec } from "./acces-admin.ts";

const env = { ADMIN_UTILISATEUR: "mama", ADMIN_MOT_DE_PASSE: "un-long-mot-de-passe", NODE_ENV: "production" };
const basic = (u: string, m: string) => "Basic " + btoa(`${u}:${m}`);

test("console admin : bons identifiants acceptés, les autres refusés", () => {
  assert.equal(decider(basic("mama", "un-long-mot-de-passe"), env), "autorise");
  assert.equal(decider(basic("mama", "mauvais"), env), "demander");
  assert.equal(decider(basic("autre", "un-long-mot-de-passe"), env), "demander");
  assert.equal(decider(null, env), "demander");
  assert.equal(decider("Bearer abc", env), "demander");
  assert.equal(decider("Basic %%%", env), "demander");
  // Mot de passe contenant « : »
  assert.equal(decider(basic("mama", "a:b:c-long-mot-de-passe"), { ...env, ADMIN_MOT_DE_PASSE: "a:b:c-long-mot-de-passe" }), "autorise");
});

test("console admin : fermée en ligne tant que les identifiants ne sont pas configurés", () => {
  assert.equal(decider(null, { NODE_ENV: "production" }), "desactive");
  assert.equal(decider(basic("mama", "court"), { ADMIN_UTILISATEUR: "mama", ADMIN_MOT_DE_PASSE: "court", NODE_ENV: "production" }), "desactive");
  assert.equal(decider(null, { NODE_ENV: "development" }), "autorise");
});

test("comparaison en temps constant", () => {
  assert.equal(egal("abc", "abc"), true);
  assert.equal(egal("abc", "abd"), false);
  assert.equal(egal("abc", "abcd"), false);
  assert.equal(egal("", ""), true);
});

test("blocage : 5 échecs en 15 minutes bloquent l'adresse 15 minutes", () => {
  const t0 = 1_000_000;
  let t: ReturnType<typeof noterEchec> | undefined;
  for (let i = 0; i < 4; i++) t = noterEchec(t, t0 + i * 1000);
  assert.equal(attenteRestante(t, t0 + 5000), 0); // 4 échecs : pas encore bloqué
  t = noterEchec(t, t0 + 5000);
  assert.equal(attenteRestante(t, t0 + 5000), 15 * 60);
  assert.equal(attenteRestante(t, t0 + 5000 + BLOCAGE_MS), 0); // fin du blocage
  // Après le blocage, le compteur repart de zéro
  t = noterEchec(t, t0 + 5000 + BLOCAGE_MS + 1);
  assert.equal(t.echecs, 1);
  // Échecs espacés de plus de 15 minutes : jamais bloqué
  let u: ReturnType<typeof noterEchec> | undefined;
  for (let i = 0; i < 10; i++) u = noterEchec(u, t0 + i * (BLOCAGE_MS + 1));
  assert.equal(attenteRestante(u, t0 + 9 * (BLOCAGE_MS + 1)), 0);
});
