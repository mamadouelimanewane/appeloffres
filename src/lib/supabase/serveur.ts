import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_CLE_PUBLIQUE, SUPABASE_URL } from "./config";

/** Client lié à l'utilisateur connecté (cookies de session) : mêmes droits que lui. */
export async function supabaseUtilisateur(): Promise<SupabaseClient> {
  const jar = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_CLE_PUBLIQUE, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (liste) => {
        try {
          for (const { name, value, options } of liste) jar.set(name, value, options);
        } catch {
          // Appelé depuis un composant serveur : la session sera rafraîchie par la prochaine route
        }
      },
    },
  });
}

/**
 * Client « administrateur » (clé service_role) : ignore la sécurité par ligne.
 * Utilisé uniquement côté serveur, après vérification des droits.
 */
export function supabaseAdmin(): SupabaseClient {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante (variables d'environnement du serveur).");
  return createClient(SUPABASE_URL, cle, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Utilisateur connecté (vérifié auprès de Supabase), ou null. */
export async function utilisateurConnecte() {
  const sb = await supabaseUtilisateur();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
