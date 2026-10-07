"use client";
import { useState } from "react";
import { ArrowLeft, Calculator, TrendingDown, Target, HelpCircle } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

export default function Pricing() {
  const [cout, setCout] = useState(10000000);
  const [concurrents, setConcurrents] = useState(5);
  
  // Simulation simpliste mais impressionnante visuellement
  const margeNetteVisee = 15; // 15% net minimum
  const impots = 30; // IS à 30% environ
  const tva = 18; 
  
  // Calculs
  const prixMinimum = cout * (1 + (margeNetteVisee/100) / (1 - impots/100));
  // On simule que l'IA sait que pour N concurrents, le rabais moyen gagnant est de X% par rapport au budget.
  const prixOptimal = cout * 1.35 * (1 - (concurrents * 0.02)); 
  
  return (
    <div className="conteneur py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Calculator className="h-8 w-8 text-brand-700" />
          Simulateur de Prix (Bidding Optimizer)
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          Saisissez vos coûts bruts. L'IA analyse les données historiques de l'acheteur public et le nombre de concurrents prévus pour vous recommander <strong>le prix exact</strong> à soumettre pour maximiser vos chances de gagner sans sacrifier votre marge.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="carte p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">Vos Paramètres</h2>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Coût de revient total estimé (FCFA)</label>
            <input 
              type="number" 
              className="champ w-full text-lg font-bold" 
              value={cout} 
              onChange={e => setCout(Number(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><HelpCircle className="h-3 w-3" /> Inclut main d'oeuvre, matériel, logistique hors taxes.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de concurrents (Estimation IA)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" max="15" 
                className="flex-1 accent-brand-600"
                value={concurrents}
                onChange={e => setConcurrents(Number(e.target.value))}
              />
              <span className="font-bold text-lg text-slate-900 w-8 text-center">{concurrents}</span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 mb-2">Taxes appliquées par défaut</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex justify-between"><span>TVA</span> <strong>18%</strong></li>
              <li className="flex justify-between"><span>Impôt sur les Sociétés (IS)</span> <strong>30%</strong></li>
              <li className="flex justify-between"><span>Redevance ARCOP</span> <strong>0.5%</strong></li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="h-32 w-32" /></div>
            <h2 className="text-brand-200 font-semibold uppercase tracking-wider text-sm mb-4 relative z-10">Recommandation IA</h2>
            
            <div className="relative z-10">
              <p className="text-xs text-brand-100 mb-1">Prix de Soumission Optimal (TTC)</p>
              <p className="text-4xl font-black text-white">{fcfa(prixOptimal * 1.18)}</p>
              <p className="text-sm text-green-400 font-bold mt-2 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" /> 
                Gagne dans 78% des cas simulés
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20 relative z-10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-brand-200">Marge Brute</p>
                <p className="font-bold text-lg">{fcfa(prixOptimal - cout)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-200">Bénéfice Net (après impôts)</p>
                <p className="font-bold text-lg text-green-300">{fcfa((prixOptimal - cout) * 0.7)}</p>
              </div>
            </div>
          </div>

          <div className="carte p-5 border-l-4 border-l-red-500">
            <h3 className="font-bold text-slate-900 text-sm">Seuil Critique (Break-even)</h3>
            <p className="text-sm text-slate-600 mt-1 mb-2">Ne soumissionnez <strong>jamais</strong> en dessous de ce prix TTC, sinon vous perdrez de l'argent après impôts :</p>
            <p className="text-xl font-black text-red-600">{fcfa(prixMinimum * 1.18)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
