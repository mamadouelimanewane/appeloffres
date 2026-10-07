"use client";
import { useState } from "react";
import { ArrowLeft, Telescope, Search, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const PRIX_DB: Record<string, { unite: string; min: number; mediane: number; max: number; nbTransactions: number; acheteurTop: string; annee: number }> = {
  "ordinateur portable": { unite: "unité", min: 245000, mediane: 298000, max: 385000, nbTransactions: 42, acheteurTop: "ADIE", annee: 2025 },
  "chaise bureau": { unite: "unité", min: 28000, mediane: 45000, max: 72000, nbTransactions: 28, acheteurTop: "Min. Finances", annee: 2025 },
  "groupe électrogène": { unite: "unité", min: 2800000, mediane: 4200000, max: 6800000, nbTransactions: 15, acheteurTop: "SENELEC", annee: 2024 },
  "climatiseur": { unite: "unité", min: 180000, mediane: 265000, max: 420000, nbTransactions: 31, acheteurTop: "Mairies", annee: 2025 },
  "véhicule 4x4": { unite: "unité", min: 18000000, mediane: 23500000, max: 31000000, nbTransactions: 22, acheteurTop: "APIX", annee: 2025 },
  "câble électrique": { unite: "ml", min: 1800, mediane: 2400, max: 3800, nbTransactions: 19, acheteurTop: "SENELEC", annee: 2024 },
  "formation informatique": { unite: "personne/jour", min: 45000, mediane: 75000, max: 120000, nbTransactions: 12, acheteurTop: "ADIE", annee: 2025 },
  "audit financier": { unite: "mission", min: 4500000, mediane: 8200000, max: 15000000, nbTransactions: 8, acheteurTop: "Min. Finances", annee: 2024 },
  "béton armé": { unite: "m³", min: 95000, mediane: 128000, max: 165000, nbTransactions: 35, acheteurTop: "APIX", annee: 2025 },
};

export default function Observatoire() {
  const [recherche, setRecherche] = useState("");
  const [resultat, setResultat] = useState<typeof PRIX_DB[string] | null>(null);
  const [motCle, setMotCle] = useState("");

  const chercher = () => {
    const key = Object.keys(PRIX_DB).find(k => recherche.toLowerCase().includes(k));
    if (key) { setResultat(PRIX_DB[key]); setMotCle(key); }
    else { setResultat(null); setMotCle(""); }
  };

  const suggestions = Object.keys(PRIX_DB);

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="conteneur max-w-4xl py-8">
        <Link href="/war-room" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> War Room
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Telescope className="h-9 w-9 text-or-400" /> Observatoire des Prix
          </h1>
          <p className="mt-2 text-lg text-slate-400 max-w-2xl">
            Les prix réels acceptés par l&apos;État sénégalais sur 3 ans. Ne soumissionnez plus à l&apos;aveugle.
          </p>
        </div>

        {/* Recherche */}
        <div className="mt-8 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-or-400 text-lg"
              placeholder="Ex : ordinateur portable, groupe électrogène, béton armé..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              onKeyDown={e => e.key === "Enter" && chercher()}
            />
          </div>
          <button onClick={chercher} className="btn-or px-6">Rechercher</button>
        </div>

        {/* Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => { setRecherche(s); }} className="text-xs bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 px-3 py-1.5 rounded-full transition capitalize">
              {s}
            </button>
          ))}
        </div>

        {/* Résultat */}
        {resultat && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-or-900/30 to-slate-900 border border-or-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-or-400 text-xs font-black uppercase tracking-widest">Résultats pour</p>
                  <h2 className="text-3xl font-black text-white capitalize">{motCle}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{resultat.nbTransactions} transactions analysées</p>
                  <p className="text-xs text-slate-500">Données {resultat.annee} · Acheteur principal : {resultat.acheteurTop}</p>
                </div>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-red-400 font-bold uppercase mb-1">Prix Min. Accepté</p>
                  <p className="text-2xl font-black text-red-300">{fcfa(resultat.min)}</p>
                  <p className="text-xs text-slate-500 mt-1">par {resultat.unite}</p>
                  <p className="text-xs text-red-400 mt-2 flex items-center justify-center gap-1"><TrendingDown className="h-3 w-3" /> Risque de dumping</p>
                </div>
                <div className="bg-or-900/30 border-2 border-or-500/50 rounded-xl p-4 text-center scale-105 shadow-2xl">
                  <p className="text-xs text-or-400 font-black uppercase mb-1">🎯 Prix Médian IA</p>
                  <p className="text-3xl font-black text-or-300">{fcfa(resultat.mediane)}</p>
                  <p className="text-xs text-slate-400 mt-1">par {resultat.unite}</p>
                  <p className="text-xs text-or-300 mt-2 font-bold">Recommandé</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Prix Max. Accepté</p>
                  <p className="text-2xl font-black text-slate-200">{fcfa(resultat.max)}</p>
                  <p className="text-xs text-slate-500 mt-1">par {resultat.unite}</p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" /> Risque d&apos;élimination</p>
                </div>
              </div>

              {/* Barre visuelle */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{fcfa(resultat.min)}</span><span className="text-or-400 font-bold">Médiane : {fcfa(resultat.mediane)}</span><span>{fcfa(resultat.max)}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-red-500 via-or-400 to-slate-500 rounded-full" />
                  <div className="absolute top-0 h-full flex items-center" style={{ left: `${((resultat.mediane - resultat.min) / (resultat.max - resultat.min)) * 100}%` }}>
                    <div className="h-5 w-1 bg-white rounded-full -translate-x-0.5" />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">💡 Conseil IA :</strong> Sur ce type de fourniture, l&apos;État sénégalais attribue généralement à des prix compris entre <strong className="text-or-300">{fcfa(resultat.min * 1.05)}</strong> et <strong className="text-or-300">{fcfa(resultat.mediane * 1.08)}</strong>. 
                  En dessous de <strong className="text-red-400">{fcfa(resultat.min)}</strong>, vous risquez d&apos;être éliminé pour dumping ou sous-évaluation anormale.
                </p>
              </div>
            </div>
          </div>
        )}

        {!resultat && recherche && (
          <div className="mt-8 text-center py-12 text-slate-500">
            <p className="text-lg">Aucun résultat pour &quot;{recherche}&quot;</p>
            <p className="text-sm mt-2">Essayez un terme plus général ou cliquez sur une suggestion ci-dessus.</p>
          </div>
        )}
      </div>
    </div>
  );
}
