"use client";
import Link from "next/link";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, BookmarkCheck, BookmarkPlus, Bot, Building, CalendarDays, Check, Copy, ExternalLink, FileText, Printer, Sparkles } from "lucide-react";
import { compteARebours, dateFr, fcfa, joursRestants, piecesPour, scorePreparation, selonDao } from "@/lib/data";
import { APPELS } from "@/lib/donnees";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";
import { BadgeSecteur, Barre, Echeance } from "@/components/ui";
import { ReservePro } from "@/components/ReservePro";

export default function DetailAppel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const a = APPELS.find((x) => x.id === id);
  const [cochees, setCochees] = useLocal<string[]>(`pieces-${id}`, []);
  const [profil] = useLocal<Profil>("profil", PROFIL_VIDE);
  const [suivis, setSuivis] = useLocal<string[]>("suivis", []);
  const [memoire, setMemoire] = useState("");
  const [attente, setAttente] = useState(false);
  const [copie, setCopie] = useState(false);
  if (!a) return notFound();

  const pieces = piecesPour(a);
  const score = scorePreparation(a, cochees);
  const j = a.dateLimite ? joursRestants(a.dateLimite) : null;
  const suivi = suivis.includes(id);
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

  const infos: [string, string][] = [
    ["Référence", a.reference],
    ["Acheteur", a.autorite],
    ["Procédure", a.mode ?? "—"],
    ["Source", a.sourceLibelle],
    ...(a.publieLe ? [["Publié le", dateFr(a.publieLe)] as [string, string]] : []),
    ...(a.budgetEstime !== null ? [["Budget estimé", fcfa(a.budgetEstime)] as [string, string]] : []),
    ...(a.garantieSoumission !== null ? [["Garantie de soumission", a.garantieSoumission ? fcfa(a.garantieSoumission) : "aucune"] as [string, string]] : []),
  ];

  return (
    <>
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-brand-50/80 to-slate-50 print:bg-none">
        <div className="conteneur py-8">
          <Link href="/appels" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700 print:hidden">
            <ArrowLeft className="h-4 w-4" /> Tous les appels d&apos;offres
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <BadgeSecteur secteur={a.secteur} />
            <Echeance jours={j} texte={j === null ? "Date limite : voir l'avis officiel" : j < 0 ? "Clôturé" : `Date limite ${dateFr(a.dateLimite!)} · ${compteARebours(j)}`} />
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-extrabold leading-tight sm:text-3xl">{a.titre}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Building className="h-4 w-4" /> {a.autorite}</p>
          <div className="mt-6 flex flex-wrap gap-2 print:hidden">
            {a.url && <a className="btn" href={a.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> Lire l&apos;avis officiel</a>}
            <button className="btn-sec" onClick={() => setSuivis(suivi ? suivis.filter((s) => s !== id) : [...suivis, id])}>
              {suivi ? <><BookmarkCheck className="h-4 w-4 text-brand-700" /> Suivi</> : <><BookmarkPlus className="h-4 w-4" /> Suivre cet appel</>}
            </button>
            <button className="btn-sec" onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimer la liste</button>
          </div>
        </div>
      </section>

      <div className="conteneur grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {a.lectureIa && (
            <section className="carte border-violet-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-bold"><Bot className="h-5 w-5 text-violet-600" /> Ce que dit l&apos;avis</h2>
                <span className="puce bg-violet-50 text-violet-800 ring-1 ring-violet-200">Lu par IA</span>
              </div>
              {a.lectureIa.resume && <p className="mt-3 leading-relaxed text-slate-700">{a.lectureIa.resume}</p>}
              {a.lectureIa.dateLimiteAvis && a.dateLimite && a.lectureIa.dateLimiteAvis !== a.dateLimite && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 p-3 text-sm text-orange-800 ring-1 ring-orange-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <b>Dates différentes :</b> la liste de la source indique le {dateFr(a.dateLimite)}, mais le document de l&apos;avis indique le{" "}
                    {dateFr(a.lectureIa.dateLimiteAvis)}. Vérifiez auprès de l&apos;acheteur ; en cas de doute, retenez la date la plus proche.
                  </span>
                </p>
              )}
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {(a.lectureIa.dateLimiteAvis ?? a.dateLimite) && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Dépôt des offres (selon l&apos;avis)</dt>
                    <dd className="font-medium">{dateFr((a.lectureIa.dateLimiteAvis ?? a.dateLimite)!)}{a.lectureIa.heureLimite ? ` à ${a.lectureIa.heureLimite}` : ""}</dd>
                  </div>
                )}
                {a.lectureIa.lieuDepot && <div><dt className="text-xs uppercase tracking-wide text-slate-400">Lieu de dépôt</dt><dd className="font-medium">{a.lectureIa.lieuDepot}</dd></div>}
              </dl>
              {a.lectureIa.piecesExigees.length > 0 && (
                <>
                  <p className="mt-4 text-sm font-semibold text-slate-800">Pièces demandées dans l&apos;avis</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                    {a.lectureIa.piecesExigees.map((p) => <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />{p}</li>)}
                  </ul>
                </>
              )}
              <p className="mt-4 text-xs text-slate-500">
                Informations extraites automatiquement du document de l&apos;avis ({a.lectureIa.modele}). Les dates et montants ne sont retenus que s&apos;ils figurent dans le texte.
                {a.lectureIa.tronque && " Document long : seule la première partie a été lue."} Vérifiez toujours sur l&apos;avis officiel.
              </p>
            </section>
          )}
          <section className="carte p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold"><FileText className="h-5 w-5 text-brand-700" /> Pièces à fournir</h2>
              <span className="puce bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800 ring-1 ring-brand-200">Dossier prêt à {score} %</span>
            </div>
            <div className="mt-4"><Barre valeur={score} /></div>
            <ul className="mt-5 divide-y divide-slate-100">
              {pieces.map((p) => {
                const ok = cochees.includes(p.id);
                return (
                  <li key={p.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50">
                      <input type="checkbox" className="sr-only" checked={ok} onChange={() => bascule(p.id)} />
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md transition ${ok ? "bg-brand-600 text-white" : "border-2 border-slate-300 bg-white"}`} aria-hidden>
                        {ok && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span className={`font-semibold ${ok ? "text-slate-400 line-through decoration-slate-300" : "text-slate-900"}`}>{p.libelle}</span>
                        {selonDao(p, a) && <span className="puce ml-2 bg-or-50 text-or-700 ring-1 ring-or-100">selon le DAO</span>}
                        <span className="mt-0.5 block text-sm text-slate-500">{p.conseil}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-slate-500">Liste indicative : la référence reste le dossier d&apos;appel d&apos;offres officiel.</p>
          </section>

          <div className="print:hidden">
          <ReservePro fonction="memoire" titre="Mémoire technique assisté">
          <section className="carte p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5 text-or-500" /> Mémoire technique</h2>
            <p className="mt-1 text-sm text-slate-600">Un brouillon structuré, rédigé à partir du profil de votre entreprise. Les informations manquantes restent à compléter.</p>
            {!profil.entreprise && (
              <p className="mt-3 rounded-xl bg-or-50 p-3 text-sm text-or-700 ring-1 ring-or-100">
                Renseignez d&apos;abord <Link className="font-semibold underline" href="/profil">votre entreprise</Link> pour un meilleur résultat.
              </p>
            )}
            <button className="btn mt-4" onClick={generer} disabled={attente}><Sparkles className="h-4 w-4" />{attente ? "Rédaction en cours…" : "Générer un brouillon"}</button>
            {memoire && (
              <>
                <textarea className="champ mt-4 font-mono text-[13px] leading-relaxed" rows={22} value={memoire} onChange={(e) => setMemoire(e.target.value)} />
                <button className="btn-sec mt-3" onClick={() => { navigator.clipboard.writeText(memoire); setCopie(true); setTimeout(() => setCopie(false), 2000); }}>
                  {copie ? <><Check className="h-4 w-4 text-brand-700" /> Copié</> : <><Copy className="h-4 w-4" /> Copier</>}
                </button>
              </>
            )}
          </section>
          </ReservePro>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="carte p-6">
            <h2 className="flex items-center gap-2 font-bold"><CalendarDays className="h-5 w-5 text-brand-700" /> En bref</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {infos.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{k}</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          {a.source === "appel" && (
            <section className="rounded-2xl bg-brand-50 p-5 text-sm text-brand-900 ring-1 ring-brand-200">
              <p className="font-bold">Dépôt en ligne sur APPEL</p>
              <p className="mt-1 leading-relaxed">Pour répondre à cet appel d&apos;offres, votre entreprise doit avoir un compte fournisseur validé sur la plateforme officielle.</p>
              <Link href="/guide-appel" className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">S&apos;inscrire sur APPEL : le guide</Link>
            </section>
          )}
          <p className="px-1 text-xs leading-relaxed text-slate-500">
            Informations extraites automatiquement du site de la source. L&apos;avis officiel fait foi.
          </p>
        </aside>
      </div>
    </>
  );
}
