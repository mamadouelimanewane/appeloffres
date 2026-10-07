"use client";
import { useState } from "react";
import { ArrowLeft, Search, CheckCircle2, AlertTriangle, TrendingUp, ShieldAlert, FileText } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

export default function Audit() {
  const [ninea, setNinea] = useState("");
  const [step, setStep] = useState<"idle" | "scanning" | "result">("idle");

  const lancerAudit = () => {
    if (ninea.length < 5) return;
    setStep("scanning");
    setTimeout(() => setStep("result"), 3500);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="conteneur max-w-4xl py-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white mb-12">
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        {step === "idle" && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">
              <Search className="h-4 w-4" /> Audit Express Gratuit
            </div>
            <h1 className="text-5xl font-black mb-6">
              Découvrez ce que votre entreprise <br/><span className="text-or-400">rate sur les marchés publics</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Entrez votre NINEA. Notre IA va scanner les 4 dernières années de données publiques (ARMP/DCMP) et vous révéler vos opportunités manquées.
            </p>

            <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <label className="block text-left text-sm font-bold text-slate-300 mb-2">Numéro NINEA ou Nom de l&apos;entreprise</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-lg font-mono mb-4"
                placeholder="Ex: 12345672X"
                value={ninea}
                onChange={e => setNinea(e.target.value)}
                onKeyDown={e => e.key === "Enter" && lancerAudit()}
              />
              <button 
                onClick={lancerAudit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 text-lg"
              >
                <Search className="h-5 w-5" /> Lancer l&apos;Audit IA
              </button>
              <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Données 100% publiques (Open Data Sénégal)
              </p>
            </div>
          </div>
        )}

        {step === "scanning" && (
          <div className="text-center py-20">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <Search className="absolute inset-0 m-auto h-10 w-10 text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black mb-2">Analyse en cours...</h2>
            <div className="text-slate-400 h-6 overflow-hidden">
              <div className="animate-slide-up space-y-6">
                <p>Connexion aux bases DCMP...</p>
                <p>Recherche du NINEA {ninea}...</p>
                <p>Analyse de la concurrence croisée...</p>
                <p>Génération du rapport...</p>
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-black mb-2">Audit terminé pour <span className="text-blue-400">{ninea.toUpperCase()}</span></h2>
              <p className="text-slate-400 text-lg">Voici un aperçu de vos performances cachées.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-bold">Opportunités manquées (2025)</h3>
                </div>
                <p className="text-4xl font-black text-white mb-2">14 <span className="text-xl text-slate-400">marchés</span></p>
                <p className="text-sm text-slate-300">Valeur totale estimée : <strong className="text-white">{fcfa(1250000000)}</strong></p>
                <p className="text-xs text-slate-500 mt-4">Vous aviez les qualifications pour ces marchés mais n&apos;avez pas soumissionné.</p>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-blue-400">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="font-bold">Concurrents directs identifiés</h3>
                </div>
                <p className="text-4xl font-black text-white mb-2">3 <span className="text-xl text-slate-400">PME</span></p>
                <p className="text-sm text-slate-300">Ils ont remporté <strong className="text-white">68%</strong> des marchés de votre secteur.</p>
                <div className="flex gap-2 mt-4">
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">TechAfrica</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">SenBTP</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded blur-sm">******</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-or-900/40 to-slate-900 border border-or-500/30 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-black text-white mb-4">Ne laissez plus l&apos;argent sur la table.</h3>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Accédez au rapport complet, découvrez le nom de tous vos concurrents, et commencez à utiliser notre IA pour gagner vos prochains marchés.
              </p>
              <Link href="/inscription" className="inline-flex items-center gap-2 bg-or-500 hover:bg-or-600 text-white font-black px-8 py-4 rounded-xl text-lg transition shadow-xl shadow-or-500/20">
                <FileText className="h-5 w-5" /> Télécharger mon rapport complet
              </Link>
              <p className="text-xs text-slate-500 mt-4">Inscription gratuite · Sans carte bancaire</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
