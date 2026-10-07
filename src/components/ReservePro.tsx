"use client";
import Link from "next/link";
import { Lock } from "lucide-react";
import { peutUtiliser } from "@/lib/compte";
import { useCompte } from "@/lib/depot";
import type { Fonction } from "@/lib/offres";

/** Affiche le contenu si l'abonnement le permet, sinon une invitation à l'essai ou à l'offre Pro. */
export function ReservePro({ fonction, titre, children }: { fonction: Fonction; titre: string; children: React.ReactNode }) {
  const { compte, pret } = useCompte();
  if (!pret) return null;
  if (peutUtiliser(compte, fonction, new Date())) return <>{children}</>;
  return (
    <div className="carte flex flex-col items-start gap-3 bg-gradient-to-br from-white to-brand-50/60 p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-white"><Lock className="h-5 w-5" /></span>
      <p className="text-lg font-bold">{titre}</p>
      <p className="text-sm text-slate-600">
        {compte ? "Cette fonction fait partie de l'offre Pro." : "Créez votre compte : 14 jours d'essai gratuit de l'offre Pro, sans engagement."}
      </p>
      <Link href={compte ? "/abonnement?offre=pro" : "/inscription?offre=pro"} className="btn">{compte ? "Passer à l'offre Pro" : "Essai gratuit 14 jours"}</Link>
      {!compte && <Link href="/connexion" className="text-sm font-semibold text-brand-700 hover:underline">Déjà inscrit ? Se connecter</Link>}
    </div>
  );
}
