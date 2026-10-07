"use client";
/**
 * Accès aux données pour les pages. Deux modes, mêmes fonctions :
 *  - vraie base (Supabase) dès que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies ;
 *  - sinon, mode démonstration : données dans le navigateur (src/lib/demo/base.ts).
 */
import { useCallback, useEffect, useState } from "react";
import type { Compte, Inscription } from "./compte";
import type { Ciblage, CodePromo } from "./marketing";
import { audience, creerCodePromo, personnaliser } from "./marketing";
import type { CodeOffre } from "./offres";
import type { MoyenPaiement, Transaction } from "./paiement";
import * as demo from "./demo/base";
import { BASE_REELLE } from "./supabase/config";
import { supabaseNavigateur } from "./supabase/navigateur";
import { modificationsClient, versCompte, versMessage, versTransaction, type LigneCompte, type LigneMessage, type LigneTransaction, type MessageEnvoye } from "./supabase/lignes";

export { BASE_REELLE };
export type { MessageEnvoye };

const EVENEMENT = "depot-change";
const signaler = () => window.dispatchEvent(new Event(EVENEMENT));

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erreur || "Erreur de connexion. Réessayez.");
  return d as T;
}

// --- Compte et session -----------------------------------------------------------

async function compteActuel(): Promise<Compte | null> {
  if (!BASE_REELLE) return demo.compteActuel();
  const sb = supabaseNavigateur();
  const { data: s } = await sb.auth.getSession();
  if (!s.session) return null;
  const { data } = await sb.from("comptes").select("*").eq("id", s.session.user.id).maybeSingle();
  return data ? versCompte(data as LigneCompte) : null;
}

export function useCompte(): { compte: Compte | null; pret: boolean } {
  const [etat, setEtat] = useState<{ compte: Compte | null; pret: boolean }>({ compte: null, pret: false });
  useEffect(() => {
    let actif = true;
    const maj = () => compteActuel().then((compte) => actif && setEtat({ compte, pret: true }), () => actif && setEtat({ compte: null, pret: true }));
    maj();
    window.addEventListener(EVENEMENT, maj);
    window.addEventListener("demo-base-change", maj);
    window.addEventListener("storage", maj);
    const abonnement = BASE_REELLE ? supabaseNavigateur().auth.onAuthStateChange(() => maj()).data.subscription : null;
    return () => {
      actif = false;
      window.removeEventListener(EVENEMENT, maj);
      window.removeEventListener("demo-base-change", maj);
      window.removeEventListener("storage", maj);
      abonnement?.unsubscribe();
    };
  }, []);
  return etat;
}

export type ResultatEntree = { etape: "connecte" } | { etape: "email-envoye"; email: string } | { etape: "code"; telephone: string };

/** Inscription. Vraie base : un lien de confirmation est envoyé par email ; le compte est créé au clic. */
export async function inscrire(d: Inscription, suite: string): Promise<ResultatEntree> {
  if (!BASE_REELLE) {
    demo.inscrire(d);
    return { etape: "connecte" };
  }
  const email = d.email?.trim().toLowerCase();
  if (!email) throw new Error("L'adresse email est obligatoire : le lien de connexion y est envoyé.");
  const { error } = await supabaseNavigateur().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/confirm`, data: { inscription: { ...d, email }, suite } },
  });
  if (error) throw new Error(messageAuth(error.message));
  return { etape: "email-envoye", email };
}

/** Connexion. Vraie base : lien par email. Démo : code simulé par téléphone. */
export async function demanderConnexion(identifiant: string): Promise<ResultatEntree> {
  if (!BASE_REELLE) return { etape: "code", telephone: demo.demanderCode(identifiant).telephone };
  const email = identifiant.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Adresse email invalide.");
  const { error } = await supabaseNavigateur().auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/confirm` } });
  if (error) throw new Error(/signups not allowed|not found/i.test(error.message) ? "Aucun compte avec cette adresse : créez votre compte (essai gratuit)." : messageAuth(error.message));
  return { etape: "email-envoye", email };
}

