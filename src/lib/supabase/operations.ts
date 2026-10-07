import "server-only";
import type { User } from "@supabase/supabase-js";
import { appliquerPaiement, creerCompte, normaliserTelephone, type Inscription } from "../compte";
import { appliquerCode, audience, creerCodePromo, personnaliser, type Ciblage, type CodePromo } from "../marketing";
import { OFFRES, type CodeOffre } from "../offres";
import { annuler, confirmer, creerTransaction, montant, MOYENS, type MoyenPaiement } from "../paiement";
import { SECTEURS, type Secteur } from "../data";
import { supabaseAdmin } from "./serveur";
import {
  ligneCode, ligneCompte, ligneTransaction, versCode, versCompte, versTransaction,
  type LigneCode, type LigneCompte, type LigneTransaction,
} from "./lignes";

/** Erreur à montrer telle quelle à l'utilisateur (les autres sont masquées). */
export class ErreurMetier extends Error {
  constructor(message: string, readonly statut = 400) {
    super(message);
  }
}

const nouvelleRef = () => `PAY${Date.now().toString(36)}${crypto.randomUUID().slice(0, 6)}`.toUpperCase();

// --- Comptes ----------------------------------------------------------------------

/**
 * Crée la fiche du client à sa première connexion, à partir des informations
 * saisies à l'inscription (gardées par Supabase avec l'adresse email).
 * L'essai gratuit est fixé ici, côté serveur : le navigateur ne peut pas le choisir.
 */
export async function creerCompteSiAbsent(user: User): Promise<"existant" | "cree"> {
  const sb = supabaseAdmin();
  const { data: existant } = await sb.from("comptes").select("id").eq("id", user.id).maybeSingle();
  if (existant) return "existant";

  const m = (user.user_metadata?.inscription ?? {}) as Partial<Inscription>;
  if (!m.nom || !m.entreprise || !m.telephone) throw new ErreurMetier("Inscription incomplète : recommencez depuis la page d'inscription.");
  const secteurs = (Array.isArray(m.secteurs) ? m.secteurs : []).filter((s): s is Secteur => SECTEURS.includes(s as Secteur));
  const c = creerCompte(
    { nom: String(m.nom), entreprise: String(m.entreprise), telephone: String(m.telephone), email: user.email ?? undefined, region: String(m.region || "Dakar"), secteurs, parrain: m.parrain ? String(m.parrain) : null },
    new Date(),
    user.id,
  );
  const { error } = await sb.from("comptes").insert(ligneCompte(c));
  if (error?.code === "23505") throw new ErreurMetier("Ce numéro de téléphone est déjà utilisé par un autre compte.", 409);
  if (error) throw error;
  return "cree";
}

// --- Codes promo --------------------------------------------------------------------

async function lireCodes(): Promise<CodePromo[]> {
  const { data, error } = await supabaseAdmin().from("codes_promo").select("*");
  if (error) throw error;
  return (data as LigneCode[]).map(versCode);
}

export async function verifierPromo(code: string, offre: CodeOffre, mois: number) {
  if (!OFFRES.some((o) => o.code === offre) || ![1, 3, 12].includes(mois)) throw new ErreurMetier("Offre ou durée invalide.");
  try {
    const r = appliquerCode(montant(offre, mois), code, await lireCodes(), new Date());
    return { code: r.code.code, montant: r.montant, remise: r.remise, taux: r.code.remise };
  } catch (e) {
    throw new ErreurMetier((e as Error).message);
  }
}

// --- Paiements ----------------------------------------------------------------------

export interface DemandePaiement {
  offre: CodeOffre;
  mois: number;
  moyen: MoyenPaiement;
  telephone: string;
  codePromo?: string;
}

/** Prix et remise recalculés ici : le navigateur n'envoie que des choix, jamais un montant. */
export async function creerPaiement(compteId: string, d: DemandePaiement) {
  if (!OFFRES.some((o) => o.code === d.offre)) throw new ErreurMetier("Offre inconnue.");
  if (!(d.moyen in MOYENS)) throw new ErreurMetier("Moyen de paiement inconnu.");
  const tel = normaliserTelephone(String(d.telephone ?? ""));
  if (!tel) throw new ErreurMetier("Numéro de paiement invalide.");
  const remise = d.codePromo?.trim() ? await verifierPromo(d.codePromo, d.offre, d.mois) : undefined;
  let t;
  try {
    t = creerTransaction({ compteId, offre: d.offre, mois: d.mois, moyen: d.moyen, telephone: tel }, new Date(), nouvelleRef(), remise && { code: remise.code, montant: remise.montant });
  } catch (e) {
    throw new ErreurMetier((e as Error).message);
  }
  const { error } = await supabaseAdmin().from("transactions").insert(ligneTransaction(t));
  if (error) throw error;
  return { ref: t.ref, urlPaiement: `/paiement/${t.ref}` };
}

/**
 * Issue d'un paiement. En production, la confirmation viendra de la notification
 * signée de l'agrégateur (PayTech) ; d'ici là, elle est simulée si PAIEMENT_SIMULE=1.
 */
