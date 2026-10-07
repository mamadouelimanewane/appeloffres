import Link from "next/link";

export function Logo({ clair = false }: { clair?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Appeldoffres.sn, accueil">
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 shadow-lg shadow-brand-900/30">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="m9 14 2 2 4-4" />
        </svg>
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-[3px] border-white bg-or-400" />
      </span>
      <span className={`text-3xl font-black leading-none tracking-tighter ${clair ? "text-white" : "text-red-600"}`}>
        Appeldoffres<span className={clair ? "text-or-300" : "text-brand-600"}>.sn</span>
      </span>
    </Link>
  );
}
