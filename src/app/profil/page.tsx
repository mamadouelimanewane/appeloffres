"use client";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";

const champs: [keyof Profil, string, "text" | "area"][] = [
  ["entreprise", "Nom de l'entreprise", "text"],
  ["ninea", "NINEA", "text"],
  ["anneesExperience", "Années d'expérience", "text"],
  ["references", "Réalisations similaires (une par ligne)", "area"],
  ["moyens", "Moyens humains et matériels", "area"],
];

const REGIONS = ["Dakar", "Thiès", "Diourbel", "Saint-Louis", "Louga", "Kaolack", "Fatick", "Kaffrine", "Kolda", "Sédhiou", "Ziguinchor", "Tambacounda", "Kédougou", "Matam"];

export default function PageProfil() {
  const [p, setP] = useLocal<Profil>("profil", PROFIL_VIDE);
  const maj = (k: keyof Profil, v: string) => setP({ ...p, [k]: v });
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Mon entreprise</h1>
      <p className="text-sm text-gray-600">Ces informations servent à rédiger vos mémoires techniques. Elles restent sur votre appareil.</p>
      <label className="block text-sm">Secteur
        <select className="champ mt-1" value={p.secteur} onChange={(e) => maj("secteur", e.target.value)}>
          {["BTP", "Fournitures", "Services", "Informatique", "Études"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="block text-sm">Région
        <select className="champ mt-1" value={p.region} onChange={(e) => maj("region", e.target.value)}>
          {REGIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      {champs.map(([k, label, type]) => (
        <label key={k} className="block text-sm">{label}
          {type === "area"
            ? <textarea className="champ mt-1" rows={4} value={p[k]} onChange={(e) => maj(k, e.target.value)} />
            : <input className="champ mt-1" value={p[k]} onChange={(e) => maj(k, e.target.value)} />}
        </label>
      ))}
      <p className="text-sm text-brand">Enregistré automatiquement.</p>
    </div>
  );
}
