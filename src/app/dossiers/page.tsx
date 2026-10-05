"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dateFr, joursRestants, scorePreparation } from "@/lib/data";
import { APPELS } from "@/lib/donnees";
import { lireLocal } from "@/lib/storage";

interface Ligne { id: string; titre: string; dateLimite: string | null; jours: number | null; score: number }

export default function MesDossiers() {
  const [lignes, setLignes] = useState<Ligne[] | null>(null);

  useEffect(() => {
    const suivis = lireLocal<string[]>("suivis", []);
    const l = APPELS.filter((a) => suivis.includes(a.id))
      .map((a) => ({
        id: a.id,
        titre: a.titre,
        dateLimite: a.dateLimite,
        jours: a.dateLimite ? joursRestants(a.dateLimite) : null,
        score: scorePreparation(a, lireLocal<string[]>(`pieces-${a.id}`, [])),
      }))
      .sort((x, y) => (x.dateLimite ?? "9999").localeCompare(y.dateLimite ?? "9999"));
    setLignes(l);
  }, []);

  if (lignes === null) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mes dossiers</h1>
      {lignes.length === 0 && (
        <p className="text-gray-600">Aucun dossier suivi pour l&apos;instant. Ouvrez un <Link href="/appels" className="text-brand underline">appel d&apos;offres</Link> et cliquez sur « Suivre ».</p>
      )}
      <ul className="space-y-3">
        {lignes.map((l) => (
          <li key={l.id} className="rounded-xl border bg-white p-4">
            <Link href={`/appels/${l.id}`} className="font-semibold text-brand hover:underline">{l.titre}</Link>
            <p className="mt-1 text-sm">
              {l.dateLimite && l.jours !== null ? (
                <>
                  Date limite {dateFr(l.dateLimite)} ·{" "}
                  <span className={l.jours < 0 ? "text-red-600" : l.jours <= 7 ? "font-semibold text-orange-600" : ""}>{l.jours < 0 ? "clôturé" : `${l.jours} j`}</span>
                </>
              ) : (
                "Date limite : voir l'avis officiel"
              )}
              {" "}· Dossier prêt à {l.score} %
            </p>
            <div className="mt-2 h-2 rounded bg-gray-200"><div className="h-2 rounded bg-brand" style={{ width: `${l.score}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
