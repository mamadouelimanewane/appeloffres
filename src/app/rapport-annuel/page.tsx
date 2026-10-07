"use client";
import { useState } from "react";
import { ArrowLeft, FileText, Download, TrendingUp, AlertCircle, BarChart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

export default function RapportAnnuel() {
  const [generant, setGenerant] = useState(false);
  const [genere, setGenere] = useState(false);

  const generer = () => {
    setGenerant(true);
    setTimeout(() => {
      setGenerant(false);
      setGenere(true);
    }, 4000);
  };

  return (
    <div className="conteneur max-w-4xl py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-700" />
            Bilan Annuel & Performances
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-2xl">
            Générez un rapport PDF board-ready de 10 pages résumant toute votre activité de soumission de l'année. Parfait pour vos réunions d'actionnaires ou votre banquier.
          </p>
        </div>
        <button 
          onClick={generer} 
          disabled={generant || genere}
          className="btn-or shrink-0 py-3 px-6 shadow-xl shadow-or-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generant ? (
            <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération...</>
          ) : genere ? (
            <><CheckCircle2 className="h-4 w-4" /> Rapport généré</>
          ) : (
            <><Download className="h-4 w-4" /> Générer le Bilan (PDF)</>
          )}
        </button>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
        {/* Aperçu du rapport (Visuel) */}
        <div className="relative aspect-[1/1.4] bg-white rounded-lg shadow-2xl border border-slate-200 p-8 flex flex-col transform md:-rotate-2 transition hover:rotate-0">
          <div className="flex-1">
            <div className="w-16 h-16 bg-brand-900 rounded-xl mb-8 flex items-center justify-center text-white font-black text-2xl">A.</div>
            <h2 className="text-4xl font-black text-slate-900 leading-none mb-2">RAPPORT DE PERFORMANCE 2026</h2>
            <p className="text-xl font-bold text-slate-400 mb-12">Entreprise : TechAfrica SARL</p>
            
            <div className="space-y-6">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-5/6" />
              <div className="h-4 bg-slate-100 rounded w-4/6" />
              
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="h-24 bg-brand-50 rounded-xl border border-brand-100 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-brand-700">72%</span>
                  <span className="text-xs text-brand-600 font-bold uppercase mt-1">Win-Rate</span>
                </div>
                <div className="h-24 bg-or-50 rounded-xl border border-or-100 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-or-700">{fcfa(450000000)}</span>
                  <span className="text-xs text-or-600 font-bold uppercase mt-1">Gagnés</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest">
            <span>Confidentiel</span>
            <span>Généré par Appeldoffres.sn IA</span>
          </div>

          {genere && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 animate-in fade-in">
              <button className="bg-white text-slate-900 font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-100 transition shadow-2xl">
                <Download className="h-5 w-5" /> Télécharger (PDF)
              </button>
            </div>
          )}
        </div>

        {/* Sommaire */}
        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Ce que contient le rapport</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center"><BarChart className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-slate-900">1. Vue d'ensemble Financière</h4>
                <p className="text-sm text-slate-600 mt-1">Analyse du chiffre d'affaires généré via les marchés publics vs privé. Graphiques de saisonnalité.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-slate-900">2. Performance de Soumission</h4>
                <p className="text-sm text-slate-600 mt-1">Win-rate détaillé par secteur et par taille de marché. Coût moyen d'acquisition d'un marché.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-or-100 text-or-700 flex items-center justify-center"><AlertCircle className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold text-slate-900">3. Analyse des Échecs & Opportunités</h4>
                <p className="text-sm text-slate-600 mt-1">Autopsie des marchés perdus (prix trop haut, dossier incomplet) et recommandations stratégiques pour l'année prochaine.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-slate-700">
              "Ce rapport est un game-changer. Je l'imprime en un clic et je le donne à mon banquier pour négocier mes prochaines lignes de crédit. C'est propre, chiffré et professionnel."
            </p>
            <p className="text-xs text-slate-500 mt-2">— DG, Entreprise de BTP à Thiès</p>
          </div>
        </div>
      </div>
    </div>
  );
}
