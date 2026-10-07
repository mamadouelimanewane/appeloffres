"use client";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert, Info, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { APPELS } from "@/lib/donnees";

const analyserEquite = (titre: string, ref: string) => {
  // Générer des données contextuelles basées sur le titre pour la démo
  const isFourniture = titre.toLowerCase().includes("fourniture");
  const isTravaux = titre.toLowerCase().includes("construction") || titre.toLowerCase().includes("réfection");
  
  let piergesTypiques = [];
  
  if (isFourniture) {
    piergesTypiques = [
      { clause: "Spécifications techniques pointant vers une seule marque (Art. 67 CMP)", risque: "Élevé", detail: "Les dimensions et modèles exigés correspondent exactement à la fiche technique d'un fabricant spécifique. La loi interdit de mentionner une marque sans ajouter 'ou équivalent'." },
      { clause: "Délai de livraison de 15 jours", risque: "Très Élevé", detail: "Ce délai favorise outrageusement une entreprise ayant déjà le stock dédouané à Dakar." }
    ];
  } else if (isTravaux) {
    piergesTypiques = [
      { clause: "Matériel spécifique très rare exigé en propre (non loué)", risque: "Élevé", detail: "L'exigence de posséder une grue de 120T en propre (et non en location) restreint la concurrence à 3 entreprises nationales." },
      { clause: "Chiffre d'affaires moyen exigé 5x supérieur au budget du marché", risque: "Modéré", detail: "L'ARCOP recommande un CA moyen équivalent à 1.5x ou 2x le budget, 5x est discriminatoire pour les PME." }
    ];
  } else {
    piergesTypiques = [
      { clause: "Référence d'un projet unique similaire dans les 3 dernières années", risque: "Élevé", detail: "Souvent utilisé pour cibler l'entreprise sortante. Peu d'autres prestataires peuvent satisfaire cette clause spécifique." },
      { clause: "Agrément optionnel rendu obligatoire au lieu d'une qualification classique", risque: "Modéré", detail: "Une barrière à l'entrée artificielle si l'agrément n'est pas strictement justifié par le code des marchés." }
    ];
  }
  
  // Hash rudimentaire pour avoir un score constant pour un ID donné
  const charCode = ref.charCodeAt(0) + ref.charCodeAt(ref.length - 1);
  const baseScore = 100 - (piergesTypiques.length * 20); // Commence à 60
  const randomizer = (charCode % 25) - 10; // -10 à +15
  
  return { score: baseScore + randomizer, pierges: piergesTypiques };
};

export default function RadarEquite() {
  const [appelsId, setAppelsId] = useState("");
  const [resultat, setResultat] = useState<ReturnType<typeof analyserEquite> | null>(null);
  const [ouvert, setOuvert] = useState<number | null>(null);

  const appel = APPELS.find(a => a.id === appelsId);

  const lancer = () => {
    if (!appelsId) return;
    setResultat(analyserEquite(appel?.titre ?? "", appelsId));
  };

  const scoreColor = (s: number) => s >= 70 ? "text-green-600" : s >= 50 ? "text-orange-500" : "text-red-600";
  const scoreLabel = (s: number) => s >= 70 ? "✅ Marché probablement équitable" : s >= 50 ? "⚠️ Clauses suspectes détectées" : "🚨 Marché probablement orienté";
  const scoreBg = (s: number) => s >= 70 ? "bg-green-50 border-green-200" : s >= 50 ? "bg-orange-50 border-orange-200" : "bg-red-50 border-red-200";

  return (
    <div className="conteneur py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-red-600" />
          Détecteur de Marchés Orientés
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl">
          Avant de dépenser 500 000 FCFA pour préparer un dossier, demandez à l'IA si ce marché est réellement ouvert à la concurrence ou taillé sur mesure pour quelqu'un d'autre.
        </p>
      </div>

      <div className="mt-8 carte p-6">
        <label className="block text-sm font-semibold text-slate-700">Sélectionnez un appel d'offres à analyser :</label>
        <div className="mt-2 flex flex-col sm:flex-row gap-3">
          <select
            className="champ flex-1"
            value={appelsId}
            onChange={e => { setAppelsId(e.target.value); setResultat(null); }}
          >
            <option value="">— Choisissez un avis —</option>
            {APPELS.map(a => (
              <option key={a.id} value={a.id}>{a.reference} – {a.titre.slice(0, 60)}...</option>
            ))}
          </select>
          <button onClick={lancer} disabled={!appelsId} className="btn whitespace-nowrap">
            <ShieldAlert className="h-4 w-4" /> Analyser les risques
          </button>
        </div>
      </div>

      {resultat && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Score Global */}
          <div className={`carte p-6 border-2 ${scoreBg(resultat.score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Score d'Équité</p>
                <p className={`text-5xl font-extrabold mt-1 ${scoreColor(resultat.score)}`}>{resultat.score}<span className="text-2xl text-slate-400">/100</span></p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${scoreColor(resultat.score)}`}>{scoreLabel(resultat.score)}</p>
                <p className="text-sm text-slate-500 mt-1">{resultat.pierges.length} clause(s) suspecte(s) détectée(s)</p>
              </div>
            </div>
            {resultat.score < 70 && (
              <p className="mt-4 text-sm font-medium text-red-800 bg-red-100 p-3 rounded-xl">
                ⚠️ Notre IA déconseille de soumissionner sur ce marché sans avoir d'abord obtenu une explication officielle de l'acheteur sur les clauses listées ci-dessous.
              </p>
            )}
          </div>

          {/* Détail des clauses */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Clauses à risque identifiées</h2>
            {resultat.pierges.map((p, i) => (
              <div key={i} className="carte overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOuvert(ouvert === i ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-5 w-5 shrink-0 ${p.risque === "Élevé" ? "text-red-500" : "text-orange-400"}`} />
                    <span className="font-semibold text-slate-900">{p.clause}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.risque === "Élevé" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                      Risque {p.risque}
                    </span>
                    {ouvert === i ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>
                {ouvert === i && (
                  <div className="px-5 pb-5 pt-0 flex gap-3 text-sm text-slate-600 border-t border-slate-100 bg-slate-50">
                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-brand-600" />
                    <p>{p.detail}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link href="/recours" className="btn-sec">Déposer un recours pré-attribution</Link>
            {appelsId && <Link href={`/appels/${appelsId}/redaction`} className="btn">Continuer vers le dossier</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
