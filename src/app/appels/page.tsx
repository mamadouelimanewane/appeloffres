"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Building, Search } from "lucide-react";
import { SECTEURS, compteARebours, dateFr, joursRestants } from "@/lib/data";
import { APPELS, AVIS_MIS_A_JOUR_LE } from "@/lib/donnees";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";
import { BadgeSecteur, Echeance, TitrePage, Vide } from "@/components/ui";

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
    <>
      <TitrePage
        icone={Search}
        titre="Appels d'offres ouverts"
        sousTitre={<>{APPELS.length} avis collectés sur les sites officiels · mis à jour le {dateFr(AVIS_MIS_A_JOUR_LE)}</>}
      />
      <div className="conteneur py-8">
        <div className="carte flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input className="champ pl-10" placeholder="Rechercher un marché, une référence, un acheteur…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <select className="champ md:!w-44" value={secteur} disabled={pertinents} onChange={(e) => setSecteur(e.target.value)} aria-label="Secteur">
            {["Tous", ...SECTEURS].map((x) => <option key={x} value={x}>{x === "Tous" ? "Tous les secteurs" : x}</option>)}
          </select>
          <select className="champ md:!w-52" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source">
            {["Toutes", ...SOURCES].map((x) => <option key={x} value={x}>{x === "Toutes" ? "Toutes les sources" : x}</option>)}
          </select>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-brand-700" checked={pertinents} onChange={(e) => setPertinents(e.target.checked)} />
            Mon secteur
          </label>
        </div>

        <p className="mt-6 text-sm text-slate-500">{liste.length} résultat(s)</p>
        <ul className="mt-3 grid gap-4">
          {liste.map((a) => {
            const j = a.dateLimite ? joursRestants(a.dateLimite) : null;
            const texte = j === null ? "Date limite : voir l'avis" : j < 0 ? "Clôturé" : `${dateFr(a.dateLimite!)} · ${compteARebours(j)}`;
            return (
              <li key={a.id}>
                <Link href={`/appels/${a.id}`} className="carte-lien group flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <BadgeSecteur secteur={a.secteur} />
                      {a.mode && <span className="puce bg-slate-100 text-slate-600">{a.mode}</span>}
                    </div>
                    <p className="mt-2 font-semibold leading-snug text-slate-900 group-hover:text-brand-800">{a.titre}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                      <Building className="h-4 w-4" aria-hidden /> {a.autorite}
                      <span className="text-slate-300">•</span> {a.sourceLibelle}
                      {a.publieLe && <><span className="text-slate-300">•</span> publié le {dateFr(a.publieLe)}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <Echeance jours={j} texte={texte} />
                    <span className="hidden items-center gap-1 text-sm font-semibold text-brand-700 sm:inline-flex">Préparer <ArrowUpRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        {liste.length === 0 && <Vide>Aucun appel d&apos;offres ne correspond à ces filtres.</Vide>}
      </div>
    </>
  );
}
