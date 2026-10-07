"use client";
import { useState } from "react";
import { ArrowLeft, Network, Building2, TrendingUp, Eye, Users } from "lucide-react";
import Link from "next/link";
import { fcfa } from "@/lib/data";

const NOEUDS = [
  { id: "adie", label: "ADIE", type: "acheteur", x: 50, y: 18, taille: 70 },
  { id: "senelec", label: "SENELEC", type: "acheteur", x: 18, y: 55, taille: 90 },
  { id: "apix", label: "APIX", type: "acheteur", x: 78, y: 60, taille: 65 },
  { id: "eiffage", label: "Eiffage SN", type: "titulaire", x: 45, y: 78, taille: 80 },
  { id: "cse", label: "CSE", type: "titulaire", x: 15, y: 28, taille: 60 },
  { id: "vinci", label: "Vinci Energies", type: "titulaire", x: 80, y: 32, taille: 55 },
  { id: "cde", label: "CDE", type: "titulaire", x: 60, y: 45, taille: 50 },
  { id: "henan", label: "Henan Chine", type: "etranger", x: 88, y: 78, taille: 58 },
];

const LIENS = [
  { source: "senelec", cible: "eiffage", poids: 12, montant: 4800000000 },
  { source: "senelec", cible: "vinci", poids: 8, montant: 2100000000 },
  { source: "senelec", cible: "cse", poids: 5, montant: 950000000 },
  { source: "adie", cible: "eiffage", poids: 6, montant: 1500000000 },
  { source: "adie", cible: "cde", poids: 4, montant: 720000000 },
  { source: "apix", cible: "eiffage", poids: 9, montant: 3200000000 },
  { source: "apix", cible: "henan", poids: 7, montant: 5400000000 },
  { source: "apix", cible: "cde", poids: 3, montant: 480000000 },
];

const DETAILS: Record<string, { role: string; description: string; opportunite: string }> = {
  eiffage: {
    role: "Titulaire Dominant",
    description: "Eiffage Sénégal est l'attributaire le plus fréquent. Elle collabore avec 3 des 4 plus grands acheteurs publics.",
    opportunite: "Proposez-vous comme sous-traitant sur leur lot électricité ou plomberie. Contact : procurement.dakar@eiffage.sn"
  },
  senelec: {
    role: "Acheteur Clé",
    description: "SENELEC publie 142 marchés par an. C'est l'acheteur le plus actif du Sénégal hors État central.",
    opportunite: "Secteurs ouverts aux PME : fourniture de câbles, maintenance génératrices, déménagement équipements."
  },
  henan: {
    role: "Concurrent Étranger",
    description: "Henan capte une part croissante des grands marchés infrastructure avec financement chinois intégré.",
    opportunite: "Ces marchés sont quasi-inatteignables pour les PME locales. Concentrez-vous sur les marchés < 500M FCFA."
  },
  adie: {
    role: "Acheteur Public",
    description: "L'ADIE gère l'informatisation de l'État sénégalais. Un budget massif chaque année pour les équipements IT.",
    opportunite: "PME IT : le lot câblage réseau et maintenance est souvent dévolu à des prestataires locaux."
  },
  apix: {
    role: "Acheteur Infrastructure",
    description: "L'APIX gère les grands projets d'infrastructure. Le plus transparent du Sénégal (score 91/100).",
    opportunite: "Les lots de génie civil secondaire et signalisation sont accessibles aux PME locales."
  },
  cse: { role: "Titulaire Local", description: "CSE est un acteur local historique, souvent mandataire de groupements.", opportunite: "Associez-vous à eux sur les marchés SENELEC si vous avez une compétence spécifique." },
  vinci: { role: "Titulaire International", description: "Vinci Energies opère sur les grands lots électricité et fibre.", opportunite: "Le sous-traitance génie civil local est souvent nécessaire. Contactez leur bureau de Dakar." },
  cde: { role: "Titulaire Émergent", description: "CDE monte en puissance sur les marchés APIX et ADIE.", opportunite: "Partenaire potentiel sur les lots informatique si vous avez l'agrément." },
};
const DEFAULT_DETAIL = { role: "Acteur de marché", description: "Cliquez sur un nœud du graphe pour afficher les détails et les opportunités de partenariat pour cet acteur.", opportunite: "" };

