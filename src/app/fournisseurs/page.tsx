"use client";
import { useState } from "react";
import { ArrowLeft, Search, Package, MapPin, Truck, ExternalLink, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const FOURNISSEURS_MOCK = [
  {
    id: 1,
    nom: "Sénégal Matériaux Pro",
    categorie: "BTP & Construction",
    localisation: "Dakar, Zone Industrielle",
    produits: ["Ciment", "Fer à béton", "Gravier"],
    prixAppel: "Ciment CEM II à partir de 65 000 FCFA / tonne",
    delai: "24-48h",
    fiabilite: 98,
    certifie: true
  },
  {
    id: 2,
    nom: "Tech Import Africa",
    categorie: "Informatique & Bureautique",
    localisation: "Dakar, Plateau",
    produits: ["Ordinateurs", "Imprimantes", "Serveurs", "Consommables"],
    prixAppel: "PC Core i5 (Lot de 10+) à partir de 280 000 FCFA / unité",
    delai: "Immédiat (Stock local)",
    fiabilite: 95,
    certifie: true
  },
  {
    id: 3,
    nom: "Global Medical Supply",
    categorie: "Équipements Médicaux",
    localisation: "Thiès",
    produits: ["Lits d'hôpital", "Échographes", "Consommables"],
    prixAppel: "Gants stériles (Carton) à partir de 12 000 FCFA",
    delai: "7 jours",
    fiabilite: 89,
    certifie: false
  }
];

export default function SourcingFournisseurs() {
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState(FOURNISSEURS_MOCK);

  const lancerRecherche = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recherche.trim()) {
      setResultats(FOURNISSEURS_MOCK);
      return;
    }
    const txt = recherche.toLowerCase();
    setResultats(FOURNISSEURS_MOCK.filter(f => 
      f.produits.some(p => p.toLowerCase().includes(txt)) || 
      f.categorie.toLowerCase().includes(txt) ||
      f.nom.toLowerCase().includes(txt)
    ));
  };

  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Package className="h-8 w-8 text-brand-700" />
          Sourcing & Fournisseurs
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl">
          Trouvez les meilleurs grossistes et importateurs pour chiffrer vos offres. Comparez les prix d'achat B2B pour garantir vos marges.
        </p>
      </div>

      <div className="mt-8 carte p-4 bg-slate-50 border-slate-200">
        <form onSubmit={lancerRecherche} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Que cherchez-vous ? (ex: Ciment, Ordinateurs, Lits...)" 
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              className="champ pl-10 w-full bg-white"
            />
          </div>
          <button type="submit" className="btn whitespace-nowrap">Chercher les prix</button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resultats.map((f) => (
          <div key={f.id} className="carte flex flex-col overflow-hidden transition-all hover:shadow-lg hover:border-brand-300">
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-1 rounded-md">{f.categorie}</span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">{f.nom}</h2>
                </div>
                {f.certifie && <span className="bg-green-100 text-green-700 p-1.5 rounded-full" title="Fournisseur Vérifié"><CheckCircle2 className="h-4 w-4" /></span>}
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {f.localisation}</p>
                <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-slate-400" /> Livraison : {f.delai}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-semibold mb-2">Produits phares :</p>
                <div className="flex flex-wrap gap-1">
                  {f.produits.map(p => <span key={p} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">{p}</span>)}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-semibold mb-1">Meilleur prix d'appel :</p>
              <p className="font-bold text-brand-900 text-sm mb-4">{f.prixAppel}</p>
              
              <div className="flex gap-2">
                <button className="btn-sec flex-1 py-2 text-xs" onClick={() => alert("Demande de devis envoyée au fournisseur via l'application.")}><Mail className="h-4 w-4" /> Demander devis</button>
                <button className="bg-white border border-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-50" title="Voir le catalogue"><ExternalLink className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}

        {resultats.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12">
            <Package className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="mt-4 text-slate-500 font-medium">Aucun fournisseur trouvé pour "{recherche}".</p>
            <button className="mt-2 text-brand-600 text-sm hover:underline" onClick={() => {setRecherche(""); setResultats(FOURNISSEURS_MOCK);}}>Afficher tous les fournisseurs</button>
          </div>
        )}
      </div>

      <div className="mt-10 p-6 bg-or-50 rounded-2xl border border-or-100 text-sm text-or-800 flex gap-3 items-start">
        <span className="text-xl">💡</span>
        <div>
          <p className="font-bold">Astuce de chiffrage</p>
          <p className="mt-1">N'oubliez pas d'ajouter les frais de transport, de manutention et vos marges (généralement entre 15% et 30%) au prix d'achat B2B avant de soumettre votre offre financière finale sur le BPU.</p>
        </div>
      </div>
    </div>
  );
}
