import type { Lead } from "@prisma/client";
import { agendarReunion } from "@/lib/actions/leads";

function formatearParaInput(fecha: Date | null): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReunionPanel({ lead }: { lead: Lead }) {
  const yaPaso = lead.reunionFecha ? new Date(lead.reunionFecha).getTime() < Date.now() : false;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Reunión</h2>
      {lead.reunionFecha && (
        <p className={`text-sm mb-3 ${yaPaso ? "text-gray-400" : "text-emerald-700 font-medium"}`}>
          {new Date(lead.reunionFecha).toLocaleString("es-BO", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
          {yaPaso ? " (ya pasó)" : ""}
          {lead.reunionNotas && <span className="block text-gray-500 mt-1">{lead.reunionNotas}</span>}
        </p>
      )}
      <form action={agendarReunion} className="space-y-3">
        <input type="hidden" name="leadId" value={lead.id} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            name="reunionFecha"
            defaultValue={formatearParaInput(lead.reunionFecha)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notas (agenda, link)</label>
          <input
            name="reunionNotas"
            defaultValue={lead.reunionNotas ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-600 text-white text-sm font-medium py-2 hover:bg-emerald-700"
        >
          {lead.reunionFecha ? "Actualizar reunión" : "Agendar reunión"}
        </button>
      </form>
    </div>
  );
}
