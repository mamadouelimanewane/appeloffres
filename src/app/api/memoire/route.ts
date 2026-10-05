import { NextResponse } from "next/server";
import type { Appel } from "@/lib/data";
import type { Profil } from "@/lib/storage";

const MODELE = "claude-sonnet-5-5";

function canevas(a: Appel, p: Profil): string {
  const nom = p.entreprise || "[Nom de l'entreprise]";
  return `MÉMOIRE TECHNIQUE — ${a.reference}
Objet : ${a.titre}
Candidat : ${nom} (NINEA ${p.ninea || "[à compléter]"})

1. PRÉSENTATION DU CANDIDAT
${nom} intervient dans le secteur ${p.secteur} depuis ${p.anneesExperience || "[X]"} ans.
${p.moyens || "[Décrire les moyens humains et matériels]"}

2. COMPRÉHENSION DU BESOIN
[Reformuler l'objet du marché et les attentes de ${a.autorite} avec vos propres mots.]

3. MÉTHODOLOGIE D'EXÉCUTION
[Étapes, organisation du chantier ou de la prestation, contrôle de la qualité.]

4. PLANNING
[Calendrier détaillé, jalons, délai total proposé.]

5. PERSONNEL ET MOYENS AFFECTÉS
[Équipe, rôles, qualifications, matériel.]

6. RÉFÉRENCES SIMILAIRES
${p.references || "[Lister les marchés comparables : client, objet, montant, année.]"}

7. GESTION DES RISQUES
[Principaux risques identifiés et mesures de prévention.]

(Version sans IA : configurez ANTHROPIC_API_KEY pour une rédaction automatique.)`;
}

export async function POST(req: Request) {
  const { appel, profil } = (await req.json()) as { appel: Appel; profil: Profil };
  if (!appel?.titre) return NextResponse.json({ erreur: "Appel d'offres manquant." }, { status: 400 });

  const cle = process.env.ANTHROPIC_API_KEY;
  if (!cle) return NextResponse.json({ texte: canevas(appel, profil) });

  const consigne = `Rédige en français un brouillon de mémoire technique pour une PME sénégalaise répondant à cet appel d'offres.
N'invente AUCUNE référence, chiffre, diplôme ou engagement : si une information manque, écris un champ [à compléter].
Structure : présentation du candidat, compréhension du besoin, méthodologie, planning, personnel et moyens, références, gestion des risques.

Appel d'offres : ${JSON.stringify(appel)}
Profil de l'entreprise : ${JSON.stringify(profil)}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": cle, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODELE, max_tokens: 2500, messages: [{ role: "user", content: consigne }] }),
    });
    if (!r.ok) return NextResponse.json({ texte: canevas(appel, profil) });
    const d = await r.json();
    const texte = d.content?.map((c: { text?: string }) => c.text ?? "").join("") || canevas(appel, profil);
    return NextResponse.json({ texte });
  } catch {
    return NextResponse.json({ texte: canevas(appel, profil) });
  }
}
