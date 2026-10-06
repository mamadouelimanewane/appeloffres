"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BellRing, Building2, Check, CreditCard, LogOut, MessageCircle, Send, Sparkles, UserRound, X } from "lucide-react";
import { SECTEURS, type Secteur } from "@/lib/data";
import { APPELS } from "@/lib/donnees";
import { normaliserTelephone, statutAbonnement, type Compte } from "@/lib/compte";
import { avisPourAlerte, messageWhatsApp } from "@/lib/alertes";
import { offre } from "@/lib/offres";
import { MOYENS, fcfaCourt } from "@/lib/paiement";
import { envoyerWhatsAppSimule, messages, mettreAJour, seDeconnecter, transactions, useCompte } from "@/lib/demo/base";
import { BandeauDemo } from "@/components/BandeauDemo";
import { TitrePage } from "@/components/ui";

function CarteAbonnement({ c }: { c: Compte }) {
  const s = statutAbonnement(c, new Date());
  const fin = c.abonnement.jusquau.split("-").reverse().join("/");
  return (
    <section className={`rounded-2xl p-6 ${s.actif ? "bg-gradient-to-br from-brand-700 to-brand-950 text-white" : "carte"}`}>
      <p className={`flex items-center gap-2 text-sm ${s.actif ? "text-brand-100" : "text-slate-500"}`}><CreditCard className="h-4 w-4" /> Abonnement</p>
      <p className={`mt-2 text-2xl font-extrabold ${s.actif ? "text-white" : "text-slate-900"}`}>{s.libelle}</p>
      <p className={`mt-1 text-sm ${s.actif ? "text-brand-100/90" : "text-red-600"}`}>
        {s.actif ? `Jusqu'au ${fin} inclus · ${s.joursRestants + 1} jour(s) restant(s)` : `Terminé le ${fin}`}
      </p>
      <Link href="/abonnement" className={`mt-5 ${s.actif ? "btn-or" : "btn"}`}>{s.offre === "essai" || !s.actif ? "S'abonner" : "Prolonger"}</Link>
    </section>
  );
}

