import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lirePpm, type Mot } from "./ppm.ts";

// Mots et positions des pages 1 à 3 du PPM Senelec 2026 (nom de l'agent retiré).
const mots: Mot[] = JSON.parse(readFileSync(new URL("./fixtures/ppm-senelec-p1-3.json", import.meta.url), "utf8"));
const r = lirePpm(mots);
const par = (ref: string) => r.find((x) => x.reference === ref);

test("le numéro du plan est lu sur la page de garde", () => {
  assert.ok(r.length > 10);
  assert.ok(r.every((x) => x.plan === "P_SENELEC_2026_2"));
});

test("une réalisation complète : objet, type, financement, mode, quatre dates, état", () => {
  const a = par("C_CSPDS_166");
  assert.ok(a);
  assert.match(a.objet, /^Recrutement d’un consultant individuel pour l’évaluation complète du Plan de Développement Stratégique 2021-2025/);
  assert.equal(a.typeMarche, "Prestations Intellectuelles/Consultants");
  assert.deepEqual(a.financement, ["Fonds propres"]);
  assert.equal(a.mode, "Demande de Renseignement et de Prix restreinte");
  assert.deepEqual([a.lancement, a.attribution, a.demarrage, a.achevement], ["2026-02-02", "2026-03-04", "2026-04-01", "2026-07-01"]);
  assert.equal(a.etat, "Retard 39 jours");
  assert.equal(a.direction, "Cellule de Suivi du Plan de Développement Stratégique");
});

test("une référence coupée sur deux lignes est recollée", () => {
  assert.ok(par("C_SMARTGRID_001"));
});

test("un intitulé en bas de page s'applique aux lignes de la page suivante", () => {
  assert.equal(par("C_SMARTGRID_001")?.direction, "Cellule SMARTGRID");
});

test("l'état d'une ligne ne déborde pas sur sa voisine", () => {
  assert.equal(par("C_CSPDS_167")?.etat, "Retard 71 jours");
});

test("les modes de passation sont des libellés connus et complets", () => {
  const connus = /^(Appel d'Offres Ouvert( avec pré qualification)?|Appel public à manifestation d'intérêt|Demande de Renseignement et de Prix (restreinte|simple|à compétition ouverte)|Avenant|Entente directe)$/;
  for (const x of r) assert.match(x.mode ?? "", connus, `${x.reference} : ${x.mode}`);
});

test("aucun texte de la page de garde n'est pris pour une réalisation", () => {
  assert.ok(r.every((x) => /^[CFTS]_/.test(x.reference ?? "")));
});
