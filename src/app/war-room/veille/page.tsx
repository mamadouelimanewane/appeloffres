"use client";
import { useState } from "react";
import { ArrowLeft, Radar, Bell, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

type Concurrent = { id: string; nom: string; secteur: string };

const RAPPORTS = [
  { semaine: "S40 · 7 oct 2026", concurrent: "Eiffage Sénégal", action: "Remporté 2 marchés BTP", montant: 1850000000, type: "danger" },
  { semaine: "S40 · 7 oct 2026", concurrent: "CSE", action: "Soumissionné sur 4 marchés IT", montant: null, type: "warning" },
  { semaine: "S39 · 30 sept 2026", concurrent: "Eiffage Sénégal", action: "Groupe formé avec Sogem BTP", montant: null, type: "info" },
  { semaine: "S39 · 30 sept 2026", concurrent: "Technocom Africa", action: "Remporté 1 marché informatique", montant: 420000000, type: "danger" },
  { semaine: "S38 · 23 sept 2026", concurrent: "CSE", action: "Aucune activité détectée", montant: null, type: "safe" },
];

export default function VeilleConcurrents() {
  const [concurrents, setConcurrents] = useState<Concurrent[]>([
    { id: "1", nom: "Eiffage Sénégal", secteur: "BTP / Énergie" },
    { id: "2", nom: "CSE", secteur: "Multi-secteurs" },
  ]);
  const [nouveau, setNouveau] = useState("");
  const [secteur, setSecteur] = useState("Informatique & Télécom");
  const [actif, setActif] = useState(true);

  const ajouter = () => {
    if (!nouveau.trim() || concurrents.length >= 5) return;
    setConcurrents(prev => [...prev, { id: Date.now().toString(), nom: nouveau, secteur }]);
    setNouveau("");
  };

  const supprimer = (id: string) => setConcurrents(prev => prev.filter(c => c.id !== id));

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="conteneur max-w-5xl py-8">
        <Link href="/war-room" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> War Room
        </Link>

        <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              <Radar className="h-9 w-9 text-red-400" /> Veille Concurrentielle
            </h1>
            <p className="mt-2 text-lg text-slate-400 max-w-2xl">
              Surveillez jusqu&apos;à 5 concurrents. Recevez chaque semaine un rapport WhatsApp de leurs mouvements sur les marchés publics.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className={`h-3 w-3 rounded-full ${actif ? "bg-red-500 animate-pulse" : "bg-slate-600"}`} />
            <button onClick={() => setActif(!actif)} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${actif ? "bg-red-900/40 text-red-400 hover:bg-red-900/60" : "bg-green-900/40 text-green-400 hover:bg-green-900/60"}`}>
              {actif ? "⏹ Désactiver la veille" : "▶ Activer la veille"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {/* Config */}
          <div className="space-y-4">
            <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-red-400" /> Concurrents surveillés ({concurrents.length}/5)</h2>
              <div className="space-y-2 mb-4">
                {concurrents.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-bold text-white">{c.nom}</p>
                      <p className="text-xs text-slate-400">{c.secteur}</p>
                    </div>
                    <button onClick={() => supprimer(c.id)} className="text-slate-500 hover:text-red-400 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {concurrents.length < 5 && (
                <div className="space-y-2">
                  <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none" placeholder="Nom du concurrent..." value={nouveau} onChange={e => setNouveau(e.target.value)} />
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none" value={secteur} onChange={e => setSecteur(e.target.value)}>
                    {["BTP / Travaux", "Informatique & Télécom", "Fournitures", "Santé", "Consulting"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={ajouter} className="w-full btn py-2 text-sm justify-center"><Plus className="h-4 w-4" /> Ajouter</button>
                </div>
              )}
            </div>

            <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Ce que l&apos;IA surveille</p>
              <ul className="space-y-2">
                {["Nouveaux marchés remportés", "Soumissions récentes", "Formations de groupements", "Certifications obtenues", "Secteurs nouvellement investis"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rapports */}
          <div className="md:col-span-2">
            <h2 className="font-bold text-white mb-4">📋 Derniers rapports de veille</h2>
            <div className="space-y-3">
              {RAPPORTS.map((r, i) => (
                <div key={i} className={`border rounded-xl p-4 ${r.type === "danger" ? "border-red-700/40 bg-red-900/10" : r.type === "warning" ? "border-or-700/40 bg-or-900/10" : r.type === "safe" ? "border-green-700/40 bg-green-900/10" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${r.type === "danger" ? "bg-red-900 text-red-300" : r.type === "warning" ? "bg-or-900 text-or-300" : r.type === "safe" ? "bg-green-900 text-green-300" : "bg-slate-700 text-slate-300"}`}>
                          {r.concurrent}
                        </span>
                        <span className="text-xs text-slate-500">{r.semaine}</span>
                      </div>
                      <p className="text-sm text-slate-200">{r.action}</p>
                    </div>
                    {r.montant && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">Montant</p>
                        <p className="font-black text-white text-sm">{fcfa(r.montant)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border border-white/10 bg-white/5 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-400">Le prochain rapport WhatsApp sera envoyé le <strong className="text-white">lundi 14 octobre 2026 à 08h00</strong></p>
              <p className="text-xs text-slate-500 mt-1">Numéro configuré : +221 77 000 00 00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
