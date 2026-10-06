"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, KeyRound, LogIn } from "lucide-react";
import { CODE_DEMO, demanderCode, seConnecter } from "@/lib/demo/base";
import { BandeauDemo } from "@/components/BandeauDemo";
import { TitrePage } from "@/components/ui";

export default function Connexion() {
  const routeur = useRouter();
  const [telephone, setTelephone] = useState("");
  const [numeroValide, setNumeroValide] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");

  function etape1(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    try {
      setNumeroValide(demanderCode(telephone).telephone);
    } catch (err) {
      setErreur((err as Error).message);
    }
  }

  function etape2(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    try {
      seConnecter(numeroValide!, code);
      routeur.push("/compte");
    } catch (err) {
      setErreur((err as Error).message);
    }
  }

  return (
    <>
      <TitrePage icone={LogIn} titre="Se connecter" sousTitre="Avec votre numéro de téléphone : pas de mot de passe à retenir." />
      <div className="conteneur max-w-xl py-8">
        <div className="carte space-y-5 p-6 sm:p-8">
          <BandeauDemo>Le code de connexion n&apos;est pas envoyé par SMS : utilisez le code de démonstration <b>{CODE_DEMO}</b>.</BandeauDemo>
          {!numeroValide ? (
            <form onSubmit={etape1} className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Téléphone
                <input className="champ mt-1.5" type="tel" inputMode="tel" autoComplete="tel" placeholder="77 123 45 67" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
              </label>
              {erreur && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">{erreur}</p>}
              <button className="btn" type="submit">Recevoir mon code <ArrowRight className="h-4 w-4" /></button>
            </form>
          ) : (
            <form onSubmit={etape2} className="space-y-4">
              <p className="text-sm text-slate-600">Code envoyé (simulation) au <b>{numeroValide}</b>.</p>
              <label className="block text-sm font-medium text-slate-700">
                Code à 6 chiffres
                <input className="champ mt-1.5 text-center text-lg tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
              </label>
              {erreur && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">{erreur}</p>}
              <div className="flex flex-wrap gap-2">
                <button className="btn" type="submit"><KeyRound className="h-4 w-4" /> Se connecter</button>
                <button className="btn-sec" type="button" onClick={() => { setNumeroValide(null); setCode(""); }}>Changer de numéro</button>
              </div>
            </form>
          )}
          <p className="text-sm text-slate-500">Pas encore de compte ? <Link className="font-semibold text-brand-700 hover:underline" href="/inscription">Essai gratuit</Link></p>
        </div>
      </div>
    </>
  );
}
