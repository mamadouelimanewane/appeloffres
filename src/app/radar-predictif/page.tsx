import { ArrowLeft, Telescope, AlertCircle, CalendarClock, TrendingUp, MapPin } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const PREDICTIONS = [
  {
    secteur: "Électrification Rurale",
    region: "Kolda & Sédhiou",
    budgetVote: 8500000000,
    source: "Loi de Finances 2026, Article 68, Programme PUDC",
    probabilite: 92,
    horizonMois: 4,
    conseil: "Commencez à contacter vos fournisseurs de câbles et transformateurs dès aujourd'hui. Les marchés sortiront probablement en Q2 2026.",
    tags: ["Électricité", "Génie Civil", "BTP"]
  },
  {
    secteur: "Équipements Scolaires",
    region: "National (Zone Rurale)",
    budgetVote: 3200000000,
    source: "Budget programme du Ministère de l'Éducation Nationale 2026",
    probabilite: 88,
    horizonMois: 2,
    conseil: "Le calendrier scolaire impose un dépôt avant juin. Préparez vos catalogues de tables-bancs et tableaux dès maintenant.",
    tags: ["Fournitures", "Mobilier"]
  },
  {
    secteur: "Informatisation des Services Publics",
    region: "Dakar principalement",
    budgetVote: 12000000000,
    source: "Loi de Finances 2026, ADIE - Programme SMART Sénégal",
    probabilite: 78,
    horizonMois: 6,
    conseil: "Budget massif pour les logiciels et serveurs. Les PME IT devraient anticiper en se regroupant (groupement solidaire) pour atteindre le seuil financier.",
    tags: ["Informatique", "Logiciels", "Réseau"]
  }
];

export default function RadarPredictif() {
  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Telescope className="h-8 w-8 text-brand-700" />
          Radar Prédictif (Loi de Finances)
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl">
          L'IA a analysé la Loi de Finances 2026 votée par l'Assemblée Nationale. Voici les secteurs qui vont publier des appels d'offres dans les prochains mois. Prenez 6 mois d'avance sur vos concurrents.
        </p>
      </div>

      <div className="mt-6 p-4 bg-or-50 border border-or-100 rounded-xl text-sm text-or-800 flex gap-3 items-center">
        <AlertCircle className="h-5 w-5 shrink-0 text-or-600" />
        <p><strong>Source analysée :</strong> Loi n° 2025-18 du 12 décembre 2025 portant Loi de Finances initiale pour l'année 2026 (Sénégal) — Document de 743 pages traité par IA.</p>
      </div>

      <div className="mt-8 space-y-6">
        {PREDICTIONS.map((p, i) => (
          <div key={i} className="carte overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900">{p.secteur}</h2>
                    {p.tags.map(t => <span key={t} className="puce bg-brand-50 text-brand-700 ring-1 ring-brand-200">{t}</span>)}
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${p.probabilite >= 90 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      Indice de Confiance IA : {p.probabilite}%
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.region}</span>
                    <span className="flex items-center gap-1"><CalendarClock className="h-4 w-4" /> Dans ~{p.horizonMois} mois</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">Source : {p.source}</span>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800">💡 Conseil IA :</p>
                    <p className="text-sm text-blue-700 mt-1">{p.conseil}</p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-4 shrink-0 md:text-right">
                  <div className="bg-slate-50 p-4 rounded-xl border min-w-36">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Budget voté</p>
                    <p className="text-xl font-extrabold text-brand-900 mt-1">{fcfa(p.budgetVote)}</p>
                  </div>
                  <div className={`p-4 rounded-xl border min-w-36 ${p.probabilite >= 85 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                    <p className="text-xs font-semibold uppercase text-slate-500">Probabilité</p>
                    <p className={`text-2xl font-extrabold mt-1 ${p.probabilite >= 85 ? "text-green-700" : "text-orange-600"}`}>{p.probabilite}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex items-center justify-between">
              <div className="w-full max-w-xs mr-6">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Probabilité de sortie dans les délais</span>
                  <span className="font-bold">{p.probabilite}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.probabilite >= 85 ? "bg-green-500" : "bg-orange-400"}`} style={{ width: `${p.probabilite}%` }} />
                </div>
              </div>
              <Link href="/fournisseurs" className="btn-sec text-sm whitespace-nowrap">Chercher fournisseurs</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
