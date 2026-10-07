import { adminBasculerCode, adminCreerCode, adminEnvoyerCampagne, donneesAdmin, ErreurMetier } from "@/lib/supabase/operations";
import { repondre } from "@/lib/supabase/reponse";

// Sous /super-admin : protégé par le même identifiant et mot de passe (src/middleware.ts)
export const dynamic = "force-dynamic";

export async function GET() {
  return repondre(donneesAdmin);
}

export async function POST(req: Request) {
  return repondre(async () => {
    const d = await req.json();
    switch (d?.action) {
      case "creer-code":
        return adminCreerCode({ code: d.code, remise: Number(d.remise), limite: d.limite ?? null, expireLe: d.expireLe ?? null });
      case "basculer-code":
        return adminBasculerCode(String(d.code), Boolean(d.actif));
      case "campagne":
        return adminEnvoyerCampagne(d);
      default:
        throw new ErreurMetier("Action inconnue.");
    }
  });
}
