/**
 * Fournisseurs d'IA interchangeables pour l'extraction des avis.
 * Choix par variables d'environnement (jamais de clé dans le code) :
 *   IA_FOURNISSEUR = deepseek | claude
 *   DEEPSEEK_API_KEY / ANTHROPIC_API_KEY
 *   IA_MODELE (facultatif) : par défaut deepseek-flash, ou claude-opus-5-5
 * Sans clé, `fournisseurIa()` renvoie null et l'enrichissement est simplement sauté.
 */
import Anthropic from "@anthropic-ai/sdk";

export interface FournisseurIa {
  nom: string;
  modele: string;
  /** Renvoie le texte brut de la réponse (censé contenir un objet json). */
  extraire(consigne: string, texte: string): Promise<string>;
}

function deepseek(cle: string, modele: string): FournisseurIa {
  return {
    nom: "DeepSeek",
    modele,
    async extraire(consigne, texte) {
      const r = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modele,
          messages: [
            { role: "system", content: consigne },
            { role: "user", content: `Avis à analyser (réponds en json) :\n\n${texte}` },
          ],
          response_format: { type: "json_object" },
          max_tokens: 2000,
          stream: false,
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!r.ok) throw new Error(`DeepSeek HTTP ${r.status} : ${(await r.text()).slice(0, 200)}`);
      const d = (await r.json()) as { choices?: { message?: { content?: string } }[] };
      const contenu = d.choices?.[0]?.message?.content ?? "";
      // La documentation prévient : le mode json peut parfois renvoyer un contenu vide
      if (!contenu.trim()) throw new Error("DeepSeek : réponse vide");
      return contenu;
    },
  };
}

function claude(cle: string, modele: string): FournisseurIa {
  const client = new Anthropic({ apiKey: cle });
  return {
    nom: "Claude",
    modele,
    async extraire(consigne, texte) {
      const reponse = await client.messages.create({
        model: modele,
        max_tokens: 4000,
        output_config: { effort: "low" }, // extraction simple : peu de réflexion nécessaire
        system: consigne,
        messages: [{ role: "user", content: `Avis à analyser (réponds en json) :\n\n${texte}` }],
      });
      if (reponse.stop_reason === "refusal") throw new Error("Claude : demande refusée");
      return reponse.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    },
  };
}

/**
 * Mode « simulation » (IA_FOURNISSEUR=simulation) : aucun appel extérieur, pour tester
 * toute la chaîne (téléchargement, PDF, contrôle, cache, affichage) sans clé.
 * Il ne « devine » que la date limite, avec la règle classique sur le texte.
 */
function simulation(): FournisseurIa {
  return {
    nom: "Simulation",
    modele: "simulation-locale",
    async extraire(_consigne, texte) {
      const { extraireDateLimite } = await import("../wordpress.ts");
      const iso = extraireDateLimite(texte);
      return JSON.stringify({ estUnAvis: true, dateLimite: iso ? iso.split("-").reverse().join("/") : null, piecesExigees: [], resume: "Lecture simulée (test sans IA)." });
    },
  };
}

export function fournisseurIa(env: Record<string, string | undefined> = process.env): FournisseurIa | null {
  if ((env.IA_FOURNISSEUR || "").toLowerCase() === "simulation") return simulation();
  // `||` et non `??` : sur GitHub, une variable non définie arrive comme texte vide
  const choix = (env.IA_FOURNISSEUR || (env.DEEPSEEK_API_KEY ? "deepseek" : env.ANTHROPIC_API_KEY ? "claude" : "")).toLowerCase();
  if (choix === "deepseek" && env.DEEPSEEK_API_KEY) return deepseek(env.DEEPSEEK_API_KEY, env.IA_MODELE || "deepseek-flash");
  if (choix === "claude" && env.ANTHROPIC_API_KEY) return claude(env.ANTHROPIC_API_KEY, env.IA_MODELE || "claude-opus-5-5");
  return null;
}
