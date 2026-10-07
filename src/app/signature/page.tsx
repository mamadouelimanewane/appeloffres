"use client";
import { useState } from "react";
import { ArrowLeft, PenTool, Image as ImageIcon, FileCheck, Upload, Download } from "lucide-react";
import Link from "next/link";

export default function SignatureCachet() {
  const [etape, setEtape] = useState(1);
  const [cachetUrl, setCachetUrl] = useState<string | null>(null);

  const simulerUpload = () => {
    // Simulation d'un upload de cachet
    setCachetUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sceau_du_S%C3%A9n%C3%A9gal.svg/200px-Sceau_du_S%C3%A9n%C3%A9gal.svg.png");
    setEtape(2);
  };

  return (
    <div className="conteneur py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <PenTool className="h-8 w-8 text-brand-700" />
          Signature & Cachet Numériques
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl">
          Fini l'impression, le tamponnage et le scan manuel. Enregistrez votre signature et votre cachet d'entreprise une seule fois. L'IA les apposera automatiquement sur tous vos documents.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          <div className={`carte p-6 \${etape === 1 ? 'border-brand-500 ring-1 ring-brand-500' : 'opacity-70'}`}>
            <h2 className="text-lg font-bold flex items-center gap-2">1. Votre Cachet</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Uploadez une photo claire de votre cachet d'entreprise sur fond blanc.</p>
            {!cachetUrl ? (
              <button onClick={simulerUpload} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-brand-400 hover:text-brand-600 transition">
                <Upload className="h-8 w-8 mb-2" />
                <span className="font-semibold">Cliquer pour uploader le cachet</span>
                <span className="text-xs mt-1">PNG transparent recommandé</span>
              </button>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white rounded-full border flex items-center justify-center p-2"><ImageIcon className="h-6 w-6 text-brand-600" /></div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">cachet-entreprise.png</p>
                    <p className="text-xs text-green-600 font-semibold">Fond détouré par l'IA</p>
                  </div>
                </div>
                <button onClick={() => setCachetUrl(null)} className="text-xs text-red-500 font-semibold hover:underline">Retirer</button>
              </div>
            )}
          </div>

          <div className={`carte p-6 \${etape === 2 ? 'border-brand-500 ring-1 ring-brand-500' : 'opacity-70'}`}>
            <h2 className="text-lg font-bold flex items-center gap-2">2. Votre Signature</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Dessinez votre signature directement sur l'écran ou uploadez-la.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl h-32 flex items-center justify-center relative">
              <span className="text-slate-300 font-mono text-xl select-none absolute">Signature du Gérant</span>
              <div className="absolute bottom-2 left-4 right-4 h-px bg-slate-300"></div>
            </div>
            <button className="btn w-full mt-4" onClick={() => setEtape(3)} disabled={!cachetUrl}>Valider et tester</button>
          </div>
        </div>

        {/* Aperçu */}
        <div className="carte bg-slate-100 p-6 flex flex-col items-center justify-center min-h-[400px]">
          {etape === 3 ? (
            <div className="w-full bg-white shadow-xl p-8 border border-slate-200 relative animate-in zoom-in-95">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Aperçu Généré</div>
              <div className="h-24 bg-slate-100 rounded mb-4"></div>
              <div className="space-y-2 mb-8">
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded w-4/6"></div>
              </div>
              <div className="flex justify-end mt-12 relative">
                <div className="text-center relative">
                  <p className="text-xs font-bold text-slate-800 mb-8">LE DIRECTEUR GÉNÉRAL</p>
                  <div className="absolute -top-4 -left-8 opacity-80 mix-blend-multiply w-24 h-24 rounded-full border-4 border-blue-600 flex items-center justify-center transform -rotate-12">
                    <span className="text-blue-600 font-bold text-[8px] text-center">CACHET<br/>ENTREPRISE<br/>DAKAR</span>
                  </div>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Signature" className="h-16 relative z-10" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <FileCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Configurez votre cachet et signature pour voir l'aperçu du document final auto-signé.</p>
            </div>
          )}
          {etape === 3 && (
            <button className="btn-sec mt-6 w-full"><Download className="h-4 w-4" /> Sauvegarder dans le coffre-fort</button>
          )}
        </div>
      </div>
    </div>
  );
}
