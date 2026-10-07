import { ArrowLeft, Scale, FileWarning, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function GuideRecours() {
  return (
    <div className="conteneur py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold flex items-center gap-3">
        <Scale className="h-8 w-8 text-brand-700" />
        Guide des recours (ARCOP)
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Vous avez été éliminé injustement d'un marché public ? La loi sénégalaise vous donne le droit de contester. Voici les étapes et délais à respecter.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="carte p-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-or-600" /> 1. Le Recours Gracieux</h2>
          <p className="mt-2 text-sm text-slate-600">À adresser directement à l'Autorité Contractante (l'acheteur).</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><strong>Délai pour agir :</strong> 5 jours ouvrables à compter de la publication de l'attribution.</li>
            <li><strong>Forme :</strong> Lettre physique avec accusé de réception ou dépôt contre décharge.</li>
            <li><strong>Réponse :</strong> L'acheteur a 3 jours ouvrables pour répondre. S'il ne répond pas, le recours est considéré comme rejeté.</li>
          </ul>
        </div>
        <div className="carte p-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-brand-700" /> 2. Le Recours Contentieux</h2>
          <p className="mt-2 text-sm text-slate-600">À adresser au CRD (Comité de Règlement des Différends) de l'ARCOP.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><strong>Délai pour agir :</strong> 3 jours ouvrables après le rejet (ou non-réponse) du recours gracieux.</li>
            <li><strong>Coût :</strong> Consignation obligatoire (souvent un pourcentage du montant du marché ou forfait).</li>
            <li><strong>Effet :</strong> Suspend immédiatement la procédure de passation jusqu'à la décision.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 carte p-6 bg-slate-50 border-slate-200">
        <h2 className="text-lg font-bold flex items-center gap-2"><FileWarning className="h-5 w-5 text-slate-700" /> Modèle de lettre (Recours gracieux)</h2>
        <div className="mt-4 p-4 bg-white rounded-lg border font-mono text-sm whitespace-pre-wrap text-slate-700">
{`À l'attention de Monsieur le [Directeur Général / Maire...]
Objet : Recours gracieux suite à l'attribution du marché N° [Référence]

Monsieur le Directeur,

Par l'avis d'attribution provisoire publié le [Date], nous avons appris le rejet de notre offre pour le marché cité en objet. 
Conformément à l'article 89 du Code des Marchés Publics, nous contestons cette décision pour les motifs suivants :
- [Motif 1 : ex. Notre capacité financière a été jugée insuffisante alors que nous avons fourni l'attestation bancaire demandée]
- [Motif 2 : ...]

Nous vous saurions gré de bien vouloir réexaminer notre offre.
Dans l'attente, veuillez agréer...`}
        </div>
      </div>
    </div>
  );
}
