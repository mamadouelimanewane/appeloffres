import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseUtilisateur } from "@/lib/supabase/serveur";
import { creerCompteSiAbsent, ErreurMetier } from "@/lib/supabase/operations";
import { suiteSure } from "@/lib/supabase/lignes";

/**
 * Lien reçu par email (inscription ou connexion). Ouvre la session, crée la fiche
 * client à la première connexion, puis renvoie vers la page prévue.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const vers = (chemin: string) => NextResponse.redirect(new URL(chemin, url.origin));
  const sb = await supabaseUtilisateur();

  const tokenHash = url.searchParams.get("token_hash");
  const code = url.searchParams.get("code");
  const { error } = tokenHash
    ? await sb.auth.verifyOtp({ token_hash: tokenHash, type: (url.searchParams.get("type") || "email") as EmailOtpType })
    : code
      ? await sb.auth.exchangeCodeForSession(code)
      : { error: new Error("lien incomplet") };
  if (error) return vers("/connexion?erreur=lien");

  const { data } = await sb.auth.getUser();
  if (!data.user) return vers("/connexion?erreur=lien");
  try {
    const etat = await creerCompteSiAbsent(data.user);
    const suite = suiteSure(data.user.user_metadata?.suite);
    return vers(etat === "cree" ? suite : "/compte");
  } catch (e) {
    await sb.auth.signOut();
    const message = e instanceof ErreurMetier ? e.message : "Création du compte impossible. Réessayez.";
    return vers(`/inscription?erreur=${encodeURIComponent(message)}`);
  }
}
