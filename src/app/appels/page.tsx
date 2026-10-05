"use client";
import Link from "next/link";
import { useState } from "react";
import { SECTEURS, dateFr, joursRestants } from "@/lib/data";
import { APPELS, AVIS_MIS_A_JOUR_LE } from "@/lib/donnees";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";

const SOURCES = [...new Set(APPELS.map((a) => a.sourceLibelle))].sort();

export default function ListeAppels() {
  const [profil] = useLocal<Profil>("profil", PROFIL_VIDE);
  const [secteur, setSecteur] = useState("Tous");
  const [source, setSource] = useState("Toutes");
  const [recherche, setRecherche] = useState("");
  const [pertinents, setPertinents] = useState(false);

  const s = pertinents ? profil.secteur : secteur;
  const mots = recherche.toLowerCase().trim();
  const liste = APPELS.filter(
    (a) =>
      (s === "Tous" || a.secteur === s) &&
      (source === "Toutes" || a.sourceLibelle === source) &&
      (!mots || `${a.titre} ${a.reference} ${a.autorite}`.toLowerCase().includes(mots)),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Appels d&apos;offres ouverts</h1>
        <p className="text-sm text-gray-600">{APPELS.length} avis collectés sur les sites officiels · mis à jour le {dateFr(AVIS_MIS_A_JOUR_LE)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input className="champ !w-56" placeholder="Rechercher…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        <select className="champ !w-auto" value={secteur} disabled={pertinents} onChange={(e) => setSecteur(e.target.value)} aria-label="Secteur">
          {["Tous", ...SECTEURS].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="champ !w-auto" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source">
          {["Toutes", ...SOURCES].map((x) => <option key={x}>{x}</option>)}
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={pertinents} onChange={(e) => setPertinents(e.target.checked)} />
          Mon secteur seulement
        </label>
      </div>
      <ul className="space-y-3">
        {liste.map((a) => {
          const j = a.dateLimite ? joursRestants(a.dateLimite) : null;
          const couleur = j === null ? "text-gray-500" : j < 0 ? "text-red-600" : j <= 7 ? "font-semibold text-orange-600" : "";
          return (
            <li key={a.id} className="rounded-xl border bg-white p-4">
              <Link href={`/appels/${a.id}`} className="font-semibold text-brand hover:underline">{a.titre}</Link>
              <p className="text-sm text-gray-600">{a.autorite} · {a.secteur}{a.mode ? ` · ${a.mode}` : ""} · source : {a.sourceLibelle}</p>
              <p className="mt-1 text-sm">
                <span className={couleur}>
                  {j === null ? "Date limite : voir l'avis officiel" : j < 0 ? "Clôturé" : `Date limite ${dateFr(a.dateLimite!)} · ${j} jour(s) restant(s)`}
                </span>
                {a.publieLe && <span className="text-gray-500"> · publié le {dateFr(a.publieLe)}</span>}
              </p>
            </li>
          );
        })}
        {liste.length === 0 && <li className="text-gray-500">Aucun appel d&apos;offres ne correspond à ces filtres.</li>}
      </ul>
    </div>
  );
}
