import { MailCheck } from "lucide-react";

/** Après une demande de lien de connexion : invite à ouvrir sa boîte mail. */
export function EmailEnvoye({ email, onRecommencer }: { email: string; onRecommencer: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700"><MailCheck className="h-7 w-7" /></span>
      <p className="text-lg font-bold">Vérifiez votre boîte mail</p>
      <p className="text-sm text-slate-600">
        Un lien de connexion a été envoyé à <b>{email}</b>. Ouvrez-le sur cet appareil ou sur votre téléphone : vous serez connecté automatiquement.
      </p>
      <p className="text-xs text-slate-500">Rien reçu après 2 minutes ? Regardez dans les courriers indésirables (spam).</p>
      <button type="button" className="btn-sec" onClick={onRecommencer}>Utiliser une autre adresse</button>
    </div>
  );
}
