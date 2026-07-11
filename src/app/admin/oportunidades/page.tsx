import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

const ETAPAS_ABIERTAS = ["creada", "propuesta_enviada", "negociacion"];

export default async function AdminOportunidadesPage() {
  const [oportunidades, ejecutivas] = await Promise.all([
    prisma.oportunidad.findMany({
      include: { lead: true, asignadaA: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({ where: { rol: "ejecutiva" }, orderBy: { nombre: "asc" } }),
  ]);

  const abiertas = oportunidades.filter((o) => ETAPAS_ABIERTAS.includes(o.etapa));
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
  const tasaGanadas = cerradas > 0 ? Math.round((ganadas.length / cerradas) * 100) : 0;
  const dealSizePromedio = ganadas.length > 0 ? valorGanado / ganadas.length : 0;

  const ciclosGanados = ganadas
    .filter((o) => o.cerradaEn)
    .map((o) => (o.cerradaEn!.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const cicloPromedioDias =
    ciclosGanados.length > 0
      ? Math.round(ciclosGanados.reduce((a, b) => a + b, 0) / ciclosGanados.length)
      : null;

  const conteoPorEtapa = Object.fromEntries(ETAPAS.map((e) => [e, 0])) as Record<string, number>;
  for (const o of oportunidades) conteoPorEtapa[o.etapa]++;
  const maxEtapa = Math.max(1, ...Object.values(conteoPorEtapa));

  const statsPorEjecutiva = ejecutivas.map((ej) => {
    const propias = oportunidades.filter((o) => o.asignadaAId === ej.id);
    const propiasGanadas = propias.filter((o) => o.etapa === "cerrada_ganada");
    const propiasPerdidas = propias.filter((o) => o.etapa === "cerrada_perdida");
    const propiasCerradas = propiasGanadas.length + propiasPerdidas.length;
    const valorGanadoEj = propiasGanadas.reduce(
      (acc, o) => acc + (o.valorEstimado ? Number(o.valorEstimado) : 0),
      0
    );
    return {
      ejecutiva: ej,
      abiertas: propias.filter((o) => ETAPAS_ABIERTAS.includes(o.etapa)).length,
      ganadas: propiasGanadas.length,
      perdidas: propiasPerdidas.length,
      tasaGanadas: propiasCerradas > 0 ? Math.round((propiasGanadas.length / propiasCerradas) * 100) : 0,
      valorGanado: valorGanadoEj,
    };
  });

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold text-gray-900">Pipeline de oportunidades</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Pipeline abierto (USD)</p>
          <p className="text-2xl font-semibold text-gray-900">
            {valorPipelineAbierto.toLocaleString("es-BO")}
          </p>
          <p className="text-xs text-gray-400">{abiertas.length} oportunidades activas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Ganado (USD)</p>
          <p className="text-2xl font-semibold text-emerald-700">
            {valorGanado.toLocaleString("es-BO")}
          </p>
          <p className="text-xs text-gray-400">{ganadas.length} cerradas ganadas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Win rate</p>
          <p className="text-2xl font-semibold text-gray-900">{tasaGanadas}%</p>
          <p className="text-xs text-gray-400">{cerradas} oportunidades cerradas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Ciclo de venta promedio</p>
          <p className="text-2xl font-semibold text-gray-900">
            {cicloPromedioDias !== null ? `${cicloPromedioDias}d` : "—"}
          </p>
          <p className="text-xs text-gray-400">
            Deal size promedio: USD {Math.round(dealSizePromedio).toLocaleString("es-BO")}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Embudo de oportunidades</h2>
        <div className="space-y-2">
          {ETAPAS.map((etapa) => (
            <div key={etapa} className="flex items-center gap-3">
              <div className="w-36 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ESTILOS_ETAPA[etapa]}`}
                >
                  {ETIQUETAS_ETAPA[etapa]}
                </span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-500 h-3 rounded-full"
                  style={{ width: `${(conteoPorEtapa[etapa] / maxEtapa) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm text-gray-600">
                {conteoPorEtapa[etapa]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Ranking por ejecutiva</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Ejecutiva</th>
              <th className="px-4 py-2 font-medium">Abiertas</th>
              <th className="px-4 py-2 font-medium">Ganadas</th>
              <th className="px-4 py-2 font-medium">Perdidas</th>
              <th className="px-4 py-2 font-medium">Win rate</th>
              <th className="px-4 py-2 font-medium">Valor ganado (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {statsPorEjecutiva
              .sort((a, b) => b.valorGanado - a.valorGanado)
              .map((s) => (
                <tr key={s.ejecutiva.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{s.ejecutiva.nombre}</td>
                  <td className="px-4 py-2 text-gray-600">{s.abiertas}</td>
                  <td className="px-4 py-2 text-emerald-700">{s.ganadas}</td>
                  <td className="px-4 py-2 text-gray-400">{s.perdidas}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{s.tasaGanadas}%</td>
                  <td className="px-4 py-2 text-gray-600">{s.valorGanado.toLocaleString("es-BO")}</td>
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
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Todas las oportunidades</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Ejecutiva</th>
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
                <td className="px-4 py-2 text-gray-600">{o.asignadaA.nombre}</td>
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
                    href={`/admin/leads/${o.leadId}`}
                    className="text-emerald-700 hover:underline text-sm font-medium"
                  >
                    Ver lead
                  </Link>
                </td>
              </tr>
            ))}
            {oportunidades.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Aún no hay oportunidades creadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
