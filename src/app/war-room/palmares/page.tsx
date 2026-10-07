"use client";
import { useState } from "react";
import { ArrowLeft, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const SECTEURS = ["Tous", "Informatique & Télécom", "BTP / Travaux", "Fournitures", "Santé", "Consulting"];

const PALMARES = [
  { rang: 1, nom: "Eiffage Sénégal", secteur: "BTP / Travaux", ca: 18200000000, nb: 47, evolution: "+12%", badge: "🥇" },
  { rang: 2, nom: "SOGEM BTP", secteur: "BTP / Travaux", ca: 9800000000, nb: 31, evolution: "+8%", badge: "🥈" },
  { rang: 3, nom: "Vinci Energies Africa", secteur: "BTP / Travaux", ca: 7400000000, nb: 22, evolution: "+3%", badge: "🥉" },
  { rang: 4, nom: "Systèmes & Réseaux SA", secteur: "Informatique & Télécom", ca: 4200000000, nb: 38, evolution: "+21%", badge: "4" },
  { rang: 5, nom: "CDE Sénégal", secteur: "Informatique & Télécom", ca: 3100000000, nb: 29, evolution: "+15%", badge: "5" },
  { rang: 6, nom: "Carrefour Médical Dakar", secteur: "Santé", ca: 2800000000, nb: 41, evolution: "+6%", badge: "6" },
  { rang: 7, nom: "Médical Sénégal SARL", secteur: "Santé", ca: 2100000000, nb: 33, evolution: "-2%", badge: "7" },
  { rang: 8, nom: "Bur Conseil & Stratégie", secteur: "Consulting", ca: 1900000000, nb: 24, evolution: "+18%", badge: "8" },
  { rang: 9, nom: "Office Plus Dakar", secteur: "Fournitures", ca: 1600000000, nb: 52, evolution: "+4%", badge: "9" },
  { rang: 10, nom: "Technocom Africa", secteur: "Informatique & Télécom", ca: 1200000000, nb: 19, evolution: "+29%", badge: "10" },
];

export default function Palmares() {
  const [secteur, setSecteur] = useState("Tous");

  const filtered = PALMARES
    .filter(e => secteur === "Tous" || e.secteur === secteur)
    .map((e, i) => ({ ...e, rang: i + 1 }));

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="conteneur max-w-4xl py-8">
        <Link href="/war-room" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> War Room
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Trophy className="h-9 w-9 text-or-400" /> Palmarès 2026
          </h1>
          <p className="mt-2 text-lg text-slate-400 max-w-2xl">
            Classement live des entreprises par volume de marchés publics remportés. Sachez précisément qui vous affrontera.
          </p>
        </div>

        {/* Filtres */}
        <div className="mt-6 flex flex-wrap gap-2">
          {SECTEURS.map(s => (
            <button
              key={s}
              onClick={() => setSecteur(s)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${secteur === s ? 'bg-or-500 text-white' : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Podium Top 3 */}
        {secteur === "Tous" && (
          <div className="mt-8 grid grid-cols-3 gap-4 mb-8">
            {[PALMARES[1], PALMARES[0], PALMARES[2]].map((e, i) => {
              const heights = ["h-28", "h-36", "h-24"];
              const colors = ["bg-slate-600", "bg-or-500", "bg-orange-700"];
              return (
                <div key={e.nom} className="text-center">
                  <p className="text-3xl mb-2">{e.badge}</p>
                  <p className="text-sm font-bold text-white mb-2">{e.nom}</p>
                  <div className={`${heights[i]} ${colors[i]} rounded-t-xl flex items-end justify-center pb-2`}>
                    <p className="text-xs font-black text-white">{fcfa(e.ca)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Liste */}
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.nom} className={`flex items-center gap-4 border rounded-xl p-4 transition hover:bg-white/8 ${e.rang <= 3 ? 'border-or-500/40 bg-or-900/10' : 'border-white/10 bg-white/5'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shrink-0 ${e.rang === 1 ? 'bg-or-500 text-white' : e.rang === 2 ? 'bg-slate-400 text-white' : e.rang === 3 ? 'bg-orange-700 text-white' : 'bg-white/10 text-slate-400'}`}>
                {e.rang <= 3 ? e.badge : e.rang}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">{e.nom}</p>
                <p className="text-xs text-slate-400">{e.secteur}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-white">{fcfa(e.ca)}</p>
                <p className="text-xs text-slate-500">{e.nb} marchés</p>
              </div>
              <div className={`shrink-0 flex items-center gap-1 text-sm font-bold ${e.evolution.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp className="h-4 w-4" /> {e.evolution}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">Source : DCMP / ARMP Sénégal · Données 2023–2026 · Mise à jour hebdomadaire</p>
      </div>
    </div>
  );
}
