import type { Oportunidad } from "@prisma/client";
import { crearOportunidad, actualizarOportunidad } from "@/lib/actions/oportunidades";

const ETAPAS = [
  "creada",
  "propuesta_enviada",
  "negociacion",
  "cerrada_ganada",
  "cerrada_perdida",
] as const;

const ETIQUETAS_ETAPA: Record<string, string> = {
  creada: "Creada",
  propuesta_enviada: "Propuesta enviada",
  negociacion: "Negociación",
  cerrada_ganada: "Cerrada (ganada)",
  cerrada_perdida: "Cerrada (perdida)",
};

function formatearFecha(fecha: Date | null): string {
  if (!fecha) return "";
  return new Date(fecha).toISOString().slice(0, 10);
}

export default function OportunidadPanel({
  leadId,
  leadEstado,
  oportunidad,
}: {
  leadId: string;
  leadEstado: string;
  oportunidad: Oportunidad | null;
}) {
  if (!oportunidad) {
    if (leadEstado !== "calificado") {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Oportunidad</h2>
          <p className="text-sm text-gray-400">
            Disponible cuando el lead esté en estado &quot;calificado&quot;.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Crear oportunidad</h2>
        <form action={crearOportunidad} className="space-y-3">
          <input type="hidden" name="leadId" value={leadId} />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Valor estimado (USD)
            </label>
            <input
              type="number"
              name="valorEstimado"
              min={0}
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Fecha de cierre estimada
            </label>
            <input
              type="date"
              name="fechaCierreEstimada"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 text-white text-sm font-medium py-2 hover:bg-emerald-700"
          >
            Crear oportunidad
          </button>
        </form>
      </div>
    );
  }

  const cerrada =
    oportunidad.etapa === "cerrada_ganada" || oportunidad.etapa === "cerrada_perdida";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Oportunidad</h2>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            oportunidad.etapa === "cerrada_ganada"
              ? "bg-emerald-50 text-emerald-700"
              : oportunidad.etapa === "cerrada_perdida"
              ? "bg-gray-100 text-gray-500"
              : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {ETIQUETAS_ETAPA[oportunidad.etapa]}
        </span>
      </div>

      {oportunidad.valorEstimado && (
        <p className="text-sm text-gray-600 mb-1">
          Valor estimado:{" "}
          <span className="font-medium text-gray-900">
            {oportunidad.moneda} {Number(oportunidad.valorEstimado).toLocaleString("es-BO")}
          </span>
        </p>
      )}
      {oportunidad.motivoPerdida && (
        <p className="text-sm text-gray-600 mb-1">
          Motivo de pérdida: <span className="text-gray-900">{oportunidad.motivoPerdida}</span>
        </p>
      )}

      {!cerrada && (
        <form action={actualizarOportunidad} className="space-y-3 mt-3">
          <input type="hidden" name="oportunidadId" value={oportunidad.id} />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Etapa</label>
            <select
              name="etapa"
              defaultValue={oportunidad.etapa}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {ETAPAS.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETAS_ETAPA[e]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Valor estimado (USD)
            </label>
            <input
              type="number"
              name="valorEstimado"
              min={0}
              step="0.01"
              defaultValue={oportunidad.valorEstimado ? Number(oportunidad.valorEstimado) : ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Fecha de cierre estimada
            </label>
            <input
              type="date"
              name="fechaCierreEstimada"
              defaultValue={formatearFecha(oportunidad.fechaCierreEstimada)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Motivo de pérdida (si aplica)
            </label>
            <input
              type="text"
              name="motivoPerdida"
              defaultValue={oportunidad.motivoPerdida ?? ""}
              placeholder="Precio, timing, competencia..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md border border-gray-300 bg-white text-sm font-medium py-2 hover:bg-gray-50"
          >
            Guardar
          </button>
        </form>
      )}
    </div>
  );
}
