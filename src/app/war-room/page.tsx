"use client";
import { ArrowLeft, ArrowRight, BarChart4, Globe, LineChart, Map, Radar, ShieldAlert, Trophy, Telescope, Lock } from "lucide-react";
import Link from "next/link";

const MODULES = [
  {
    href: "/war-room/benchmark",
    icone: BarChart4,
    titre: "Benchmark Concurrentiel",
    desc: "Comparez-vous à vos concurrents directs avant de soumissionner. Nombre de marchés remportés, prix habituels, certifications — tout en un tableau.",
    couleur: "from-blue-600 to-blue-900",
    badge: "Analyse",
    locked: false,
  },
  {
    href: "/war-room/observatoire",
    icone: Telescope,
    titre: "Observatoire des Prix",
    desc: "Les prix réels acceptés par l'État sénégalais sur 3 ans. Entrez un article : l'IA vous donne la médiane d'attribution au FCFA près.",
    couleur: "from-or-500 to-or-700",
    badge: "Pricing",
    locked: false,
  },
  {
    href: "/war-room/palmares",
    icone: Trophy,
    titre: "Palmarès & Classements",
    desc: "TOP 10 des PME les plus performantes par secteur et par volume. Sachez exactement qui vous affrontera.",
    couleur: "from-purple-600 to-purple-900",
    badge: "Ranking",
    locked: false,
  },
  {
    href: "/war-room/heatmap",
    icone: Map,
    titre: "Heatmap Géographique",
    desc: "Carte du Sénégal : zones rouges (forte concurrence) vs zones vertes (niches sous-exploitées). Trouvez où vos chances sont maximales.",
    couleur: "from-green-600 to-green-900",
    badge: "Cartographie",
    locked: false,
  },
  {
    href: "/war-room/veille",
    icone: Radar,
    titre: "Veille Concurrentielle",
    desc: "Suivez 5 concurrents. Chaque semaine : rapport WhatsApp de leurs mouvements, nouveaux marchés remportés, secteurs investis.",
    couleur: "from-red-600 to-red-900",
    badge: "Surveillance",
    locked: false,
  },
  {
    href: "/war-room/matrice",
    icone: Globe,
    titre: "Matrice Stratégique",
    desc: "Vue dirigeant : votre portefeuille de marchés potentiels classé en Étoiles, Vaches à lait, Dilemmes et Poids morts. Priorisez sans hésiter.",
    couleur: "from-slate-600 to-slate-900",
    badge: "Stratégie",
    locked: false,
  },
];

export default function WarRoom() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950 sticky top-0 z-40">
        <div className="conteneur max-w-6xl py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Data</span>
          </div>
        </div>
      </div>

      <div className="conteneur max-w-6xl py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-bold text-or-400 uppercase tracking-widest mb-6">
            <ShieldAlert className="h-4 w-4" /> Centre d&apos;Intelligence Économique
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter">
            INTELLIGENCE
            <span className="bg-gradient-to-r from-red-500 to-or-400 bg-clip-text text-transparent"> ÉCONOMIQUE</span>
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            L&apos;information que vos concurrents ne savent pas.
            <br />
            <span className="text-white font-semibold">6 modules d&apos;intelligence économique</span> pour prendre des décisions de soumission basées sur des données réelles — pas sur des intuitions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-slate-500">
            <span className="flex items-center gap-2"><LineChart className="h-4 w-4 text-brand-400" /> Données DCMP 2023–2026</span>
            <span className="flex items-center gap-2"><BarChart4 className="h-4 w-4 text-or-400" /> 4 800+ marchés analysés</span>
            <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-green-400" /> Mise à jour hebdomadaire</span>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map(({ href, icone: Icone, titre, desc, couleur, badge, locked }) => (
            <Link
              key={href}
              href={locked ? "#" : href}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              {locked && (
                <div className="absolute inset-0 rounded-2xl bg-slate-950/70 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Abonnement Pro requis</p>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${couleur} shadow-lg`}>
                  <Icone className="h-7 w-7 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-white/10 text-white tracking-wider">{badge}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{titre}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              <div className="mt-5 flex items-center gap-1 text-xs font-bold text-or-400 opacity-0 group-hover:opacity-100 transition">
                Ouvrir le module <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 border border-white/10 rounded-2xl p-8 bg-white/5">
          <p className="text-center text-xs font-bold uppercase text-slate-500 tracking-widest mb-6">Couverture des données</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "4 800+", label: "Marchés analysés" },
              { val: "312", label: "Entreprises profilées" },
              { val: "2023–2026", label: "Données historiques" },
              { val: "18", label: "Secteurs couverts" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-white">{s.val}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
