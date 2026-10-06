import { FlaskConical } from "lucide-react";

/** Rappelle que comptes, paiements et messages sont simulés. */
export function BandeauDemo({ children }: { children?: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-violet-50 p-3 text-sm text-violet-900 ring-1 ring-violet-200">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        <b>Mode démonstration.</b> {children ?? "Les comptes, paiements et messages WhatsApp sont simulés et restent sur cet appareil : aucun paiement réel, aucun message envoyé."}
      </span>
    </p>
  );
}
