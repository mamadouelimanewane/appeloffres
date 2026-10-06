import Link from "next/link";
import { Logo } from "./Logo";

export function PiedDePage() {
  return (
    <footer className="mt-20 bg-brand-950 text-brand-100/80 print:hidden">
      <div className="conteneur grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo clair />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            L&apos;assistant des PME sénégalaises pour trouver les marchés publics, préparer des dossiers complets et
            remporter plus d&apos;appels d&apos;offres.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Le service</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/appels">Appels d&apos;offres ouverts</Link></li>
            <li><Link className="hover:text-white" href="/a-venir">Marchés à venir</Link></li>
            <li><Link className="hover:text-white" href="/qui-gagne">Qui gagne quoi</Link></li>
            <li><Link className="hover:text-white" href="/dossiers">Mes dossiers</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Sources officielles</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Portail des marchés publics (DCMP, archives)</li>
            <li>Senelec · AGEROUTE · ARTP</li>
            <li>Port Autonome de Dakar · BCEAO</li>
            <li>Banque mondiale · Nations unies (UNGM)</li>
            <li>ONG (plate-forme PFONGUE)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="conteneur flex flex-col gap-2 py-6 text-xs text-brand-100/60 md:flex-row md:justify-between">
          <p>© 2026 Soumission PME · Dakar, Sénégal</p>
          <p className="max-w-2xl md:text-right">
            Avis collectés automatiquement sur les sites officiels. L&apos;avis officiel fait foi : vérifiez toujours les pièces exigées dans le dossier d&apos;appel d&apos;offres.
          </p>
        </div>
      </div>
    </footer>
  );
}
