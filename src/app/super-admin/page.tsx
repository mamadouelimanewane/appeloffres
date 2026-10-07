"use client";
import { useState, useEffect } from "react";
import { 
  Users, Activity, Bell, FileText, TrendingUp, ShieldAlert, 
  Server, Database, Lock, Terminal, AlertOctagon, Power, 
  Fingerprint, CheckCircle2, XCircle, Search
} from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const API_STATUS = [
  { nom: "Scraper ARMP/DCMP", status: "online", ping: "24ms" },
  { nom: "OpenAI GPT-4", status: "online", ping: "145ms" },
  { nom: "Wave Mobile Money", status: "online", ping: "89ms" },
  { nom: "Orabank (Cautions)", status: "degraded", ping: "450ms" },
  { nom: "Signature eIDAS", status: "online", ping: "12ms" },
];

const LOGS = [
  "[18:41:02] INFO: Backup DB automatique terminé avec succès (2.4 GB).",
  "[18:39:15] WARN: 14 tentatives de connexion échouées (IP: 197.214.X.X) -> IP Bannie.",
  "[18:35:44] SEC: Certificat SSL renouvelé pour appeldoffres.sn.",
  "[18:31:12] USR: TechAfrica SARL a téléchargé Rapport_Annuel_2026.pdf.",
  "[18:28:05] API: Webhook Wave reçu (Paiement Caution #842) -> Status: 200 OK.",
  "[18:22:30] SYS: Déploiement Vercel réussi (Commit: f570d32).",
  "[18:15:00] ALERT: Pics de requêtes détectés sur /api/radar. Auto-scaling déclenché.",
];

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("securite");
  const [logs, setLogs] = useState(LOGS);

  // Simulation de logs en direct
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const types = ["INFO", "SEC", "API", "USR"];
      const msgs = [
        "Vérification d'intégrité de la base de données... OK.",
        "Nouvelle entreprise inscrite: SN BTP Express.",
        "Scraping en cours: 4 nouveaux appels d'offres détectés.",
        "Agent IA WhatsApp: Message traité en 1.2s.",
        "Analyse de fichier RCCM terminée (Scan anti-virus OK)."
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [`[${now}] ${randomType}: ${randomMsg}`, ...prev].slice(0, 8));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen flex font-sans text-slate-300">
      
      {/* Sidebar Nav */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 bg-red-600 rounded flex items-center justify-center font-black text-white">MW</div>
          <div>
            <h1 className="font-bold text-white text-sm">Système Core</h1>
            <p className="text-[10px] text-green-400 font-mono tracking-widest uppercase">Admin Root</p>
          </div>
        </div>
        <div className="p-3 flex-1 space-y-1">
          {[
            { id: "dashboard", icon: Activity, label: "Business & Finances" },
            { id: "securite", icon: ShieldAlert, label: "SOC & Sécurité" },
            { id: "infra", icon: Server, label: "Infrastructure & API" },
            { id: "users", icon: Users, label: "Contrôle Utilisateurs" },
            { id: "kyc", icon: Fingerprint, label: "Validation KYC / Fraude" },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === item.id ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800/50 text-slate-400'}`}
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
            <span className="flex items-center gap-2 text-xs font-mono bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full">
              <Lock className="h-3 w-3" /> Chiffrement AES-256
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2 text-slate-500" />
              <input type="text" placeholder="Rechercher IP, Utilisateur, ID..." className="bg-slate-950 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:border-blue-500 outline-none w-64" />
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition">
              <Power className="h-3 w-3" /> KILL SWITCH
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white">Centre d'Opérations de Sécurité (SOC)</h2>
            <p className="text-slate-400 text-sm mt-1">Surveillance globale de l'intégrité de la plateforme Appeldoffres.sn</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Health Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <ShieldAlert className="h-40 w-40 text-green-500" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">System Health Score</p>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-green-400">99.8</span>
                <span className="text-xl text-green-500/50 font-bold mb-1">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Aucune vulnérabilité critique détectée</p>
            </div>

            {/* Firewall Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">WAF & Pare-feu</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Requêtes analysées (24h)</span><span className="font-mono text-white">142,850</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-blue-500 rounded-full w-[100%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Menaces bloquées</span><span className="font-mono text-red-400">1,204</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-red-500 rounded-full w-[12%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Tentatives d'intrusion (Brute Force)</span><span className="font-mono text-or-400">42</span></div>
                  <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-full bg-or-500 rounded-full w-[3%]" /></div>
                </div>
              </div>
            </div>

            {/* API Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Réseau & API <Activity className="h-4 w-4" />
              </p>
              <div className="space-y-3">
                {API_STATUS.map(api => (
                  <div key={api.nom} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{api.nom}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">{api.ping}</span>
                      <span className={`h-2 w-2 rounded-full ${api.status === 'online' ? 'bg-green-500' : 'bg-or-500 animate-pulse'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Audit Trail Terminal */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Audit Trail & Logs Serveur</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                </div>
              </div>
              <div className="p-4 font-mono text-[11px] leading-relaxed h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${log.includes('WARN') || log.includes('ALERT') ? 'text-or-400' : log.includes('SEC') ? 'text-blue-400' : log.includes('USR') ? 'text-purple-400' : 'text-slate-400'}`}>
                    <span className="text-slate-600 opacity-50 mr-2">{i === 0 ? '>' : ''}</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* KYC Validation Queue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" /> File d'attente KYC (Compliance)
                </p>
                <span className="bg-or-500/20 text-or-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">3 en attente</span>
              </div>
              <div className="space-y-3">
                {[
                  { nom: "Global Construction SA", doc: "RCCM + NINEA", risque: "Faible", color: "text-green-400", bg: "bg-green-500/10" },
                  { nom: "Sénégal Digital SARL", doc: "Attestation Fiscale", risque: "Modéré", color: "text-or-400", bg: "bg-or-500/10" },
                  { nom: "Trade Corp (Inconnu)", doc: "ID Dirigeant", risque: "Élevé (IP suspecte)", color: "text-red-400", bg: "bg-red-500/10" },
                ].map((kyc, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{kyc.nom}</p>
                      <p className="text-xs text-slate-500">Document : <span className="text-slate-300">{kyc.doc}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${kyc.color} ${kyc.bg}`}>Risque {kyc.risque}</span>
                      <div className="flex gap-2">
                        <button className="h-7 w-7 rounded bg-green-500/10 hover:bg-green-500/20 text-green-500 flex items-center justify-center transition"><CheckCircle2 className="h-4 w-4" /></button>
                        <button className="h-7 w-7 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition"><XCircle className="h-4 w-4" /></button>
                      </div>
                    </div>
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
// Ajout des imports manquants pour éviter les erreurs de compilation
import { LogOut } from "lucide-react";