export function seConnecterDemo(telephone: string, code: string) {
  demo.seConnecter(telephone, code);
}

function messageAuth(m: string): string {
  if (/rate limit|too many|seconds/i.test(m)) return "Trop de demandes : patientez une minute avant de redemander un lien.";
  if (/invalid.*email/i.test(m)) return "Adresse email invalide.";
  return "Envoi du lien impossible pour le moment. Réessayez.";
}

export async function seDeconnecter() {
  if (BASE_REELLE) await supabaseNavigateur().auth.signOut();
  else demo.seDeconnecter();
  signaler();
}

export async function mettreAJour(c: Compte) {
  if (!BASE_REELLE) return demo.mettreAJour(c);
  const { error } = await supabaseNavigateur().from("comptes").update(modificationsClient(c)).eq("id", c.id);
  if (error) throw new Error("Enregistrement impossible. Réessayez.");
  signaler();
}

// --- Paiements --------------------------------------------------------------------

export async function mesTransactions(compteId: string): Promise<Transaction[]> {
  if (!BASE_REELLE) return demo.transactions().filter((t) => t.compteId === compteId);
  const { data } = await supabaseNavigateur().from("transactions").select("*").order("cree_le");
  return ((data ?? []) as LigneTransaction[]).map(versTransaction);
}

export async function transaction(ref: string): Promise<Transaction | null> {
  if (!BASE_REELLE) return demo.transactions().find((t) => t.ref === ref) ?? null;
  const { data } = await supabaseNavigateur().from("transactions").select("*").eq("ref", ref).maybeSingle();
  return data ? versTransaction(data as LigneTransaction) : null;
}

export async function verifierCodePromo(code: string, offre: CodeOffre, mois: number) {
  if (!BASE_REELLE) return demo.verifierCodePromo(code, offre, mois);
  return api<{ code: string; montant: number; remise: number; taux: number }>(`/api/promo?${new URLSearchParams({ code, offre, mois: String(mois) })}`);
}

export async function demanderPaiement(p: { offre: CodeOffre; mois: number; moyen: MoyenPaiement; telephone: string; codePromo?: string }) {
  if (!BASE_REELLE) return demo.demanderPaiement(p);
  return api<{ ref: string; urlPaiement: string }>("/api/paiement", { method: "POST", body: JSON.stringify(p) });
}

export async function confirmerPaiementSimule(ref: string) {
  if (!BASE_REELLE) demo.confirmerPaiementSimule(ref);
  else await api(`/api/paiement/${encodeURIComponent(ref)}`, { method: "POST", body: JSON.stringify({ action: "confirmer" }) });
  signaler();
}

export async function annulerPaiementSimule(ref: string) {
  if (!BASE_REELLE) demo.annulerPaiementSimule(ref);
  else await api(`/api/paiement/${encodeURIComponent(ref)}`, { method: "POST", body: JSON.stringify({ action: "annuler" }) });
  signaler();
}

// --- Alertes WhatsApp ---------------------------------------------------------------

export async function mesMessages(compteId: string): Promise<MessageEnvoye[]> {
  if (!BASE_REELLE) return demo.messages(compteId);
  const { data } = await supabaseNavigateur().from("messages_envoyes").select("*").order("envoye_le");
  return ((data ?? []) as LigneMessage[]).map(versMessage);
}

/** Alerte du jour, simulée (enregistrée dans la boîte « Mes alertes »). */
export async function envoyerAlerteSimulee(compteId: string, a: string, texte: string, avisIds: string[]) {
  if (!BASE_REELLE) demo.envoyerWhatsAppSimule(compteId, a, texte, avisIds);
  else {
    const { error } = await supabaseNavigateur().from("messages_envoyes").insert({ compte_id: compteId, a, texte, avis_ids: avisIds });
    if (error) throw new Error("Envoi impossible. Réessayez.");
  }
  signaler();
}

