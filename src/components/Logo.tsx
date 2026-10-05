import Link from "next/link";

export function Logo({ clair = false }: { clair?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Soumission PME, accueil">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 shadow-md shadow-brand-900/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="m9 14 2 2 4-4" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-or-400" />
      </span>
      <span className={`text-lg font-extrabold leading-none tracking-tight ${clair ? "text-white" : "text-slate-900"}`}>
        Soumission<span className={clair ? "text-or-300" : "text-brand-700"}>PME</span>
      </span>
    </Link>
  );
}
