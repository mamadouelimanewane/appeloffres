"use client";
/**
 * MODE DÉMONSTRATION — « base de données » simulée dans le navigateur.
 * Chaque fonction a la forme qu'aura l'appel au vrai serveur (Supabase,
 * PayTech, WhatsApp), pour pouvoir les remplacer une à une.
 * Rien ne quitte l'appareil : aucun paiement réel, aucun message envoyé.
 */
import { useEffect, useState } from "react";
import { appliquerPaiement, creerCompte, normaliserTelephone, type Compte, type Inscription } from "../compte";
import { annuler, confirmer, creerTransaction, montant, type MoyenPaiement, type Transaction } from "../paiement";
import type { CodeOffre } from "../offres";
import { appliquerCode, type CodePromo } from "../marketing";

export const MODE_DEMO = true;
/** Code de connexion simulé (en production : SMS ou WhatsApp à usage unique). */
export const CODE_DEMO = "123456";

export interface MessageEnvoye {
  id: string;
  compteId: string;
  a: string;
  texte: string;
  avisIds: string[];
  envoyeLe: string;
}

/** `codes` : même clé que la console admin (onglet Marketing), qui les crée. */
const CLES = { comptes: "demo-comptes", session: "demo-session", transactions: "demo-transactions", messages: "demo-messages", codes: "admin-codes-promo" };
const EVENEMENT = "demo-base-change";

