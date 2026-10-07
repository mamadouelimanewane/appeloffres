"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, LogIn } from "lucide-react";
import { CODE_DEMO } from "@/lib/demo/base";
import { BASE_REELLE, demanderConnexion, seConnecterDemo } from "@/lib/depot";
import { BandeauDemo } from "@/components/BandeauDemo";
import { EmailEnvoye } from "@/components/EmailEnvoye";
import { TitrePage } from "@/components/ui";

export default function Connexion() {
  const routeur = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [numeroValide, setNumeroValide] = useState<string | null>(null);
  const [emailEnvoye, setEmailEnvoye] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("erreur") === "lien") setErreur("Ce lien de connexion n'est plus valable (déjà utilisé ou expiré). Demandez-en un nouveau.");
  }, []);

  async function etape1(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      const r = await demanderConnexion(identifiant);
      if (r.etape === "email-envoye") setEmailEnvoye(r.email);
      else if (r.etape === "code") setNumeroValide(r.telephone);
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  function etape2(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    try {
      seConnecterDemo(numeroValide!, code);
      routeur.push("/compte");
    } catch (err) {
      setErreur((err as Error).message);
    }
  }

  const alerte = erreur && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">{erreur}</p>;

  return (
    <>
      <TitrePage icone={LogIn} titre="Se connecter" sousTitre={BASE_REELLE ? "Avec votre adresse email : un lien de connexion, pas de mot de passe à retenir." : "Avec votre numéro de téléphone : pas de mot de passe à retenir."} />
      <div className="conteneur max-w-xl py-8">
        <div className="carte space-y-5 p-6 sm:p-8">
          {!BASE_REELLE && <BandeauDemo>Le code de connexion n&apos;est pas envoyé par SMS : utilisez le code de démonstration <b>{CODE_DEMO}</b>.</BandeauDemo>}
          {emailEnvoye ? (
            <EmailEnvoye email={emailEnvoye} onRecommencer={() => setEmailEnvoye(null)} />
          ) : !numeroValide ? (
            <form onSubmit={etape1} className="space-y-4">
              {BASE_REELLE ? (
                <label className="block text-sm font-medium text-slate-700">
                  Adresse email
                  <input className="champ mt-1.5" type="email" autoComplete="email" placeholder="vous@entreprise.sn" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} required />
                </label>
              ) : (
                <label className="block text-sm font-medium text-slate-700">
                  Téléphone
                  <input className="champ mt-1.5" type="tel" inputMode="tel" autoComplete="tel" placeholder="77 123 45 67" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} required />
                </label>
              )}
              {alerte}
              <button className="btn" type="submit" disabled={envoi}>
                {envoi ? "Envoi…" : BASE_REELLE ? "Recevoir mon lien de connexion" : "Recevoir mon code"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={etape2} className="space-y-4">
              <p className="text-sm text-slate-600">Code envoyé (simulation) au <b>{numeroValide}</b>.</p>
              <label className="block text-sm font-medium text-slate-700">
                Code à 6 chiffres
                <input className="champ mt-1.5 text-center text-lg tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
              </label>
              {alerte}
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
