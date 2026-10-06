import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, BadgeCheck, Building2, CheckCircle2, ExternalLink, FileText, Mail, MousePointerClick, Send, ShieldCheck, Tags, UserRound } from "lucide-react";
import { TitrePage } from "@/components/ui";

export const metadata: Metadata = {
  title: "S'inscrire sur APPEL, la plateforme des marchés publics — Soumission PME",
  description: "Guide pas à pas pour créer le compte fournisseur de votre entreprise sur achatspublics.sn et répondre aux appels d'offres en ligne.",
};

const A_PREPARER = [
  { icone: FileText, titre: "Le NINEA de l'entreprise", texte: "La plateforme le vérifie directement auprès de l'ANSD et préremplit les informations de l'entreprise." },
  { icone: Mail, titre: "Une adresse e-mail active", texte: "Elle sert à activer le compte, puis à recevoir les notifications (réponses aux questions, ouverture des plis)." },
  { icone: UserRound, titre: "Le responsable légal", texte: "Nom et coordonnées du représentant de l'entreprise (gérant, directeur général…)." },
  { icone: Tags, titre: "Ce que vous vendez ou faites", texte: "Vos biens, services ou travaux, que vous choisirez dans la classification internationale de l'ONU (UNSPSC)." },
];

const ETAPES = [
  { icone: MousePointerClick, titre: "Ouvrir l'inscription", texte: "Allez sur achatspublics.sn et cliquez sur le bouton d'inscription, en haut à droite de la page." },
  { icone: FileText, titre: "Créer le compte", texte: "Remplissez le formulaire, puis cliquez sur « Créer un compte »." },
  { icone: Mail, titre: "Activer le compte", texte: "Suivez le message d'activation reçu par e-mail. Pensez à regarder dans les courriers indésirables." },
  { icone: Building2, titre: "Identifier l'entreprise", texte: "Connectez-vous et saisissez le NINEA : les données de l'ANSD se remplissent automatiquement. Complétez les contacts." },
  { icone: Tags, titre: "Déclarer vos biens et services", texte: "Cherchez par mot-clé (ex. « informatique ») et cochez vos activités. Il faut descendre au moins au 3e niveau, la « classe ». Puis « Sauvegarder la sélection »." },
  { icone: UserRound, titre: "Renseigner les représentants", texte: "Ajoutez le ou les responsables de l'entreprise dans la rubrique « Représentants »." },
  { icone: BadgeCheck, titre: "Attendre la validation", texte: "Un administrateur vérifie vos informations, puis valide définitivement le compte." },
];

const ENSUITE = [
  "Consulter les appels d'offres et les plans de passation",
  "Manifester votre intérêt pour un marché",
  "Poser une question à l'acheteur et recevoir sa réponse",
  "Télécharger le dossier d'appel d'offres et les modèles",
  "Déposer votre offre en ligne, de façon sécurisée",
  "Recevoir le procès-verbal d'ouverture des plis",
];

export default function GuideAppel() {
  return (
    <>
      <TitrePage
        icone={ShieldCheck}
        titre="S'inscrire sur APPEL"
        sousTitre="APPEL (achatspublics.sn) est la plateforme officielle de la commande publique au Sénégal. Pour déposer une offre en ligne, votre entreprise doit y avoir un compte fournisseur validé."
      >
        <a className="btn" href="https://www.achatspublics.sn" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" /> Ouvrir achatspublics.sn
        </a>
      </TitrePage>

      <div className="conteneur space-y-10 py-10">
        <section>
          <h2 className="text-xl font-extrabold">1. À préparer avant de commencer</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {A_PREPARER.map(({ icone: Icone, titre, texte }) => (
              <div key={titre} className="carte p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icone className="h-5 w-5" /></span>
                <p className="mt-3 font-bold">{titre}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{texte}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-extrabold">2. Les étapes de l&apos;inscription</h2>
          <ol className="mt-5 space-y-3">
            {ETAPES.map(({ icone: Icone, titre, texte }, i) => (
              <li key={titre} className="carte flex items-start gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-700 text-sm font-extrabold text-white">{i + 1}</span>
                <div>
                  <p className="flex items-center gap-2 font-bold"><Icone className="h-4 w-4 text-brand-700" /> {titre}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="carte p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold"><Send className="h-5 w-5 text-brand-700" /> 3. Une fois le compte validé</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {ENSUITE.map((e) => <li key={e} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{e}</li>)}
            </ul>
          </section>
          <section className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-or-50 p-5 text-sm text-or-700 ring-1 ring-or-100">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <b>Ne vous inscrivez pas la veille d&apos;une date limite.</b> La validation du compte par un administrateur n&apos;est pas immédiate :
                inscrivez votre entreprise dès maintenant, même sans marché en vue.
              </p>
            </div>
            <div className="carte p-6">
              <p className="font-bold">Besoin d&apos;aide ?</p>
              <p className="mt-1 text-sm text-slate-600">
                Notre offre <b>Dossier clé en main</b> comprend l&apos;accompagnement à l&apos;inscription sur APPEL, puis la constitution et la relecture de votre dossier.
              </p>
              <Link href="/inscription" className="btn mt-4">Être accompagné <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </section>
        </div>

        <p className="text-xs text-slate-500">
          Source : manuel d&apos;utilisation APPEL pour les fournisseurs, Autorité de régulation de la commande publique (ARCOP), version du 30/04/2026.
          La plateforme peut évoluer : en cas de différence, ce qui s&apos;affiche sur achatspublics.sn fait foi.
        </p>
      </div>
    </>
  );
}