export default function ReseauInfluence() {
  const [selected, setSelected] = useState<string | null>(null);

  const noeudSelectionne = NOEUDS.find(n => n.id === selected);
  const detail = selected ? (DETAILS[selected] ?? DEFAULT_DETAIL) : DEFAULT_DETAIL;
  const liensSelectionne = LIENS.filter(l => l.source === selected || l.cible === selected);

  const getColor = (type: string) => {
    if (type === "acheteur") return { fill: "#1e4d8c" };
    if (type === "titulaire") return { fill: "#1f9263" };
    return { fill: "#c84b31" };
  };

  return (
    <div className="conteneur py-8 max-w-6xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Network className="h-8 w-8 text-brand-700" />
          Réseau d&apos;Influence &amp; Partenariats
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          Cartographie en temps réel des relations entre acheteurs publics et attributaires. Identifiez les leaders, détectez les opportunités de sous-traitance et évitez les segments dominés par des géants étrangers.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 mb-4">
        {[
          { label: "Acheteur Public", color: "bg-blue-800" },
          { label: "Titulaire Local", color: "bg-brand-700" },
          { label: "Concurrent Étranger", color: "bg-red-700" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className={`h-3 w-3 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* SVG Network */}
        <div className="md:col-span-2 carte p-4">
          <svg viewBox="0 0 100 100" className="w-full h-[450px]">
            {LIENS.map((l, i) => {
              const src = NOEUDS.find(n => n.id === l.source)!;
              const dst = NOEUDS.find(n => n.id === l.cible)!;
              const isActive = selected === l.source || selected === l.cible;
              return (
                <line
                  key={i}
                  x1={src.x} y1={src.y}
                  x2={dst.x} y2={dst.y}
                  stroke={isActive ? "#1f9263" : "#cbd5e1"}
                  strokeWidth={isActive ? (l.poids / 5) : (l.poids / 12)}
                  strokeOpacity={isActive ? 0.9 : 0.5}
                />
              );
            })}
            {NOEUDS.map(n => {
              const { fill } = getColor(n.type);
              const isSelected = selected === n.id;
              const r = n.taille / 20;
              return (
                <g key={n.id} onClick={() => setSelected(selected === n.id ? null : n.id)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={n.x} cy={n.y}
                    r={isSelected ? r * 1.3 : r}
                    fill={fill}
                    opacity={selected && !isSelected ? 0.35 : 1}
                    stroke={isSelected ? "#f2b100" : "white"}
                    strokeWidth={isSelected ? 0.8 : 0.3}
                  />
                  <text
                    x={n.x} y={n.y + 0.4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={isSelected ? "2.8" : "2.2"}
                    fontWeight="bold"
                    style={{ userSelect: "none" }}
                  >
                    {n.label.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-center text-slate-400 mt-2">Cliquez sur un acteur pour explorer ses connexions — Épaisseur du lien = volume financier</p>
        </div>

        {/* Panneau détails */}
        <div className="space-y-4">
          <div className="carte p-5">
            {noeudSelectionne ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{noeudSelectionne.label}</h3>
                    <span className="text-xs font-bold text-brand-600 uppercase">{detail.role}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{detail.description}</p>
                {detail.opportunite && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-green-800 uppercase mb-1">💡 Opportunité PME</p>
                    <p className="text-sm text-green-700">{detail.opportunite}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Eye className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Cliquez sur un nœud du graphe pour voir les détails</p>
              </div>
            )}
          </div>

          {liensSelectionne.length > 0 && (
            <div className="carte p-5">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-brand-600" /> Relations ({liensSelectionne.length})</h4>
              <div className="space-y-2">
                {liensSelectionne.map((l, i) => {
                  const autre = l.source === selected ? NOEUDS.find(n => n.id === l.cible) : NOEUDS.find(n => n.id === l.source);
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{autre?.label}</span>
                      <span className="text-brand-700 font-bold text-xs">{fcfa(l.montant)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="carte p-5 bg-slate-50">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><Users className="h-4 w-4" /> Statistiques Réseau</h4>
            <ul className="text-sm space-y-2 text-slate-700">
              <li className="flex justify-between"><span>Acheteurs cartographiés</span><strong>3</strong></li>
              <li className="flex justify-between"><span>Titulaires analysés</span><strong>5</strong></li>
              <li className="flex justify-between"><span>Marchés modélisés</span><strong>8</strong></li>
              <li className="flex justify-between"><span>Budget total observé</span><strong>19,1 Mds FCFA</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
