"use client";
import { useMemo, useState } from "react";
import { Check, Copy, Gift, Mail, Megaphone, MessageSquare, Percent, Plus, Power, Send, Target, Users } from "lucide-react";
import { SECTEURS, type Secteur } from "@/lib/data";
import { adminBasculerCode, adminCreerCode, adminEnvoyerCampagne, BASE_REELLE, useDonneesAdmin, type Campagne } from "@/lib/depot";
import type { Compte } from "@/lib/compte";
import { useLocal } from "@/lib/storage";
import {
  audience, etatCode, indicateurs, lienAffilie, personnaliser, SEGMENTS,
  type Canal, type CodePromo, type EtatCode, type Segment,
} from "@/lib/marketing";

const fcfa = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ") + " FCFA";
const ETATS: Record<EtatCode, { libelle: string; style: string }> = {
  actif: { libelle: "ACTIF", style: "bg-green-500/10 text-green-400" },
  desactive: { libelle: "DÉSACTIVÉ", style: "bg-slate-800 text-slate-500" },
  epuise: { libelle: "ÉPUISÉ", style: "bg-or-500/10 text-or-400" },
  expire: { libelle: "EXPIRÉ", style: "bg-red-500/10 text-red-400" },
};
const champ = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-purple-500";

export function Marketing() {
  const { donnees, erreur } = useDonneesAdmin();
  const [budget, setBudget] = useLocal<number>("admin-budget-marketing", 0);
  const maintenant = new Date();
  if (!donnees) {
    return <p className={`rounded-xl p-4 text-sm ${erreur ? "border border-red-500/30 bg-red-500/10 text-red-300" : "text-slate-500"}`}>{erreur ?? "Chargement des données…"}</p>;
  }
  const { comptes, transactions, codes, campagnes } = donnees;
  const k = indicateurs(comptes, transactions, budget, maintenant);

  return (
    <div className="animate-in fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Marketing & Croissance</h2>
          <p className="mt-1 text-sm text-slate-400">Acquisition, campagnes ciblées, codes promo et affiliation</p>
        </div>
        <a href="#campagne" className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition hover:bg-purple-700">
          <Megaphone className="h-4 w-4" /> Créer une campagne
        </a>
      </div>

      <p className="mb-6 rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-200">
        {BASE_REELLE ? (
          <><b>Base de données connectée.</b> Chiffres calculés sur les comptes et paiements réels. Les messages WhatsApp restent simulés : ils arrivent dans la boîte « Mes alertes » des clients, sans envoi réel.</>
        ) : (
          <><b>Mode démonstration.</b> Les chiffres sont calculés à partir des comptes et paiements enregistrés dans ce navigateur. Aucun message n&apos;est réellement envoyé : ils arrivent dans la boîte « Mes alertes » des comptes de démonstration.</>
        )}
      </p>

      {/* 1. Indicateurs d'acquisition */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Kpi libelle="Inscrits (30 jours)" valeur={String(k.inscrits30j)} detail={`${k.inscrits} au total`} couleur="text-purple-400" />
        <Kpi libelle="Taux de conversion" valeur={k.tauxConversion === null ? "—" : `${k.tauxConversion.toLocaleString("fr-FR")} %`} detail={`${k.payants} client${k.payants > 1 ? "s" : ""} payant${k.payants > 1 ? "s" : ""}`} couleur="text-green-400" />
        <Kpi libelle="Encaissé (30 jours)" valeur={fcfa(k.encaisse30j)} detail="Paiements confirmés" couleur="text-or-400" />
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Coût d&apos;acquisition (CAC)</p>
          <p className="text-2xl font-black text-blue-400">{k.cac === null ? "—" : fcfa(k.cac)}</p>
          <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            Budget 30 j
            <input type="number" min={0} step={5000} value={budget || ""} placeholder="0" onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))}
              className="w-28 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-right text-xs text-white outline-none focus:border-blue-500" />
            FCFA
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NouvelleCampagne comptes={comptes} historique={campagnes} />
        <CodesPromo codes={codes} comptes={comptes} />
      </div>
    </div>
  );
}

