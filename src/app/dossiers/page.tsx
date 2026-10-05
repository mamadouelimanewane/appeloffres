"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FolderCheck } from "lucide-react";
import { compteARebours, dateFr, joursRestants, scorePreparation } from "@/lib/data";
import { APPELS } from "@/lib/donnees";
import { lireLocal } from "@/lib/storage";
import { Barre, Echeance, TitrePage } from "@/components/ui";

interface Ligne { id: string; titre: string; autorite: string; dateLimite: string | null; jours: number | null; score: number }

export default function MesDossiers() {
  const [lignes, setLignes] = useState<Ligne[] | null>(null);

  useEffect(() => {
    const suivis = lireLocal<string[]>("suivis", []);
    const l = APPELS.filter((a) => suivis.includes(a.id))
      .map((a) => ({
        id: a.id,
        titre: a.titre,
        autorite: a.autorite,
        dateLimite: a.dateLimite,
        jours: a.dateLimite ? joursRestants(a.dateLimite) : null,
        score: scorePreparation(a, lireLocal<string[]>(`pieces-${a.id}`, [])),
      }))
      .sort((x, y) => (x.dateLimite ?? "9999").localeCompare(y.dateLimite ?? "9999"));
    setLignes(l);
  }, []);

  return (
    <>
      <TitrePage icone={FolderCheck} titre="Mes dossiers" sousTitre="Les appels d'offres que vous suivez, leur échéance et l'avancement de votre dossier." />
      <div className="conteneur py-8">
        {lignes !== null && lignes.length === 0 && (
          <div className="carte flex flex-col items-center px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700"><FolderCheck className="h-7 w-7" /></span>
            <p className="mt-4 text-lg font-bold">Aucun dossier suivi pour l&apos;instant</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">Ouvrez un appel d&apos;offres et cliquez sur « Suivre cet appel » : il apparaîtra ici avec son échéance et votre avancement.</p>
            <Link href="/appels" className="btn mt-6">Parcourir les appels d&apos;offres <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}
        <ul className="grid gap-4 md:grid-cols-2">
          {(lignes ?? []).map((l) => (
            <li key={l.id}>
              <Link href={`/appels/${l.id}`} className="carte-lien block p-5">
                <Echeance jours={l.jours} texte={l.dateLimite && l.jours !== null ? (l.jours < 0 ? "Clôturé" : `${dateFr(l.dateLimite)} · ${compteARebours(l.jours)}`) : "Date limite : voir l'avis"} />
                <p className="mt-3 font-semibold leading-snug text-slate-900">{l.titre}</p>
                <p className="mt-1 text-sm text-slate-500">{l.autorite}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Dossier prêt</span>
                  <span className="text-brand-700">{l.score} %</span>
                </div>
                <div className="mt-1.5"><Barre valeur={l.score} /></div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
