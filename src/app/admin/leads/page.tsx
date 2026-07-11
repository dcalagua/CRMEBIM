import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EstadoBadge from "@/components/EstadoBadge";
import type { EstadoLead } from "@prisma/client";

const ESTADOS: EstadoLead[] = [
  "nuevo",
  "asignado",
  "contactado",
  "respondio",
  "agendado",
  "calificado",
  "descartado",
];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { estado?: string; ejecutiva?: string };
}) {
  const estado = searchParams.estado as EstadoLead | undefined;
  const ejecutivaId = searchParams.ejecutiva;

  const [leads, ejecutivas] = await Promise.all([
    prisma.lead.findMany({
      where: {
        ...(estado ? { estado } : {}),
        ...(ejecutivaId ? { asignadaAId: ejecutivaId } : {}),
      },
      include: { asignadaA: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findMany({
      where: { rol: "ejecutiva", activo: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Leads</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/leads/importar"
            className="rounded-md border border-gray-300 bg-white text-sm font-medium px-4 py-2 hover:bg-gray-50"
          >
            Importar CSV
          </Link>
          <Link
            href="/admin/leads/nuevo"
            className="rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700"
          >
            + Nuevo lead
          </Link>
        </div>
      </div>

      <form className="flex gap-3 items-end" method="get">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select
            name="estado"
            defaultValue={estado ?? ""}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ejecutiva</label>
          <select
            name="ejecutiva"
            defaultValue={ejecutivaId ?? ""}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {ejecutivas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-gray-300 bg-white text-sm font-medium px-4 py-1.5 hover:bg-gray-50"
        >
          Filtrar
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Ciudad</th>
              <th className="px-4 py-2 font-medium">Origen</th>
              <th className="px-4 py-2 font-medium">Segmento</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Ejecutiva</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-2 font-medium text-gray-900">{lead.empresa}</td>
                <td className="px-4 py-2 text-gray-600">{lead.contactoNombre ?? "—"}</td>
                <td className="px-4 py-2 text-gray-600">{lead.ciudad ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500 capitalize">{lead.origen}</td>
                <td className="px-4 py-2 text-gray-500">{lead.segmento ?? "—"}</td>
                <td className="px-4 py-2">
                  <EstadoBadge estado={lead.estado} />
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {lead.asignadaA?.nombre ?? "Sin asignar"}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-emerald-700 hover:underline text-sm font-medium"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  No hay leads con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
