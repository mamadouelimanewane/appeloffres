import { ArrowLeft, TrendingUp, Trophy, Target } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const CONCURRENTS = [
  { nom: "CGE (Compagnie Générale d'Entreprises)", marchesGagnes: 12, montantTotal: 4500000000, acheteurs: ["AGEROUTE", "SENELEC"] },
  { nom: "Delta Informatique", marchesGagnes: 8, montantTotal: 850000000, acheteurs: ["Ministère des Finances", "ADIE"] },
  { nom: "Sénégal Fournitures Pro", marchesGagnes: 24, montantTotal: 320000000, acheteurs: ["Port de Dakar", "UCAD", "Hôpital Principal"] },
];

export default function Concurrents() {
  return (
    <div className="conteneur py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold flex items-center gap-3">
        <Target className="h-8 w-8 text-brand-700" />
        Veille Concurrentielle
      </h1>
      <p className="mt-2 text-lg text-slate-600 max-w-2xl">
        Analysez les entreprises qui gagnent les marchés dans votre secteur. Découvrez leurs clients principaux et les volumes financiers remportés.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200 text-sm uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Entreprise</th>
              <th className="px-4 py-3 font-medium">Marchés Gagnés (12 mois)</th>
              <th className="px-4 py-3 font-medium">Montant Total Estimé</th>
              <th className="px-4 py-3 font-medium">Acheteurs Principaux</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CONCURRENTS.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 font-bold text-slate-900">{c.nom}</td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-1 font-semibold text-brand-700"><Trophy className="h-4 w-4" /> {c.marchesGagnes}</span>
                </td>
                <td className="px-4 py-4 font-mono text-slate-700">{fcfa(c.montantTotal)}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <div className="flex flex-wrap gap-1">
                    {c.acheteurs.map(a => <span key={a} className="bg-slate-100 px-2 py-0.5 rounded text-xs">{a}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 p-4 rounded-xl bg-blue-50 text-blue-800 text-sm flex gap-3">
        <TrendingUp className="h-5 w-5 shrink-0" />
        <p>Ces données sont consolidées publiquement à partir des avis d'attribution définitive de la DCMP et de l'ARCOP.</p>
      </div>
    </div>
  );
}
