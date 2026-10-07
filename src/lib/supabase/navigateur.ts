"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLE_PUBLIQUE, SUPABASE_URL } from "./config";

let client: SupabaseClient | null = null;

/** Client du navigateur : clé publique, droits limités par la sécurité par ligne (RLS). */
export function supabaseNavigateur(): SupabaseClient {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_CLE_PUBLIQUE);
  return client;
}
