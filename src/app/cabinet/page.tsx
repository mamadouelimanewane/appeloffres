"use client";
import { useState } from "react";
import { ArrowLeft, Building2, Plus, Users, Briefcase, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocal, PROFIL_VIDE, type Profil } from "@/lib/storage";

export default function EspaceCabinet() {
  // On simule une liste de profils gérés par le cabinet
  const [profils, setProfils] = useLocal<Profil[]>("cabinet-profils", [
    { ...PROFIL_VIDE, nom: "SenBTP Construction", secteurs: ["BTP"], mail: "contact@senbtp.sn" },
    { ...PROFIL_VIDE, nom: "TechTech Africa", secteurs: ["Informatique"], mail: "hello@techtech.sn" }
  ]);
  const [, setProfilActif] = useLocal<Profil>("profil", PROFIL_VIDE);

  const [nouveauNom, setNouveauNom] = useState("");

  const ajouterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauNom.trim()) return;
    setProfils([...profils, { ...PROFIL_VIDE, nom: nouveauNom }]);
    setNouveauNom("");
  };

  const basculerClient = (client: Profil) => {
    setProfilActif(client);
    alert(`Vous gérez maintenant le profil de : ${client.nom}. Toutes vos actions sur la plateforme s'appliqueront à cette entreprise.`);
  };

  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-brand-700" />
          Espace Cabinet
        </h1>
        <span className="puce bg-brand-50 text-brand-700 ring-1 ring-brand-200">Mode Multi-Comptes</span>
      </div>
      <p className="mt-2 text-lg text-slate-600">
        Gérez les candidatures de plusieurs PME depuis un seul compte. Basculez d'une entreprise à l'autre en un clic.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-slate-700" /> Vos clients ({profils.length})</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {profils.map((p, i) => (
              <div key={i} className="carte p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /> {p.nom || "Entreprise sans nom"}</h3>
                  <p className="text-sm text-slate-500 mt-1">{p.mail || "Pas d'email renseigné"}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.secteurs?.map(s => <span key={s} className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => basculerClient(p)} className="btn-sec flex-1 py-1.5 text-sm">Travailler pour ce client</button>
                  <Link href="/profil" onClick={() => setProfilActif(p)} className="btn-sec px-2 py-1.5" title="Modifier le profil"><Settings className="h-4 w-4" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="carte p-6 bg-slate-50 border-slate-100 h-fit">
          <h2 className="text-lg font-bold flex items-center gap-2">Ajouter un client</h2>
          <p className="mt-2 text-sm text-slate-600">Créez un nouveau profil d'entreprise vierge.</p>
          <form onSubmit={ajouterClient} className="mt-4 space-y-3">
            <input 
              type="text" 
              placeholder="Raison sociale de la PME" 
              value={nouveauNom} 
              onChange={e => setNouveauNom(e.target.value)} 
              className="champ w-full"
              required 
            />
            <button type="submit" className="btn w-full"><Plus className="h-4 w-4" /> Ajouter la PME</button>
          </form>
        </div>
      </div>
    </div>
  );
}
