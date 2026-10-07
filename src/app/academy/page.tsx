"use client";
import { ArrowLeft, GraduationCap, PlayCircle, Award, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

const COURS = [
  {
    id: 1,
    titre: "Comprendre le Code des Marchés Publics",
    duree: "45 min",
    modules: 5,
    progression: 100,
    statut: "Terminé",
    certifie: true
  },
  {
    id: 2,
    titre: "Comment contester une attribution (Recours ARCOP)",
    duree: "30 min",
    modules: 3,
    progression: 33,
    statut: "En cours",
    certifie: false
  },
  {
    id: 3,
    titre: "Optimiser son BPU et sa Marge Financière",
    duree: "1h 15",
    modules: 8,
    progression: 0,
    statut: "À commencer",
    certifie: false
  }
];

export default function SoumissionAcademy() {
  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-brand-700" />
            Soumission Academy
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-2xl">
            Maîtrisez les rouages de la commande publique sénégalaise. Suivez nos formations courtes, réussissez les quiz et obtenez le badge "Expert" affiché sur votre profil d'entreprise.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-or-400 to-or-600 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4 shrink-0">
          <Award className="h-12 w-12 text-or-100" />
          <div>
            <p className="text-xs font-bold uppercase text-or-100 tracking-wider">Votre Statut</p>
            <p className="text-xl font-black">Initié (1/3)</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {COURS.map(c => (
          <div key={c.id} className="carte flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-brand-300">
            <div className="h-32 bg-slate-100 relative flex items-center justify-center border-b border-slate-200">
              {c.progression === 100 ? (
                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="h-12 w-12 text-green-500" /></div>
              ) : c.progression > 0 ? (
                <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center"><PlayCircle className="h-12 w-12 text-brand-500" /></div>
              ) : (
                <div className="absolute inset-0 bg-slate-200/50 flex items-center justify-center"><Lock className="h-8 w-8 text-slate-400" /></div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded \${c.progression === 100 ? 'bg-green-100 text-green-700' : c.progression > 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                  {c.statut}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{c.duree}</span>
              </div>
              
              <h3 className="font-bold text-slate-900 leading-tight mb-4 flex-1">{c.titre}</h3>
              
              <div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Progression</span>
                  <span>{c.progression}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full \${c.progression === 100 ? 'bg-green-500' : 'bg-brand-500'}`} style={{ width: `${c.progression}%` }}></div>
                </div>
              </div>

              <button className={`mt-5 btn w-full justify-center \${c.progression === 100 ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : ''}`}>
                {c.progression === 100 ? 'Revoir le cours' : c.progression > 0 ? 'Continuer' : 'Commencer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