// --- Console d'administration -------------------------------------------------------

export interface Campagne {
  id: string;
  nom: string;
  canal: Ciblage["canal"];
  segment: Ciblage["segment"];
  secteurs: Ciblage["secteurs"];
  message: string;
  destinataires: number;
  envoyeeLe: string;
}

export interface DonneesAdmin {
  comptes: Compte[];
  transactions: Transaction[];
  codes: CodePromo[];
  campagnes: Campagne[];
}

const CLE_CAMPAGNES = "admin-campagnes";
const lireCampagnesDemo = (): Campagne[] => {
  try {
    return JSON.parse(localStorage.getItem(CLE_CAMPAGNES) || "[]");
  } catch {
    return [];
  }
};

export async function chargerDonneesAdmin(): Promise<DonneesAdmin> {
  if (BASE_REELLE) return api<DonneesAdmin>("/super-admin/api", { cache: "no-store" });
  return { comptes: demo.comptes(), transactions: demo.transactions(), codes: demo.codesPromo(), campagnes: lireCampagnesDemo() };
}

export async function adminCreerCode(d: { code: string; remise: number; limite: number | null; expireLe: string | null }) {
  if (BASE_REELLE) await api("/super-admin/api", { method: "POST", body: JSON.stringify({ action: "creer-code", ...d }) });
  else demo.enregistrerCodesPromo([creerCodePromo(d, demo.codesPromo(), new Date()), ...demo.codesPromo()]);
  signaler();
}

export async function adminBasculerCode(code: string, actif: boolean) {
  if (BASE_REELLE) await api("/super-admin/api", { method: "POST", body: JSON.stringify({ action: "basculer-code", code, actif }) });
  else demo.enregistrerCodesPromo(demo.codesPromo().map((x) => (x.code === code ? { ...x, actif } : x)));
  signaler();
}

export async function adminEnvoyerCampagne(d: { nom: string; message: string } & Ciblage): Promise<number> {
  if (BASE_REELLE) {
    const r = await api<{ destinataires: number }>("/super-admin/api", { method: "POST", body: JSON.stringify({ action: "campagne", ...d }) });
    signaler();
    return r.destinataires;
  }
  const cibles = audience(demo.comptes(), d, new Date());
  if (cibles.length === 0) throw new Error("Aucun destinataire pour ce ciblage.");
  if (d.canal === "whatsapp") for (const c of cibles) demo.envoyerWhatsAppSimule(c.id, c.alertes.whatsapp, personnaliser(d.message, c), []);
  const campagne: Campagne = { id: `cmp_${Date.now().toString(36)}`, nom: d.nom.trim(), canal: d.canal, segment: d.segment, secteurs: d.secteurs, message: d.message, destinataires: cibles.length, envoyeeLe: new Date().toISOString() };
  localStorage.setItem(CLE_CAMPAGNES, JSON.stringify([campagne, ...lireCampagnesDemo()]));
  signaler();
  return cibles.length;
}

/** Données de la console, rechargées après chaque changement. */
export function useDonneesAdmin() {
  const [etat, setEtat] = useState<{ donnees: DonneesAdmin | null; erreur: string | null }>({ donnees: null, erreur: null });
  const recharger = useCallback(() => {
    chargerDonneesAdmin().then((donnees) => setEtat({ donnees, erreur: null }), (e) => setEtat((s) => ({ ...s, erreur: (e as Error).message })));
  }, []);
  useEffect(() => {
    recharger();
    window.addEventListener(EVENEMENT, recharger);
    window.addEventListener("demo-base-change", recharger);
    window.addEventListener("storage", recharger);
    return () => {
      window.removeEventListener(EVENEMENT, recharger);
      window.removeEventListener("demo-base-change", recharger);
      window.removeEventListener("storage", recharger);
    };
  }, [recharger]);
  return { ...etat, recharger };
}
