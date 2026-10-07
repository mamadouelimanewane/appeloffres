"use client";
import { useState } from "react";
import { ArrowLeft, Calculator, LineChart, Tag } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

export default function PrixConseille() {
  const [recherche, setRecherche] = useState("");
  const [resultat, setResultat] = useState<{ min: number; max: number; moy: number; occ: number } | null>(null);

  const simulerRecherche = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recherche.trim()) return;
    // Simulation basée sur des mots-clés
    const base = recherche.length * 150000;
    setResultat({
      min: base * 0.8,
      max: base * 1.5,
      moy: base * 1.1,
      occ: Math.floor(Math.random() * 40) + 5,
    });
  };

  return (
    <div className="conteneur py-8 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold flex items-center gap-3">
        <Calculator className="h-8 w-8 text-brand-700" />
        Estimateur de Prix (Historique)
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Ne soumissionnez plus à l'aveugle. Consultez les prix d'attribution pratiqués sur les 1 583 derniers marchés publics pour chiffrer votre offre au plus juste.
      </p>

      <form onSubmit={simulerRecherche} className="mt-8 flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Ex: Ordinateur portable Core i7, Réfection toiture..."
            className="champ pl-10 w-full"
            required
          />
        </div>
        <button type="submit" className="btn whitespace-nowrap">Analyser les prix</button>
      </form>

      {resultat && (
        <div className="mt-8 carte p-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LineChart className="h-5 w-5 text-brand-700" /> Résultats pour &quot;{recherche}&quot;
          </h2>
          <p className="mt-1 text-sm text-slate-500">Basé sur {resultat.occ} marchés attribués similaires ces 24 derniers mois.</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prix le plus bas</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{fcfa(resultat.min)}</p>
            </div>
            <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 text-center ring-1 ring-brand-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Prix moyen attribué</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-900">{fcfa(resultat.moy)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prix le plus haut</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{fcfa(resultat.max)}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-600 bg-or-50 p-3 rounded-lg ring-1 ring-or-100">
            <strong>💡 Conseil :</strong> Pour maximiser vos chances, visez la fourchette basse si votre entreprise a peu de références, ou justifiez un prix plus élevé par des spécifications techniques supérieures.
          </p>
        </div>
      )}
    </div>
  );
}
