"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Banknote, Landmark, Medal, Search, Trophy, Users } from "lucide-react";
import { SECTEURS, fcfa } from "@/lib/data";
import { ATTRIBUEES } from "@/lib/donnees";
import { principauxGagnants, resumer, type Resume } from "@/lib/stats";
import { BadgeSecteur, TitrePage, Vide } from "@/components/ui";

const ANNEES = [...new Set(ATTRIBUEES.map((l) => l.annee).filter(Boolean))].sort();
const periode = ANNEES.length ? `${ANNEES[0]}–${ANNEES.at(-1)}` : "";

function Chiffres({ r }: { r: Resume }) {
  const cases = [
    { libelle: "Marchés", valeur: String(r.marches), icone: BarChart3 },
    { libelle: "Montant médian", valeur: r.montantMedian !== null ? fcfa(r.montantMedian) : "—", icone: Banknote },
    { libelle: "Offres reçues (médiane)", valeur: r.offresMedianes !== null ? String(r.offresMedianes) : "—", icone: Users },
    { libelle: "Une seule offre", valeur: r.partUneOffre !== null ? `${r.partUneOffre} %` : "—", icone: Trophy },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cases.map(({ libelle, valeur, icone: Icone }) => (
        <div key={libelle} className="carte p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icone className="h-4 w-4" /></span>
          <p className="mt-3 text-xl font-extrabold text-slate-900 sm:text-2xl">{valeur}</p>
          <p className="text-xs text-slate-500">{libelle}</p>
        </div>
      ))}
    </div>
  );
}

export default function QuiGagne() {
  const [recherche, setRecherche] = useState("");
  const [secteur, setSecteur] = useState("Tous");

  const lignes = useMemo(() => {
    const mots = recherche.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return ATTRIBUEES.filter(
      (l) =>
        (secteur === "Tous" || l.secteur === secteur) &&
        mots.every((m) => `${l.objet} ${l.avis ?? ""} ${l.autorite ?? ""} ${l.attributaire ?? ""}`.toLowerCase().includes(m)),
    );
  }, [recherche, secteur]);

  const resume = resumer(lignes);
  const gagnants = principauxGagnants(lignes, 8);
  const exemples = [...lignes].sort((a, b) => (b.annee ?? "").localeCompare(a.annee ?? "") || (b.montantFcfa ?? 0) - (a.montantFcfa ?? 0)).slice(0, 40);
  const maxSecteur = Math.max(...SECTEURS.map((s) => ATTRIBUEES.filter((l) => l.secteur === s).length));

  return (
    <>
      <TitrePage
        icone={BarChart3}
        titre="Qui gagne quoi, à quel prix"
        sousTitre={<>Marchés attribués publiés sur le portail de la DCMP ({periode}). Cherchez un produit ou un service pour connaître les prix pratiqués, le nombre de concurrents et les entreprises qui gagnent.</>}
      />
      <div className="conteneur space-y-6 py-8">
        <p className="flex items-start gap-2 rounded-xl bg-or-50 p-4 text-sm text-or-700 ring-1 ring-or-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Données historiques extraites automatiquement de copies archivées : elles donnent des ordres de grandeur, pas les prix d&apos;aujourd&apos;hui. Montants TTC tels que publiés.
        </p>

        <div className="carte flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input className="champ pl-10" placeholder="Ex. : véhicule, ordinateur, nettoyage, réhabilitation…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <select className="champ md:!w-48" value={secteur} onChange={(e) => setSecteur(e.target.value)} aria-label="Secteur">
            {["Tous", ...SECTEURS].map((x) => <option key={x} value={x}>{x === "Tous" ? "Tous les secteurs" : x}</option>)}
          </select>
        </div>

        <Chiffres r={resume} />

        {!recherche && secteur === "Tous" && (
          <section className="carte p-6">
            <h2 className="text-lg font-bold">Par secteur</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <tr><th className="pb-3 pr-4 font-medium">Secteur</th><th className="pb-3 pr-4 font-medium">Marchés</th><th className="pb-3 pr-4 font-medium">Montant médian</th><th className="pb-3 pr-4 font-medium">Offres (médiane)</th><th className="pb-3 font-medium">Une seule offre</th></tr>
                </thead>
                <tbody>
                  {SECTEURS.map((s) => {
                    const r = resumer(ATTRIBUEES.filter((l) => l.secteur === s));
                    return (
                      <tr key={s} className="border-t border-slate-100">
                        <td className="py-3 pr-4"><BadgeSecteur secteur={s} /></td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 font-semibold">{r.marches}</span>
                            <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-slate-100 sm:block"><span className="block h-full rounded-full bg-brand-500" style={{ width: `${(r.marches / maxSecteur) * 100}%` }} /></span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-medium">{r.montantMedian !== null ? fcfa(r.montantMedian) : "—"}</td>
                        <td className="py-3 pr-4">{r.offresMedianes ?? "—"}</td>
                        <td className="py-3">{r.partUneOffre !== null ? `${r.partUneOffre} %` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="carte p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Medal className="h-5 w-5 text-or-500" /> Entreprises qui gagnent le plus</h2>
            <ol className="mt-4 space-y-3">
              {gagnants.map((g, i) => (
                <li key={g.nom} className="flex items-start gap-3">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i < 3 ? "bg-or-100 text-or-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                  <span className="min-w-0 text-sm">
                    <span className="block truncate font-semibold text-slate-900">{g.nom}</span>
                    <span className="text-slate-500">{g.marches} marché(s){g.montant ? ` · ${fcfa(g.montant)}` : ""}</span>
                  </span>
                </li>
              ))}
              {gagnants.length === 0 && <li className="text-sm text-slate-500">Aucun résultat.</li>}
            </ol>
          </section>

          <section className="carte p-6 lg:col-span-2">
            <h2 className="text-lg font-bold">Exemples de marchés attribués</h2>
            <ul className="mt-2 divide-y divide-slate-100">
              {exemples.map((l) => (
                <li key={l.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 font-semibold text-slate-900">{l.objet}</p>
                    <span className="whitespace-nowrap text-sm font-bold text-brand-800">{l.montantFcfa !== null ? fcfa(l.montantFcfa) : "montant non publié"}</span>
                  </div>
                  {l.avis && <p className="mt-0.5 text-xs text-slate-400">Lot de : {l.avis}</p>}
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    {l.attributaire && <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-or-500" />{l.attributaire}</span>}
                    {l.nombreOffres ? <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{l.nombreOffres} offre(s)</span> : null}
                    <span className="flex items-center gap-1"><Landmark className="h-3.5 w-3.5" />{l.autorite ?? "Acheteur non identifié"}{l.annee ? ` · ${l.annee}` : ""}</span>
                  </p>
                </li>
              ))}
            </ul>
            {exemples.length === 0 && <Vide>Aucun marché ne correspond.</Vide>}
          </section>
        </div>
      </div>
    </>
  );
}
