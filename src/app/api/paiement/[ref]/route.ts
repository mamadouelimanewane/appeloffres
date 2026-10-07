import { utilisateurConnecte } from "@/lib/supabase/serveur";
import { ErreurMetier, traiterPaiement } from "@/lib/supabase/operations";
import { repondre } from "@/lib/supabase/reponse";

export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  return repondre(async () => {
    const u = await utilisateurConnecte();
    if (!u) throw new ErreurMetier("Connectez-vous.", 401);
    const { action } = (await req.json()) as { action?: string };
    if (action !== "confirmer" && action !== "annuler") throw new ErreurMetier("Action inconnue.");
    return traiterPaiement(u.id, (await params).ref, action);
  });
}
