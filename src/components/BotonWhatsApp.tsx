"use client";

import { useTransition } from "react";
import { registrarWhatsappAbierto } from "@/lib/actions/leads";

export default function BotonWhatsApp({
  leadId,
  link,
}: {
  leadId: string;
  link: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    window.open(link, "_blank", "noopener,noreferrer");
    startTransition(() => {
      registrarWhatsappAbierto(leadId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
    >
      Abrir WhatsApp
    </button>
  );
}
