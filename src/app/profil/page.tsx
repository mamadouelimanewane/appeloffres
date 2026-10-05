"use client";
import { Building2, CheckCircle2, Lock } from "lucide-react";
import { SECTEURS } from "@/lib/data";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";
import { TitrePage } from "@/components/ui";

const REGIONS = ["Dakar", "Thiès", "Diourbel", "Saint-Louis", "Louga", "Kaolack", "Fatick", "Kaffrine", "Kolda", "Sédhiou", "Ziguinchor", "Tambacounda", "Kédougou", "Matam"];

const ZONES: { cle: keyof Profil; libelle: string; aide: string }[] = [
  { cle: "references", libelle: "Réalisations similaires", aide: "Une par ligne : client, objet, montant, année." },
  { cle: "moyens", libelle: "Moyens humains et matériels", aide: "Effectif, qualifications clés, matériel, véhicules…" },
];

export default function PageProfil() {
  const [p, setP] = useLocal<Profil>("profil", PROFIL_VIDE);
  const maj = (k: keyof Profil, v: string) => setP({ ...p, [k]: v });
  const remplis = (Object.keys(PROFIL_VIDE) as (keyof Profil)[]).filter((k) => p[k].trim()).length;
  const total = Object.keys(PROFIL_VIDE).length;

  return (
    <>
      <TitrePage icone={Building2} titre="Mon entreprise" sousTitre="Ces informations servent à préparer vos dossiers et à rédiger vos mémoires techniques.">
        <span className="puce bg-white px-3 py-1.5 text-sm text-slate-700 shadow-doux ring-1 ring-slate-200">
          <CheckCircle2 className="h-4 w-4 text-brand-600" /> Profil complété : {remplis}/{total}
        </span>
      </TitrePage>
      <div className="conteneur grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        <section className="carte p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Nom de l&apos;entreprise
              <input className="champ mt-1.5" value={p.entreprise} onChange={(e) => maj("entreprise", e.target.value)} placeholder="Ex. : Bâtir Sénégal SARL" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Secteur principal
              <select className="champ mt-1.5" value={p.secteur} onChange={(e) => maj("secteur", e.target.value)}>
                {SECTEURS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Région
              <select className="champ mt-1.5" value={p.region} onChange={(e) => maj("region", e.target.value)}>
                {REGIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              NINEA
              <input className="champ mt-1.5" value={p.ninea} onChange={(e) => maj("ninea", e.target.value)} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Années d&apos;expérience
              <input className="champ mt-1.5" inputMode="numeric" value={p.anneesExperience} onChange={(e) => maj("anneesExperience", e.target.value)} />
            </label>
            {ZONES.map(({ cle, libelle, aide }) => (
              <label key={cle} className="block text-sm font-medium text-slate-700 sm:col-span-2">
                {libelle}
                <span className="ml-2 font-normal text-slate-400">{aide}</span>
                <textarea className="champ mt-1.5" rows={5} value={p[cle]} onChange={(e) => maj(cle, e.target.value)} />
              </label>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-brand-700"><CheckCircle2 className="h-4 w-4" /> Enregistré automatiquement</p>
        </section>
        <aside className="space-y-4">
          <div className="carte p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Lock className="h-5 w-5" /></span>
            <p className="mt-3 font-bold">Vos données restent chez vous</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">Le profil est enregistré sur cet appareil uniquement. Il n&apos;est envoyé que lorsque vous demandez un brouillon de mémoire technique.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
