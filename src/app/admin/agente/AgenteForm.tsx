"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ejecutarAgenteLusha, estadoInicialAgente } from "@/lib/actions/agente";
import { SEGMENTOS } from "@/lib/lusha/icp";

function BotonEjecutar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Ejecutando... (puede tardar)" : "Ejecutar agente"}
    </button>
  );
}

export default function AgenteForm() {
  const [estado, formAction] = useFormState(ejecutarAgenteLusha, estadoInicialAgente);

  return (
    <form action={formAction} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Segmentos a buscar</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(SEGMENTOS).map((s) => (
            <label
              key={s.id}
              className="flex items-start gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <input type="checkbox" name="segmentos" value={s.id} className="mt-0.5" />
              <span>
                <span className="font-medium text-gray-900 block">{s.nombre}</span>
                <span className="text-gray-500 text-xs">{s.descripcion}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Límite por segmento
          </label>
          <input
            type="number"
            name="limitePorSegmento"
            defaultValue={10}
            min={10}
            max={100}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Mínimo 10 (lo exige Lusha). Cada contacto enriquecido consume créditos.
          </p>
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="autoAsignar" defaultChecked />
            Auto-asignar (round-robin por carga)
          </label>
        </div>
      </div>

      <BotonEjecutar />

      {estado.mensaje && (
        <p className={`text-sm ${estado.ok ? "text-emerald-700" : "text-red-600"}`}>{estado.mensaje}</p>
      )}
    </form>
  );
}
