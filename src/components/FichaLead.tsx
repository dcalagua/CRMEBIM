import type { Actividad, Lead, User } from "@prisma/client";
import EstadoBadge from "@/components/EstadoBadge";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import { construirLinkWhatsApp } from "@/lib/whatsapp";
import { asignarLead, cambiarEstadoLead, agregarNota } from "@/lib/actions/leads";

const ESTADOS = [
  "nuevo",
  "asignado",
  "contactado",
  "respondio",
  "agendado",
  "calificado",
  "descartado",
] as const;

const ETIQUETAS_ACTIVIDAD: Record<string, string> = {
  asignacion: "Asignación",
  whatsapp_abierto: "WhatsApp abierto",
  cambio_estado: "Cambio de estado",
  nota: "Nota",
};

export default function FichaLead({
  lead,
  actividades,
  ejecutivas,
  esAdmin,
}: {
  lead: Lead & { asignadaA: User | null };
  actividades: (Actividad & { user: User })[];
  ejecutivas: User[];
  esAdmin: boolean;
}) {
  const linkWhatsApp = construirLinkWhatsApp(
    lead.telefono,
    lead.empresa,
    lead.contactoNombre
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{lead.empresa}</h1>
              <p className="text-sm text-gray-500">
                {lead.contactoNombre ?? "Sin contacto"}
                {lead.cargo ? ` · ${lead.cargo}` : ""}
              </p>
            </div>
            <EstadoBadge estado={lead.estado} />
          </div>

          <dl className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <dt className="text-gray-400">Teléfono</dt>
              <dd className="text-gray-900">{lead.telefono}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Email</dt>
              <dd className="text-gray-900">{lead.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Sector</dt>
              <dd className="text-gray-900">{lead.sector ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Ciudad / Departamento</dt>
              <dd className="text-gray-900">
                {[lead.ciudad, lead.departamento].filter(Boolean).join(" / ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Origen</dt>
              <dd className="text-gray-900 capitalize">{lead.origen}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Ejecutiva</dt>
              <dd className="text-gray-900">{lead.asignadaA?.nombre ?? "Sin asignar"}</dd>
            </div>
            {lead.segmento && (
              <div className="col-span-2">
                <dt className="text-gray-400">Segmento (línea a ofrecer)</dt>
                <dd className="text-gray-900 font-medium">{lead.segmento}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <BotonWhatsApp leadId={lead.id} link={linkWhatsApp} />

            <form action={cambiarEstadoLead} className="flex items-center gap-2">
              <input type="hidden" name="leadId" value={lead.id} />
              <select
                name="estado"
                defaultValue={lead.estado}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md border border-gray-300 bg-white text-sm font-medium px-3 py-2 hover:bg-gray-50"
              >
                Actualizar estado
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Agregar nota</h2>
          <form action={agregarNota} className="space-y-3">
            <input type="hidden" name="leadId" value={lead.id} />
            <textarea
              name="texto"
              required
              rows={3}
              placeholder="Detalle de la conversación, próximos pasos, etc."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700"
            >
              Guardar nota
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Actividad</h2>
          <ul className="space-y-3">
            {actividades.map((a) => (
              <li key={a.id} className="text-sm border-l-2 border-gray-200 pl-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="font-medium text-gray-700">
                    {ETIQUETAS_ACTIVIDAD[a.tipo] ?? a.tipo}
                  </span>
                  <span>· {a.user.nombre}</span>
                  <span>· {new Date(a.timestamp).toLocaleString("es-BO")}</span>
                </div>
                {a.detalle && <p className="text-gray-800 mt-0.5">{a.detalle}</p>}
              </li>
            ))}
            {actividades.length === 0 && (
              <li className="text-sm text-gray-400">Sin actividad registrada aún.</li>
            )}
          </ul>
        </div>
      </div>

      {esAdmin && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Asignación</h2>
            <form action={asignarLead} className="space-y-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <select
                name="asignadaAId"
                defaultValue={lead.asignadaAId ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Sin asignar</option>
                {ejecutivas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-md border border-gray-300 bg-white text-sm font-medium px-3 py-2 hover:bg-gray-50"
              >
                Guardar asignación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
