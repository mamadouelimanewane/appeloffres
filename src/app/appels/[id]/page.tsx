"use client";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import { dateFr, fcfa, joursRestants, piecesPour, scorePreparation, selonDao } from "@/lib/data";
import { APPELS } from "@/lib/donnees";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";

export default function DetailAppel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const a = APPELS.find((x) => x.id === id);
  const [cochees, setCochees] = useLocal<string[]>(`pieces-${id}`, []);
  const [profil] = useLocal<Profil>("profil", PROFIL_VIDE);
  const [suivis, setSuivis] = useLocal<string[]>("suivis", []);
  const [memoire, setMemoire] = useState("");
  const [attente, setAttente] = useState(false);
  if (!a) return notFound();

  const pieces = piecesPour(a);
  const score = scorePreparation(a, cochees);
  const j = a.dateLimite ? joursRestants(a.dateLimite) : null;
  const bascule = (pid: string) => setCochees(cochees.includes(pid) ? cochees.filter((c) => c !== pid) : [...cochees, pid]);

  async function generer() {
    setAttente(true);
    try {
      const r = await fetch("/api/memoire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appel: a, profil }) });
      const d = await r.json();
      setMemoire(d.texte ?? d.erreur ?? "Erreur inattendue.");
    } catch {
      setMemoire("Connexion impossible. Réessayez.");
    }
    setAttente(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{a.titre}</h1>
        <p className="text-sm text-gray-600">{a.reference} · {a.autorite}{a.region ? ` · ${a.region}` : ""}{a.mode ? ` · ${a.mode}` : ""}</p>
        <p className="mt-2 text-sm">
          {a.budgetEstime !== null && <>Budget estimé {fcfa(a.budgetEstime)} · </>}
          {a.garantieSoumission !== null && <>Garantie de soumission {a.garantieSoumission ? fcfa(a.garantieSoumission) : "aucune"} · </>}
          {a.dateLimite ? <>Date limite {dateFr(a.dateLimite)} ({j! < 0 ? "clôturé" : `${j} j`})</> : <>Date limite : voir l&apos;avis officiel</>}
          {a.publieLe && <> · publié le {dateFr(a.publieLe)}</>}
        </p>
        <p className="mt-1 text-xs text-gray-500">Source : {a.sourceLibelle}. Les informations ci-dessus sont extraites automatiquement : l&apos;avis officiel fait foi.</p>
        <div className="mt-3 flex flex-wrap gap-2 print:hidden">
          {a.url && <a className="btn" href={a.url} target="_blank" rel="noopener noreferrer">Lire l&apos;avis officiel</a>}
          <button className={suivis.includes(id) ? "btn-sec" : "btn"} onClick={() => setSuivis(suivis.includes(id) ? suivis.filter((s) => s !== id) : [...suivis, id])}>
            {suivis.includes(id) ? "Ne plus suivre" : "Suivre cet appel"}
          </button>
          <button className="btn-sec" onClick={() => window.print()}>Imprimer la liste</button>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pièces à fournir</h2>
          <span className="rounded-full bg-brand-light px-3 py-1 text-sm font-medium text-brand-dark">Dossier prêt à {score} %</span>
        </div>
        <div className="mt-3 h-2 rounded bg-gray-200"><div className="h-2 rounded bg-brand" style={{ width: `${score}%` }} /></div>
        <ul className="mt-4 space-y-3">
          {pieces.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-1" checked={cochees.includes(p.id)} onChange={() => bascule(p.id)} />
                <span>
                  <b>{p.libelle}</b>
                  {selonDao(p, a) && <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">selon le DAO</span>}
                  <br /><span className="text-sm text-gray-600">{p.conseil}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-500">Liste indicative : la référence reste le dossier d&apos;appel d&apos;offres officiel.</p>
      </section>

      <section className="rounded-xl border bg-white p-5 print:hidden">
        <h2 className="text-lg font-semibold">Mémoire technique (brouillon)</h2>
        {!profil.entreprise && <p className="mt-2 text-sm text-orange-600">Renseignez d&apos;abord « Mon entreprise » pour un meilleur résultat.</p>}
        <button className="btn mt-3" onClick={generer} disabled={attente}>{attente ? "Rédaction en cours…" : "Générer un brouillon"}</button>
        {memoire && (
          <>
            <textarea className="champ mt-4 font-mono text-sm" rows={22} value={memoire} onChange={(e) => setMemoire(e.target.value)} />
            <button className="btn-sec mt-2" onClick={() => navigator.clipboard.writeText(memoire)}>Copier</button>
          </>
        )}
      </section>
    </div>
  );
}
