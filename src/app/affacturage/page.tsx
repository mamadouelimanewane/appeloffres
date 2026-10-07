"use client";
import { useState } from "react";
import { ArrowLeft, Banknote, UploadCloud, Clock, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const FACTURES_MOCK = [
  { id: "FAC-2024-001", marche: "Fourniture de matériels informatiques - UCAD", montant: 45000000, delaiPaiementEtat: "12 mois", offresFinanciers: 3, meilleureTaux: 6, statut: "Enchères en cours" },
  { id: "FAC-2024-002", marche: "Réhabilitation de 5 salles de classe - Région de Thiès", montant: 18000000, delaiPaiementEtat: "9 mois", offresFinanciers: 2, meilleureTaux: 8, statut: "Vient de fermer" },
];

export default function Affacturage() {
  const [etape, setEtape] = useState<"liste" | "depot" | "confirmation">("liste");
  const [montant, setMontant] = useState("");

  const montantNum = parseInt(montant.replace(/\s/g, "")) || 0;
  const decote = 0.07;
  const montantRecu = montantNum * (1 - decote);

  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Banknote className="h-8 w-8 text-brand-700" />
          Marketplace d'Affacturage
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl">
          Vous avez livré un marché public ? Ne subissez plus les délais de paiement de l'État. Vendez votre facture à un financier partenaire et encaissez en <strong>48 heures</strong>.
        </p>
      </div>

      {/* Explication */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { n: "01", icone: UploadCloud, titre: "Déposez votre facture", texte: "Uploadez le Bon de Réception signé par l'acheteur public et votre facture proforma." },
          { n: "02", icone: TrendingUp, titre: "Les financiers enchérissent", texte: "Nos partenaires (banques, fonds d'investissement) proposent un taux de rachat en concurrence." },
          { n: "03", icone: Zap, titre: "Vous êtes payé en 48h", texte: "Acceptez la meilleure offre et recevez le virement dans les 48 heures ouvrables." },
        ].map(({ n, icone: Icone, titre, texte }) => (
          <div key={n} className="carte p-5 relative">
            <span className="absolute right-4 top-3 text-5xl font-extrabold text-slate-100">{n}</span>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Icone className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-bold">{titre}</h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{texte}</p>
          </div>
        ))}
      </div>

      {/* Simulateur */}
      <div className="mt-8 carte p-6 bg-brand-950 text-white">
        <h2 className="text-xl font-bold text-white">Simuler votre encaissement</h2>
        <p className="text-brand-300 text-sm mt-1">Estimez le montant que vous recevrez immédiatement.</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-200 mb-1">Montant de votre facture (FCFA)</label>
            <input
              type="text"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              placeholder="Ex: 45 000 000"
              className="champ bg-brand-900 border-brand-700 text-white placeholder:text-brand-600 w-full"
            />
          </div>
          <div className="bg-brand-900 p-4 rounded-xl border border-brand-700 min-w-52">
            <p className="text-xs text-brand-400 uppercase font-bold">Vous recevez (taux moyen 7%)</p>
            <p className="text-2xl font-extrabold text-or-400 mt-1">{montantRecu > 0 ? fcfa(montantRecu) : "—"}</p>
          </div>
        </div>
      </div>

      {/* Factures en cours */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Factures en cours de financement</h2>
          <button className="btn" onClick={() => setEtape("depot")}>
            <UploadCloud className="h-4 w-4" /> Déposer ma facture
          </button>
        </div>
        <div className="space-y-4">
          {FACTURES_MOCK.map(f => (
            <div key={f.id} className="carte p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{f.id}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.statut === "Enchères en cours" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{f.statut}</span>
                </div>
                <p className="font-bold text-slate-900 mt-2">{f.marche}</p>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Délai paiement État estimé : {f.delaiPaiementEtat}</p>
              </div>
              <div className="flex gap-6 text-center shrink-0">
                <div>
                  <p className="text-xs text-slate-500">Montant</p>
                  <p className="font-bold text-slate-800">{fcfa(f.montant)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Meilleur taux</p>
                  <p className="font-bold text-green-600">{f.meilleureTaux}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Offres</p>
                  <p className="font-bold text-slate-800">{f.offresFinanciers} financiers</p>
                </div>
                {f.statut === "Enchères en cours" && (
                  <button className="btn py-2 text-sm self-center" onClick={() => setEtape("confirmation")}>
                    <CheckCircle2 className="h-4 w-4" /> Accepter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {etape === "confirmation" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEtape("liste")}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-extrabold mt-4">Accord accepté !</h2>
            <p className="text-slate-600 mt-2">Le virement de <strong className="text-brand-700">{fcfa(45000000 * 0.94)}</strong> sera effectué sous 48h ouvrables. Vous recevrez une confirmation par email et SMS.</p>
            <button className="btn mt-6 w-full" onClick={() => setEtape("liste")}>Retour au tableau de bord</button>
          </div>
        </div>
      )}
    </div>
  );
}
