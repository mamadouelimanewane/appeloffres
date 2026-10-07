import { ArrowLeft, Users, Search, Building2, MapPin } from "lucide-react";
import Link from "next/link";

const PME = [
  { nom: "SenBTP Construction", secteur: "BTP", ville: "Dakar", effectif: "50-100", certif: "ISO 9001" },
  { nom: "TechTech Africa", secteur: "Informatique", ville: "Dakar", effectif: "10-50", certif: "Aucune" },
  { nom: "Thiès Assainissement", secteur: "Assainissement", ville: "Thiès", effectif: "10-50", certif: "Agrément Qualité" },
  { nom: "Touba Matériaux", secteur: "Fournitures", ville: "Touba", effectif: "1-10", certif: "Aucune" },
];

export default function Annuaire() {
  return (
    <div className="conteneur py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Users className="h-8 w-8 text-brand-700" />
            Annuaire des PME (Groupements)
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-2xl">
            Trouvez des partenaires locaux pour former un groupement solidaire ou sous-traiter une partie d'un marché complexe.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input type="text" placeholder="Rechercher par secteur, ville..." className="champ pl-10 w-full md:w-64" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PME.map((p, i) => (
          <div key={i} className="carte p-5 flex flex-col hover:border-brand-300 transition-colors cursor-pointer">
            <h2 className="text-lg font-bold flex items-center gap-2"><Building2 className="h-5 w-5 text-slate-500" /> {p.nom}</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600 flex-1">
              <p><span className="font-medium text-slate-900">Secteur :</span> {p.secteur}</p>
              <p className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.ville}</p>
              <p><span className="font-medium text-slate-900">Effectif :</span> {p.effectif}</p>
              {p.certif !== "Aucune" && <span className="inline-block mt-2 puce bg-brand-50 text-brand-700 ring-1 ring-brand-200">{p.certif}</span>}
            </div>
            <button className="mt-4 btn-sec w-full">Contacter pour groupement</button>
          </div>
        ))}
      </div>
    </div>
  );
}
