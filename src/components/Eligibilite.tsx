"use client";
import Link from "next/link";
import { CheckCircle2, CircleHelp, Gauge, Info, XCircle } from "lucide-react";
import { evaluerEligibilite, lireNombre, type StatutCritere } from "@/lib/eligibilite";
import type { Exigences } from "@/lib/ia/extraction";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";

const STYLE = {
  vert: { bandeau: "bg-brand-50 ring-brand-200 text-brand-900", pastille: "bg-brand-600" },
  orange: { bandeau: "bg-or-50 ring-or-100 text-or-700", pastille: "bg-or-500" },
  rouge: { bandeau: "bg-red-50 ring-red-200 text-red-800", pastille: "bg-red-500" },
  inconnu: { bandeau: "bg-slate-50 ring-slate-200 text-slate-700", pastille: "bg-slate-400" },
};

const ICONE: Record<StatutCritere, React.ReactNode> = {
  ok: <CheckCircle2 className="h-5 w-5 text-brand-600" />,
  manque: <XCircle className="h-5 w-5 text-red-500" />,
  a_renseigner: <CircleHelp className="h-5 w-5 text-or-500" />,
  a_verifier: <Info className="h-5 w-5 text-slate-400" />,
};

export function Eligibilite({ exigences }: { exigences: Exigences | undefined }) {
  const [p, , pret] = useLocal<Profil>("profil", PROFIL_VIDE);
  if (!pret) return null;
  const verdict = evaluerEligibilite(exigences, {
    chiffreAffairesFcfa: lireNombre(p.chiffreAffaires),
    capaciteCreditFcfa: lireNombre(p.capaciteCredit),
    marchesSimilaires: lireNombre(p.marchesSimilaires),
    anneesExperience: lireNombre(p.anneesExperience),
  });
  const s = STYLE[verdict.couleur];

  return (
    <section className="carte overflow-hidden">
      <div className={`flex items-center gap-3 px-6 py-4 ring-1 ring-inset ${s.bandeau}`}>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ${s.pastille}`}><Gauge className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Ce marché est-il pour moi ?</p>
          <p className="font-bold">{verdict.titre}</p>
        </div>
      </div>
      {verdict.criteres.length > 0 && (
        <ul className="divide-y divide-slate-100 px-6">
          {verdict.criteres.map((c) => (
            <li key={c.libelle} className="flex gap-3 py-3">
              <span className="mt-0.5 shrink-0">{ICONE[c.statut]}</span>
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-slate-900">{c.libelle}</p>
                <p className="text-slate-600">Exigé : {c.exige}{c.possede ? ` · Vous : ${c.possede}` : ""}</p>
                {c.conseil && c.statut !== "ok" && <p className="mt-0.5 text-xs text-slate-500">{c.conseil}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
        {verdict.couleur === "inconnu" && !exigences && <span>Les conditions apparaîtront quand l&apos;avis aura été lu par l&apos;IA.</span>}
        <Link href="/profil" className="font-semibold text-brand-700 hover:underline">Mettre à jour mes capacités</Link>
        {verdict.couleur === "rouge" && <Link href="/groupements" className="font-semibold text-brand-700 hover:underline">Trouver un partenaire de groupement</Link>}
        <span className="ml-auto">Conditions lues dans l&apos;avis par IA : vérifiez dans le DAO.</span>
      </div>
    </section>
  );
}
