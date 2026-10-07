"use client";
import { Users, CreditCard, Activity, Bell, FileText, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const KPI = [
  { label: "PME Actives (30j)", value: "1 284", evolution: "+12%", trend: "up" },
  { label: "MRR (Abonnements)", value: fcfa(8500000), evolution: "+5%", trend: "up" },
  { label: "Cautions générées (Vol)", value: fcfa(1420000000), evolution: "+22%", trend: "up" },
  { label: "Marchés IA Rédigés", value: "3 412", evolution: "+8%", trend: "up" },
];

const FLUX = [
  { time: "Il y a 2 min", user: "TechAfrica SARL", action: "Abonnement Pro annuel souscrit", val: fcfa(600000), type: "money" },
  { time: "Il y a 14 min", user: "Sogem BTP", action: "Caution Express générée via Wave", val: fcfa(125000), type: "money" },
  { time: "Il y a 31 min", user: "Anonyme", action: "Audit Express effectué (NINEA: 1234...)", val: null, type: "lead" },
  { time: "Il y a 1h", user: "Global Services", action: "Dossier généré par Agent WhatsApp", val: null, type: "usage" },
  { time: "Il y a 2h", user: "CDE Sénégal", action: "Groupement Solidaire créé", val: null, type: "usage" },
];

export default function SuperAdmin() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Sidebar / Header (Simplifié) */}
      <div className="bg-slate-900 text-white">
        <div className="conteneur max-w-6xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-or-500 rounded flex items-center justify-center font-black">A</div>
            <span className="font-bold tracking-tight">Appeldoffres.sn <span className="text-slate-500 font-normal ml-2">Console Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-white">Retour au site public</Link>
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center"><Bell className="h-4 w-4" /></div>
            <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">MW</div>
          </div>
        </div>
      </div>

      <div className="conteneur max-w-6xl py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Vue d'ensemble</h1>
            <p className="text-sm text-slate-500 mt-1">Données en temps réel (Sénégal) — Octobre 2026</p>
          </div>
          <button className="btn py-2 text-sm"><FileText className="h-4 w-4" /> Exporter CSV</button>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {KPI.map((k, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{k.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black text-slate-900">{k.value}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  <TrendingUp className="h-3 w-3" /> {k.evolution}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Chart Placeholder */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-600" /> Évolution des Revenus (MRR)
            </h2>
            <div className="h-64 flex items-end gap-2">
              {[40, 45, 35, 60, 75, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-brand-100 hover:bg-brand-200 rounded-t-sm relative group cursor-crosshair" style={{ height: `${h}%` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-brand-600 rounded-t-sm" style={{ height: `${h * 0.7}%` }} />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    Mois {i+1} : {fcfa(h * 100000)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-slate-400 font-bold uppercase">
              <span>Avr</span><span>Mai</span><span>Juin</span><span>Juil</span><span>Août</span><span>Sept</span><span>Oct</span>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-6">Flux en direct</h2>
            <div className="space-y-4">
              {FLUX.map((f, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${f.type === 'money' ? 'bg-green-500' : f.type === 'lead' ? 'bg-or-500' : 'bg-brand-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{f.action}</p>
                    <p className="text-xs text-slate-500 flex justify-between">
                      {f.user}
                      <span className="text-slate-400">{f.time}</span>
                    </p>
                    {f.val && <p className="text-xs font-black text-green-600 mt-1">{f.val}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition">
              Voir tout l'historique
            </button>
          </div>

          {/* Modules Status */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-6">État de l'Écosystème</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { nom: "Agent IA WhatsApp", stat: "412 actifs", color: "bg-green-50 text-green-700" },
                { nom: "Extension Sniper", stat: "1 250 installs", color: "bg-blue-50 text-blue-700" },
                { nom: "Intelligence Économique", stat: "850 pros", color: "bg-slate-900 text-white" },
                { nom: "API Bancaires (Cautions)", stat: "100% UP", color: "bg-emerald-50 text-emerald-700" },
              ].map(m => (
                <div key={m.nom} className={`p-4 rounded-xl ${m.color} flex flex-col justify-between`}>
                  <p className="text-xs font-bold uppercase mb-2 opacity-80">{m.nom}</p>
                  <p className="text-xl font-black">{m.stat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
