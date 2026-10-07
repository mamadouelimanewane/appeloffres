"use client";
import { useState } from "react";
import { ArrowLeft, BarChart4, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const CONCURRENTS = [
  {
    id: "eiffage",
    nom: "Eiffage Sénégal",
    secteur: "BTP / Énergie",
    marchesRemportes: 47,
    caTotal: 18200000000,
    certifications: ["ISO 9001", "ISO 14001", "OHSAS 18001"],
    prixMoyen: 850000000,
    tendance: "hausse",
    points: ["Forte capacité financière", "Relations historiques SENELEC/APIX", "Équipements en propre"],
    faiblesses: ["Peu réactif sur petits marchés < 50M", "Délais de réponse longs"],
  },
  {
    id: "cse",
    nom: "CSE",
    secteur: "Multi-secteurs",
    marchesRemportes: 28,
    caTotal: 4100000000,
    certifications: ["ISO 9001"],
    prixMoyen: 145000000,
    tendance: "stable",
    points: ["Très réactif, rapide à mobiliser", "Bonne couverture régionale"],
    faiblesses: ["Moins compétitif sur gros marchés", "Capacité financière limitée"],
  },
  {
    id: "henan",
    nom: "Henan Chine",
    secteur: "Infrastructure",
    marchesRemportes: 12,
    caTotal: 22400000000,
    certifications: ["ISO 9001", "ISO 14001"],
    prixMoyen: 1860000000,
    tendance: "hausse",
    points: ["Prix très agressifs (financement chinois)", "Équipements importés moins chers"],
    faiblesses: ["Sous-traitance locale rare", "Délais souvent dépassés"],
  },
];

const VOTRE_PROFIL = {
  marchesRemportes: 8,
  caTotal: 620000000,
  certifications: ["NINEA", "RCCM"],
  prixMoyen: 75000000,
};

export default function Benchmark() {
  const [recherche, setRecherche] = useState("");
  const filtered = CONCURRENTS.filter(c => c.nom.toLowerCase().includes(recherche.toLowerCase()) || c.secteur.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <div className="conteneur max-w-6xl py-8">
        <Link href="/war-room" className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> War Room
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-black flex items-center gap-3">
            <BarChart4 className="h-9 w-9 text-blue-400" /> Benchmark Concurrentiel
          </h1>
          <p className="mt-2 text-lg text-slate-400 max-w-3xl">
            Comparez votre entreprise à vos concurrents directs. Identifiez vos avantages, corrigez vos lacunes, choisissez les marchés où vous êtes réellement compétitif.
          </p>
        </div>

        {/* Votre profil */}
        <div className="mt-8 border border-brand-500/40 bg-brand-900/20 rounded-2xl p-6">
          <p className="text-xs font-black uppercase text-brand-400 tracking-widest mb-4">Votre entreprise (référence)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-xs text-slate-500">Marchés remportés</p><p className="text-2xl font-black text-white">{VOTRE_PROFIL.marchesRemportes}</p></div>
            <div><p className="text-xs text-slate-500">CA total marchés pub.</p><p className="text-2xl font-black text-white">{fcfa(VOTRE_PROFIL.caTotal)}</p></div>
            <div><p className="text-xs text-slate-500">Prix moyen offre</p><p className="text-2xl font-black text-white">{fcfa(VOTRE_PROFIL.prixMoyen)}</p></div>
            <div><p className="text-xs text-slate-500">Certifications</p><div className="flex flex-wrap gap-1 mt-1">{VOTRE_PROFIL.certifications.map(c => <span key={c} className="text-xs bg-brand-800 text-brand-200 px-2 py-0.5 rounded">{c}</span>)}</div></div>
          </div>
        </div>

        {/* Recherche */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
          <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-brand-500" placeholder="Rechercher un concurrent..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        </div>

        {/* Tableau comparatif */}
        <div className="mt-6 space-y-4">
          {filtered.map(c => (
            <div key={c.id} className="border border-white/10 bg-white/5 rounded-2xl p-6 hover:bg-white/8 transition">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white">{c.nom}</h2>
                    {c.tendance === "hausse" && <TrendingUp className="h-5 w-5 text-red-400" />}
                    {c.tendance === "stable" && <Minus className="h-5 w-5 text-yellow-400" />}
                    {c.tendance === "baisse" && <TrendingDown className="h-5 w-5 text-green-400" />}
                  </div>
                  <p className="text-sm text-slate-400">{c.secteur}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {c.certifications.map(cert => <span key={cert} className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded font-medium">{cert}</span>)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                {[
                  { label: "Marchés remportés", vous: VOTRE_PROFIL.marchesRemportes, eux: c.marchesRemportes },
                  { label: "CA marchés publics", vous: VOTRE_PROFIL.caTotal, eux: c.caTotal, fcfa: true },
                  { label: "Prix moyen proposé", vous: VOTRE_PROFIL.prixMoyen, eux: c.prixMoyen, fcfa: true },
                ].map(stat => {
                  const avantage = stat.vous > stat.eux;
                  return (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-slate-500 uppercase mb-2">{stat.label}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-brand-400 font-bold">VOUS</p>
                          <p className="font-black text-sm text-white">{stat.fcfa ? fcfa(stat.vous) : stat.vous}</p>
                        </div>
                        <div className={`text-xs font-black px-2 py-1 rounded-full ${avantage ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {avantage ? "✓ Avantage" : "✗ Déficit"}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold text-right">EUX</p>
                          <p className="font-black text-sm text-slate-300 text-right">{stat.fcfa ? fcfa(stat.eux) : stat.eux}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-950/30 border border-green-800/30 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-400 uppercase mb-2">✅ Leurs forces</p>
                  <ul className="space-y-1">{c.points.map(p => <li key={p} className="text-xs text-slate-300">{p}</li>)}</ul>
                </div>
                <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-400 uppercase mb-2">⚠️ Leurs faiblesses</p>
                  <ul className="space-y-1">{c.faiblesses.map(f => <li key={f} className="text-xs text-slate-300">{f}</li>)}</ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
