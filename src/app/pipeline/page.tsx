"use client";
import { useState } from "react";
import { ArrowLeft, KanbanSquare, MoreHorizontal, Plus, Building2, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const COLONNES = [
  { id: "opportunite", titre: "1. Opportunités IA", color: "border-slate-300 bg-slate-100/50" },
  { id: "montage", titre: "2. Montage en cours", color: "border-blue-300 bg-blue-50/50" },
  { id: "soumis", titre: "3. Offre Soumise", color: "border-or-300 bg-or-50/50" },
  { id: "evaluation", titre: "4. En Évaluation", color: "border-purple-300 bg-purple-50/50" },
  { id: "gagne", titre: "5. Gagné", color: "border-green-300 bg-green-50/50" },
];

const INITIAL_TASKS = [
  { id: 1, col: "opportunite", titre: "Fourniture de 500 ordinateurs", acheteur: "ADIE", montant: 250000000, deadline: "2026-11-15", prob: 85, responsable: "MN" },
  { id: 2, col: "montage", titre: "Construction Forage Kolda", acheteur: "OFOR", montant: 45000000, deadline: "2026-10-10", prob: 60, responsable: "KD" },
  { id: 3, col: "soumis", titre: "Maintenance Réseau Fibre", acheteur: "SENELEC", montant: 120000000, deadline: "2026-10-09", prob: 90, responsable: "AD" },
  { id: 4, col: "evaluation", titre: "Équipements Médicaux", acheteur: "Min. de la Santé", montant: 850000000, deadline: "2026-10-20", prob: 45, responsable: "MN" },
  { id: 5, col: "gagne", titre: "Réfection École Primaire", acheteur: "Mairie de Thiès", montant: 25000000, deadline: "2026-06-10", prob: 100, responsable: "KD" },
];

export default function Pipeline() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  
  const moveTask = (taskId: number, newCol: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, col: newCol } : t));
  };

  const calculateTotal = (colId: string) => {
    return tasks.filter(t => t.col === colId).reduce((sum, t) => sum + t.montant, 0);
  };

  return (
    <div className="conteneur py-8 max-w-[1400px]">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <KanbanSquare className="h-8 w-8 text-brand-700" />
            CRM Commande Publique (Pipeline)
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-3xl">
            L'Usine à Marchés. Suivez visuellement votre pipeline de prospection, de montage et d'attribution.
          </p>
        </div>
        <div className="bg-slate-900 text-white p-4 rounded-xl shrink-0 flex items-center gap-6">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">CA Potentiel Sécurisé</p>
            <p className="text-2xl font-black mt-1 text-green-400">{fcfa(calculateTotal("gagne") + calculateTotal("evaluation") * 0.45)}</p>
          </div>
          <button className="btn bg-brand-600 border-none"><Plus className="h-4 w-4" /> Nouveau Dossier</button>
        </div>
      </div>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 snap-x">
        {COLONNES.map(col => (
          <div key={col.id} className={`flex-1 min-w-[320px] rounded-2xl border ${col.color} flex flex-col snap-center`}>
            <div className="p-4 border-b border-inherit flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{col.titre}</h2>
              <span className="bg-white/60 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">{tasks.filter(t => t.col === col.id).length}</span>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-3 min-h-[500px]">
              {tasks.filter(t => t.col === col.id).map(t => (
                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${t.prob >= 80 ? 'bg-green-100 text-green-700' : t.prob >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      IA Win-Rate: {t.prob}%
                    </span>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-white text-[10px] font-black shrink-0" title={`Responsable: ${t.responsable}`}>{t.responsable}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{t.titre}</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {t.acheteur}</div>
                    <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-brand-600" /> <span className="font-bold text-slate-900">{fcfa(t.montant)}</span></div>
                    <div className={`flex items-center gap-2 font-bold ${(() => { const d = new Date(t.deadline); const now = new Date(); const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000); return diff <= 3 ? 'text-red-600' : diff <= 7 ? 'text-orange-500' : 'text-slate-500'; })()}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {(() => { const d = new Date(t.deadline); const now = new Date(); const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000); return diff <= 0 ? `⛔ Expiré (${t.deadline})` : diff <= 3 ? `🔴 Urgent — ${diff}j (${t.deadline})` : diff <= 7 ? `🟠 ${diff}j (${t.deadline})` : t.deadline; })()}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                    <select 
                      className="text-xs bg-slate-50 border border-slate-200 rounded p-1 w-full" 
                      value={t.col} 
                      onChange={(e) => moveTask(t.id, e.target.value)}
                    >
                      {COLONNES.map(c => <option key={c.id} value={c.id}>Vers {c.titre}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-inherit text-center bg-white/40 rounded-b-2xl text-xs font-bold text-slate-700">
              Total: {fcfa(calculateTotal(col.id))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
