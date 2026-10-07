"use client";
import { ArrowLeft, Globe, Star, TrendingUp, AlertTriangle, Minus } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const MARCHES = [
  { titre: "Fourniture 300 PC portables – ADIE", budget: 150000000, concurrents: 4, prob: 72, cat: "etoile" },
  { titre: "Maintenance réseau fibre – SENELEC", budget: 85000000, concurrents: 3, prob: 68, cat: "etoile" },
  { titre: "Réhabilitation école rurale – Tambacounda", budget: 25000000, concurrents: 1, prob: 91, cat: "etoile" },
  { titre: "Audit financier – Min. Finances", budget: 18000000, concurrents: 2, prob: 55, cat: "vache" },
  { titre: "Fourniture mobilier bureau – Mairie Dakar", budget: 12000000, concurrents: 2, prob: 65, cat: "vache" },
  { titre: "Construction forage – OFOR Kolda", budget: 45000000, concurrents: 5, prob: 48, cat: "dilemme" },
  { titre: "Formation digitale – ADIE", budget: 22000000, concurrents: 8, prob: 32, cat: "dilemme" },
  { titre: "Nettoyage locaux – Assemblée Nationale", budget: 8000000, concurrents: 15, prob: 18, cat: "poids" },
  { titre: "Consulting RH – Ministère Fonct. Pub.", budget: 6500000, concurrents: 12, prob: 22, cat: "poids" },
];

const CATS = {
  etoile: { label: "⭐ Étoiles", sub: "Fort potentiel · Faible concurrence", color: "border-or-500/50 bg-or-900/20", badge: "bg-or-500 text-white" },
  vache: { label: "🐄 Vaches à lait", sub: "Marchés récurrents stables", color: "border-green-500/50 bg-green-900/20", badge: "bg-green-600 text-white" },
  dilemme: { label: "❓ Dilemmes", sub: "Intéressant mais risqué", color: "border-or-400/40 bg-slate-800/50", badge: "bg-or-500/30 text-or-300" },
  poids: { label: "🪨 Poids morts", sub: "Éviter — trop de concurrence", color: "border-slate-600/30 bg-slate-900/50", badge: "bg-slate-600/50 text-slate-400" },
};

export default function MatriceStrategique() {
  const grouped = {
    etoile: MARCHES.filter(m => m.cat === "etoile"),
    vache: MARCHES.filter(m => m.cat === "vache"),
    dilemme: MARCHES.filter(m => m.cat === "dilemme"),
    poids: MARCHES.filter(m => m.cat === "poids"),
  } as const;

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="conteneur max-w-6xl py-8">
        <Link href="/war-room" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> War Room
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <Globe className="h-9 w-9 text-slate-300" /> Matrice Stratégique
          </h1>
          <p className="mt-2 text-lg text-slate-400 max-w-3xl">
            Vue dirigeant de votre portefeuille de marchés potentiels. L&apos;IA classe chaque opportunité selon votre Win-Rate et la concurrence. Priorisez sans hésitation.
          </p>
        </div>

        {/* Schéma */}
        <div className="mt-6 border border-white/10 bg-white/5 rounded-2xl p-4 hidden md:block">
          <div className="grid grid-cols-2 gap-2 aspect-square max-h-64">
            {(["etoile", "dilemme", "vache", "poids"] as const).map(cat => {
              const c = CATS[cat];
              return (
                <div key={cat} className={`border rounded-xl p-4 flex flex-col justify-between ${c.color}`}>
                  <p className="font-black text-white text-sm">{c.label}</p>
                  <p className="text-xs text-slate-400">{c.sub}</p>
                  <p className="text-2xl font-black text-white">{grouped[cat].length} marchés</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-2">
            <span className="text-xs text-slate-500">← Forte concurrence</span>
            <span className="text-xs text-slate-400 font-bold">Axe : Niveau de concurrence</span>
            <span className="text-xs text-slate-500">Faible concurrence →</span>
          </div>
        </div>

        {/* Listes */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {(["etoile", "vache", "dilemme", "poids"] as const).map(cat => {
            const c = CATS[cat];
            const items = grouped[cat];
            return (
              <div key={cat} className={`border rounded-2xl overflow-hidden ${c.color}`}>
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-xl font-black text-white">{c.label}</h2>
                  <p className="text-sm text-slate-400">{c.sub}</p>
                </div>
                <div className="p-4 space-y-3">
                  {items.map((m, i) => (
                    <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-start gap-3">
                      <span className={`shrink-0 text-xs font-black px-2 py-1 rounded-full ${c.badge}`}>
                        {m.prob}%
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white leading-snug">{m.titre}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            {cat === "etoile" ? <Star className="h-3 w-3 text-or-400" /> : cat === "dilemme" ? <AlertTriangle className="h-3 w-3 text-or-400" /> : cat === "poids" ? <Minus className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 text-green-400" />}
                            {m.concurrents} concurrent{m.concurrents > 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-slate-400">{fcfa(m.budget)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun marché dans cette catégorie</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 border border-or-500/30 bg-or-900/10 rounded-2xl p-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-or-400">💡 Recommandation IA :</strong> Concentrez 80% de vos ressources sur les <strong className="text-white">3 marchés Étoiles</strong>. Maintenez une activité minimale sur les Vaches à lait. Évitez les Poids morts — le coût de préparation dépasse souvent la probabilité de gain.
          </p>
        </div>
      </div>
    </div>
  );
}
