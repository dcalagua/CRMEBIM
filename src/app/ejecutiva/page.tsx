import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EstadoBadge from "@/components/EstadoBadge";

const ORDEN_PRIORIDAD: Record<string, number> = {
  nuevo: 0,
  asignado: 0,
  contactado: 1,
  respondio: 1,
  agendado: 2,
  calificado: 3,
  descartado: 4,
};

const UN_DIA = 1000 * 60 * 60 * 24;

export default async function MisLeadsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const leads = await prisma.lead.findMany({ where: { asignadaAId: userId } });

  const leadsOrdenados = [...leads].sort((a, b) => {
    const prioridad = ORDEN_PRIORIDAD[a.estado] - ORDEN_PRIORIDAD[b.estado];
    if (prioridad !== 0) return prioridad;
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });

  const sinTocar = leads.filter((l) => {
    const dias = (Date.now() - new Date(l.updatedAt).getTime()) / UN_DIA;
    if (["nuevo", "asignado"].includes(l.estado)) return dias > 1;
    if (["contactado", "respondio", "agendado"].includes(l.estado)) return dias > 3;
    return false;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Mis leads</h1>

      {sinTocar.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          Tienes {sinTocar.length} lead(s) sin actividad hace más de 1 día (nuevos/asignados) o 3 días
          (en seguimiento). Priorízalos primero.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Ciudad</th>
              <th className="px-4 py-2 font-medium">Segmento</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leadsOrdenados.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-2 font-medium text-gray-900">{lead.empresa}</td>
                <td className="px-4 py-2 text-gray-600">{lead.contactoNombre ?? "—"}</td>
                <td className="px-4 py-2 text-gray-600">{lead.ciudad ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">{lead.segmento ?? "—"}</td>
                <td className="px-4 py-2">
                  <EstadoBadge estado={lead.estado} />
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/ejecutiva/leads/${lead.id}`}
                    className="text-emerald-700 hover:underline text-sm font-medium"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {leadsOrdenados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Aún no tienes leads asignados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
