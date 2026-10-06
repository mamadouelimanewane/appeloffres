"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, CreditCard, Smartphone } from "lucide-react";
import { statutAbonnement } from "@/lib/compte";
import { OFFRES, type CodeOffre } from "@/lib/offres";
import { MOYENS, fcfaCourt, montant, type MoyenPaiement } from "@/lib/paiement";
import { demanderPaiement, useCompte } from "@/lib/demo/base";
import { BandeauDemo } from "@/components/BandeauDemo";
import { TitrePage } from "@/components/ui";

const DUREES = [
  { mois: 1, libelle: "1 mois" },
  { mois: 3, libelle: "3 mois" },
  { mois: 12, libelle: "12 mois", remise: "2 mois offerts" },
];

export default function Abonnement() {
  const routeur = useRouter();
  const { compte, pret } = useCompte();
  const [code, setCode] = useState<CodeOffre>("pro");
  const [mois, setMois] = useState(1);
  const [moyen, setMoyen] = useState<MoyenPaiement>("wave");
  const [telephone, setTelephone] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get("offre");
    if (o === "veille" || o === "pro") setCode(o);
  }, []);
  useEffect(() => { if (compte) setTelephone(compte.telephone.replace("+221", "")); }, [compte]);

  function payer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    try {
      routeur.push(demanderPaiement({ offre: code, mois, moyen, telephone }).urlPaiement);
    } catch (err) {
      setErreur((err as Error).message);
    }
  }

  const statut = compte ? statutAbonnement(compte, new Date()) : null;

  return (
    <>
      <TitrePage icone={CreditCard} titre="Choisir mon abonnement" sousTitre="Paiement par Wave ou Orange Money. Sans engagement : vous payez pour la durée choisie." />
      <div className="conteneur py-8">
        <BandeauDemo>Le paiement est simulé : aucune somme ne sera prélevée.</BandeauDemo>
        {pret && !compte && (
          <div className="carte mt-6 flex flex-col items-start gap-3 p-6">
            <p className="font-semibold">Créez d&apos;abord votre compte (essai gratuit inclus), ou connectez-vous.</p>
            <div className="flex flex-wrap gap-2">
              <Link className="btn" href={`/inscription?offre=${code}`}>Créer mon compte <ArrowRight className="h-4 w-4" /></Link>
              <Link className="btn-sec" href="/connexion">Se connecter</Link>
            </div>
          </div>
        )}
        {statut && (
          <p className="mt-6 text-sm text-slate-600">
            Abonnement actuel : <b>{statut.libelle}</b>
            {statut.actif && ` — encore ${statut.joursRestants + 1} jour(s)`}
          </p>
        )}

        <form onSubmit={payer} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {OFFRES.map((o) => (
                <button type="button" key={o.code} onClick={() => setCode(o.code)} aria-pressed={code === o.code}
                  className={`carte p-6 text-left transition ${code === o.code ? "ring-2 ring-brand-600" : "hover:ring-1 hover:ring-brand-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{o.nom}</span>
                    {o.vedette && <span className="puce bg-or-100 text-or-700">Recommandé</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{o.detail}</p>
                  <p className="mt-4 text-2xl font-extrabold">{fcfaCourt(o.prixMensuel)}<span className="text-sm font-medium text-slate-500"> / mois</span></p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {o.points.map((p) => <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={3} />{p}</li>)}
                  </ul>
                </button>
              ))}
            </div>
            <fieldset className="carte p-6">
              <legend className="font-semibold">Durée</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {DUREES.map((d) => (
                  <button type="button" key={d.mois} onClick={() => setMois(d.mois)} aria-pressed={mois === d.mois}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition ${mois === d.mois ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-slate-700 ring-slate-200"}`}>
                    {d.libelle}{d.remise && <span className={`ml-2 text-xs ${mois === d.mois ? "text-or-300" : "text-brand-700"}`}>{d.remise}</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className="carte h-fit space-y-5 p-6">
            <p className="font-semibold">Paiement</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MOYENS) as MoyenPaiement[]).map((m) => (
                <button type="button" key={m} onClick={() => setMoyen(m)} aria-pressed={moyen === m}
                  className={`rounded-xl px-3 py-3 text-sm font-bold ring-1 transition ${moyen === m ? (m === "wave" ? "bg-sky-500 text-white ring-sky-500" : "bg-orange-500 text-white ring-orange-500") : "bg-white text-slate-700 ring-slate-200"}`}>
                  {MOYENS[m]}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Numéro {MOYENS[moyen]}
              <div className="relative mt-1.5">
                <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="champ pl-10" type="tel" inputMode="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="77 123 45 67" required />
              </div>
            </label>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-2xl font-extrabold">{fcfaCourt(montant(code, mois))}</span>
            </div>
            {erreur && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">{erreur}</p>}
            <button className="btn w-full" type="submit" disabled={!compte}>Payer avec {MOYENS[moyen]} <ArrowRight className="h-4 w-4" /></button>
          </aside>
        </form>
      </div>
    </>
  );
}
