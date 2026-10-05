import Link from "next/link";

const points = [
  ["Sachez avant les autres", "Les marchés inscrits aux plans de passation, avant même la publication de l'avis : préparez-vous à temps."],
  ["Ne ratez plus une échéance", "Les appels d'offres de votre métier, collectés sur les sites officiels, avec les dates limites bien visibles."],
  ["Un dossier complet du premier coup", "La liste des pièces à fournir selon le marché, cochée au fur et à mesure."],
  ["Un mémoire technique en minutes", "Un brouillon rédigé à partir de votre profil, que vous corrigez et complétez."],
];

export default function Accueil() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-brand-light p-8">
        <h1 className="text-3xl font-bold text-brand-dark">Gagnez des marchés publics, sans perdre vos dossiers sur un détail.</h1>
        <p className="mt-3 max-w-2xl text-gray-700">Conçu pour les PME sénégalaises : veille, liste de contrôle des pièces et aide à la rédaction.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/appels" className="btn">Voir les appels d&apos;offres</Link>
          <Link href="/profil" className="btn-sec">Créer le profil de mon entreprise</Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {points.map(([t, d]) => (
          <div key={t} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-2 text-sm text-gray-600">{d}</p>
          </div>
        ))}
      </section>
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-xl font-semibold">Tarifs prévus</h2>
        <ul className="mt-3 grid gap-3 text-sm md:grid-cols-3">
          <li className="rounded-lg border p-4"><b>Veille</b><br />15 000 FCFA / mois<br />Alertes et liste des pièces</li>
          <li className="rounded-lg border p-4"><b>Pro</b><br />35 000 FCFA / mois<br />+ mémoire technique assisté</li>
          <li className="rounded-lg border p-4"><b>Dossier clé en main</b><br />dès 75 000 FCFA<br />Préparation avec un expert</li>
        </ul>
      </section>
    </div>
  );
}