function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : defaut;
  } catch {
    return defaut;
  }
}
function ecrire(cle: string, valeur: unknown) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {}
  window.dispatchEvent(new Event(EVENEMENT));
}
const nouvelId = (prefixe: string) => `${prefixe}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// --- Comptes et session ------------------------------------------------------

export function comptes(): Compte[] {
  return lire<Compte[]>(CLES.comptes, []);
}

export function compteActuel(): Compte | null {
  const id = lire<string | null>(CLES.session, null);
  return comptes().find((c) => c.id === id) ?? null;
}

export function inscrire(d: Inscription): Compte {
  const tel = normaliserTelephone(d.telephone);
  if (tel && comptes().some((c) => c.telephone === tel)) throw new Error("Un compte existe déjà avec ce numéro : connectez-vous.");
  const c = creerCompte(d, new Date(), nouvelId("cpt"));
  ecrire(CLES.comptes, [...comptes(), c]);
  ecrire(CLES.session, c.id);
  return c;
}

/** Étape 1 de la connexion : en production, envoi d'un code par SMS ou WhatsApp. */
export function demanderCode(telephone: string): { telephone: string } {
  const tel = normaliserTelephone(telephone);
  if (!tel) throw new Error("Numéro de téléphone sénégalais invalide.");
  if (!comptes().some((c) => c.telephone === tel)) throw new Error("Aucun compte avec ce numéro. Créez votre compte.");
  return { telephone: tel };
}

export function seConnecter(telephone: string, code: string): Compte {
  if (code.trim() !== CODE_DEMO) throw new Error("Code incorrect.");
  const c = comptes().find((x) => x.telephone === telephone);
  if (!c) throw new Error("Compte introuvable.");
  ecrire(CLES.session, c.id);
  return c;
}

export function seDeconnecter() {
  ecrire(CLES.session, null);
}

export function mettreAJour(c: Compte) {
  ecrire(CLES.comptes, comptes().map((x) => (x.id === c.id ? c : x)));
}

// --- Paiements (simulation de l'agrégateur) ----------------------------------

export function transactions(): Transaction[] {
  return lire<Transaction[]>(CLES.transactions, []);
}

/** En production : appel serveur à l'API de l'agrégateur, qui renvoie l'adresse de sa page de paiement. */
export function demanderPaiement(p: { offre: CodeOffre; mois: number; moyen: MoyenPaiement; telephone: string; codePromo?: string }): { ref: string; urlPaiement: string } {
  const c = compteActuel();
  if (!c) throw new Error("Connectez-vous pour vous abonner.");
  const tel = normaliserTelephone(p.telephone);
  if (!tel) throw new Error("Numéro de paiement invalide.");
  const { codePromo, ...demande } = p;
  // Le code est revérifié ici (en production : côté serveur), jamais cru sur parole depuis la page
  const remise = codePromo?.trim() ? verifierCodePromo(codePromo, p.offre, p.mois) : undefined;
  const t = creerTransaction({ compteId: c.id, ...demande, telephone: tel }, new Date(), nouvelId("PAY").toUpperCase(), remise && { code: remise.code, montant: remise.montant });
  ecrire(CLES.transactions, [...transactions(), t]);
  return { ref: t.ref, urlPaiement: `/paiement/${t.ref}` };
}

/** En production : notification (IPN) de l'agrégateur, vérifiée par signature côté serveur. */
export function confirmerPaiementSimule(ref: string): Compte {
  const t = transactions().find((x) => x.ref === ref);
  if (!t) throw new Error("Transaction introuvable.");
  const payee = confirmer(t, new Date());
  ecrire(CLES.transactions, transactions().map((x) => (x.ref === ref ? payee : x)));
  const c = comptes().find((x) => x.id === t.compteId);
  if (!c) throw new Error("Compte introuvable.");
  const maj = appliquerPaiement(c, t.offre, t.mois, new Date());
  mettreAJour(maj);
  // Une utilisation du code est comptée seulement quand le paiement est confirmé (une seule fois, grâce à `confirmer`)
  if (t.codePromo) ecrire(CLES.codes, codesPromo().map((x) => (x.code === t.codePromo ? { ...x, utilisations: x.utilisations + 1 } : x)));
  return maj;
}

export function annulerPaiementSimule(ref: string) {
  const t = transactions().find((x) => x.ref === ref);
  if (!t) return;
  ecrire(CLES.transactions, transactions().map((x) => (x.ref === ref ? annuler(t) : x)));
}

// --- Codes promo (créés dans la console admin, onglet Marketing) --------------

export function codesPromo(): CodePromo[] {
  return lire<CodePromo[]>(CLES.codes, []);
}

export function enregistrerCodesPromo(codes: CodePromo[]) {
  ecrire(CLES.codes, codes);
}

/** Prix après remise pour cette offre et cette durée ; lève une erreur si le code n'est pas valable. */
export function verifierCodePromo(saisie: string, offre: CodeOffre, mois: number): { code: string; montant: number; remise: number; taux: number } {
  const r = appliquerCode(montant(offre, mois), saisie, codesPromo(), new Date());
  return { code: r.code.code, montant: r.montant, remise: r.remise, taux: r.code.remise };
}

// --- Messages WhatsApp (boîte d'envoi simulée) --------------------------------

export function messages(compteId: string): MessageEnvoye[] {
  return lire<MessageEnvoye[]>(CLES.messages, []).filter((m) => m.compteId === compteId);
}

/** En production : envoi par l'API WhatsApp Business. */
export function envoyerWhatsAppSimule(compteId: string, a: string, texte: string, avisIds: string[]): MessageEnvoye {
  const m: MessageEnvoye = { id: nouvelId("msg"), compteId, a, texte, avisIds, envoyeLe: new Date().toISOString() };
  ecrire(CLES.messages, [...lire<MessageEnvoye[]>(CLES.messages, []), m]);
  return m;
}

// --- Hook React : se met à jour à chaque changement ---------------------------

export function useCompte(): { compte: Compte | null; pret: boolean } {
  const [etat, setEtat] = useState<{ compte: Compte | null; pret: boolean }>({ compte: null, pret: false });
  useEffect(() => {
    const maj = () => setEtat({ compte: compteActuel(), pret: true });
    maj();
    window.addEventListener(EVENEMENT, maj);
    window.addEventListener("storage", maj);
    return () => {
      window.removeEventListener(EVENEMENT, maj);
      window.removeEventListener("storage", maj);
    };
  }, []);
  return etat;
}
