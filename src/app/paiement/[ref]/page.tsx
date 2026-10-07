"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { CheckCircle2, FlaskConical, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { offre } from "@/lib/offres";
import { MOYENS, fcfaCourt, type Transaction } from "@/lib/paiement";
import { annulerPaiementSimule, confirmerPaiementSimule, transactions } from "@/lib/demo/base";

/**
 * Passerelle de paiement SIMULÉE. En production, l'utilisateur est redirigé vers
 * la page de l'agrégateur (ex. PayTech) puis revient ici ; la confirmation
 * arrive au serveur par notification signée.
 */
export default function PaiementSimule({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [t, setT] = useState<Transaction | null | undefined>(undefined);
  const [etape, setEtape] = useState<"choix" | "attente" | "fini">("choix");
  const [erreur, setErreur] = useState("");

  useEffect(() => setT(transactions().find((x) => x.ref === ref) ?? null), [ref]);

  function confirmerApresDelai() {
    setEtape("attente");
    // Simule la validation sur le téléphone du client
    setTimeout(() => {
      try {
        confirmerPaiementSimule(ref);
      } catch (err) {
        setErreur((err as Error).message);
      }
      setT(transactions().find((x) => x.ref === ref) ?? null);
      setEtape("fini");
    }, 1800);
  }

  function refuser() {
    annulerPaiementSimule(ref);
    setT(transactions().find((x) => x.ref === ref) ?? null);
    setEtape("fini");
  }

  if (t === undefined) return null;
  if (t === null) {
    return <div className="conteneur py-16 text-center text-slate-600">Transaction introuvable. <Link className="font-semibold text-brand-700" href="/abonnement">Revenir à l&apos;abonnement</Link></div>;
  }

  const couleur = t.moyen === "wave" ? "bg-sky-500" : "bg-orange-500";

  return (
    <div className="min-h-[70vh] bg-slate-100 py-10">
      <div className="mx-auto max-w-md px-4">
        <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-700">
          <FlaskConical className="h-4 w-4" /> Passerelle de paiement simulée — aucune somme prélevée
        </p>
        <div className="overflow-hidden rounded-3xl bg-white shadow-releve">
          <div className={`${couleur} px-6 py-5 text-white`}>
            <p className="text-sm opacity-90">Paiement {MOYENS[t.moyen]}</p>
            <p className="mt-1 text-3xl font-extrabold">{fcfaCourt(t.montant)}</p>
          </div>
          <div className="space-y-4 p-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Bénéficiaire</dt><dd className="font-medium">Appeldoffres.sn</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Objet</dt><dd className="font-medium">Offre {offre(t.offre).nom} · {t.mois} mois</dd></div>
              {t.codePromo && t.montantAvantRemise && (
                <div className="flex justify-between"><dt className="text-slate-500">Code promo</dt><dd className="font-medium text-brand-700">{t.codePromo} · -{fcfaCourt(t.montantAvantRemise - t.montant)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-slate-500">Numéro</dt><dd className="font-medium">{t.telephone}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Référence</dt><dd className="font-mono text-xs">{t.ref}</dd></div>
            </dl>

            {etape === "choix" && t.statut === "en_attente" && (
              <>
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  En vrai, vous valideriez maintenant le paiement sur votre téléphone ({MOYENS[t.moyen]}). Ici, choisissez l&apos;issue à simuler :
                </p>
                <button className={`btn w-full ${couleur} hover:opacity-90`} onClick={confirmerApresDelai}><ShieldCheck className="h-4 w-4" /> Simuler un paiement réussi</button>
                <button className="btn-sec w-full" onClick={refuser}>Simuler un refus</button>
              </>
            )}
            {etape === "attente" && (
              <p className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-slate-600"><Loader2 className="h-5 w-5 animate-spin" /> En attente de validation sur le téléphone…</p>
            )}
            {(etape === "fini" || t.statut !== "en_attente") && (
              t.statut === "payee" ? (
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
                  <p className="text-lg font-bold">Paiement confirmé</p>
                  <p className="text-sm text-slate-600">Votre abonnement {offre(t.offre).nom} est actif.</p>
                  <Link className="btn w-full" href="/compte">Aller à mon compte</Link>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <XCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="text-lg font-bold">Paiement non effectué</p>
                  <p className="text-sm text-slate-600">{erreur || "Aucune somme n'a été prélevée."}</p>
                  <Link className="btn-sec w-full" href="/abonnement">Réessayer</Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
