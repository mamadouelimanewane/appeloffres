import { utilisateurConnecte } from "@/lib/supabase/serveur";
import { creerPaiement, ErreurMetier, type DemandePaiement } from "@/lib/supabase/operations";
import { repondre } from "@/lib/supabase/reponse";

export async function POST(req: Request) {
  return repondre(async () => {
    const u = await utilisateurConnecte();
    if (!u) throw new ErreurMetier("Connectez-vous pour vous abonner.", 401);
    const d = (await req.json()) as DemandePaiement;
    return creerPaiement(u.id, { offre: d.offre, mois: Number(d.mois), moyen: d.moyen, telephone: d.telephone, codePromo: d.codePromo });
  });
}
