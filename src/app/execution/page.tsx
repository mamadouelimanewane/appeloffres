"use client";
import { ArrowLeft, HardHat, AlertOctagon, CalendarOff, FileText, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

const CHANTIERS = [
  {
    id: "M-2026-04",
    titre: "Fourniture de 200 ordinateurs - Ministère de l'Éducation",
    dateLivraison: "2026-11-15",
    joursRestants: 38,
    statut: "En cours",
    progression: 65,
    risque: "Faible"
  },
  {
    id: "M-2026-01",
    titre: "Réhabilitation Dispensaire Rural - Thiès",
    dateLivraison: "2026-10-12",
    joursRestants: 5,
    statut: "Alerte",
    progression: 80,
    risque: "Élevé",
    penalitesEstimees: "15 000 FCFA / jour de retard"
  }
];

export default function SuiviExecution() {
  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <HardHat className="h-8 w-8 text-brand-700" />
            Suivi d'Exécution & Pénalités
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-2xl">
            Pilotez les délais de vos marchés gagnés. Soyez alerté avant l'échéance et générez automatiquement vos courriers de demande de prolongation pour éviter les pénalités de l'État.
          </p>
        </div>
        <div className="bg-slate-900 text-white p-4 rounded-xl shrink-0 text-center">
          <p className="text-xs uppercase font-bold text-slate-400">Marchés Actifs</p>
          <p className="text-3xl font-black mt-1">2</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {CHANTIERS.map(c => (
          <div key={c.id} className={`carte overflow-hidden border-2 \${c.risque === 'Élevé' ? 'border-red-300' : 'border-transparent'}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{c.id}</span>
                  <h2 className="text-xl font-bold mt-2">{c.titre}</h2>
                </div>
                {c.risque === "Élevé" ? (
                  <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full"><AlertOctagon className="h-4 w-4" /> Urgence Délai</span>
                ) : (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full"><CheckCircle2 className="h-4 w-4" /> Dans les temps</span>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mt-6">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Progression</p>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full \${c.risque === 'Élevé' ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${c.progression}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-right mt-1">{c.progression}%</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-1"><Clock className="h-4 w-4" /> Date limite officielle</p>
                  <p className="text-lg font-bold">{new Date(c.dateLivraison).toLocaleDateString('fr-FR')}</p>
                  <p className={`text-sm font-semibold mt-1 \${c.joursRestants <= 10 ? 'text-red-600' : 'text-slate-600'}`}>
                    J-{c.joursRestants} jours
                  </p>
                </div>

                {c.risque === "Élevé" && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <p className="text-xs font-bold text-red-800 uppercase">Risque de pénalité</p>
                    <p className="text-sm text-red-600 font-semibold mt-1">{c.penalitesEstimees}</p>
                  </div>
                )}
              </div>
            </div>

            {c.risque === "Élevé" && (
              <div className="bg-red-600 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium">⚠️ Le délai contractuel approche dangereusement. Vous risquez des retenues sur vos factures.</p>
                <button className="bg-white text-red-600 hover:bg-red-50 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap" onClick={() => alert("Génération du courrier type de demande de prolongation de délai (Force majeure / Intempéries)...")}>
                  <FileText className="h-4 w-4" />
                  Générer lettre de prolongation
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