function PreferencesAlertes({ c }: { c: Compte }) {
  const [whatsapp, setWhatsapp] = useState(c.alertes.whatsapp.replace("+221", ""));
  const [mot, setMot] = useState("");
  const [erreur, setErreur] = useState("");
  const maj = (alertes: Partial<Compte["alertes"]>) => mettreAJour({ ...c, alertes: { ...c.alertes, ...alertes } });
  const basculeSecteur = (s: Secteur) => maj({ secteurs: c.alertes.secteurs.includes(s) ? c.alertes.secteurs.filter((x) => x !== s) : [...c.alertes.secteurs, s] });

  return (
    <section className="carte space-y-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold"><BellRing className="h-5 w-5 text-brand-700" /> Alertes WhatsApp</h2>
        <button onClick={() => maj({ actives: !c.alertes.actives })} role="switch" aria-checked={c.alertes.actives} aria-label="Activer les alertes"
          className={`relative h-7 w-12 rounded-full transition ${c.alertes.actives ? "bg-brand-600" : "bg-slate-300"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${c.alertes.actives ? "left-6" : "left-1"}`} />
        </button>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Numéro WhatsApp
        <input className="champ mt-1.5" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
          onBlur={() => { const n = normaliserTelephone(whatsapp); if (n) { setErreur(""); maj({ whatsapp: n }); } else setErreur("Numéro invalide."); }} />
        {erreur && <span className="mt-1 block text-xs text-red-600">{erreur}</span>}
      </label>
      <div>
        <p className="text-sm font-medium text-slate-700">Secteurs suivis</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SECTEURS.map((s) => {
            const actif = c.alertes.secteurs.includes(s);
            return (
              <button key={s} onClick={() => basculeSecteur(s)} aria-pressed={actif}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${actif ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-slate-700 ring-slate-200"}`}>
                {actif && <Check className="h-3.5 w-3.5" />} {s}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">Mots-clés <span className="font-normal text-slate-400">(ex. : véhicule, groupe électrogène)</span></p>
        <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const m = mot.trim(); if (m && !c.alertes.motsCles.includes(m)) maj({ motsCles: [...c.alertes.motsCles, m] }); setMot(""); }}>
          <input className="champ" value={mot} onChange={(e) => setMot(e.target.value)} placeholder="Ajouter un mot-clé" />
          <button className="btn-sec" type="submit">Ajouter</button>
        </form>
        <div className="mt-2 flex flex-wrap gap-2">
          {c.alertes.motsCles.map((m) => (
            <span key={m} className="puce bg-slate-100 py-1 text-slate-700">{m}
              <button onClick={() => maj({ motsCles: c.alertes.motsCles.filter((x) => x !== m) })} aria-label={`Retirer ${m}`}><X className="h-3.5 w-3.5" /></button>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoiteWhatsApp({ c }: { c: Compte }) {
  const [version, setVersion] = useState(0);
  const envoyes = useMemo(() => messages(c.id), [c.id, version]);
  const deja = useMemo(() => new Set(envoyes.flatMap((m) => m.avisIds)), [envoyes]);
  const aEnvoyer = avisPourAlerte(c, APPELS, deja, new Date().toISOString().slice(0, 10));

  function simuler() {
    if (aEnvoyer.length === 0) return;
    envoyerWhatsAppSimule(c.id, c.alertes.whatsapp, messageWhatsApp(c, aEnvoyer, window.location.origin), aEnvoyer.map((a) => a.id));
    setVersion(version + 1);
  }

  return (
    <section className="carte p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold"><MessageCircle className="h-5 w-5 text-emerald-600" /> Messages WhatsApp (simulés)</h2>
        <button className="btn" onClick={simuler} disabled={aEnvoyer.length === 0 || !c.alertes.actives}>
          <Send className="h-4 w-4" /> {aEnvoyer.length ? `Simuler l'alerte du jour (${aEnvoyer.length} avis)` : "Aucun nouvel avis"}
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">Chaque matin, après la collecte, chaque client recevrait les nouveaux avis de ses secteurs et mots-clés. Un avis n&apos;est jamais envoyé deux fois.</p>
      <div className="mt-5 space-y-4 rounded-2xl bg-[#e7ddd3] p-4">
        {envoyes.length === 0 && <p className="py-6 text-center text-sm text-slate-600">Aucun message pour l&apos;instant.</p>}
        {[...envoyes].reverse().map((m) => (
          <div key={m.id} className="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-4 py-3 text-sm text-slate-800 shadow-sm">
            <pre className="whitespace-pre-wrap break-words font-sans">{m.texte}</pre>
            <p className="mt-1 text-right text-[11px] text-slate-500">à {m.a} · {new Date(m.envoyeLe).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MonCompte() {
  const routeur = useRouter();
  const { compte, pret } = useCompte();
  const [bienvenue, setBienvenue] = useState(false);
  const [sortie, setSortie] = useState(false); // déconnexion volontaire : on va à l'accueil, pas à la connexion
  useEffect(() => setBienvenue(new URLSearchParams(window.location.search).has("bienvenue")), []);
  useEffect(() => { if (pret && !compte && !sortie) routeur.replace("/connexion"); }, [pret, compte, sortie, routeur]);
  if (!compte) return null;

  const paiements = transactions().filter((t) => t.compteId === compte.id).reverse();

  return (
    <>
      <TitrePage icone={UserRound} titre={`Bonjour ${compte.nom.split(" ")[0]}`} sousTitre={<>{compte.entreprise} · {compte.telephone} · {compte.region}</>}>
        <button className="btn-sec" onClick={() => { setSortie(true); seDeconnecter(); routeur.push("/"); }}><LogOut className="h-4 w-4" /> Se déconnecter</button>
      </TitrePage>
      <div className="conteneur space-y-6 py-8">
        <BandeauDemo />
        {bienvenue && (
          <p className="flex items-center gap-2 rounded-xl bg-brand-50 p-4 text-sm font-medium text-brand-800 ring-1 ring-brand-200">
            <Sparkles className="h-4 w-4" /> Bienvenue ! Votre essai gratuit de l&apos;offre Pro a commencé.
          </p>
        )}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <BoiteWhatsApp c={compte} />
          </div>
          <div className="space-y-6">
            <CarteAbonnement c={compte} />
            <PreferencesAlertes c={compte} />
            <Link href="/profil" className="carte-lien flex items-center gap-3 p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Building2 className="h-5 w-5" /></span>
              <span><span className="block font-semibold">Fiche entreprise</span><span className="text-sm text-slate-500">Références et moyens, pour vos mémoires techniques</span></span>
            </Link>
            {paiements.length > 0 && (
              <section className="carte p-6">
                <h2 className="font-bold">Paiements</h2>
                <ul className="mt-3 divide-y divide-slate-100 text-sm">
                  {paiements.map((t) => (
                    <li key={t.ref} className="flex items-center justify-between gap-2 py-2">
                      <span>{offre(t.offre).nom} · {t.mois} mois<br /><span className="text-xs text-slate-400">{MOYENS[t.moyen]} · {new Date(t.creeLe).toLocaleDateString("fr-FR")}</span></span>
                      <span className="text-right">{fcfaCourt(t.montant)}<br />
                        <span className={`text-xs font-semibold ${t.statut === "payee" ? "text-brand-700" : t.statut === "annulee" ? "text-red-600" : "text-slate-500"}`}>
                          {t.statut === "payee" ? "payé" : t.statut === "annulee" ? "refusé" : "en attente"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
