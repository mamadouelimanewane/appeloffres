"use client";
import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock, FileLock2, Plus, Trash2 } from "lucide-react";
import { dateFr } from "@/lib/data";
import { aRenouveler, statutPiece, TYPES_COFFRE, type PieceCoffre, type StatutPiece } from "@/lib/coffre";
import { useLocal } from "@/lib/storage";
import { TitrePage } from "@/components/ui";

const PASTILLE: Record<StatutPiece, { texte: string; style: string }> = {
  valide: { texte: "Valide", style: "bg-brand-50 text-brand-800 ring-1 ring-brand-200" },
  bientot: { texte: "Expire bientôt", style: "bg-orange-50 text-orange-700 ring-1 ring-orange-200" },
  expiree: { texte: "Expirée", style: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  sans_date: { texte: "Sans expiration", style: "bg-slate-100 text-slate-600" },
};

export default function Coffre() {
  const [coffre, setCoffre, pret] = useLocal<PieceCoffre[]>("coffre", []);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const urgentes = useMemo(() => aRenouveler(coffre, aujourdhui), [coffre, aujourdhui]);
  const parType = (type: string) => coffre.find((p) => p.type === type);

  const enregistrer = (p: PieceCoffre) => setCoffre([...coffre.filter((x) => x.type !== p.type), p]);
  const retirer = (type: string) => setCoffre(coffre.filter((x) => x.type !== type));

  return (
    <>
      <TitrePage
        icone={FileLock2}
        titre="Mes pièces administratives"
        sousTitre="Enregistrez vos attestations avec leur date d'expiration : nous vous prévenons avant qu'elles expirent, et nous vérifions qu'elles seront encore valides le jour du dépôt de chaque offre."
      >
        <span className="puce bg-white px-3 py-1.5 text-sm text-slate-700 shadow-doux ring-1 ring-slate-200">
          <CheckCircle2 className="h-4 w-4 text-brand-600" /> {coffre.length}/{TYPES_COFFRE.length} pièces enregistrées
        </span>
      </TitrePage>

      <div className="conteneur space-y-6 py-8">
        {pret && urgentes.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl bg-orange-50 p-5 text-sm text-orange-900 ring-1 ring-orange-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">À renouveler</p>
              <ul className="mt-1 space-y-0.5">
                {urgentes.map((p) => (
                  <li key={p.type}>
                    {p.libelle} — {statutPiece(p, aujourdhui) === "expiree" ? "expirée depuis le" : "expire le"} {dateFr(p.expireLe!)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <ul className="grid gap-4 md:grid-cols-2">
          {TYPES_COFFRE.map((t) => {
            const p = parType(t.type);
            const statut = p ? statutPiece(p, aujourdhui) : null;
            return (
              <li key={t.type} className="carte p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-900">{t.libelle}</p>
                  {statut ? <span className={`puce ${PASTILLE[statut].style}`}>{PASTILLE[statut].texte}</span> : <span className="puce bg-slate-100 text-slate-500">Non enregistrée</span>}
                </div>
                {p ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Délivrée le
                      <input type="date" className="champ mt-1" value={p.delivreeLe ?? ""} onChange={(e) => enregistrer({ ...p, delivreeLe: e.target.value || null })} />
                    </label>
                    {t.expire ? (
                      <label className="block text-xs font-medium text-slate-600">
                        Expire le <span className="font-normal text-slate-400">(date écrite sur la pièce)</span>
                        <input type="date" className="champ mt-1" value={p.expireLe ?? ""} onChange={(e) => enregistrer({ ...p, expireLe: e.target.value || null })} />
                      </label>
                    ) : (
                      <p className="flex items-end pb-2 text-xs text-slate-500"><Clock className="mr-1 h-3.5 w-3.5" /> Sans date d&apos;expiration</p>
                    )}
                    <button className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 sm:col-span-2" onClick={() => retirer(t.type)}>
                      <Trash2 className="h-3.5 w-3.5" /> Retirer du coffre
                    </button>
                  </div>
                ) : (
                  <button className="btn-sec mt-4" onClick={() => enregistrer({ type: t.type, libelle: t.libelle, delivreeLe: null, expireLe: null })}>
                    <Plus className="h-4 w-4" /> J&apos;ai cette pièce
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-slate-500">
          Mode démonstration : les dates sont enregistrées sur cet appareil. Les fichiers eux-mêmes (PDF, photos) seront conservés dans votre espace sécurisé quand les comptes seront en service.
        </p>
      </div>
    </>
  );
}
