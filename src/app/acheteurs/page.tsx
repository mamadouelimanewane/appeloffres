"use client";
import { ArrowLeft, Building2, BarChart4, AlertTriangle, Search, Star, Clock } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const ACHETEURS = [
  {
    nom: "SENELEC",
    secteur: "Énergie",
    marchesAnnuels: 142,
    budgetMedian: 250000000,
    delaiPaiement: 112,
    tauxAnnulation: 4,
    scoreTransparence: 78,
    avisIA: "Bon payeur historique mais sélectif. Exige une trésorerie solide (>150M FCFA). Marchés souvent remportés par des groupements. Renforcez votre dossier technique.",
    criteres: ["Mieux disant", "ISO 9001", "Capacité financière"],
    favoris: ["Eiffage Sénégal", "Vinci Energies", "CSE"]
  },
  {
    nom: "Ministère de la Santé",
    secteur: "Santé Publique",
    marchesAnnuels: 85,
    budgetMedian: 120000000,
    delaiPaiement: 180,
    tauxAnnulation: 12,
    scoreTransparence: 52,
    avisIA: "Délais de paiement très longs (6 mois). Prévoir un plan de trésorerie solide ou utiliser l'affacturage. Taux d'annulation suspect, renseignez-vous sur les DAO avant d'investir.",
    criteres: ["Moins disant", "Agrément spécifique"],
    favoris: ["Médical Sénégal", "Carrefour Médical"]
  },
  {
    nom: "APIX",
    secteur: "Infrastructures",
    marchesAnnuels: 45,
    budgetMedian: 850000000,
    delaiPaiement: 65,
    tauxAnnulation: 2,
    scoreTransparence: 91,
    avisIA: "L'acheteur le plus transparent du Sénégal. Paiements rapides, critères clairs. Attention : les marchés sont très grands, nécessitent souvent un groupement ou un sous-traitant local.",
    criteres: ["Expérience internationale", "Mieux disant"],
    favoris: ["CDE", "Henan Chine", "CSE"]
  }
];

export default function CartographieAcheteurs() {
  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Building2 className="h-8 w-8 text-brand-700" />
          Cartographie des Acheteurs (Intelligence)
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          Découvrez le profil caché des autorités contractantes. Avant de soumissionner, analysez leurs délais de paiement réels, leurs critères préférés et les entreprises qu'ils choisissent le plus souvent.
        </p>
      </div>

      <div className="mt-6 flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input type="text" placeholder="Rechercher un ministère, une agence (ex: SENELEC, ADIE)..." className="champ pl-10 w-full" />
        </div>
        <button className="btn">Filtrer</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {ACHETEURS.map((a, i) => (
          <div key={i} className="carte p-0 overflow-hidden">
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{a.nom}</h2>
                <span className="text-sm font-medium text-slate-500">{a.secteur}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border shadow-sm text-center">
                <span className="block text-xs text-slate-500 font-bold uppercase">Volume</span>
                <span className="font-black text-brand-700">{a.marchesAnnuels}/an</span>
              </div>
            </div>
            
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase"><Clock className="h-3.5 w-3.5" /> Délai de paiement</span>
                <p className={`font-bold text-lg ${a.delaiPaiement > 120 ? 'text-red-600' : 'text-green-600'}`}>
                  ~{a.delaiPaiement} jours
                </p>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase"><BarChart4 className="h-3.5 w-3.5" /> Budget Médian</span>
                <p className="font-bold text-lg text-slate-900">{fcfa(a.budgetMedian)}</p>
              </div>
              
              <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase mb-2"><AlertTriangle className="h-3.5 w-3.5" /> Risque d'annulation</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${a.tauxAnnulation > 10 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${a.tauxAnnulation * 4}%` }} />
                  </div>
                  <span className="text-sm font-bold">{a.tauxAnnulation}%</span>
                </div>
              </div>

              <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase mb-2"><Star className="h-3.5 w-3.5" /> Attributaires Fréquents</span>
                <div className="flex flex-wrap gap-2">
                  {a.favoris.map(f => (
                    <span key={f} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-md font-medium border border-brand-100">{f}</span>
                  ))}
                </div>
              </div>

              {/* Score de transparence */}
              <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Indice de Transparence IA</span>
                  <span className={`text-lg font-black ${a.scoreTransparence >= 75 ? 'text-green-600' : a.scoreTransparence >= 55 ? 'text-orange-500' : 'text-red-600'}`}>{a.scoreTransparence}/100</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${a.scoreTransparence >= 75 ? 'bg-green-500' : a.scoreTransparence >= 55 ? 'bg-orange-400' : 'bg-red-500'}`}
                    style={{ width: `${a.scoreTransparence}%` }}
                  />
                </div>
              </div>

              {/* Avis IA */}
              <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">💡 Avis Expert IA</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 italic">{a.avisIA}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
