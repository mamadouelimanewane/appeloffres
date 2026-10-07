import { ArrowLeft, Handshake, Building, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const MEGA_MARCHES = [
  { 
    id: 1, 
    titre: "Construction de l'autoroute Dakar-Tivaouane", 
    gagnant: "Eiffage Sénégal", 
    montant: 150000000000, 
    budgetLocal: 45000000000,
    opportunites: ["Terrassement", "Fourniture de ciment", "Location d'engins lourds", "Restauration base vie"],
    statut: "Recherche active"
  },
  { 
    id: 2, 
    titre: "Fourniture et installation de compteurs intelligents", 
    gagnant: "Senelec / Consortium Huawei", 
    montant: 25000000000, 
    budgetLocal: 7500000000,
    opportunites: ["Déploiement sur site (Dakar et Thiès)", "Câblage", "Logistique et transport"],
    statut: "Bientôt ouvert"
  }
];

export default function BourseSousTraitance() {
  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      
      <div className="mt-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Handshake className="h-8 w-8 text-brand-700" />
            Bourse au Contenu Local
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-2xl">
            Accédez directement à la sous-traitance des "Méga-Projets". La loi impose aux multinationales de réserver 30% des travaux aux PME locales. Positionnez-vous.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {MEGA_MARCHES.map(m => (
          <div key={m.id} className="carte p-6 border-l-4 border-l-brand-600 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Projet d'État</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.statut === 'Recherche active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>{m.statut}</span>
              </div>
              <h2 className="text-xl font-bold mt-2 text-slate-900">{m.titre}</h2>
              <p className="text-slate-600 mt-1 flex items-center gap-2"><Building className="h-4 w-4" /> Attributaire : <strong>{m.gagnant}</strong></p>
              
              <div className="mt-4 flex gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <p className="text-xs text-slate-500 uppercase">Marché global</p>
                  <p className="font-bold text-slate-800">{fcfa(m.montant)}</p>
                </div>
                <div className="bg-brand-50 p-3 rounded-lg border border-brand-100">
                  <p className="text-xs text-brand-700 uppercase font-semibold">Budget sous-traitance locale (30%)</p>
                  <p className="font-extrabold text-brand-900">{fcfa(m.budgetLocal)}</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Opportunités pour les PME :</h3>
              <ul className="space-y-2">
                {m.opportunites.map((opp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> {opp}
                  </li>
                ))}
              </ul>
              <button className="btn w-full mt-5">Postuler comme Sous-traitant</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
