import type { LucideIcon } from "lucide-react";
import { CalendarX2, Clock, Hourglass } from "lucide-react";
import type { Secteur } from "@/lib/data";

/** Bandeau de titre commun aux pages intérieures. */
export function TitrePage({ icone: Icone, titre, sousTitre, children }: { icone: LucideIcon; titre: string; sousTitre?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50/80 to-slate-50">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" aria-hidden />
      <div className="conteneur relative py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-700 shadow-doux ring-1 ring-brand-100">
              <Icone className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">{titre}</h1>
              {sousTitre && <div className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{sousTitre}</div>}
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

const COULEURS_SECTEUR: Record<Secteur, string> = {
  BTP: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Fournitures: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  Services: "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
  Informatique: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200",
  Études: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
};

export function BadgeSecteur({ secteur }: { secteur: Secteur }) {
  return <span className={`puce ${COULEURS_SECTEUR[secteur]}`}>{secteur}</span>;
}

/** Pastille d'échéance : couleur selon l'urgence. */
export function Echeance({ jours, texte }: { jours: number | null; texte: string }) {
  if (jours === null) return <span className="puce bg-slate-100 text-slate-600"><Clock className="h-3.5 w-3.5" aria-hidden />{texte}</span>;
  if (jours < 0) return <span className="puce bg-red-50 text-red-700 ring-1 ring-red-200"><CalendarX2 className="h-3.5 w-3.5" aria-hidden />{texte}</span>;
  const urgent = jours <= 7;
  return (
    <span className={`puce ${urgent ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200" : "bg-brand-50 text-brand-800 ring-1 ring-brand-200"}`}>
      <Hourglass className="h-3.5 w-3.5" aria-hidden />
      {texte}
    </span>
  );
}

export function Barre({ valeur }: { valeur: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500" style={{ width: `${valeur}%` }} />
    </div>
  );
}

export function Vide({ children }: { children: React.ReactNode }) {
  return <div className="carte grid place-items-center px-6 py-14 text-center text-sm text-slate-500">{children}</div>;
}
