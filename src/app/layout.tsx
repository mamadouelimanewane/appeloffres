import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soumission PME — réussir vos marchés publics",
  description: "Veille des appels d'offres, liste des pièces à fournir et aide à la rédaction du mémoire technique pour les PME sénégalaises.",
};

export default function Racine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="border-b bg-white print:hidden">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-brand">Soumission PME</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/appels">Appels d&apos;offres</Link>
              <Link href="/a-venir">Marchés à venir</Link>
              <Link href="/dossiers">Mes dossiers</Link>
              <Link href="/profil">Mon entreprise</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-gray-500">
          Avis collectés automatiquement sur les sites officiels (Senelec, AGEROUTE, Port Autonome de Dakar, Banque mondiale). L&apos;avis officiel fait foi : vérifiez toujours les pièces exigées dans le dossier d&apos;appel d&apos;offres.
        </footer>
      </body>
    </html>
  );
}
