"use client";
import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, FileText, HandCoins, Landmark, Send, ShieldCheck } from "lucide-react";
import { fcfa } from "@/lib/data";
import { coutCaution, DUREE_SOUMISSION_MOIS } from "@/lib/financement";
import { lireNombre } from "@/lib/eligibilite";
import { PROFIL_VIDE, Profil, useLocal } from "@/lib/storage";
import { BandeauDemo } from "@/components/BandeauDemo";
import { TitrePage } from "@/components/ui";

const GARANTIES = [
  { icone: ShieldCheck, titre: "Garantie de soumission", texte: "Exigée avec l'offre. Elle prouve le sérieux du candidat et est restituée si l'offre n'est pas retenue. Délivrée par une banque ou une compagnie d'assurance agréée." },
  { icone: Landmark, titre: "Garantie de bonne exécution", texte: "Demandée à l'entreprise retenue, avant la signature du marché. Elle couvre l'acheteur si les travaux ou livraisons ne sont pas exécutés correctement." },
  { icone: HandCoins, titre: "Garantie de restitution d'avance", texte: "Permet de recevoir une avance de démarrage de l'acheteur. Elle garantit le remboursement de l'avance si le marché n'est pas exécuté." },
  { icone: Banknote, titre: "Préfinancement du marché", texte: "Crédit bancaire pour acheter le matériel ou payer le personnel avant les premiers paiements de l'acheteur, appuyé sur le marché obtenu." },
];

const DOCUMENTS_BANQUE = [
  "Avis d'appel d'offres et extrait du dossier précisant le montant et la forme de la garantie",
  "Statuts, RCCM et NINEA de l'entreprise",
  "États financiers des derniers exercices",
  "Relevés bancaires récents",
  "Références de marchés déjà exécutés",
  "Pour un préfinancement : le marché signé ou la notification d'attribution",
];

export default function Financement() {
  const [profil] = useLocal<Profil>("profil", PROFIL_VIDE);
  const [montant, setMontant] = useState("");
  const [taux, setTaux] = useState("2");
  const [duree, setDuree] = useState(String(DUREE_SOUMISSION_MOIS));
  const [demandes, setDemandes] = useLocal<{ date: string; type: string; montant: string; marche: string }[]>("demandes-financement", []);
  const [type, setType] = useState("Garantie de soumission");
  const [marche, setMarche] = useState("");
  const [envoye, setEnvoye] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("montant")) setMontant(p.get("montant")!);
    if (p.get("marche")) setMarche(p.get("marche")!);
  }, []);

  const m = lireNombre(montant) ?? 0;
  const cout = coutCaution(m, Number(taux.replace(",", ".")) || 0, Number(duree) || 0);

  function demander(e: React.FormEvent) {
    e.preventDefault();
    setDemandes([...demandes, { date: new Date().toISOString(), type, montant, marche }]);
    setEnvoye(true);
  }

  return (
    <>
      <TitrePage icone={Landmark} titre="Cautions et financement" sousTitre="La garantie de soumission bloque beaucoup de PME. Comprenez ce qui est demandé, estimez son coût et préparez votre demande à la banque." />
      <div className="conteneur space-y-8 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GARANTIES.map(({ icone: Icone, titre, texte }) => (
            <div key={titre} className="carte p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icone className="h-5 w-5" /></span>
              <p className="mt-3 font-bold">{titre}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{texte}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="carte p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Banknote className="h-5 w-5 text-brand-700" /> Estimer le coût d&apos;une caution</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700 sm:col-span-3">
                Montant de la garantie (FCFA)
                <input className="champ mt-1.5" inputMode="numeric" placeholder="Ex. : 15 000 000" value={montant} onChange={(e) => setMontant(e.target.value)} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Commission (% par an)
                <input className="champ mt-1.5" inputMode="decimal" value={taux} onChange={(e) => setTaux(e.target.value)} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Durée (mois)
                <input className="champ mt-1.5" inputMode="numeric" value={duree} onChange={(e) => setDuree(e.target.value)} />
              </label>
              <div className="rounded-xl bg-brand-50 p-3 ring-1 ring-brand-100">
                <p className="text-xs text-brand-800">Coût estimé</p>
                <p className="text-xl font-extrabold text-brand-900">{cout ? fcfa(cout) : "—"}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Estimation indicative : la commission, les frais de dossier et la durée facturée dépendent de chaque banque ou assureur. La garantie de soumission doit
              couvrir la durée de validité des offres fixée dans le dossier d&apos;appel d&apos;offres.
            </p>
          </section>

          <section className="carte p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><FileText className="h-5 w-5 text-brand-700" /> Ce que la banque vous demandera</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {DOCUMENTS_BANQUE.map((d) => <li key={d} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{d}</li>)}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Conseil : demandez la garantie au moins une à deux semaines avant la date limite. Pour les PME, le FONGIP (Fonds de garantie des investissements prioritaires)
              peut faciliter l&apos;accès au crédit bancaire : renseignez-vous auprès de lui et de votre banque.
            </p>
          </section>
        </div>

        <div className="carte p-6 bg-brand-50 border-brand-200 mt-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-brand-900">
            ⚡ Garantie "1-Clic" (API FONGIP / Banques)
          </h2>
          <p className="mt-2 text-brand-800 text-sm">
            Appeldoffres.sn est connecté au FONGIP et à 3 banques partenaires. En cliquant sur le bouton ci-dessous, notre système envoie votre "Score PME" et votre historique pour obtenir un <strong>accord de principe en moins de 10 secondes</strong>.
          </p>
          <button className="mt-4 btn bg-brand-700 hover:bg-brand-800 text-white w-full sm:w-auto" onClick={() => alert("Simulation API FONGIP : Demande envoyée avec votre Score PME (85/100). Vous recevrez l'accord de principe par email sous peu.")}>
            Demander la garantie en 1-clic
          </button>
        </div>

        <section className="carte p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Send className="h-5 w-5 text-brand-700" /> Être accompagné</h2>
          <p className="mt-1 text-sm text-slate-600">Décrivez votre besoin : nous vous aidons à préparer la demande et à l&apos;adresser aux banques et assureurs partenaires.</p>
          <div className="mt-4"><BandeauDemo>Nos partenariats avec des banques et assureurs sont en cours de constitution : votre demande est enregistrée sur cet appareil et n&apos;est transmise à personne pour l&apos;instant.</BandeauDemo></div>
          {envoye ? (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 p-4 text-sm font-medium text-brand-800 ring-1 ring-brand-200"><CheckCircle2 className="h-5 w-5" /> Demande enregistrée ({demandes.length} au total).</p>
          ) : (
            <form onSubmit={demander} className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">
                Besoin
                <select className="champ mt-1.5" value={type} onChange={(e) => setType(e.target.value)}>
                  {[...GARANTIES.map((g) => g.titre)].map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Montant (FCFA)
                <input className="champ mt-1.5" inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value)} required />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Marché concerné
                <input className="champ mt-1.5" value={marche} onChange={(e) => setMarche(e.target.value)} placeholder="Référence ou objet" />
              </label>
              <p className="text-xs text-slate-500 sm:col-span-2">Entreprise : {profil.entreprise || "à renseigner dans « Mon entreprise »"}</p>
              <button className="btn" type="submit"><Send className="h-4 w-4" /> Enregistrer ma demande</button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