export async function traiterPaiement(compteId: string, ref: string, action: "confirmer" | "annuler") {
  const sb = supabaseAdmin();
  const { data } = await sb.from("transactions").select("*").eq("ref", ref).eq("compte_id", compteId).maybeSingle();
  if (!data) throw new ErreurMetier("Transaction introuvable.", 404);
  const t = versTransaction(data as LigneTransaction);

  if (action === "annuler") {
    const a = annuler(t);
    await sb.from("transactions").update({ statut: a.statut }).eq("ref", ref).eq("statut", "en_attente");
    return a;
  }

  if (process.env.PAIEMENT_SIMULE !== "1") throw new ErreurMetier("Le paiement en ligne n'est pas encore ouvert.", 403);
  let payee;
  try {
    payee = confirmer(t, new Date());
  } catch (e) {
    throw new ErreurMetier((e as Error).message, 409);
  }
  // « où statut = en_attente » : une double confirmation ne prolonge jamais deux fois
  const { data: maj } = await sb.from("transactions").update({ statut: payee.statut, payee_le: payee.payeeLe }).eq("ref", ref).eq("statut", "en_attente").select("ref");
  if (!maj?.length) throw new ErreurMetier("Transaction déjà traitée.", 409);

  const { data: lc } = await sb.from("comptes").select("*").eq("id", compteId).single();
  const c = appliquerPaiement(versCompte(lc as LigneCompte), t.offre, t.mois, new Date());
  await sb.from("comptes").update({ abonnement_offre: c.abonnement.offre, abonnement_jusquau: c.abonnement.jusquau }).eq("id", compteId);
  if (t.codePromo) await sb.rpc("compter_utilisation_code", { p_code: t.codePromo });
  return payee;
}

// --- Console d'administration (protégée par mot de passe, voir src/middleware.ts) -------

export async function donneesAdmin() {
  const sb = supabaseAdmin();
  const [c, t, p, k] = await Promise.all([
    sb.from("comptes").select("*").order("cree_le"),
    sb.from("transactions").select("*").order("cree_le"),
    sb.from("codes_promo").select("*").order("cree_le", { ascending: false }),
    sb.from("campagnes").select("*").order("envoyee_le", { ascending: false }).limit(20),
  ]);
  for (const r of [c, t, p, k]) if (r.error) throw r.error;
  return {
    comptes: (c.data as LigneCompte[]).map(versCompte),
    transactions: (t.data as LigneTransaction[]).map(versTransaction),
    codes: (p.data as LigneCode[]).map(versCode),
    campagnes: (k.data ?? []).map((x) => ({ id: x.id, nom: x.nom, canal: x.canal, segment: x.segment, secteurs: x.secteurs, message: x.message, destinataires: x.destinataires, envoyeeLe: new Date(x.envoyee_le).toISOString() })),
  };
}

export async function adminCreerCode(d: { code: string; remise: number; limite?: number | null; expireLe?: string | null }) {
  let p;
  try {
    p = creerCodePromo(d, await lireCodes(), new Date());
  } catch (e) {
    throw new ErreurMetier((e as Error).message);
  }
  const { error } = await supabaseAdmin().from("codes_promo").insert(ligneCode(p));
  if (error?.code === "23505") throw new ErreurMetier(`Le code ${p.code} existe déjà.`, 409);
  if (error) throw error;
  return p;
}

export async function adminBasculerCode(code: string, actif: boolean) {
  const { error } = await supabaseAdmin().from("codes_promo").update({ actif }).eq("code", code);
  if (error) throw error;
}

/**
 * Envoi d'une campagne. Les destinataires sont recalculés ici (consentement
 * WhatsApp, secteurs, segment) : la console n'envoie que le ciblage.
 * Les messages sont simulés (boîte « Mes alertes ») jusqu'au branchement de l'API WhatsApp Business.
 */
export async function adminEnvoyerCampagne(d: { nom: string; message: string } & Ciblage) {
  if (!d.nom?.trim() || !d.message?.trim()) throw new ErreurMetier("Nom et message obligatoires.");
  const { comptes } = await donneesAdmin();
  const cibles = audience(comptes, { canal: d.canal, segment: d.segment, secteurs: d.secteurs ?? [] }, new Date());
  if (cibles.length === 0) throw new ErreurMetier("Aucun destinataire pour ce ciblage.");
  const sb = supabaseAdmin();
  if (d.canal === "whatsapp") {
    const { error } = await sb.from("messages_envoyes").insert(cibles.map((c) => ({ compte_id: c.id, a: c.alertes.whatsapp, texte: personnaliser(d.message, c), avis_ids: [] })));
    if (error) throw error;
  }
  const { error } = await sb.from("campagnes").insert({ nom: d.nom.trim(), canal: d.canal, segment: d.segment, secteurs: d.secteurs ?? [], message: d.message, destinataires: cibles.length });
  if (error) throw error;
  return { destinataires: cibles.length };
}
