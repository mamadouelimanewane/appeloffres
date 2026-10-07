import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Entete } from "@/components/Entete";
import { PiedDePage } from "@/components/PiedDePage";

const police = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Soumission PME — gagnez plus de marchés publics au Sénégal",
  description: "Appels d'offres ouverts, marchés à venir, prix pratiqués et aide à la préparation des dossiers pour les PME sénégalaises.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Soumission PME",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = { themeColor: "#063a20" };

export default function Racine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={police.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Entete />
        <main className="flex-1">{children}</main>
        <PiedDePage />
      </body>
    </html>
  );
}
