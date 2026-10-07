"use client";
import { ArrowLeft, Chrome, Zap, ShieldCheck, Download, Star, MousePointer2, Cpu } from "lucide-react";
import Link from "next/link";

const FONCTIONNALITES = [
  { icone: Zap, titre: "Score d'Équité en 1 clic", desc: "L'extension analyse automatiquement chaque avis sur les sites officiels et affiche le Score d'Équité IA directement sur la page." },
  { icone: MousePointer2, titre: "Import Automatique", desc: "Un bouton vert apparaît sur chaque marché. Cliquez : toutes les données (titre, budget, deadline) s'importent dans votre Pipeline en 0 seconde." },
  { icone: ShieldCheck, titre: "Détection de doublons", desc: "L'extension détecte si un marché est déjà dans votre coffre-fort et vous prévient avant de perdre du temps à le traiter deux fois." },
  { icone: Cpu, titre: "Résumé IA immédiat", desc: "Survolez n'importe quel titre d'appel d'offres : un tooltip IA s'affiche avec le résumé des pièces exigées, le budget et la probabilité de win en 2 lignes." },
];

const SITES = [
  { nom: "marchespublics.sn", logo: "🏛️" },
  { nom: "dcmp.sn", logo: "📋" },
  { nom: "armp.sn", logo: "⚖️" },
  { nom: "ungm.org (ONU)", logo: "🌍" },
  { nom: "devex.com (Banque mondiale)", logo: "🌐" },
];

export default function Extension() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white">
        <div className="conteneur py-16 max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-white mb-8">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-brand-200 mb-6">
                <Chrome className="h-4 w-4" /> Extension Chrome &amp; Firefox
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                L&apos;IA d&apos;Appeldoffres.sn
                <span className="text-or-400"> dans votre navigateur</span>
              </h1>
              <p className="mt-6 text-lg text-brand-200 leading-relaxed">
                Installez l&apos;extension <strong className="text-white">Sniper</strong>. Elle transforme les sites officiels de marchés publics en tableaux de bord intelligents. Analysez, importez, décidez — sans changer vos habitudes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="btn-or text-base px-8 py-3">
                  <Download className="h-5 w-5" /> Ajouter à Chrome (Gratuit)
                </button>
                <button className="rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 text-base px-6 py-3 font-semibold transition">
                  Pour Firefox
                </button>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-or-400 text-or-400" />)}
                </div>
                <span className="text-sm text-brand-300">4.9/5 — 1 200+ installations actives</span>
              </div>
            </div>
            {/* Simulation visuelle */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded text-xs text-slate-500 px-3 py-1 text-center">marchespublics.sn/avis/detail/2026-0842</div>
              </div>
              <div className="p-4 text-slate-800 text-sm">
                <p className="font-bold text-base text-slate-900">Fourniture de 500 ordinateurs portables</p>
                <p className="text-slate-500 text-xs mt-1">ADIE · Budget estimé : 250 000 000 FCFA</p>
                <div className="mt-3 border border-brand-200 bg-brand-50 rounded-xl p-3 relative">
                  <div className="absolute -top-2.5 left-3 bg-brand-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">🤖 SNIPER IA</div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-1">
                    <div className="bg-green-100 rounded-lg p-2">
                      <p className="text-[10px] text-green-700 font-bold uppercase">Équité</p>
                      <p className="text-xl font-black text-green-700">78</p>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-2">
                      <p className="text-[10px] text-orange-700 font-bold uppercase">Concurrents</p>
                      <p className="text-xl font-black text-orange-700">~6</p>
                    </div>
                    <div className="bg-brand-100 rounded-lg p-2">
                      <p className="text-[10px] text-brand-700 font-bold uppercase">Win-Rate</p>
                      <p className="text-xl font-black text-brand-700">62%</p>
                    </div>
                  </div>
                  <button className="mt-2 w-full bg-brand-700 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-brand-800 transition">
                    ⚡ Importer dans Pipeline
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-400 text-center">Pièces : NINEA, RCCM, Attestation Fiscale, Caution 2% ...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sites couverts */}
      <div className="bg-slate-50 border-y border-slate-200 py-6">
        <div className="conteneur max-w-5xl">
          <p className="text-center text-xs font-bold uppercase text-slate-400 tracking-widest mb-4">Compatible avec</p>
          <div className="flex flex-wrap justify-center gap-6">
            {SITES.map(s => (
              <div key={s.nom} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="text-2xl">{s.logo}</span> {s.nom}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div className="conteneur max-w-5xl py-16">
        <h2 className="text-3xl font-extrabold text-center mb-2">Ce que l&apos;extension ajoute</h2>
        <p className="text-center text-slate-500 mb-12">Sur chaque page de marché officielle, l&apos;IA s&apos;intègre en temps réel.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {FONCTIONNALITES.map(({ icone: Icone, titre, desc }, i) => (
            <div key={i} className="carte p-6 flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icone className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{titre}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button className="btn-or text-base px-10 py-4">
            <Download className="h-5 w-5" /> Installer l&apos;extension Sniper — C&apos;est gratuit
          </button>
          <p className="text-sm text-slate-500 mt-3">Aucune donnée personnelle collectée · Open source</p>
        </div>
      </div>
    </div>
  );
}
