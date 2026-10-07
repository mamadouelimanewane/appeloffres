"use client";
import { use, useState } from "react";
import { ArrowLeft, Bot, Send, Sparkles, Save, Download, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { APPELS } from "@/lib/donnees";
import { notFound } from "next/navigation";

export default function AssistantRedaction({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const a = APPELS.find((x) => x.id === id);
  if (!a) return notFound();

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! J'ai analysé le Cahier des Prescriptions Techniques (CPT) de cet appel d'offres. Pour ce type de marché, le DAO exige une attention particulière sur la méthodologie d'exécution et le plan de sécurité. Par quoi voulez-vous commencer la rédaction de votre dossier ?" }
  ]);
  const [input, setInput] = useState("");
  const [documentContent, setDocumentContent] = useState("# Mémoire Technique\\n\\n## 1. Compréhension de la mission\\n[À rédiger...]\\n\\n## 2. Méthodologie d'exécution\\n[À rédiger...]\\n\\n## 3. Moyens humains et matériels\\n[À rédiger...]\\n\\n## 4. Planning d'exécution\\n[À rédiger...]");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: "user", text: input }];
    setMessages(newMsgs);
    setInput("");
    setIsTyping(true);

    // Simulation de l'IA qui rédige un bloc
    setTimeout(() => {
      const reponseIa = "J'ai rédigé la section Méthodologie en intégrant vos forces. J'ai insisté sur le respect des normes environnementales locales exigées à l'article 4.2 du DAO. J'ajoute cela directement au document.";
      setMessages([...newMsgs, { role: "assistant", text: reponseIa }]);
      
      const newDoc = documentContent.replace(
        "[À rédiger...]", 
        "Notre approche méthodologique s'articule autour de trois phases critiques :\\n1. Installation de chantier et sécurisation du périmètre (conforme norme ISO 45001).\\n2. Phase d'exécution avec phasage optimisé pour ne pas perturber les riverains.\\n3. Repli de chantier et gestion des déchets (tri sélectif certifié).\\n\\nCette méthode garantit le respect strict des délais imposés par le CCTP."
      );
      setDocumentContent(newDoc);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/appels/\${id}`} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-600" /> Assistant IA de Rédaction
            </h1>
            <p className="text-xs text-slate-500 truncate max-w-md">{a.titre}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-sec text-xs py-1.5"><Save className="h-4 w-4" /> Sauvegarder</button>
          <button className="btn text-xs py-1.5"><Download className="h-4 w-4" /> Exporter (Word)</button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Panneau de discussion IA */}
        <div className="w-full md:w-1/3 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 bg-brand-50 border-b border-brand-100">
            <h2 className="text-sm font-bold text-brand-900 flex items-center gap-2"><FileText className="h-4 w-4" /> Analyse du DAO</h2>
            <ul className="mt-2 space-y-1 text-xs text-brand-800">
              <li className="flex gap-1"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5" /> Type : Fournitures & Services</li>
              <li className="flex gap-1"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5" /> Exigence clé : Certification ISO 9001</li>
              <li className="flex gap-1"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5" /> Piège à éviter : Planning > 6 mois éliminatoire</li>
            </ul>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm \${m.role === 'user' ? 'bg-brand-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex gap-1">
                  <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={sendMessage} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ex: Rédige la méthode d'exécution..." 
                className="w-full bg-slate-100 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Editeur de document */}
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden min-h-full flex flex-col">
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Document Final (Modifiable)</span>
              <span className="flex items-center gap-1 text-xs text-brand-600 font-medium ml-auto"><Sparkles className="h-3.5 w-3.5" /> Co-piloté par l'IA</span>
            </div>
            <textarea 
              value={documentContent}
              onChange={e => setDocumentContent(e.target.value)}
              className="flex-1 w-full p-8 focus:outline-none font-serif text-[15px] leading-relaxed resize-none text-slate-800"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
