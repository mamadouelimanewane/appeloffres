"use client";
import { useState, useEffect } from "react";
import { 
  Users, Activity, Bell, FileText, TrendingUp, ShieldAlert, 
  Server, Database, Lock, Terminal, AlertOctagon, Power, 
  Fingerprint, CheckCircle2, XCircle, Search, CreditCard,
  LogOut, ArrowUpRight, TrendingDown, MoreVertical
} from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const LOGS = [
  "[18:41:02] INFO: Backup DB automatique terminé avec succès (2.4 GB).",
  "[18:39:15] WARN: 14 tentatives de connexion échouées (IP: 197.214.X.X) -> IP Bannie.",
  "[18:35:44] SEC: Certificat SSL renouvelé pour appeldoffres.sn.",
  "[18:31:12] USR: TechAfrica SARL a téléchargé Rapport_Annuel_2026.pdf.",
];

const ABONNES = [
  { nom: "Sogem BTP", ninea: "0014258742A2", plan: "Entreprise", mrr: 150000, statut: "Actif", date: "12 Sept 2026" },
  { nom: "TechAfrica SARL", ninea: "0048751221B3", plan: "Pro", mrr: 45000, statut: "Actif", date: "03 Oct 2026" },
  { nom: "Menuiserie Fall", ninea: "0098547412Z1", plan: "Gratuit", mrr: 0, statut: "Actif", date: "05 Oct 2026" },
  { nom: "Global Services", ninea: "0021458778C4", plan: "Pro", mrr: 45000, statut: "Impayé", date: "15 Aout 2026" },
  { nom: "Eiffage Sénégal", ninea: "0000001425A1", plan: "Entreprise", mrr: 150000, statut: "Actif", date: "10 Jan 2026" },
];

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [logs, setLogs] = useState(LOGS);

  // Simulation de logs en direct
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const types = ["INFO", "SEC", "API", "USR"];
      const msgs = ["Vérification BDD... OK", "Nouvelle souscription Pro", "Scraping DCMP terminé", "Caution générée via Wave"];
      const t = types[Math.floor(Math.random() * types.length)];
      const m = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [`[${now}] ${t}: ${m}`, ...prev].slice(0, 8));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen flex font-sans text-slate-300">
      
      {/* Sidebar Nav */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-600 rounded flex items-center justify-center font-black text-white">AD</div>
          <div>
            <h1 className="font-bold text-white text-sm">Appeldoffres.sn</h1>
            <p className="text-[10px] text-brand-400 font-mono tracking-widest uppercase">Console Admin</p>
          </div>
        </div>
        <div className="p-3 flex-1 space-y-1">
          {[
            { id: "dashboard", icon: Activity, label: "Business & Finances" },
            { id: "users", icon: Users, label: "Gestion des Abonnés" },
            { id: "securite", icon: ShieldAlert, label: "SOC & Sécurité" },
            { id: "infra", icon: Server, label: "Infrastructure & API" },
            { id: "kyc", icon: Fingerprint, label: "Validation KYC" },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === item.id ? 'bg-brand-600/10 text-brand-400' : 'hover:bg-slate-800/50 text-slate-400'}`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition">
            <LogOut className="h-4 w-4" /> Quitter la console
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Topbar */}
        <div className="bg-slate-900/50 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-mono bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Prod (v2.4.1)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2 text-slate-500" />
              <input type="text" placeholder="Rechercher..." className="bg-slate-950 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:border-brand-500 outline-none w-64" />
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition">
              <Power className="h-3 w-3" /> KILL SWITCH
            </button>
          </div>
        </div>

        <div className="p-8">
          
          {/* TAB: FINANCES */}
          {activeTab === "dashboard" && (
            <div className="animate-in fade-in">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">Business & Finances</h2>
                  <p className="text-slate-400 text-sm mt-1">Revenus récurrents et performances commerciales</p>
                </div>
                <button className="btn-or py-2 px-4 text-sm flex items-center gap-2"><Download className="h-4 w-4" /> Exporter Bilan</button>
              </div>

              {/* KPIs Financiers */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "MRR (Revenu Mensuel)", val: fcfa(8500000), trend: "+12%", up: true },
                  { label: "Abonnés Actifs", val: "1 284", trend: "+5%", up: true },
                  { label: "Taux de Churn", val: "2.1%", trend: "-0.4%", up: true },
                  { label: "ARPU (Revenu Moyen)", val: fcfa(42500), trend: "+1.2%", up: true },
                ].map((k, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{k.label}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-white">{k.val}</p>
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${k.up ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {k.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-6">Croissance du MRR (2026)</h3>
                  <div className="h-64 flex items-end gap-2">
                    {[40, 45, 50, 60, 75, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-brand-900/40 hover:bg-brand-800/60 rounded-t-sm relative group transition" style={{ height: `${h}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-brand-500 rounded-t-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ height: `${h * 0.7}%` }} />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {fcfa(h * 85000)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-slate-500 font-bold uppercase">
                    <span>Avr</span><span>Mai</span><span>Juin</span><span>Juil</span><span>Août</span><span>Sept</span><span>Oct</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-6">Dernières Transactions</h3>
                  <div className="space-y-4">
                    {[
                      { user: "Global Services", plan: "Plan Pro", montant: 45000, time: "Il y a 5 min", status: "success" },
                      { user: "SenBTP", plan: "Plan Entreprise", montant: 150000, time: "Il y a 12 min", status: "success" },
                      { user: "Auto Plus", plan: "Caution Express", montant: 12500, time: "Il y a 45 min", status: "success" },
                      { user: "Tech SARL", plan: "Plan Pro", montant: 45000, time: "Il y a 2h", status: "failed" },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{tx.user}</p>
                            <p className="text-xs text-slate-500">{tx.plan}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">{fcfa(tx.montant)}</p>
                          <p className="text-xs text-slate-500">{tx.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === "users" && (
            <div className="animate-in fade-in">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">Gestion des Abonnés</h2>
                  <p className="text-slate-400 text-sm mt-1">CRM Administratif et contrôle des accès</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Rechercher une entreprise..." className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-brand-500 outline-none" />
                  <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Ajouter</button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <th className="p-4 font-medium">Entreprise / NINEA</th>
                      <th className="p-4 font-medium">Plan</th>
                      <th className="p-4 font-medium">Revenu (MRR)</th>
                      <th className="p-4 font-medium">Statut</th>
                      <th className="p-4 font-medium">Inscription</th>
                      <th className="p-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-800">
                    {ABONNES.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition">
                        <td className="p-4">
                          <p className="font-bold text-white">{a.nom}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{a.ninea}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${a.plan === 'Entreprise' ? 'bg-or-500/10 text-or-400' : a.plan === 'Pro' ? 'bg-brand-500/10 text-brand-400' : 'bg-slate-800 text-slate-400'}`}>
                            {a.plan}
                          </span>
                        </td>
                        <td className="p-4 font-black text-white">{a.mrr > 0 ? fcfa(a.mrr) : '-'}</td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 text-xs font-bold ${a.statut === 'Actif' ? 'text-green-400' : 'text-red-400'}`}>
                            <span className={`h-2 w-2 rounded-full ${a.statut === 'Actif' ? 'bg-green-500' : 'bg-red-500'}`} /> {a.statut}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">{a.date}</td>
                        <td className="p-4 text-right">
                          <button className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"><MoreVertical className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SÉCURITÉ / SOC */}
          {activeTab === "securite" && (
            <div className="animate-in fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white">Centre d'Opérations de Sécurité (SOC)</h2>
                <p className="text-slate-400 text-sm mt-1">Surveillance de l'intégrité de la plateforme</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10"><ShieldAlert className="h-40 w-40 text-green-500" /></div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">System Health Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-black text-green-400">99.8</span>
                    <span className="text-xl text-green-500/50 font-bold mb-1">%</span>
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Terminal className="h-4 w-4 text-slate-400" /><span className="text-xs font-bold text-slate-400 uppercase">Audit Trail & Logs Serveur</span></div>
                  </div>
                  <div className="p-4 font-mono text-[11px] leading-relaxed h-48 overflow-y-auto">
                    {logs.map((log, i) => (
                      <div key={i} className={`mb-1 ${log.includes('WARN') ? 'text-or-400' : log.includes('SEC') ? 'text-blue-400' : 'text-slate-400'}`}>
                        <span className="text-slate-600 opacity-50 mr-2">{i === 0 ? '>' : ''}</span>{log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback pour les onglets non implémentés (Infra, KYC) */}
          {(activeTab === "infra" || activeTab === "kyc") && (
            <div className="animate-in fade-in flex flex-col items-center justify-center h-64 text-slate-500 border border-slate-800 border-dashed rounded-2xl">
              <Server className="h-8 w-8 mb-3 opacity-50" />
              <p>Ce module est en cours de déploiement (v2.5).</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

import { Download } from "lucide-react";
