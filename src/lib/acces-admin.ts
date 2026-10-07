/**
 * Accès à la console d'administration (/super-admin), vérifié par le middleware
 * avant l'envoi de la page. Identifiants dans les variables d'environnement
 * (Vercel → Settings → Environment Variables), jamais dans le code :
 *   ADMIN_UTILISATEUR, ADMIN_MOT_DE_PASSE (12 caractères au moins)
 */

export type Decision = "autorise" | "demander" | "desactive";

/** Comparaison en temps constant (ne révèle pas, par la durée, combien de caractères sont justes). */
export function egal(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function decider(
  authorization: string | null,
  env: { ADMIN_UTILISATEUR?: string; ADMIN_MOT_DE_PASSE?: string; NODE_ENV?: string },
): Decision {
  const utilisateur = env.ADMIN_UTILISATEUR;
  const motDePasse = env.ADMIN_MOT_DE_PASSE;
  if (!utilisateur || !motDePasse || motDePasse.length < 12) {
    // Non configuré : ouvert en local (npm run dev), fermé partout ailleurs
    return env.NODE_ENV === "development" ? "autorise" : "desactive";
  }
  if (!authorization?.startsWith("Basic ")) return "demander";
  let decode: string;
  try {
    decode = atob(authorization.slice(6).trim());
  } catch {
    return "demander";
  }
  const i = decode.indexOf(":");
  if (i < 0) return "demander";
  const okU = egal(decode.slice(0, i), utilisateur);
  const okM = egal(decode.slice(i + 1), motDePasse);
  return okU && okM ? "autorise" : "demander";
}

// --- Blocage après plusieurs échecs ------------------------------------------

export const ESSAIS_MAX = 5;
export const BLOCAGE_MS = 15 * 60_000;

export interface Tentatives {
  echecs: number;
  premierEchec: number; // ms
  bloqueJusqua: number | null; // ms
}

/** Encore bloqué ? Renvoie le nombre de secondes restantes, ou 0. */
export function attenteRestante(t: Tentatives | undefined, maintenant: number): number {
  if (!t?.bloqueJusqua || t.bloqueJusqua <= maintenant) return 0;
  return Math.ceil((t.bloqueJusqua - maintenant) / 1000);
}

/** Enregistre un échec : au 5e échec en 15 minutes, l'adresse est bloquée 15 minutes. */
export function noterEchec(t: Tentatives | undefined, maintenant: number): Tentatives {
  const fenetreEcoulee = !t || maintenant - t.premierEchec > BLOCAGE_MS || (t.bloqueJusqua !== null && t.bloqueJusqua <= maintenant);
  const base = fenetreEcoulee ? { echecs: 0, premierEchec: maintenant, bloqueJusqua: null } : t;
  const echecs = base.echecs + 1;
  return { echecs, premierEchec: base.premierEchec, bloqueJusqua: echecs >= ESSAIS_MAX ? maintenant + BLOCAGE_MS : null };
}
