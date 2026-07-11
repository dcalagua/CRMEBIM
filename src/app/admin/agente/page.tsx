import { prisma } from "@/lib/prisma";
import AgenteForm from "./AgenteForm";

export default async function AgentePage() {
  const runs = await prisma.agenteRun.findMany({
    include: { ejecutadoPor: true },
    orderBy: { fecha: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Agente de captación Lusha</h1>
        <p className="text-sm text-gray-500 mb-4">
          Busca contactos en Bolivia según el perfil de cada línea de negocio de EBIM, los deduplica
          contra la base actual y los deja listos (o auto-asignados) para seguimiento por WhatsApp.
        </p>
        <AgenteForm />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Historial de corridas</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Fecha</th>
              <th className="px-4 py-2 font-medium">Ejecutado por</th>
              <th className="px-4 py-2 font-medium">Segmentos</th>
              <th className="px-4 py-2 font-medium">Traídos</th>
              <th className="px-4 py-2 font-medium">Nuevos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {runs.map((run) => {
              const filtros = run.filtrosUsados as { segmentos?: string[] } | null;
              return (
                <tr key={run.id}>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(run.fecha).toLocaleString("es-BO")}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{run.ejecutadoPor.nombre}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {filtros?.segmentos?.join(", ") ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-900 font-medium">{run.leadsTraidos}</td>
                  <td className="px-4 py-2 text-emerald-700 font-medium">{run.leadsNuevos}</td>
                </tr>
              );
            })}
            {runs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  El agente todavía no se ha ejecutado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
