import "server-only";
import { NextResponse } from "next/server";
import { BASE_REELLE } from "./config";
import { ErreurMetier } from "./operations";

/** Exécute une opération et renvoie du JSON ; seules les erreurs « métier » sont montrées au client. */
export async function repondre(f: () => Promise<unknown>) {
  if (!BASE_REELLE) return NextResponse.json({ erreur: "Base de données non configurée." }, { status: 503 });
  try {
    return NextResponse.json((await f()) ?? { ok: true });
  } catch (e) {
    if (e instanceof ErreurMetier) return NextResponse.json({ erreur: e.message }, { status: e.statut });
    console.error(e);
    return NextResponse.json({ erreur: "Erreur du serveur. Réessayez dans un instant." }, { status: 500 });
  }
}
