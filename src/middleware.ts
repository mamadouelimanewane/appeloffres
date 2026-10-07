import { NextResponse, type NextRequest } from "next/server";
import { attenteRestante, decider, noterEchec, type Tentatives } from "@/lib/acces-admin";

/**
 * Échecs de connexion par adresse IP. Mémoire de l'instance serveur : protège
 * contre les essais en rafale, sans base de données. Pour un blocage partagé
 * entre toutes les instances, passer à une base (ex. Supabase ou Upstash).
 */
const tentatives = new Map<string, Tentatives>();

function adresse(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "inconnue";
}

/** Protège la console d'administration : identifiant et mot de passe demandés par le navigateur. */
export function middleware(req: NextRequest) {
  const entetes = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };
  const texte = { ...entetes, "Content-Type": "text/plain; charset=utf-8" };
  const ip = adresse(req);
  const maintenant = Date.now();

  const attente = attenteRestante(tentatives.get(ip), maintenant);
  if (attente > 0) {
    return new NextResponse(`Trop d'essais. Réessayez dans ${Math.ceil(attente / 60)} minute(s).`, { status: 429, headers: { ...texte, "Retry-After": String(attente) } });
  }

  const authorization = req.headers.get("authorization");
  const decision = decider(authorization, {
    ADMIN_UTILISATEUR: process.env.ADMIN_UTILISATEUR,
    ADMIN_MOT_DE_PASSE: process.env.ADMIN_MOT_DE_PASSE,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (decision === "autorise") {
    tentatives.delete(ip);
    const r = NextResponse.next();
    for (const [k, v] of Object.entries(entetes)) r.headers.set(k, v);
    return r;
  }
  if (decision === "desactive") {
    return new NextResponse("Page introuvable.", { status: 404, headers: texte });
  }
  // Une demande sans identifiants (première visite) n'est pas un échec ; des identifiants faux, si
  if (authorization) {
    const t = noterEchec(tentatives.get(ip), maintenant);
    tentatives.set(ip, t);
    if (tentatives.size > 10_000) tentatives.clear(); // garde-fou mémoire
    if (t.bloqueJusqua) {
      return new NextResponse("Trop d'essais. Réessayez dans 15 minutes.", { status: 429, headers: { ...texte, "Retry-After": String(attenteRestante(t, maintenant)) } });
    }
  }
  return new NextResponse("Accès réservé à l'administration.", {
    status: 401,
    headers: { ...texte, "WWW-Authenticate": 'Basic realm="Console Appeldoffres.sn", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/super-admin", "/super-admin/:path*"] };
