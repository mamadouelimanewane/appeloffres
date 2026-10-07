"use client";
import { useState } from "react";
import { ArrowLeft, Banknote, CheckCircle2, Clock, Shield, Smartphone, Zap, FileCheck } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const ETAPES = [
  { n: "01", icone: FileCheck, titre: "Renseignez le marché", desc: "Entrez la référence de l'appel d'offres et le pourcentage de caution exigé (1% à 3% du budget)." },
  { n: "02", icone: Smartphone, titre: "Payez via Wave ou OM", desc: "Recevez un lien de paiement sécurisé. Réglez les frais de dossier (1.5% du montant) depuis votre mobile." },
  { n: "03", icone: CheckCircle2, titre: "Recevez l'attestation en 2 min", desc: "Votre attestation de garantie de soumission numérique, signée par notre partenaire bancaire, arrive par email et SMS." },
];

const PARTENAIRES = ["Orabank Sénégal", "CNCAS", "Ecobank", "Banque de Dakar"];

export default function CautionExpress() {
  const [budget, setBudget] = useState(50000000);
  const [pourcentage, setPourcentage] = useState(2);
  const [step, setStep] = useState<"form" | "paiement" | "succes">("form");
  const [mode, setMode] = useState<"wave" | "om">("wave");

  const montantCaution = budget * (pourcentage / 100);
  const fraisDossier = montantCaution * 0.015;

  return (
    <div className="conteneur py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Shield className="h-8 w-8 text-brand-700" />
          Caution de Soumission Express
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          Obtenez votre <strong>garantie de soumission bancaire</strong> en moins de 2 minutes, depuis votre téléphone. Payez les frais via Wave ou Orange Money. Aucun déplacement en banque.
        </p>
      </div>

      {/* Étapes */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {ETAPES.map(({ n, icone: Icone, titre, desc }) => (
          <div key={n} className="carte p-5 relative">
            <span className="absolute right-4 top-3 text-4xl font-extrabold text-slate-100">{n}</span>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Icone className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-bold text-slate-900">{titre}</h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        {step === "form" && (
          <>
            <div className="carte p-6 space-y-5">
              <h2 className="text-xl font-bold">Simuler ma caution</h2>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Budget du marché (FCFA)</label>
                <input
                  type="number"
                  className="champ w-full text-lg font-bold"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pourcentage de caution exigé</label>
                <div className="flex gap-3">
                  {[1, 2, 3].map(p => (
                    <button
                      key={p}
                      onClick={() => setPourcentage(p)}
                      className={`flex-1 rounded-xl py-3 font-black text-lg border-2 transition ${pourcentage === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mode de paiement des frais</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode("wave")}
                    className={`border-2 rounded-xl p-3 flex items-center gap-2 font-bold text-sm transition ${mode === "wave" ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    <Smartphone className="h-5 w-5" /> Wave
                  </button>
                  <button
                    onClick={() => setMode("om")}
                    className={`border-2 rounded-xl p-3 flex items-center gap-2 font-bold text-sm transition ${mode === "om" ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}
                  >
                    <Smartphone className="h-5 w-5" /> Orange Money
                  </button>
                </div>
              </div>
            </div>

            {/* Résumé */}
            <div className="space-y-6">
              <div className="bg-brand-950 text-white rounded-2xl p-6 shadow-xl">
                <h2 className="text-brand-200 font-semibold uppercase tracking-wider text-sm mb-4">Votre Caution</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-200 text-sm">Montant de la caution</span>
                    <span className="font-black text-xl">{fcfa(montantCaution)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-3">
                    <span className="text-brand-200 text-sm">Frais de dossier (1.5%)</span>
                    <span className="font-bold text-lg text-or-300">{fcfa(fraisDossier)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-3">
                    <span className="text-brand-200 text-sm flex items-center gap-1"><Clock className="h-4 w-4" /> Délai</span>
                    <span className="font-black text-green-400 text-xl flex items-center gap-1"><Zap className="h-4 w-4" /> &lt; 2 minutes</span>
                  </div>
                </div>
                <button onClick={() => setStep("paiement")} className="btn-or mt-6 w-full py-4 justify-center text-base">
                  Obtenir ma caution via {mode === "wave" ? "Wave" : "Orange Money"}
                </button>
              </div>

              <div className="carte p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Établissements partenaires</p>
                <div className="flex flex-wrap gap-2">
                  {PARTENAIRES.map(p => <span key={p} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">{p}</span>)}
                </div>
              </div>
            </div>
          </>
        )}

        {step === "paiement" && (
          <div className="md:col-span-2 carte p-8 text-center">
            <div className={`inline-flex h-20 w-20 place-items-center rounded-full ${mode === "wave" ? "bg-blue-100" : "bg-orange-100"} mb-4 mx-auto items-center justify-center`}>
              <Smartphone className={`h-10 w-10 ${mode === "wave" ? "text-blue-600" : "text-orange-600"}`} />
            </div>
            <h2 className="text-2xl font-black">Paiement en attente</h2>
            <p className="text-slate-600 mt-2 mb-6">Un message {mode === "wave" ? "Wave" : "Orange Money"} a été envoyé au <strong>+221 7X XXX XX XX</strong>.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-sm mx-auto">
              <p className="font-mono font-black text-3xl text-slate-900">{fcfa(fraisDossier)}</p>
              <p className="text-sm text-slate-500 mt-1">à payer via {mode === "wave" ? "Wave" : "Orange Money"}</p>
            </div>
            <p className="mt-4 text-sm text-slate-500 animate-pulse">⏳ En attente de confirmation de paiement...</p>
            <button onClick={() => setStep("succes")} className="mt-6 btn">
              ✅ Simuler le paiement reçu
            </button>
          </div>
        )}

        {step === "succes" && (
          <div className="md:col-span-2 carte p-8 text-center border-2 border-green-300 bg-green-50">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-green-800">Caution émise !</h2>
            <p className="text-green-700 mt-2 text-lg">Votre attestation de garantie de soumission est prête.</p>
            <div className="mt-6 bg-white border border-green-200 rounded-2xl p-6 max-w-md mx-auto text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Référence caution</span><strong>CAU-2026-08421</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Montant garanti</span><strong>{fcfa(montantCaution)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Émetteur</span><strong>Orabank Sénégal</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Validité</span><strong>90 jours</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Signature</span><strong className="text-green-600">✅ Numérique (eIDAS)</strong></div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button className="btn-or py-3 px-8"><Banknote className="h-5 w-5" /> Télécharger le PDF</button>
              <Link href="/dossiers" className="btn-sec py-3 px-8">Ajouter à mon dossier</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
