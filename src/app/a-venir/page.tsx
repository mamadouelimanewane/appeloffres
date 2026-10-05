"use client";
import { useState } from "react";
import { SECTEURS, dateFr, joursRestants } from "@/lib/data";
import { A_VENIR, A_VENIR_MIS_A_JOUR_LE } from "@/lib/donnees";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";

const AUTORITES = [...new Set(A_VENIR.map((r) => r.autorite ?? "—"))].sort();
const OUVERTS = /Ouvert|compétition ouverte|manifestation/;

export default function MarchesAVenir() {
  const [profil] = useLocal<Profil>("profil", PROFIL_VIDE);
  const [secteur, setSecteur] = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const [ouvertsSeulement, setOuvertsSeulement] = useState(true);
  const [pertinents, setPertinents] = useState(false);

  const s = pertinents ? profil.secteur : secteur;
  const mots = recherche.toLowerCase().trim();
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const liste = A_VENIR.filter(
    (r) =>
      (s === "Tous" || r.secteur === s) &&
      (!ouvertsSeulement || OUVERTS.test(r.mode ?? "")) &&
      (!mots || `${r.objet} ${r.reference} ${r.direction}`.toLowerCase().includes(mots)),
  )
    // D'abord les lancements à venir (les plus proches en tête), puis les dates dépassées (les plus récentes en tête).
    .sort((x, y) => {
      const ax = (x.lancement ?? "") >= aujourdhui, ay = (y.lancement ?? "") >= aujourdhui;
      if (ax !== ay) return ax ? -1 : 1;
      return ax ? (x.lancement ?? "").localeCompare(y.lancement ?? "") : (y.lancement ?? "").localeCompare(x.lancement ?? "");
    });
  const nbAVenir = liste.filter((r) => (r.lancement ?? "") >= aujourdhui).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Marchés à venir</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Marchés inscrits aux plans de passation des autorités ({AUTORITES.join(", ")}) mais pas encore publiés.
          Préparez votre dossier avant l&apos;avis officiel. Plans lus le {dateFr(A_VENIR_MIS_A_JOUR_LE)}.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input className="champ !w-56" placeholder="Rechercher…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        <select className="champ !w-auto" value={secteur} disabled={pertinents} onChange={(e) => setSecteur(e.target.value)} aria-label="Secteur">
          {["Tous", ...SECTEURS].map((x) => <option key={x}>{x}</option>)}
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={ouvertsSeulement} onChange={(e) => setOuvertsSeulement(e.target.checked)} />
          Procédures ouvertes à toute entreprise
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={pertinents} onChange={(e) => setPertinents(e.target.checked)} />
          Mon secteur seulement
        </label>
      </div>
      <p className="text-sm text-gray-600">
        {liste.length} marché(s) : {nbAVenir} à lancer prochainement, {liste.length - nbAVenir} dont la date prévue est dépassée sans publication constatée.
      </p>
      <ul className="space-y-3">
        {liste.map((r) => {
          const j = r.lancement ? joursRestants(r.lancement) : null;
          return (
            <li key={r.id} className="rounded-xl border bg-white p-4">
              <p className="font-semibold">{r.objet}</p>
              <p className="text-sm text-gray-600">
                {r.autorite}{r.direction ? ` · ${r.direction}` : ""} · {r.typeMarche} · {r.mode}
              </p>
              <p className="mt-1 text-sm">
                {r.lancement && (
                  <span className={j !== null && j < 0 ? "text-orange-700" : "font-medium text-brand-dark"}>
                    Lancement prévu le {dateFr(r.lancement)}
                    {j !== null && (j < 0 ? " · date dépassée : vérifiez s'il a déjà été publié" : ` (dans ${j} jour(s))`)}
                  </span>
                )}
                {r.financement.length > 0 && <span className="text-gray-500"> · financement : {r.financement.join(", ")}</span>}
              </p>
              <p className="text-xs text-gray-400">Réf. {r.reference} · plan {r.plan}</p>
            </li>
          );
        })}
        {liste.length === 0 && <li className="text-gray-500">Aucun marché ne correspond à ces filtres.</li>}
      </ul>
    </div>
  );
}
