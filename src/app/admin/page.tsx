import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EstadoBadge from "@/components/EstadoBadge";

const ESTADOS = [
  "nuevo",
  "asignado",
  "contactado",
  "respondio",
  "agendado",
  "calificado",
  "descartado",
] as const;

const CONTACTADO_O_MAS = ["contactado", "respondio", "agendado", "calificado"];
const RESPONDIO_O_MAS = ["respondio", "agendado", "calificado"];

const ETAPAS_ABIERTAS_OPORTUNIDAD = ["creada", "propuesta_enviada", "negociacion"];

export default async function AdminDashboardPage() {
  const [porEstado, ejecutivas, leads, oportunidades, sinTocar] = await Promise.all([
    prisma.lead.groupBy({ by: ["estado"], _count: { _all: true } }),
    prisma.user.findMany({ where: { rol: "ejecutiva" }, orderBy: { nombre: "asc" } }),
    prisma.lead.findMany({ select: { id: true, estado: true, asignadaAId: true, createdAt: true } }),
    prisma.oportunidad.findMany(),
    prisma.lead.findMany({
      where: {
        asignadaAId: { not: null },
        OR: [
          {
            estado: { in: ["nuevo", "asignado"] },
            updatedAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
          },
          {
            estado: { in: ["contactado", "respondio", "agendado"] },
            updatedAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
          },
        ],
      },
      include: { asignadaA: true },
      orderBy: { updatedAt: "asc" },
      take: 20,
    }),
  ]);

  const conteoEstado = Object.fromEntries(ESTADOS.map((e) => [e, 0])) as Record<
    string,
    number
  >;
  for (const grupo of porEstado) conteoEstado[grupo.estado] = grupo._count._all;
  const totalLeads = leads.length;
  const maxEstado = Math.max(1, ...Object.values(conteoEstado));

  const statsPorEjecutiva = ejecutivas.map((ej) => {
    const propios = leads.filter((l) => l.asignadaAId === ej.id);
    const asignados = propios.length;
    const contactados = propios.filter((l) => CONTACTADO_O_MAS.includes(l.estado)).length;
    const respondidos = propios.filter((l) => RESPONDIO_O_MAS.includes(l.estado)).length;
    const agendados = propios.filter((l) => l.estado === "agendado" || l.estado === "calificado").length;
    const tasaRespuesta = contactados > 0 ? Math.round((respondidos / contactados) * 100) : 0;
    return { ejecutiva: ej, asignados, contactados, respondidos, agendados, tasaRespuesta };
  });

  const ultimos14dias = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const captadosPorDia = ultimos14dias.map((dia) => {
    const siguienteDia = new Date(dia);
    siguienteDia.setDate(siguienteDia.getDate() + 1);
    const count = leads.filter(
      (l) => l.createdAt >= dia && l.createdAt < siguienteDia
    ).length;
    return { dia, count };
  });
  const maxDia = Math.max(1, ...captadosPorDia.map((d) => d.count));

  const abiertas = oportunidades.filter((o) => ETAPAS_ABIERTAS_OPORTUNIDAD.includes(o.etapa));
  const ganadas = oportunidades.filter((o) => o.etapa === "cerrada_ganada");
  const perdidas = oportunidades.filter((o) => o.etapa === "cerrada_perdida");
  const cerradas = ganadas.length + perdidas.length;
  const valorPipelineAbierto = abiertas.reduce(
    (acc, o) => acc + (o.valorEstimado ? Number(o.valorEstimado) : 0),
    0
  );
  const valorGanado = ganadas.reduce(
    (acc, o) => acc + (o.valorEstimado ? Number(o.valorEstimado) : 0),
    0
  );
  const winRate = cerradas > 0 ? Math.round((ganadas.length / cerradas) * 100) : 0;
  const ciclosGanados = ganadas
    .filter((o) => o.cerradaEn)
    .map((o) => (o.cerradaEn!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const cicloPromedioDias =
    ciclosGanados.length > 0
      ? Math.round(ciclosGanados.reduce((a, b) => a + b, 0) / ciclosGanados.length)
      : null;

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Leads totales</p>
          <p className="text-2xl font-semibold text-gray-900">{totalLeads}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Sin asignar</p>
          <p className="text-2xl font-semibold text-gray-900">
            {leads.filter((l) => !l.asignadaAId).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Calificados</p>
          <p className="text-2xl font-semibold text-emerald-700">
            {conteoEstado.calificado}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Descartados</p>
          <p className="text-2xl font-semibold text-gray-400">
            {conteoEstado.descartado}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Embudo de estados</h2>
        <div className="space-y-2">
          {ESTADOS.map((estado) => (
            <div key={estado} className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <EstadoBadge estado={estado} />
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full"
                  style={{ width: `${(conteoEstado[estado] / maxEstado) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm text-gray-600">
                {conteoEstado[estado]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Pipeline de oportunidades (RevOps)</h2>
          <Link href="/admin/oportunidades" className="text-sm text-emerald-700 hover:underline font-medium">
            Ver pipeline completo →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400">Pipeline abierto (USD)</p>
            <p className="text-xl font-semibold text-gray-900">
              {valorPipelineAbierto.toLocaleString("es-BO")}
            </p>
            <p className="text-xs text-gray-400">{abiertas.length} activas</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ganado (USD)</p>
            <p className="text-xl font-semibold text-emerald-700">
              {valorGanado.toLocaleString("es-BO")}
            </p>
            <p className="text-xs text-gray-400">{ganadas.length} cerradas ganadas</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Win rate</p>
            <p className="text-xl font-semibold text-gray-900">{winRate}%</p>
            <p className="text-xs text-gray-400">{cerradas} cerradas</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ciclo de venta promedio</p>
            <p className="text-xl font-semibold text-gray-900">
              {cicloPromedioDias !== null ? `${cicloPromedioDias}d` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Leads captados · últimos 14 días
        </h2>
        <div className="flex items-end gap-1.5 h-24">
          {captadosPorDia.map(({ dia, count }) => (
            <div key={dia.toISOString()} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-emerald-500 rounded-t"
                style={{ height: `${(count / maxDia) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
                title={`${count} leads`}
              />
              <span className="text-[10px] text-gray-400">{dia.getDate()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Actividad y ranking por ejecutiva
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Ejecutiva</th>
              <th className="px-4 py-2 font-medium">Asignados</th>
              <th className="px-4 py-2 font-medium">Contactados</th>
              <th className="px-4 py-2 font-medium">Respondieron</th>
              <th className="px-4 py-2 font-medium">Agendados/Calificados</th>
              <th className="px-4 py-2 font-medium">Tasa respuesta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {statsPorEjecutiva
              .sort((a, b) => b.tasaRespuesta - a.tasaRespuesta)
              .map((s) => (
                <tr key={s.ejecutiva.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {s.ejecutiva.nombre}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{s.asignados}</td>
                  <td className="px-4 py-2 text-gray-600">{s.contactados}</td>
                  <td className="px-4 py-2 text-gray-600">{s.respondidos}</td>
                  <td className="px-4 py-2 text-gray-600">{s.agendados}</td>
                  <td className="px-4 py-2 font-medium text-emerald-700">
                    {s.tasaRespuesta}%
                  </td>
                </tr>
              ))}
            {statsPorEjecutiva.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Aún no hay ejecutivas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Leads sin tocar (+1 día si nuevos/asignados, +3 días en seguimiento)
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Ejecutiva</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Última actualización</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sinTocar.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-2 font-medium text-gray-900">{lead.empresa}</td>
                <td className="px-4 py-2 text-gray-600">{lead.asignadaA?.nombre}</td>
                <td className="px-4 py-2">
                  <EstadoBadge estado={lead.estado} />
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(lead.updatedAt).toLocaleDateString("es-BO")}
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
            {sinTocar.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Todo al día
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
