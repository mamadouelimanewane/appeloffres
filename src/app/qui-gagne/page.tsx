"use client";
import { useMemo, useState } from "react";
import { SECTEURS, fcfa } from "@/lib/data";
import { ATTRIBUEES } from "@/lib/donnees";
import { principauxGagnants, resumer, type Resume } from "@/lib/stats";

const ANNEES = [...new Set(ATTRIBUEES.map((l) => l.annee).filter(Boolean))].sort();
const periode = ANNEES.length ? `${ANNEES[0]}–${ANNEES.at(-1)}` : "";

function Chiffres({ r }: { r: Resume }) {
  const cases = [
    ["Marchés", String(r.marches)],
    ["Montant médian", r.montantMedian !== null ? fcfa(r.montantMedian) : "—"],
    ["Offres reçues (médiane)", r.offresMedianes !== null ? String(r.offresMedianes) : "—"],
    ["Une seule offre", r.partUneOffre !== null ? `${r.partUneOffre} %` : "—"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cases.map(([libelle, valeur]) => (
        <div key={libelle} className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500">{libelle}</p>
          <p className="mt-1 text-lg font-semibold">{valeur}</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Qui gagne quoi, à quel prix</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Marchés attribués publiés sur le portail de la DCMP ({periode}). Cherchez un produit ou un service pour connaître les prix
          pratiqués, le nombre de concurrents et les entreprises qui gagnent.
        </p>
        <p className="mt-2 max-w-3xl rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
          Données historiques extraites automatiquement de copies archivées : elles donnent des ordres de grandeur, pas les prix
          d&apos;aujourd&apos;hui. Les montants s&apos;entendent TTC tels que publiés.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input className="champ !w-72" placeholder="Ex. : véhicule, ordinateur, nettoyage…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        <select className="champ !w-auto" value={secteur} onChange={(e) => setSecteur(e.target.value)} aria-label="Secteur">
          {["Tous", ...SECTEURS].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>

      <Chiffres r={resume} />

      {!recherche && secteur === "Tous" && (
        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Par secteur</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr><th className="py-1 pr-4">Secteur</th><th className="pr-4">Marchés</th><th className="pr-4">Montant médian</th><th className="pr-4">Offres (médiane)</th><th>Une seule offre</th></tr>
              </thead>
              <tbody>
                {SECTEURS.map((s) => {
                  const r = resumer(ATTRIBUEES.filter((l) => l.secteur === s));
                  return (
                    <tr key={s} className="border-t">
                      <td className="py-1.5 pr-4 font-medium">{s}</td>
                      <td className="pr-4">{r.marches}</td>
                      <td className="pr-4">{r.montantMedian !== null ? fcfa(r.montantMedian) : "—"}</td>
                      <td className="pr-4">{r.offresMedianes ?? "—"}</td>
                      <td>{r.partUneOffre !== null ? `${r.partUneOffre} %` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Entreprises qui gagnent le plus</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {gagnants.map((g) => (
              <li key={g.nom}>
                <b>{g.nom}</b>
                <br />
                <span className="text-gray-600">{g.marches} marché(s){g.montant ? ` · ${fcfa(g.montant)}` : ""}</span>
              </li>
            ))}
            {gagnants.length === 0 && <li className="text-gray-500">Aucun résultat.</li>}
          </ol>
        </section>

        <section className="rounded-xl border bg-white p-5 md:col-span-2">
          <h2 className="font-semibold">Exemples de marchés attribués</h2>
          <ul className="mt-3 divide-y text-sm">
            {exemples.map((l) => (
              <li key={l.id} className="py-2">
                <p className="font-medium">{l.objet}</p>
                {l.avis && <p className="text-xs text-gray-500">Lot de : {l.avis}</p>}
                <p className="text-gray-600">
                  {l.montantFcfa !== null ? fcfa(l.montantFcfa) : "montant non publié"}
                  {l.nombreOffres ? ` · ${l.nombreOffres} offre(s)` : ""}
                  {l.attributaire ? ` · gagné par ${l.attributaire}` : ""}
                </p>
                <p className="text-xs text-gray-500">{l.autorite ?? "Acheteur non identifié"}{l.annee ? ` · ${l.annee}` : ""}</p>
              </li>
            ))}
            {exemples.length === 0 && <li className="py-2 text-gray-500">Aucun marché ne correspond.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
