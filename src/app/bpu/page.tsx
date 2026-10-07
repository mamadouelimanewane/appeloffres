"use client";
import { useState } from "react";
import { ArrowLeft, TableProperties, Sparkles, UploadCloud, Download, Check } from "lucide-react";
import Link from "next/link";

export default function AutoBPU() {
  const [etape, setEtape] = useState(1);

  const simulerAnalyse = () => {
    setEtape(2);
    setTimeout(() => setEtape(3), 2500);
  };

  return (
    <div className="conteneur py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      
      <h1 className="mt-6 text-3xl font-extrabold flex items-center gap-3">
        <TableProperties className="h-8 w-8 text-brand-700" />
        Auto-Remplissage du BPU (IA)
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Fini les erreurs de calcul Excel. Chargez le Bordereau des Prix Unitaires vierge fourni par l'acheteur, et l'IA le remplit en utilisant vos prix historiques et les prix du marché.
      </p>

      <div className="mt-10 p-8 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 text-center">
        {etape === 1 && (
          <div className="animate-in fade-in zoom-in">
            <UploadCloud className="h-16 w-16 text-slate-400 mx-auto" />
            <h2 className="mt-4 text-xl font-bold text-slate-800">Glissez-déposez le BPU vierge (Excel ou Word)</h2>
            <p className="text-slate-500 mt-2 text-sm">Formats supportés : .xlsx, .xls, .docx, .csv</p>
            <button onClick={simulerAnalyse} className="btn mt-6"><Sparkles className="h-4 w-4" /> Remplir avec l'IA</button>
          </div>
        )}
        
        {etape === 2 && (
          <div className="animate-in fade-in py-8">
            <Sparkles className="h-12 w-12 text-or-500 mx-auto animate-pulse" />
            <h2 className="mt-4 text-lg font-bold text-slate-800">L'IA analyse les articles du BPU...</h2>
            <p className="text-slate-500 mt-2">Recherche des prix moyens dans la base de données (1 583 marchés)...</p>
          </div>
        )}

        {etape === 3 && (
          <div className="animate-in fade-in zoom-in py-4 text-left max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 justify-center text-green-600">
              <Check className="h-8 w-8" />
              <h2 className="text-2xl font-bold">BPU Généré avec succès !</h2>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Aperçu des lignes détectées</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between border-b pb-2"><span>1. Ordinateurs portables (x50)</span> <strong className="text-slate-800">750 000 FCFA/u</strong></li>
                <li className="flex justify-between border-b pb-2"><span>2. Imprimantes laser (x10)</span> <strong className="text-slate-800">120 000 FCFA/u</strong></li>
                <li className="flex justify-between font-bold text-lg pt-2 text-brand-700"><span>TOTAL HT</span> <span>38 700 000 FCFA</span></li>
              </ul>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="btn-sec bg-white">Ajuster les marges</button>
              <button className="btn"><Download className="h-4 w-4" /> Télécharger Excel final</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
