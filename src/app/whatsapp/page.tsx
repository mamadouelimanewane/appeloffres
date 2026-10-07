"use client";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Smartphone, CheckCircle2, BellRing, Settings } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/lib/storage";

export default function ConfigurationWhatsApp() {
  const [numero, setNumero] = useLocal("wa-numero", "");
  const [actif, setActif] = useLocal("wa-actif", false);
  const [saisi, setSaisi] = useState("");

  const lierCompte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saisi) return;
    setNumero(saisi);
    setActif(true);
    setSaisi("");
    alert("Un message de confirmation WhatsApp vous a été envoyé (Simulation).");
  };

  return (
    <div className="conteneur py-8 max-w-2xl">
      <Link href="/compte" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour au compte
      </Link>
      
      <div className="mt-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/20">
          <MessageCircle className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Assistant WhatsApp</h1>
          <p className="text-slate-600">Ne ratez plus aucun appel d'offres de votre secteur.</p>
        </div>
      </div>

      <div className="mt-8 carte p-6">
        {actif && numero ? (
          <div className="text-center py-6 animate-in fade-in">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="mt-4 text-xl font-bold">WhatsApp connecté !</h2>
            <p className="mt-2 text-slate-600">Les alertes sont envoyées au <strong className="text-slate-900">{numero}</strong></p>
            <div className="mt-6 flex flex-col gap-3 justify-center max-w-xs mx-auto">
              <button className="btn-sec w-full"><Settings className="h-4 w-4" /> Gérer mes alertes</button>
              <button className="text-red-600 text-sm font-medium hover:underline mt-2" onClick={() => { setActif(false); setNumero(""); }}>Déconnecter WhatsApp</button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><BellRing className="h-5 w-5 text-slate-700" /> Connecter votre compte</h2>
            <p className="mt-2 text-sm text-slate-600">Recevez les avis dès leur publication et interrogez notre assistant IA directement depuis l'application que vous utilisez tous les jours.</p>
            
            <form onSubmit={lierCompte} className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="tel" 
                  value={saisi}
                  onChange={(e) => setSaisi(e.target.value)}
                  placeholder="Ex: +221 77 123 45 67" 
                  className="champ pl-10 w-full"
                  required
                />
              </div>
              <button type="submit" className="btn bg-green-600 hover:bg-green-700 ring-green-600 text-white">Lier WhatsApp</button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <h3 className="font-bold text-slate-800">Comment ça marche ?</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>💬 <strong>Alertes temps réel :</strong> Un avis de Senelec sort ? Vous le recevez 5 minutes après.</li>
          <li>🤖 <strong>Assistant interactif :</strong> Envoyez "Marchés BTP Thiès" et l'IA vous répond par message.</li>
          <li>⏰ <strong>Rappels automatiques :</strong> Soyez alerté 48h avant l'expiration de vos attestations fiscales.</li>
        </ul>
      </div>
    </div>
  );
}
