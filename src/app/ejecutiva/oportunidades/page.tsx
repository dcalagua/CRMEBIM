import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ETIQUETAS_ETAPA: Record<string, string> = {
  creada: "Creada",
  propuesta_enviada: "Propuesta enviada",
  negociacion: "Negociación",
  cerrada_ganada: "Ganada",
  cerrada_perdida: "Perdida",
};

const ESTILOS_ETAPA: Record<string, string> = {
  creada: "bg-indigo-50 text-indigo-700",
  propuesta_enviada: "bg-amber-50 text-amber-700",
  negociacion: "bg-purple-50 text-purple-700",
  cerrada_ganada: "bg-emerald-50 text-emerald-700",
  cerrada_perdida: "bg-gray-100 text-gray-500",
};

export default async function EjecutivaOportunidadesPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const oportunidades = await prisma.oportunidad.findMany({
    where: { asignadaAId: userId },
    include: { lead: true },
    orderBy: { updatedAt: "desc" },
  });

  const abiertas = oportunidades.filter((o) => !o.etapa.startsWith("cerrada"));
  const valorAbierto = abiertas.reduce(
    (acc, o) => acc + (o.valorEstimado ? Number(o.valorEstimado) : 0),
    0
  );
  const ganadas = oportunidades.filter((o) => o.etapa === "cerrada_ganada").length;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Mis oportunidades</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Abiertas</p>
          <p className="text-2xl font-semibold text-gray-900">{abiertas.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Valor en pipeline (USD)</p>
          <p className="text-2xl font-semibold text-gray-900">
            {valorAbierto.toLocaleString("es-BO")}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Ganadas</p>
          <p className="text-2xl font-semibold text-emerald-700">{ganadas}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Etapa</th>
              <th className="px-4 py-2 font-medium">Valor (USD)</th>
              <th className="px-4 py-2 font-medium">Cierre estimado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {oportunidades.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2 font-medium text-gray-900">{o.lead.empresa}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ESTILOS_ETAPA[o.etapa]}`}
                  >
                    {ETIQUETAS_ETAPA[o.etapa]}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {o.valorEstimado ? Number(o.valorEstimado).toLocaleString("es-BO") : "—"}
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {o.fechaCierreEstimada
                    ? new Date(o.fechaCierreEstimada).toLocaleDateString("es-BO")
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/ejecutiva/leads/${o.leadId}`}
                    className="text-emerald-700 hover:underline text-sm font-medium"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {oportunidades.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Aún no tienes oportunidades. Se crean desde un lead en estado
                  &quot;calificado&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