function Kpi({ libelle, valeur, detail, couleur }: { libelle: string; valeur: string; detail: string; couleur: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{libelle}</p>
      <p className={`text-2xl font-black ${couleur}`}>{valeur}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

// --- 2. Campagnes WhatsApp & email ----------------------------------------------

function NouvelleCampagne({ comptes, historique }: { comptes: Compte[]; historique: Campagne[] }) {
  const [nom, setNom] = useState("");
  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [segment, setSegment] = useState<Segment>("sans-abonnement-payant");
  const [secteurs, setSecteurs] = useState<Secteur[]>(["BTP"]);
  const [message, setMessage] = useState("Bonjour {nom}, de nouveaux appels d'offres BTP sont ouverts cette semaine. Passez à l'offre Pro pour voir qui gagne et à quel prix : appeloffres.vercel.app/abonnement");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const cibles = useMemo(() => audience(comptes, { canal, segment, secteurs }, new Date()), [comptes, canal, segment, secteurs]);
  const basculer = (s: Secteur) => setSecteurs(secteurs.includes(s) ? secteurs.filter((x) => x !== s) : [...secteurs, s]);

  const envoyer = async () => {
    if (!nom.trim() || !message.trim() || cibles.length === 0 || envoi) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const n = await adminEnvoyerCampagne({ nom, message, canal, segment, secteurs });
      setConfirmation(`« ${nom.trim()} » : ${n} message${n > 1 ? "s" : ""} ${canal === "whatsapp" ? "WhatsApp" : "email"} simulé${n > 1 ? "s" : ""}.`);
      setNom("");
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div id="campagne" className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-5 flex items-center gap-2 font-bold text-white"><Target className="h-5 w-5 text-purple-500" /> Campagnes WhatsApp & email</h3>

      <div className="space-y-4">
        <input className={champ} placeholder="Nom de la campagne (ex. Relance BTP octobre)" value={nom} onChange={(e) => setNom(e.target.value)} />

        <div className="grid grid-cols-2 gap-2">
          {([["whatsapp", "WhatsApp", MessageSquare], ["email", "Email", Mail]] as const).map(([v, l, Icone]) => (
            <button key={v} type="button" onClick={() => setCanal(v)} aria-pressed={canal === v}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${canal === v ? "border-purple-500 bg-purple-500/10 text-purple-300" : "border-slate-700 text-slate-400 hover:text-white"}`}>
              <Icone className="h-4 w-4" /> {l}
            </button>
          ))}
        </div>

        <select className={champ} value={segment} onChange={(e) => setSegment(e.target.value as Segment)} aria-label="Segment">
          {Object.entries(SEGMENTS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <div className="flex flex-wrap gap-2" aria-label="Secteurs">
          {SECTEURS.map((s) => (
            <button key={s} type="button" onClick={() => basculer(s)} aria-pressed={secteurs.includes(s)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${secteurs.includes(s) ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              {s}
            </button>
          ))}
          <span className="self-center text-xs text-slate-500">{secteurs.length ? "" : "Tous les secteurs"}</span>
        </div>

        <div>
          <textarea className={`${champ} h-28 resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} aria-label="Message" />
          <p className="mt-1 text-xs text-slate-500">Variables : {"{nom}"}, {"{entreprise}"}. {canal === "whatsapp" && "En production, un message d'initiative doit utiliser un modèle approuvé par Meta."}</p>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3">
          <span className="flex items-center gap-2 text-sm text-slate-300"><Users className="h-4 w-4 text-purple-400" /> <b className="text-white">{cibles.length}</b> destinataire{cibles.length > 1 ? "s" : ""}</span>
          <button type="button" onClick={envoyer} disabled={!nom.trim() || !message.trim() || cibles.length === 0 || envoi}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40">
            <Send className="h-4 w-4" /> Envoyer (simulé)
          </button>
        </div>
        {cibles[0] && (
          <p className="rounded-xl border border-slate-800 p-3 text-xs text-slate-400"><span className="text-slate-500">Aperçu pour {cibles[0].entreprise} : </span>{personnaliser(message, cibles[0])}</p>
        )}
        {canal === "whatsapp" && <p className="text-xs text-slate-500">Seuls les comptes qui ont gardé les alertes WhatsApp actives sont ciblés (consentement, STOP respecté).</p>}
        {confirmation && <p className="flex items-center gap-2 text-sm text-green-400"><Check className="h-4 w-4" /> {confirmation}</p>}
        {erreur && <p className="text-sm text-red-400">{erreur}</p>}
      </div>

      {historique.length > 0 && (
        <div className="mt-6 border-t border-slate-800 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Campagnes envoyées</p>
          <ul className="space-y-2">
            {historique.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  {c.canal === "whatsapp" ? <MessageSquare className="h-4 w-4 text-green-400" /> : <Mail className="h-4 w-4 text-blue-400" />}
                  {c.nom}
                </span>
                <span className="text-xs text-slate-500">{c.destinataires} dest. · {new Date(c.envoyeeLe).toLocaleDateString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- 3. Codes promo & affiliation ------------------------------------------------

function CodesPromo({ codes, comptes }: { codes: CodePromo[]; comptes: Compte[] }) {
  const [code, setCode] = useState("");
  const [remise, setRemise] = useState(20);
  const [limite, setLimite] = useState("");
  const [expireLe, setExpireLe] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState<string | null>(null);
  const maintenant = new Date();

  const ajouter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreerCode({ code, remise, limite: limite ? Number(limite) : null, expireLe: expireLe || null });
      setCode("");
      setLimite("");
      setExpireLe("");
      setErreur(null);
    } catch (x) {
      setErreur((x as Error).message);
    }
  };

  const copier = async (c: string) => {
    try {
      await navigator.clipboard.writeText(lienAffilie(window.location.origin, c));
      setCopie(c);
      setTimeout(() => setCopie(null), 2000);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-5 flex items-center gap-2 font-bold text-white"><Percent className="h-5 w-5 text-or-500" /> Codes promo & affiliation</h3>

      <form onSubmit={ajouter} className="grid gap-2 sm:grid-cols-[1fr_5rem_5rem]">
        <input className={`${champ} font-mono uppercase`} placeholder="PROMO-BTP" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Code" />
        <label className="relative">
          <input type="number" min={1} max={90} className={`${champ} pr-6`} value={remise} onChange={(e) => setRemise(Number(e.target.value))} aria-label="Remise en %" />
          <span className="absolute right-2 top-2 text-sm text-slate-500">%</span>
        </label>
        <input type="number" min={1} className={champ} placeholder="∞" value={limite} onChange={(e) => setLimite(e.target.value)} aria-label="Nombre maximal d'utilisations" title="Nombre maximal d'utilisations (vide = illimité)" />
        <label className="flex items-center gap-2 whitespace-nowrap text-xs text-slate-500 sm:col-span-2">
          Expire le
          <input type="date" className={`${champ} w-auto`} value={expireLe} onChange={(e) => setExpireLe(e.target.value)} />
        </label>
        <button type="submit" className="flex items-center justify-center gap-1 rounded-lg bg-or-500 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-or-400"><Plus className="h-4 w-4" /> Créer</button>
      </form>
      {erreur && <p className="mt-2 text-sm text-red-400">{erreur}</p>}

      {codes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
          <Gift className="mx-auto mb-2 h-6 w-6" /> Aucun code pour l&apos;instant. Exemple : <span className="font-mono text-slate-300">PROMO-BTP</span>, 20 %, 100 utilisations.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <th className="p-3">Code</th>
                <th className="p-3">Remise</th>
                <th className="p-3">Utilisations</th>
                <th className="p-3" title="Comptes créés avec le lien d'affiliation">Inscrits</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {codes.map((p) => {
                const e = ETATS[etatCode(p, maintenant)];
                return (
                  <tr key={p.code} className="transition hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-white">{p.code}{p.expireLe && <span className="block text-[10px] font-normal text-slate-500">jusqu&apos;au {new Date(p.expireLe + "T00:00:00").toLocaleDateString("fr-FR")}</span>}</td>
                    <td className="p-3 font-bold text-brand-400">-{p.remise} %</td>
                    <td className="p-3 text-slate-300">{p.utilisations} <span className="text-slate-600">/ {p.limite ?? "∞"}</span></td>
                    <td className="p-3 text-slate-300">{comptes.filter((c) => c.parrain === p.code).length}</td>
                    <td className="p-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${e.style}`}>{e.libelle}</span></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => copier(p.code)} title="Copier le lien d'affiliation" className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white">
                          {copie === p.code ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => adminBasculerCode(p.code, !p.actif).catch((x) => setErreur((x as Error).message))} title={p.actif ? "Désactiver" : "Réactiver"} className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white">
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Les clients saisissent le code sur la page d&apos;abonnement ; une utilisation est comptée quand le paiement est confirmé. Le lien d&apos;affiliation (<span className="font-mono">/inscription?ref=CODE</span>) enregistre le parrain à l&apos;inscription et propose son code au moment de payer.
      </p>
    </div>
  );
}
