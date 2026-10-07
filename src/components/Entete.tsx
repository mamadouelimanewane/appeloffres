"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Building2, CalendarClock, FileLock2, FolderCheck, LogIn, Menu, Search, Sparkles, UserRound, X } from "lucide-react";
import { statutAbonnement } from "@/lib/compte";
import { useCompte } from "@/lib/depot";
import { Logo } from "./Logo";

const LIENS = [
  { href: "/appels", libelle: "Appels d'offres", icone: Search },
  { href: "/a-venir", libelle: "Marchés à venir", icone: CalendarClock },
  { href: "/qui-gagne", libelle: "Qui gagne quoi", icone: BarChart3 },
  { href: "/dossiers", libelle: "Mes dossiers", icone: FolderCheck },
  { href: "/coffre", libelle: "Mes pièces", icone: FileLock2 },
];

export function Entete() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const { compte, pret } = useCompte();
  const statut = compte ? statutAbonnement(compte, new Date()) : null;
  const actif = (href: string) => chemin === href || chemin.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md print:hidden">
      <div className="conteneur flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Navigation principale">
          {LIENS.map(({ href, libelle, icone: Icone }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                actif(href) ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icone className="h-4 w-4" aria-hidden />
              {libelle}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {pret && compte ? (
            <Link href="/compte" className={`hidden items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 ring-1 ring-slate-200 transition hover:ring-brand-300 sm:flex ${actif("/compte") ? "bg-brand-50" : "bg-white"}`}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-sm font-bold text-white">{compte.nom.charAt(0).toUpperCase()}</span>
              <span className="text-left leading-tight">
                <span className="block text-sm font-semibold text-slate-900">{compte.nom.split(" ")[0]}</span>
                <span className={`block text-[11px] font-medium ${statut!.actif ? "text-brand-700" : "text-red-600"}`}>{statut!.libelle}</span>
              </span>
            </Link>
          ) : pret ? (
            <>
              <Link href="/connexion" className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex">Connexion</Link>
              <Link href="/inscription" className="btn hidden whitespace-nowrap sm:inline-flex"><Sparkles className="h-4 w-4" aria-hidden /> Essai gratuit</Link>
            </>
          ) : null}
          <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 xl:hidden" onClick={() => setOuvert(!ouvert)} aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={ouvert}>
            {ouvert ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {ouvert && (
        <nav className="border-t border-slate-100 bg-white xl:hidden" aria-label="Navigation mobile">
          <div className="conteneur grid gap-1 py-3">
            {[...LIENS, ...(compte ? [{ href: "/compte", libelle: "Mon compte", icone: UserRound }, { href: "/profil", libelle: "Fiche entreprise", icone: Building2 }] : [{ href: "/connexion", libelle: "Connexion", icone: LogIn }, { href: "/inscription", libelle: "Essai gratuit", icone: Sparkles }])].map(({ href, libelle, icone: Icone }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOuvert(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium ${actif(href) ? "bg-brand-50 text-brand-800" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <Icone className="h-5 w-5" aria-hidden />
                {libelle}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
