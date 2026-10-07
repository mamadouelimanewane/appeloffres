/**
 * La vraie base est utilisée dès que ces deux variables sont définies
 * (Vercel → Settings → Environment Variables, et .env.local en local).
 * Sinon, le site reste en mode démonstration (données dans le navigateur).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_CLE_PUBLIQUE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const BASE_REELLE = Boolean(SUPABASE_URL && SUPABASE_CLE_PUBLIQUE);
