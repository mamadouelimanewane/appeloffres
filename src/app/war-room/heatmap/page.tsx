"use client";
import { useState } from "react";
import { ArrowLeft, Map, TrendingDown } from "lucide-react";
import Link from "next/link";

const REGIONS = [
  { id: "dakar", nom: "Dakar & Région", marchesAnnuels: 312, budgetTotal: 185000000000, concurrents: "Très élevé", score: 15, conseil: "Marché très saturé. Concentrez-vous sur des niches spécifiques ou des lots de taille moyenne.", color: "#dc2626", x: 60, y: 75, r: 28 },
  { id: "thies", nom: "Thiès", marchesAnnuels: 87, budgetTotal: 32000000000, concurrents: "Élevé", score: 38, conseil: "Bonne activité BTP grâce au TER et au Plan Thiès 2025. Concurrence modérée sur les lots secondaires.", color: "#ea580c", x: 45, y: 60, r: 18 },
  { id: "saint-louis", nom: "Saint-Louis", marchesAnnuels: 54, budgetTotal: 18000000000, concurrents: "Modéré", score: 55, conseil: "Marchés hydrauliques et agriculture en croissance. Zone sous-investie par les PME de Dakar.", color: "#d97706", x: 35, y: 25, r: 14 },
  { id: "kaolack", nom: "Kaolack", marchesAnnuels: 41, budgetTotal: 12000000000, concurrents: "Faible", score: 68, conseil: "Forte opportunité en agro-industrie et stockage céréalier. Peu de concurrents qualifiés locaux.", color: "#16a34a", x: 50, y: 55, r: 12 },
  { id: "ziguinchor", nom: "Ziguinchor", marchesAnnuels: 28, budgetTotal: 9500000000, concurrents: "Très faible", score: 82, conseil: "Région sous-dotée en prestataires. Les entreprises de Dakar capables de se déplacer ont un avantage énorme.", color: "#15803d", x: 25, y: 82, r: 10 },
  { id: "tambacounda", nom: "Tambacounda", marchesAnnuels: 22, budgetTotal: 7200000000, concurrents: "Très faible", score: 85, conseil: "Marchés miniers et forestiers. Niches très peu exploitées par les PME urbaines.", color: "#15803d", x: 72, y: 48, r: 10 },
  { id: "matam", nom: "Matam / Kédougou", marchesAnnuels: 18, budgetTotal: 5800000000, concurrents: "Inexistant", score: 91, conseil: "Zone d'or — peu de concurrence, marchés garantis pour les entreprises qui acceptent de s'implanter.", color: "#166534", x: 75, y: 28, r: 9 },
];

export default function Heatmap() {
  const [selected, setSelected] = useState<typeof REGIONS[0] | null>(null);

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="conteneur max-w-6xl py-8">
        <Link href="/war-room" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> War Room
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Map className="h-9 w-9 text-green-400" /> Heatmap Géographique
          </h1>
          <p className="mt-2 text-lg text-slate-400 max-w-3xl">
            Carte de chaleur de la concurrence par région. Les zones vertes sont des niches sous-exploitées où vos chances sont maximales.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* SVG Map */}
          <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
            <svg viewBox="0 0 100 100" className="w-full h-[450px]">
              {/* Fond carte simplifiée du Sénégal */}
              <rect x="0" y="0" width="100" height="100" fill="#1e293b" rx="4" />
              <text x="50" y="5" textAnchor="middle" fontSize="3" fill="#475569" fontWeight="bold">SÉNÉGAL — Carte d&apos;opportunités</text>

              {REGIONS.map(r => (
                <g key={r.id} onClick={() => setSelected(r)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={r.x} cy={r.y} r={r.r}
                    fill={r.color}
                    opacity={selected?.id === r.id ? 1 : 0.65}
                    stroke={selected?.id === r.id ? "white" : "transparent"}
                    strokeWidth="0.8"
                  />
                  <text x={r.x} y={r.y - 0.5} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="2.8" fontWeight="bold" style={{ pointerEvents: "none", userSelect: "none" }}>
                    {r.score}
                  </text>
                  <text x={r.x} y={r.y + 3.5} textAnchor="middle" fill="white" fontSize="2" style={{ pointerEvents: "none", userSelect: "none" }}>
                    {r.nom.split(" ")[0]}
                  </text>
                </g>
              ))}

              {/* Légende */}
              <rect x="2" y="88" width="55" height="10" fill="rgba(0,0,0,0.5)" rx="2" />
              <text x="4" y="92.5" fontSize="2.2" fill="#94a3b8">Rouge = Forte concurrence · Vert = Niche libre</text>
              <text x="4" y="96" fontSize="2" fill="#64748b">Score = Indice d&apos;opportunité IA (/100)</text>
            </svg>
          </div>

          {/* Détails */}
          <div className="space-y-4">
            {selected ? (
              <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-white">{selected.nom}</h2>
                  <div className={`text-3xl font-black px-4 py-2 rounded-xl ${selected.score >= 70 ? 'bg-green-900/50 text-green-400' : selected.score >= 40 ? 'bg-or-900/50 text-or-400' : 'bg-red-900/50 text-red-400'}`}>
                    {selected.score}/100
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Marchés/an</p>
                    <p className="text-xl font-black">{selected.marchesAnnuels}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Budget total</p>
                    <p className="text-xl font-black">{(selected.budgetTotal / 1000000000).toFixed(1)} Mds</p>
                  </div>
                </div>
                <div className={`p-3 rounded-xl mb-4 ${selected.concurrents === "Très faible" || selected.concurrents === "Inexistant" ? 'bg-green-900/30 border border-green-700/30' : selected.concurrents === "Modéré" || selected.concurrents === "Faible" ? 'bg-or-900/30 border border-or-700/30' : 'bg-red-900/30 border border-red-700/30'}`}>
                  <p className="text-xs font-bold text-slate-400 uppercase">Niveau de concurrence</p>
                  <p className={`font-black text-lg ${selected.concurrents === "Très faible" || selected.concurrents === "Inexistant" ? 'text-green-400' : selected.concurrents === "Modéré" || selected.concurrents === "Faible" ? 'text-or-400' : 'text-red-400'}`}>{selected.concurrents}</p>
                </div>
                <div className="bg-brand-900/20 border border-brand-700/30 rounded-xl p-4">
                  <p className="text-xs font-bold text-brand-400 uppercase mb-1">💡 Conseil IA</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{selected.conseil}</p>
                </div>
              </div>
            ) : (
              <div className="border border-white/10 bg-white/5 rounded-2xl p-8 text-center text-slate-500">
                <Map className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Cliquez sur une région pour voir son analyse</p>
              </div>
            )}

            {/* Classement rapide */}
            <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Niches à saisir maintenant</p>
              <div className="space-y-2">
                {[...REGIONS].sort((a, b) => b.score - a.score).slice(0, 4).map(r => (
                  <div key={r.id} onClick={() => setSelected(r)} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="flex-1 text-sm text-slate-300">{r.nom}</span>
                    <span className={`text-sm font-black ${r.score >= 70 ? 'text-green-400' : 'text-or-400'}`}>{r.score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
