import type { NextRequest } from "next/server";
import { verifierPromo } from "@/lib/supabase/operations";
import { repondre } from "@/lib/supabase/reponse";
import type { CodeOffre } from "@/lib/offres";

/** Aperçu de la remise sur la page d'abonnement (le montant est recalculé au paiement). */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  return repondre(() => verifierPromo(q.get("code") ?? "", q.get("offre") as CodeOffre, Number(q.get("mois"))));
}
