import Link from "next/link";
import {
  ArrowRight, BarChart3, BellRing, CalendarClock, Check, ClipboardCheck, FileText, FolderCheck, Search, ShieldCheck, Sparkles, Trophy,
} from "lucide-react";
import { compteARebours, dateFr, joursRestants, piecesPour } from "@/lib/data";
import { APPELS, ATTRIBUEES, A_VENIR } from "@/lib/donnees";
import { resumer } from "@/lib/stats";
import { BadgeSecteur } from "@/components/ui";
import { OFFRES } from "@/lib/offres";

// Recalculée toutes les heures pour que les comptes à rebours restent justes.
export const revalidate = 3600;

const resume = resumer(ATTRIBUEES);

const ETAPES = [
  { icone: Search, titre: "Repérez", texte: "Les appels d'offres de votre métier, collectés sur les sites officiels, et les marchés annoncés dans les plans de passation." },
  { icone: ClipboardCheck, titre: "Préparez", texte: "La liste des pièces à fournir pour chaque marché, cochée au fur et à mesure, et un brouillon de mémoire technique." },
  { icone: Trophy, titre: "Remportez", texte: "Les prix pratiqués et le nombre de concurrents pour fixer une offre juste, et un suivi des échéances pour ne rien rater." },
];

const FONCTIONS = [
  { icone: BellRing, titre: "Appels d'offres ouverts", texte: "Senelec, AGEROUTE, Port de Dakar, Banque mondiale… avec la date limite et le lien vers l'avis officiel.", href: "/appels" },
  { icone: CalendarClock, titre: "Marchés à venir", texte: "Les marchés inscrits aux plans de passation, avant même la publication de l'avis.", href: "/a-venir" },
  { icone: BarChart3, titre: "Qui gagne quoi", texte: "Montants attribués, nombre d'offres reçues et entreprises gagnantes, par produit ou service.", href: "/qui-gagne" },
  { icone: FileText, titre: "Pièces à fournir", texte: "NINEA, RCCM, attestations fiscale et sociale, garanties… une liste claire pour chaque marché.", href: "/appels" },
  { icone: Sparkles, titre: "Mémoire technique assisté", texte: "Un brouillon structuré rédigé à partir du profil de votre entreprise, à relire et compléter.", href: "/profil" },
  { icone: FolderCheck, titre: "Suivi des dossiers", texte: "Vos marchés suivis, leur échéance et le pourcentage de préparation, en un coup d'œil.", href: "/dossiers" },
];

// Veille et Pro viennent du catalogue commun ; « Dossier clé en main » est un service à l'acte.
const OFFRES_ACCUEIL = [
  ...OFFRES.map((o) => ({ nom: o.nom, prix: o.prixMensuel.toLocaleString("fr-FR").replace(/\u202f/g, " "), detail: o.detail, points: o.points, vedette: o.vedette, unite: undefined as string | undefined, href: `/inscription?offre=${o.code}` })),
  { nom: "Dossier clé en main", prix: "dès 75 000", detail: "Préparation avec un expert des marchés publics", points: ["Analyse du DAO", "Constitution du dossier", "Relecture avant dépôt"], vedette: false, unite: "par dossier", href: "/inscription" },
];

