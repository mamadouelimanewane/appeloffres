"use client";
import { useMemo, useState } from "react";
import { CalendarRange, Landmark, Repeat, Search } from "lucide-react";
import { SECTEURS } from "@/lib/data";
import { RECURRENTS } from "@/lib/donnees";
import { BadgeSecteur, Vide } from "./ui";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const ANNEES = [...new Set(RECURRENTS.flatMap((r) => r.annees))].sort();

/** Nombre de mois avant le prochain mois habituel (0 = ce mois-ci). */
function moisAvant(mois: number, maintenant: number): number {
  return (mois - maintenant + 12) % 12;
}

export function AchatsRecurrents({ secteurProfil }: { secteurProfil: string | null }) {
  const [secteur, setSecteur] = useState("Tous");
  const [mois, setMois] = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const moisCourant = new Date().getMonth() + 1;

  const liste = useMemo(() => {
    const mots = recherche.toLowerCase().trim();
    const s = secteurProfil ?? secteur;
    return RECURRENTS.filter(
      (r) =>
        (s === "Tous" || r.secteur === s) &&
        (mois === "Tous" || r.moisHabituel === Number(mois)) &&
        (!mots || `${r.objet} ${r.autorite}`.toLowerCase().includes(mots)),
    ).sort((a, b) => {
      // les mois habituels les plus proches d'abord, puis les habitudes les plus solides
      const da = a.moisHabituel ? moisAvant(a.moisHabituel, moisCourant) : 99;
      const db = b.moisHabituel ? moisAvant(b.moisHabituel, moisCourant) : 99;
      return da - db || b.annees.length - a.annees.length;
    });
  }, [secteur, mois, recherche, secteurProfil, moisCourant]);

  return (
    <>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-600">
        Achats que le même acheteur a inscrits à son plan de passation <b>au moins trois années</b> ({ANNEES[0]}–{ANNEES.at(-1)}, plans archivés du portail de la DCMP).
        Ils ont de bonnes chances de revenir : préparez vos pièces avant le mois habituel de lancement.
      </p>
      <div className="carte mt-4 flex flex-col gap-3 p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input className="champ pl-10" placeholder="Ex. : véhicule, gardiennage, consommables…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        </div>
        <select className="champ md:!w-44" value={secteur} disabled={!!secteurProfil} onChange={(e) => setSecteur(e.target.value)} aria-label="Secteur">
          {["Tous", ...SECTEURS].map((x) => <option key={x} value={x}>{x === "Tous" ? "Tous les secteurs" : x}</option>)}
        </select>
        <select className="champ md:!w-44" value={mois} onChange={(e) => setMois(e.target.value)} aria-label="Mois habituel">
          <option value="Tous">Tous les mois</option>
          {MOIS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>
      <p className="mt-4 text-sm text-slate-500">{liste.length} achat(s) récurrent(s)</p>
      <ul className="mt-3 grid gap-4 md:grid-cols-2">
        {liste.slice(0, 120).map((r) => {
          const avant = r.moisHabituel ? moisAvant(r.moisHabituel, moisCourant) : null;
          return (
            <li key={r.id} className="carte flex flex-col p-5">
              <div className="flex flex-wrap items-center gap-2">
                <BadgeSecteur secteur={r.secteur} />
                <span className="puce bg-violet-50 text-violet-800 ring-1 ring-violet-200"><Repeat className="h-3.5 w-3.5" /> {r.annees.length} années</span>
              </div>
              <p className="mt-3 flex-1 font-semibold leading-snug text-slate-900 first-letter:uppercase">{r.objet}</p>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                <Landmark className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {r.autorite}
              </p>
              <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
                {r.moisHabituel && (
                  <p className={`flex items-center gap-1.5 ${avant !== null && avant <= 3 ? "font-semibold text-brand-800" : "text-slate-700"}`}>
                    <CalendarRange className="h-4 w-4" /> Lancé habituellement en {MOIS[r.moisHabituel - 1]}
                    {avant === 0 ? " · c'est ce mois-ci" : avant !== null && avant <= 3 ? ` · dans ${avant} mois` : ""}
                  </p>
                )}
                <p className="text-xs text-slate-400">Au plan en {r.annees.join(", ")}{r.mode ? ` · ${r.mode}` : ""}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {liste.length > 120 && <p className="mt-4 text-center text-sm text-slate-500">120 premiers affichés : affinez la recherche pour voir les autres.</p>}
      {liste.length === 0 && <Vide>Aucun achat récurrent ne correspond à ces filtres.</Vide>}
    </>
  );
}
