"use client";
import { useState } from "react";
import { ArrowLeft, Users, FileCheck, Download, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Membre = { nom: string; ninea: string; rccm: string; part: number; mandataire: boolean };

const MEMBRE_VIDE: Membre = { nom: "", ninea: "", rccm: "", part: 0, mandataire: false };

export default function GenerateurGroupement() {
  const [membres, setMembres] = useState<Membre[]>([
    { nom: "", ninea: "", rccm: "", part: 60, mandataire: true },
    { nom: "", ninea: "", rccm: "", part: 40, mandataire: false }
  ]);
  const [objet, setObjet] = useState("");
  const [reference, setReference] = useState("");
  const [genere, setGenere] = useState(false);

  const totalParts = membres.reduce((s, m) => s + m.part, 0);

  const ajouterMembre = () => setMembres([...membres, { ...MEMBRE_VIDE, part: 0 }]);
  const supprimerMembre = (i: number) => setMembres(membres.filter((_, idx) => idx !== i));
  const modif = (i: number, champ: keyof Membre, val: string | number | boolean) => {
    setMembres(membres.map((m, idx) => idx === i ? { ...m, [champ]: val } : m));
  };
  const setMandataire = (i: number) => {
    setMembres(membres.map((m, idx) => ({ ...m, mandataire: idx === i })));
  };

  const mandataire = membres.find(m => m.mandataire);
  const genererContrat = () => {
    if (!objet || !reference || totalParts !== 100 || membres.some(m => !m.nom)) return;
    setGenere(true);
  };

  const contrat = `ACCORD DE GROUPEMENT CONJOINT ET SOLIDAIRE

RELATIF AU MARCHÉ N° ${reference}
OBJET : ${objet}

Entre les soussignés :
${membres.map((m, i) => `${i + 1}. ${m.nom || "[Nom PME]"}, immatriculée au RCCM sous le numéro ${m.rccm || "[N° RCCM]"}, NINEA : ${m.ninea || "[NINEA]"} ;`).join("\n")}

Il est convenu ce qui suit :

Article 1 – Constitution du Groupement
Les parties ci-dessus désignées constituent un groupement conjoint et solidaire conformément aux dispositions de l'article 35 et suivants du Code des Marchés Publics du Sénégal pour répondre à l'appel d'offres référencé ci-dessus.

Article 2 – Mandataire du Groupement
${mandataire?.nom || "[Mandataire]"} est désigné(e) comme entreprise mandataire du groupement. À ce titre, elle est seule habilitée à signer les offres et actes contractuels au nom de toutes les parties.

Article 3 – Répartition des Prestations
${membres.map(m => `- ${m.nom || "[Membre]"} prendra en charge ${m.part}% des prestations.`).join("\n")}

Article 4 – Responsabilité Solidaire
Les membres du groupement sont solidairement responsables de la bonne exécution du marché envers l'autorité contractante.

Article 5 – Durée
Le présent accord est valable pour la durée de validité des offres et, en cas d'attribution, pendant toute la durée d'exécution du marché.

Fait à Dakar, le ${new Date().toLocaleDateString("fr-FR")}

${membres.map(m => `SIGNATURE DE ${(m.nom || "[Membre]").toUpperCase()} : ___________________`).join("\n")}
`;

  return (
    <div className="conteneur py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Users className="h-8 w-8 text-brand-700" />
          Générateur d'Actes de Groupement
        </h1>
        <p className="mt-2 text-lg text-slate-600 max-w-2xl">
          En 2 minutes, générez un contrat de groupement solidaire <strong>conforme aux normes de l'ARCOP</strong>, sans passer par un avocat.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="carte p-6">
          <h2 className="text-lg font-bold mb-4">1. Informations du marché</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Référence de l'avis</label>
              <input type="text" className="champ w-full" placeholder="Ex: SENELEC/DAO/2026/042" value={reference} onChange={e => setReference(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Objet du marché</label>
              <input type="text" className="champ w-full" placeholder="Ex: Fourniture et pose de câbles HTA..." value={objet} onChange={e => setObjet(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="carte p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">2. Membres du groupement</h2>
            <button onClick={ajouterMembre} className="btn-sec text-sm py-1.5"><Plus className="h-4 w-4" /> Ajouter un membre</button>
          </div>

          <div className="space-y-4">
            {membres.map((m, i) => (
              <div key={i} className={`p-4 rounded-xl border ${m.mandataire ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">Membre {i + 1} {m.mandataire && <span className="text-brand-700 ml-2">★ Mandataire</span>}</span>
                  <div className="flex gap-2">
                    {!m.mandataire && <button onClick={() => setMandataire(i)} className="text-xs text-brand-600 font-semibold hover:underline">Définir comme mandataire</button>}
                    {membres.length > 2 && <button onClick={() => supprimerMembre(i)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                  <input type="text" className="champ sm:col-span-2" placeholder="Raison sociale" value={m.nom} onChange={e => modif(i, "nom", e.target.value)} />
                  <input type="text" className="champ" placeholder="NINEA" value={m.ninea} onChange={e => modif(i, "ninea", e.target.value)} />
                  <div className="relative">
                    <input type="number" className="champ pr-6" placeholder="Part %" value={m.part || ""} onChange={e => modif(i, "part", parseInt(e.target.value) || 0)} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-4 text-right text-sm font-bold ${totalParts === 100 ? "text-green-600" : "text-red-600"}`}>
            Total des parts : {totalParts}% {totalParts === 100 ? "✅" : "(doit être égal à 100%)"}
          </div>
        </div>

        <button onClick={genererContrat} className="btn w-full text-base py-4 justify-center" disabled={!objet || !reference || totalParts !== 100 || membres.some(m => !m.nom)}>
          <FileCheck className="h-5 w-5" /> Générer le contrat de groupement (ARCOP)
        </button>

        {genere && (
          <div className="carte overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center justify-between">
              <p className="text-sm font-bold text-green-800 flex items-center gap-2"><FileCheck className="h-4 w-4" /> Contrat généré — Prêt à signer</p>
              <button className="btn-sec text-xs py-1.5" onClick={() => navigator.clipboard.writeText(contrat)}><Download className="h-4 w-4" /> Copier / Exporter</button>
            </div>
            <pre className="p-6 text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-white overflow-x-auto">
              {contrat}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
