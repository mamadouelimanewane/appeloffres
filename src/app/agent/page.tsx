"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Bot, Send, Smartphone, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Message = { de: "agent" | "user"; texte: string; heure: string };

const CONVERSATION_INITIALE: Message[] = [
  {
    de: "agent",
    texte: "🤖 Bonjour Patron ! Je suis votre Agent IA Appeldoffres.sn. Je surveille les marchés publics 24h/24 pour vous.",
    heure: "08:14"
  },
  {
    de: "agent",
    texte: "📢 ALERTE MARCHÉ : La Mairie de Dakar vient de publier un AO pour *Fourniture de 300 ordinateurs portables* (Budget : 150 000 000 FCFA, délai : 15 jours).\n\n✅ J'ai vérifié votre profil : toutes les qualifications sont OK (NINEA ✓, RCCM ✓, Attestation Fiscale ✓, Caution 2% disponible ✓).\n\n🎯 Win-Rate estimé : 71%\n\n💬 Voulez-vous que je rédige le dossier technique complet ?",
    heure: "08:15"
  },
  { de: "user", texte: "Oui", heure: "08:16" },
  {
    de: "agent",
    texte: "⚡ Parfait ! Je commence la rédaction...\n\n📝 Mémoire Technique → ✅\n📋 Liste des pièces → ✅\n💰 Prix optimal calculé → 138 500 000 FCFA (marge nette 12%)\n📄 Lettre de soumission → personnalisée\n\n✅ Dossier complet généré en 2 min 34s. PDF envoyé sur votre email. Bonne chance, Patron ! 🙏",
    heure: "08:18"
  },
];

const SUGGESTIONS = ["Oui, rédige le dossier", "Non, trop risqué", "Montre-moi les détails", "Quel est le score d'équité ?"];

export default function AgentAutonome() {
  const [messages, setMessages] = useState<Message[]>(CONVERSATION_INITIALE);
  const [saisie, setSaisie] = useState("");
  const [enTraitement, setEnTraitement] = useState(false);
  const [telephone, setTelephone] = useState("+221 77 000 00 00");
  const [active, setActive] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, enTraitement]);

  const envoyerMessage = (texte: string) => {
    if (!texte.trim()) return;
    const heure = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { de: "user", texte, heure }]);
    setSaisie("");
    setEnTraitement(true);
    setTimeout(() => {
      let reponse = "🤖 Bien reçu ! Je continue de surveiller les marchés pour vous. Je vous alerterai dès qu'une nouvelle opportunité se présente.";
      const t = texte.toLowerCase();
      if (t.includes("oui") || t.includes("rédige") || t.includes("redige")) {
        reponse = "⚡ Excellente décision !\n\n📝 Mémoire technique → ✅\n📋 Liste des pièces → ✅\n💰 Prix optimal calculé → ✅\n\n📲 Dossier PDF envoyé par email. Vous pouvez le déposer directement !";
      } else if (t.includes("non") || t.includes("risqué") || t.includes("risque")) {
        reponse = "✅ Compris, je passe à la prochaine opportunité. Je reste à l'affût pour vous !";
      } else if (t.includes("équité") || t.includes("equite") || t.includes("score")) {
        reponse = "🔍 Score d'Équité analysé : *74/100*. Marché assez ouvert, aucune clause suspecte majeure. Je recommande de soumissionner !";
      } else if (t.includes("détails") || t.includes("details") || t.includes("montre")) {
        reponse = "📋 Détails du marché :\n• Acheteur : Mairie de Dakar\n• Budget : 150 000 000 FCFA\n• Deadline : dans 15 jours\n• Pièces : NINEA, RCCM, Attestation fiscale, Caution 2%\n• Concurrents estimés : ~5\n• Votre avantage : Expérience similaire (2023)";
      }
      const h = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setMessages(prev => [...prev, { de: "agent", texte: reponse, heure: h }]);
      setEnTraitement(false);
    }, 1800);
  };

  return (
    <div className="conteneur py-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Bot className="h-8 w-8 text-brand-700" />
            Agent Autonome Zero-Click
          </h1>
          <p className="mt-2 text-lg text-slate-600 max-w-3xl">
            Un agent IA travaille <strong>24h/24 sur WhatsApp</strong> pour vous. Il détecte les marchés, vérifie votre éligibilité, calcule votre prix optimal et rédige votre dossier complet — vous répondez juste <strong className="text-brand-700">&quot;Oui&quot;</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`h-3 w-3 rounded-full ${active ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-sm font-bold text-slate-600">{active ? "Agent Actif" : "Agent Inactif"}</span>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {/* Config */}
        <div className="space-y-4">
          <div className="carte p-5">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Smartphone className="h-5 w-5 text-green-600" /> Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Votre numéro WhatsApp</label>
                <input className="champ w-full" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+221 7X XXX XX XX" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">L&apos;agent surveille</label>
                {["Fournitures & Équipements", "Travaux & BTP", "Informatique & Télécom", "Services & Consulting"].map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm text-slate-700 mb-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-brand-600" /> {s}
                  </label>
                ))}
              </div>
              <button
                onClick={() => setActive(!active)}
                className={`w-full py-3 rounded-xl font-bold transition ${active ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-600 text-white hover:bg-green-700"}`}
              >
                {active ? "⏹ Désactiver l'agent" : "▶ Activer l'agent IA"}
              </button>
            </div>
          </div>

          <div className="carte p-5 bg-slate-50">
            <h3 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-or-500" /> Ce que l&apos;agent fait seul</h3>
            <ul className="space-y-2">
              {[
                "Surveille les portails officiels 24h/24",
                "Vérifie votre éligibilité automatiquement",
                "Calcule le Win-Rate et le prix optimal",
                "Rédige le dossier technique complet",
                "Vous envoie le PDF prêt à déposer",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chat WhatsApp */}
        <div className="md:col-span-2">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg flex flex-col" style={{ height: "600px" }}>
            {/* Header */}
            <div className="bg-green-700 text-white px-4 py-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="font-bold">Agent IA — Appeldoffres.sn</p>
                <p className="text-xs text-green-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" /> en ligne
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#e5ddd5] p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                    m.de === "user" ? "bg-green-100 text-slate-800 rounded-br-sm" : "bg-white text-slate-800 rounded-bl-sm"
                  }`}>
                    {m.texte}
                    <p className={`text-[10px] mt-1 text-right ${m.de === "user" ? "text-green-600" : "text-slate-400"}`}>
                      {m.heure} {m.de === "user" && "✓✓"}
                    </p>
                  </div>
                </div>
              ))}
              {enTraitement && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 0.2, 0.4].map(d => (
                        <span key={d} className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Suggestions rapides */}
            <div className="bg-[#e5ddd5] px-3 py-2 flex gap-2 overflow-x-auto border-t border-black/5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => envoyerMessage(s)}
                  className="shrink-0 text-xs bg-white text-green-800 border border-green-200 rounded-full px-3 py-1.5 font-semibold hover:bg-green-50 transition whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="bg-[#f0f0f0] px-3 py-3 flex items-center gap-2">
              <input
                type="text"
                value={saisie}
                onChange={e => setSaisie(e.target.value)}
                onKeyDown={e => e.key === "Enter" && envoyerMessage(saisie)}
                placeholder="Tapez un message..."
                className="flex-1 rounded-full bg-white px-4 py-2 text-sm border border-slate-200 outline-none"
              />
              <button
                onClick={() => envoyerMessage(saisie)}
                className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