function ApercuProduit() {
  const vitrine = APPELS.find((a) => a.dateLimite && joursRestants(a.dateLimite) >= 0) ?? APPELS[0];
  if (!vitrine) return null;
  const j = vitrine.dateLimite ? joursRestants(vitrine.dateLimite) : null;
  const pieces = piecesPour(vitrine).slice(0, 4);
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-or-400/30 to-brand-300/20 blur-2xl" aria-hidden />
      <div className="relative rotate-1 rounded-3xl border border-white/20 bg-white p-6 pb-16 text-slate-800 shadow-2xl transition hover:rotate-0">
        <div className="flex items-center justify-between gap-3">
          <BadgeSecteur secteur={vitrine.secteur} />
          {j !== null && <span className="puce bg-orange-50 text-orange-700 ring-1 ring-orange-200">{compteARebours(j)}</span>}
        </div>
        <p className="mt-3 line-clamp-2 font-bold text-slate-900">{vitrine.titre}</p>
        <p className="mt-1 text-xs text-slate-500">{vitrine.autorite}{vitrine.dateLimite ? ` · limite ${dateFr(vitrine.dateLimite)}` : ""}</p>
        <div className="mt-5 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Dossier prêt</span>
          <span className="text-brand-700">75 %</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-500 to-brand-700" /></div>
        <ul className="mt-4 space-y-2 text-sm">
          {pieces.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className={`grid h-5 w-5 place-items-center rounded-md ${i < 3 ? "bg-brand-600 text-white" : "border border-slate-300"}`}>
                {i < 3 && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className={i < 3 ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800"}>{p.libelle}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 text-slate-800 shadow-xl sm:block">
        <p className="text-xs text-slate-500">Concurrence médiane</p>
        <p className="text-2xl font-extrabold text-brand-700">{resume.offresMedianes ?? "—"} offres</p>
      </div>
    </div>
  );
}

export default function Accueil() {
  const chiffres = [
    { valeur: APPELS.length, libelle: "appels d'offres ouverts", icone: BellRing },
    { valeur: A_VENIR.length, libelle: "marchés à venir repérés", icone: CalendarClock },
    { valeur: ATTRIBUEES.length, libelle: "marchés attribués analysés", icone: BarChart3 },
    { valeur: resume.partUneOffre !== null ? `${resume.partUneOffre} %` : "—", libelle: "des marchés n'ont reçu qu'une offre", icone: Trophy },
  ];

  return (
    <>
      {/* Bandeau d'accroche */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(242,177,0,.22),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(31,146,94,.45),transparent_60%)]" aria-hidden />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" aria-hidden />
        <div className="conteneur relative grid items-center gap-14 pb-28 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100">
              <span className="h-2 w-2 rounded-full bg-or-400" /> Conçu pour les PME du Sénégal
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Gagnez plus de <span className="bg-gradient-to-r from-or-300 to-or-500 bg-clip-text text-transparent">marchés publics</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/90">
              Trouvez les appels d&apos;offres de votre métier, anticipez les marchés à venir, préparez des dossiers complets et
              proposez le bon prix.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appels" className="btn-or">Voir les appels d&apos;offres <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/a-venir" className="btn-fantome">Marchés à venir</Link>
            </div>
            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-100/70">
              <ShieldCheck className="h-4 w-4 text-or-300" /> Sources officielles : DCMP · Senelec · AGEROUTE · Port de Dakar · Banque mondiale
            </p>
          </div>
          <ApercuProduit />
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="conteneur relative -mt-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {chiffres.map(({ valeur, libelle, icone: Icone }) => (
            <div key={libelle} className="carte flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icone className="h-5 w-5" /></span>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{valeur}</p>
                <p className="text-xs leading-snug text-slate-500">{libelle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="conteneur mt-24">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-600">Comment ça marche</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold sm:text-4xl">Du premier avis au marché gagné</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ETAPES.map(({ icone: Icone, titre, texte }, i) => (
            <div key={titre} className="carte relative p-7">
              <span className="absolute right-6 top-5 text-5xl font-extrabold text-slate-100">0{i + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-900/20"><Icone className="h-6 w-6" /></span>
              <h3 className="mt-5 text-lg font-bold">{titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctions */}
      <section className="mt-24 bg-white py-20">
        <div className="conteneur">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Tout en un</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Les outils d&apos;un service marchés, pour le prix d&apos;un abonnement</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FONCTIONS.map(({ icone: Icone, titre, texte, href }) => (
              <Link key={titre} href={href} className="carte-lien group p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white"><Icone className="h-5 w-5" /></span>
                <h3 className="mt-4 font-bold">{titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{texte}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">Découvrir <ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Le saviez-vous */}
      <section className="conteneur mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-or-50 to-white p-8 ring-1 ring-or-100 sm:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-or-700">Le saviez-vous ?</p>
              <p className="mt-3 text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl">
                La moitié des marchés publics analysés ont reçu <span className="text-brand-700">{resume.offresMedianes ?? "—"} offres ou moins</span>.
              </p>
              <p className="mt-3 max-w-2xl text-slate-600">
                La concurrence est souvent plus faible qu&apos;on ne le croit. Un dossier complet et un prix juste suffisent fréquemment à faire la différence.
              </p>
            </div>
            <Link href="/qui-gagne" className="btn">Voir les prix pratiqués <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="conteneur mt-24">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-600">Tarifs</p>
        <h2 className="mt-3 text-center text-3xl font-extrabold sm:text-4xl">Simple et sans engagement</h2>
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {OFFRES_ACCUEIL.map((o) => (
            <div key={o.nom} className={`relative flex flex-col rounded-3xl p-8 ${o.vedette ? "bg-brand-900 text-white shadow-releve ring-1 ring-brand-700 lg:-my-4" : "carte"}`}>
              {o.vedette && <span className="absolute -top-3 left-8 rounded-full bg-or-400 px-3 py-1 text-xs font-bold text-brand-950">Recommandé</span>}
              <h3 className={`text-lg font-bold ${o.vedette ? "text-white" : ""}`}>{o.nom}</h3>
              <p className={`mt-1 text-sm ${o.vedette ? "text-brand-100/80" : "text-slate-500"}`}>{o.detail}</p>
              <p className="mt-6">
                <span className={`text-4xl font-extrabold ${o.vedette ? "text-white" : "text-slate-900"}`}>{o.prix}</span>
                <span className={`ml-1 text-sm ${o.vedette ? "text-brand-100/80" : "text-slate-500"}`}>FCFA / {o.unite ?? "mois"}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {o.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${o.vedette ? "text-or-300" : "text-brand-600"}`} strokeWidth={3} />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={o.href} className={`mt-8 ${o.vedette ? "btn-or" : "btn-sec"}`}>{o.vedette ? "Essai gratuit 14 jours" : "Commencer"}</Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">Tarifs de lancement, indicatifs.</p>
      </section>

      {/* Appel final */}
      <section className="conteneur mt-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-950 px-8 py-14 text-center text-white sm:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-or-400/20 blur-3xl" aria-hidden />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">Prêt à répondre à votre prochain marché ?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-brand-100/90">Créez le profil de votre entreprise en deux minutes : il sert à préparer vos dossiers et vos mémoires techniques.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/inscription" className="btn-or">Essai gratuit 14 jours <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/appels" className="btn-fantome">Parcourir les appels d&apos;offres</Link>
          </div>
        </div>
      </section>
    </>
  );
}
