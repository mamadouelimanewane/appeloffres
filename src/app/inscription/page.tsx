"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Gift, UserPlus } from "lucide-react";
import { SECTEURS, type Secteur } from "@/lib/data";
import { ESSAI_JOURS } from "@/lib/offres";
import { inscrire } from "@/lib/demo/base";
import { BandeauDemo } from "@/components/BandeauDemo";
import { TitrePage } from "@/components/ui";

const REGIONS = ["Dakar", "Thiès", "Diourbel", "Saint-Louis", "Louga", "Kaolack", "Fatick", "Kaffrine", "Kolda", "Sédhiou", "Ziguinchor", "Tambacounda", "Kédougou", "Matam"];

export default function Inscription() {
  const routeur = useRouter();
  const [f, setF] = useState({ nom: "", entreprise: "", telephone: "", email: "", region: "Dakar" });
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [erreur, setErreur] = useState("");
  const [offreVoulue, setOffreVoulue] = useState<string | null>(null);
  const [parrain, setParrain] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setOffreVoulue(q.get("offre"));
    setParrain(q.get("ref"));
  }, []);

  const bascule = (s: Secteur) => setSecteurs(secteurs.includes(s) ? secteurs.filter((x) => x !== s) : [...secteurs, s]);

  function valider(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (secteurs.length === 0) return setErreur("Choisissez au moins un secteur : il sert à vos alertes.");
    try {
      inscrire({ ...f, secteurs, parrain });
      routeur.push(offreVoulue ? `/abonnement?offre=${offreVoulue}` : "/compte?bienvenue=1");
    } catch (err) {
      setErreur((err as Error).message);
    }
  }

  const champ = (cle: keyof typeof f, libelle: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block text-sm font-medium text-slate-700">
      {libelle}
      <input className="champ mt-1.5" value={f[cle]} onChange={(e) => setF({ ...f, [cle]: e.target.value })} {...props} />
    </label>
  );

  return (
    <>
      <TitrePage icone={UserPlus} titre="Créer votre compte" sousTitre={`${ESSAI_JOURS} jours d'essai gratuit de l'offre Pro, sans engagement.`} />
      <div className="conteneur grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={valider} className="carte space-y-5 p-6 sm:p-8">
          <BandeauDemo />
          <div className="grid gap-5 sm:grid-cols-2">
            {champ("nom", "Votre nom", { required: true, autoComplete: "name", placeholder: "Ex. : Awa Diop" })}
            {champ("entreprise", "Entreprise", { required: true, autoComplete: "organization", placeholder: "Ex. : Diop BTP SARL" })}
            {champ("telephone", "Téléphone (WhatsApp)", { required: true, type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "77 123 45 67" })}
            {champ("email", "E-mail (facultatif)", { type: "email", autoComplete: "email" })}
            <label className="block text-sm font-medium text-slate-700">
              Région
              <select className="champ mt-1.5" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Vos secteurs d&apos;activité</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTEURS.map((s) => {
                const actif = secteurs.includes(s);
                return (
                  <button type="button" key={s} onClick={() => bascule(s)} aria-pressed={actif}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${actif ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-slate-700 ring-slate-200 hover:ring-brand-300"}`}>
                    {actif && <Check className="h-4 w-4" />} {s}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {erreur && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">{erreur}</p>}
          <button className="btn w-full sm:w-auto" type="submit">Créer mon compte <ArrowRight className="h-4 w-4" /></button>
          <p className="text-sm text-slate-500">Déjà inscrit ? <Link className="font-semibold text-brand-700 hover:underline" href="/connexion">Se connecter</Link></p>
        </form>
        <aside className="carte h-fit p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-or-50 text-or-600"><Gift className="h-5 w-5" /></span>
          <p className="mt-3 font-bold">Inclus dans l&apos;essai</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {["Alertes WhatsApp sur vos secteurs", "Marchés à venir et achats récurrents", "Prix pratiqués et concurrents", "Mémoire technique assisté"].map((p) => (
              <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={3} />{p}</li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
