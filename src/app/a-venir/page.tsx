"use client";
import { useState } from "react";
import { CalendarClock, Landmark, Rocket, Search } from "lucide-react";
import { SECTEURS, dateFr, joursRestants } from "@/lib/data";
import { A_VENIR, A_VENIR_MIS_A_JOUR_LE } from "@/lib/donnees";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";
import { BadgeSecteur, TitrePage, Vide } from "@/components/ui";

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
    <>
      <TitrePage
        icone={CalendarClock}
        titre="Marchés à venir"
        sousTitre={<>Marchés inscrits aux plans de passation ({AUTORITES.join(", ")}) mais pas encore publiés. Préparez votre dossier avant l&apos;avis officiel. Plans lus le {dateFr(A_VENIR_MIS_A_JOUR_LE)}.</>}
      />
      <div className="conteneur py-8">
        <div className="carte flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input className="champ pl-10" placeholder="Rechercher un marché prévu…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <select className="champ lg:!w-44" value={secteur} disabled={pertinents} onChange={(e) => setSecteur(e.target.value)} aria-label="Secteur">
            {["Tous", ...SECTEURS].map((x) => <option key={x} value={x}>{x === "Tous" ? "Tous les secteurs" : x}</option>)}
          </select>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-brand-700" checked={ouvertsSeulement} onChange={(e) => setOuvertsSeulement(e.target.checked)} />
            Ouverts à toute entreprise
          </label>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-brand-700" checked={pertinents} onChange={(e) => setPertinents(e.target.checked)} />
            Mon secteur
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="puce bg-brand-50 px-3 py-1 text-brand-800 ring-1 ring-brand-200"><Rocket className="h-3.5 w-3.5" /> {nbAVenir} à lancer prochainement</span>
          <span className="puce bg-slate-100 px-3 py-1 text-slate-600">{liste.length - nbAVenir} à date prévue dépassée, sans publication constatée</span>
        </div>

        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {liste.map((r) => {
            const j = r.lancement ? joursRestants(r.lancement) : null;
            const passe = j !== null && j < 0;
            return (
              <li key={r.id} className="carte flex flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <BadgeSecteur secteur={r.secteur} />
                  {r.mode && <span className="puce bg-slate-100 text-slate-600">{r.mode}</span>}
                </div>
                <p className="mt-3 flex-1 font-semibold leading-snug text-slate-900">{r.objet}</p>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                  <Landmark className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{r.autorite}{r.direction ? ` · ${r.direction}` : ""}</span>
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
                  {r.lancement ? (
                    <span className={passe ? "text-slate-500" : "font-semibold text-brand-800"}>
                      Lancement prévu le {dateFr(r.lancement)}
                      {j !== null && (passe ? " · vérifiez s'il a déjà été publié" : ` · dans ${j} j`)}
                    </span>
                  ) : <span className="text-slate-500">Date de lancement non indiquée</span>}
                  {r.financement.length > 0 && <span className="text-xs text-slate-400">{r.financement.join(", ")}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        {liste.length === 0 && <Vide>Aucun marché ne correspond à ces filtres.</Vide>}
      </div>
    </>
  );
}
