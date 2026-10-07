/**
 * Alertes WhatsApp : choix des avis à signaler à un client et rédaction du
 * message. En mode démonstration les messages sont seulement affichés ; en
 * production ils partiront par l'API WhatsApp Business (modèle de message validé).
 */
import type { Appel } from "./data.ts";
import type { Compte } from "./compte.ts";

const sansAccents = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Avis à envoyer : encore ouverts, dans un secteur suivi OU contenant un mot-clé
 * suivi, et jamais envoyés à ce client.
 */
export function avisPourAlerte(c: Compte, avis: Appel[], dejaEnvoyes: Set<string>, aujourdhui: string): Appel[] {
  if (!c.alertes.actives) return [];
  const mots = c.alertes.motsCles.map(sansAccents).filter(Boolean);
  return avis.filter((a) => {
    if (dejaEnvoyes.has(a.id)) return false;
    if (a.dateLimite && a.dateLimite < aujourdhui) return false;
    const texte = sansAccents(`${a.titre} ${a.autorite}`);
    return c.alertes.secteurs.includes(a.secteur) || mots.some((m) => texte.includes(m));
  });
}

/** Message WhatsApp : court, lisible sur téléphone, 5 avis au plus, puis un renvoi vers le site. */
export function messageWhatsApp(c: Compte, avis: Appel[], urlSite: string): string {
  const prenom = c.nom.split(" ")[0];
  const lignes = avis.slice(0, 5).map((a) => {
    const limite = a.dateLimite ? ` — limite ${a.dateLimite.split("-").reverse().join("/")}` : "";
    return `• *${a.titre.length > 90 ? a.titre.slice(0, 87) + "…" : a.titre}*\n  ${a.autorite}${limite}\n  ${urlSite}/appels/${a.id}`;
  });
  const reste = avis.length > 5 ? `\n…et ${avis.length - 5} autre(s) : ${urlSite}/appels` : "";
  return `Bonjour ${prenom} 👋\n${avis.length} nouvel(s) appel(s) d'offres pour ${c.entreprise} :\n\n${lignes.join("\n\n")}${reste}\n\nAppeldoffres.sn — répondez STOP pour ne plus recevoir d'alertes.`;
}
