"use client";

import { useState, useTransition } from "react";
import { registrarWhatsappAbierto } from "@/lib/actions/leads";

export type OpcionPlantilla = {
  id: string;
  nombre: string;
  link: string;
};

export default function BotonWhatsApp({
  leadId,
  opciones,
}: {
  leadId: string;
  opciones: OpcionPlantilla[];
}) {
  const [pending, startTransition] = useTransition();
  const [seleccionada, setSeleccionada] = useState(opciones[0]?.id ?? "");

  const opcionActual = opciones.find((o) => o.id === seleccionada) ?? opciones[0];

  function handleClick() {
    if (!opcionActual) return;
    window.open(opcionActual.link, "_blank", "noopener,noreferrer");
    startTransition(() => {
      registrarWhatsappAbierto(leadId);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={pending || !opcionActual}
        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        Abrir WhatsApp
      </button>
      {opciones.length > 1 && (
        <select
          value={seleccionada}
          onChange={(e) => setSeleccionada(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-2 text-sm"
        >
          {opciones.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
