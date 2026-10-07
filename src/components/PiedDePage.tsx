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
            <li><Link className="hover:text-white" href="/prix-conseille">Estimateur de prix</Link></li>
            <li><Link className="hover:text-white" href="/bpu">Auto-Remplissage BPU</Link></li>
            <li><Link className="hover:text-white" href="/fournisseurs">Sourcing & Fournisseurs</Link></li>
            <li><Link className="hover:text-white" href="/concurrents">Veille concurrentielle</Link></li>
            <li><Link className="hover:text-white" href="/bourse-sous-traitance">Bourse de Sous-traitance</Link></li>
            <li><Link className="hover:text-white" href="/annuaire">Annuaire des PME</Link></li>
            <li><Link className="hover:text-white" href="/recours">Guide des recours (ARCOP)</Link></li>
            <li><Link className="hover:text-white" href="/dossiers">Mes dossiers</Link></li>
            <li><Link className="hover:text-white" href="/signature">✍️ Signature & Cachet Numérique</Link></li>
            <li><Link className="hover:text-white" href="/execution">🏗️ Suivi d'Exécution & Pénalités</Link></li>
            <li><Link className="hover:text-white" href="/academy">🎓 Soumission Academy (Formation)</Link></li>
            <li><Link className="hover:text-white" href="/guide-appel">S&apos;inscrire sur APPEL</Link></li>
            <li><Link className="hover:text-white" href="/financement">Cautions et financement</Link></li>
            <li><Link className="hover:text-white" href="/whatsapp">Assistant WhatsApp</Link></li>
            <li><Link className="hover:text-white" href="/cabinet">Espace Cabinet</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Outils Avancés</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/score-equite">🚩 Détecteur de marchés orientés</Link></li>
            <li><Link className="hover:text-white" href="/affacturage">💸 Marketplace d&apos;Affacturage</Link></li>
            <li><Link className="hover:text-white" href="/radar-predictif">🔮 Radar Prédictif (Loi de Finances)</Link></li>
            <li><Link className="hover:text-white" href="/groupement">🤝 Générateur d&apos;Actes de Groupement</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Sources couvertes</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Portail des marchés publics (DCMP, archives)</li>
            <li>Senelec · AGEROUTE · ARTP</li>
            <li>Port Autonome de Dakar · BCEAO</li>
            <li>Banque mondiale · Nations unies (UNGM)</li>
            <li>ONG (plate-forme PFONGUE)</li>
          </ul>
        </div>
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
