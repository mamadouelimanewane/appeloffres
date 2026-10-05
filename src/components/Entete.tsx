"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Building2, CalendarClock, FolderCheck, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";

const LIENS = [
  { href: "/appels", libelle: "Appels d'offres", icone: Search },
  { href: "/a-venir", libelle: "Marchés à venir", icone: CalendarClock },
  { href: "/qui-gagne", libelle: "Qui gagne quoi", icone: BarChart3 },
  { href: "/dossiers", libelle: "Mes dossiers", icone: FolderCheck },
];

export function Entete() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
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
          <Link href="/profil" className={`btn hidden whitespace-nowrap sm:inline-flex ${actif("/profil") ? "ring-4 ring-brand-500/20" : ""}`}>
            <Building2 className="h-4 w-4" aria-hidden />
            Mon entreprise
          </Link>
          <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 xl:hidden" onClick={() => setOuvert(!ouvert)} aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={ouvert}>
            {ouvert ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {ouvert && (
        <nav className="border-t border-slate-100 bg-white xl:hidden" aria-label="Navigation mobile">
          <div className="conteneur grid gap-1 py-3">
            {[...LIENS, { href: "/profil", libelle: "Mon entreprise", icone: Building2 }].map(({ href, libelle, icone: Icone }) => (
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
