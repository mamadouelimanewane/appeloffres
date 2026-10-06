import test from "node:test";
import assert from "node:assert/strict";
import { achatsRecurrents, cleObjet } from "./recurrents.ts";
import type { PlanDcmp } from "./plans-dcmp.ts";
import type { Realisation } from "./ppm.ts";

const r = (objet: string, lancement: string | null, typeMarche = "Fournitures"): Realisation => ({
  plan: null, direction: null, reference: "F_X_001", objet, typeMarche, financement: [], mode: "Demande de Renseignement et de Prix simple",
  lancement, attribution: null, demarrage: null, achevement: null, etat: null,
});
const plan = (autorite: string, annee: string, versionDu: string, realisations: Realisation[]): PlanDcmp => ({ autorite, categorie: null, annee, plan: `P_${annee}`, versionDu, realisations });

test("le même achat est reconnu malgré casse, accents, pluriel et année", () => {
  assert.equal(cleObjet("Entretien et réparation véhicules 2018"), cleObjet("ENTRETIEN ET REPARATION VEHICULE"));
});

test("un achat présent deux années de suite est récurrent, avec son mois habituel", () => {
  const rec = achatsRecurrents([
    plan("Ministère A", "2018", "2018-01-10", [r("Entretien et réparation véhicules", "2018-02-01"), r("Achat unique", "2018-05-01")]),
    plan("Ministère A", "2019", "2019-01-10", [r("ENTRETIEN ET REPARATION VEHICULE", "2019-02-15")]),
  ]);
  assert.equal(rec.length, 1);
  assert.deepEqual(rec[0].annees, ["2018", "2019"]);
  assert.equal(rec[0].moisHabituel, 2);
  assert.equal(rec[0].objet, "ENTRETIEN ET REPARATION VEHICULE"); // libellé le plus récent
});

test("l'année d'origine est retirée du libellé affiché", () => {
  const rec = achatsRecurrents([
    plan("ADM", "2020", "2020-01-10", [r("Nettoiement des locaux de l'ADM - gestion 2020", "2020-10-01")]),
    plan("ADM", "2021", "2021-01-10", [r("Nettoiement des locaux de l'ADM - gestion 2021", "2021-10-01")]),
  ]);
  assert.equal(rec[0].objet, "Nettoiement des locaux de l'ADM");
});

test("seule la dernière version du plan d'une année compte", () => {
  const rec = achatsRecurrents([
    plan("Ministère A", "2018", "2018-01-10", [r("Gardiennage", "2018-01-05")]),
    plan("Ministère A", "2018", "2018-06-10", [r("Nettoiement", "2018-07-01")]), // version plus récente : sans gardiennage
    plan("Ministère A", "2019", "2019-01-10", [r("Gardiennage", "2019-01-05")]),
  ]);
  assert.equal(rec.length, 0);
});

test("deux acheteurs différents ne sont pas confondus", () => {
  const rec = achatsRecurrents([
    plan("Ministère A", "2018", "2018-01-10", [r("Gardiennage", null)]),
    plan("Ministère B", "2019", "2019-01-10", [r("Gardiennage", null)]),
  ]);
  assert.equal(rec.length, 0);
});
