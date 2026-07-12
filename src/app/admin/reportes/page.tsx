import Link from "next/link";
import { prisma } from "@/lib/prisma";

const ORDEN_LEAD = ["nuevo", "asignado", "contactado", "respondio", "agendado", "calificado"] as const;
const ORDEN_OPORTUNIDAD = ["creada", "propuesta_enviada", "negociacion", "cerrada_ganada"] as const;

const PROBABILIDAD_ETAPA: Record<string, number> = {
  creada: 0.2,
  propuesta_enviada: 0.4,
  negociacion: 0.7,
};

export default async function ReportesPage() {
  const [leads, oportunidades, ejecutivas] = await Promise.all([
    prisma.lead.findMany({ select: { estado: true, sector: true, tamanoEmpresa: true, segmento: true, nivelDecision: true, origen: true, asignadaAId: true } }),
    prisma.oportunidad.findMany({ select: { etapa: true, valorEstimado: true, asignadaAId: true, createdAt: true, cerradaEn: true } }),
    prisma.user.findMany({ where: { rol: "ejecutiva" }, orderBy: { nombre: "asc" } }),
  ]);

  // --- Embudo con tasas de conversión ---
  const conteoLeadPorEtapa = ORDEN_LEAD.map((estado, i) => {
    const alcanzaronEstaOMas = leads.filter((l) => ORDEN_LEAD.indexOf(l.estado as (typeof ORDEN_LEAD)[number]) >= i).length;
    return { etapa: estado, count: alcanzaronEstaOMas };
  });

  const leadsCalificados = leads.filter((l) => l.estado === "calificado").length;
  const oportunidadesCreadas = oportunidades.length;
  const oportunidadesGanadas = oportunidades.filter((o) => o.etapa === "cerrada_ganada").length;
  const oportunidadesPerdidas = oportunidades.filter((o) => o.etapa === "cerrada_perdida").length;
  const oportunidadesCerradas = oportunidadesGanadas + oportunidadesPerdidas;

  const conteoOportunidadPorEtapa = ORDEN_OPORTUNIDAD.map((etapa, i) => {
    const alcanzaron = oportunidades.filter(
      (o) => o.etapa !== "cerrada_perdida" && ORDEN_OPORTUNIDAD.indexOf(o.etapa as (typeof ORDEN_OPORTUNIDAD)[number]) >= i
    ).length;
    return { etapa, count: alcanzaron };
  });

  const embudoCompleto = [
    ...conteoLeadPorEtapa.map((e) => ({ etapa: e.etapa, count: e.count })),
    ...conteoOportunidadPorEtapa.map((e) => ({ etapa: e.etapa, count: e.count })),
  ];

  const filasEmbudo = embudoCompleto.map((e, i) => {
    const anterior = i > 0 ? embudoCompleto[i - 1].count : e.count;
    const tasa = anterior > 0 ? Math.round((e.count / anterior) * 100) : 0;
    return { ...e, tasa: i === 0 ? 100 : tasa };
  });

  // --- Desgloses ---
  function desglosePor(campo: "sector" | "tamanoEmpresa" | "segmento" | "nivelDecision") {
    const mapa = new Map<string, number>();
    for (const l of leads) {
      const valor = l[campo] ?? "Sin dato";
      mapa.set(valor, (mapa.get(valor) ?? 0) + 1);
    }
    return Array.from(mapa.entries())
      .map(([valor, count]) => ({ valor, count }))
      .sort((a, b) => b.count - a.count);
  }

  const porSector = desglosePor("sector");
  const porTamano = desglosePor("tamanoEmpresa");
  const porSegmento = desglosePor("segmento");
  const porNivelDecision = desglosePor("nivelDecision");

  // --- Pronóstico ponderado ---
  const pipelineAbierto = oportunidades.filter((o) => PROBABILIDAD_ETAPA[o.etapa] !== undefined);
  const valorPipelineAbierto = pipelineAbierto.reduce((acc, o) => acc + Number(o.valorEstimado ?? 0), 0);
  const forecastPonderado = pipelineAbierto.reduce(
    (acc, o) => acc + Number(o.valorEstimado ?? 0) * (PROBABILIDAD_ETAPA[o.etapa] ?? 0),
    0
  );
  const valorGanado = oportunidades
    .filter((o) => o.etapa === "cerrada_ganada")
    .reduce((acc, o) => acc + Number(o.valorEstimado ?? 0), 0);

  // --- Origen de leads ---
  const porOrigen = desglosePorOrigen(leads);

  function desglosePorOrigen(ls: typeof leads) {
    const mapa = new Map<string, number>();
    for (const l of ls) mapa.set(l.origen, (mapa.get(l.origen) ?? 0) + 1);
    return Array.from(mapa.entries()).map(([valor, count]) => ({ valor, count }));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Reportería gerencial</h1>
          <p className="text-sm text-gray-500">
            Conversión por etapa, pronóstico de pipeline y desgloses para análisis ejecutivo.
          </p>
        </div>
        <a
          href="/admin/reportes/exportar"
          className="rounded-md border border-gray-300 bg-white text-sm font-medium px-4 py-2 hover:bg-gray-50"
        >
          Exportar CSV
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Pipeline abierto (USD)</p>
          <p className="text-2xl font-semibold text-gray-900">
            {valorPipelineAbierto.toLocaleString("es-BO")}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Forecast ponderado (USD)</p>
          <p className="text-2xl font-semibold text-indigo-700">
            {Math.round(forecastPonderado).toLocaleString("es-BO")}
          </p>
          <p className="text-[11px] text-gray-400">
            probabilidad 20/40/70% por creada/propuesta/negociación
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Ganado (USD)</p>
          <p className="text-2xl font-semibold text-emerald-700">
            {valorGanado.toLocaleString("es-BO")}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400">Win rate</p>
          <p className="text-2xl font-semibold text-gray-900">
            {oportunidadesCerradas > 0
              ? Math.round((oportunidadesGanadas / oportunidadesCerradas) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Embudo completo con tasa de conversión (prospección → cierre)
        </h2>
        <table className="w-full text-sm">
          <thead className="text-gray-500 text-left">
            <tr>
              <th className="py-1.5 font-medium">Etapa</th>
              <th className="py-1.5 font-medium">Cantidad</th>
              <th className="py-1.5 font-medium">Conversión vs. etapa anterior</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filasEmbudo.map((f) => (
              <tr key={f.etapa}>
                <td className="py-1.5 capitalize text-gray-900 font-medium">
                  {f.etapa.replaceAll("_", " ")}
                </td>
                <td className="py-1.5 text-gray-600">{f.count}</td>
                <td className="py-1.5 text-gray-600">{f.tasa}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3">
          {leadsCalificados} leads calificados → {oportunidadesCreadas} oportunidades creadas (
          {leadsCalificados > 0 ? Math.round((oportunidadesCreadas / leadsCalificados) * 100) : 0}
          %) → {oportunidadesGanadas} ganadas (
          {oportunidadesCreadas > 0 ? Math.round((oportunidadesGanadas / oportunidadesCreadas) * 100) : 0}
          %)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TablaDesglose titulo="Por sector" filas={porSector} />
        <TablaDesglose titulo="Por tamaño de empresa" filas={porTamano} />
        <TablaDesglose titulo="Por segmento (línea de negocio)" filas={porSegmento} />
        <TablaDesglose titulo="Por nivel de decisión alcanzado" filas={porNivelDecision} />
        <TablaDesglose titulo="Por origen" filas={porOrigen} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Pipeline por ejecutiva</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Ejecutiva</th>
              <th className="px-4 py-2 font-medium">Leads</th>
              <th className="px-4 py-2 font-medium">Oportunidades abiertas</th>
              <th className="px-4 py-2 font-medium">Forecast ponderado (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ejecutivas.map((ej) => {
              const susLeads = leads.filter((l) => l.asignadaAId === ej.id).length;
              const susOportunidades = oportunidades.filter(
                (o) => o.asignadaAId === ej.id && PROBABILIDAD_ETAPA[o.etapa] !== undefined
              );
              const forecast = susOportunidades.reduce(
                (acc, o) => acc + Number(o.valorEstimado ?? 0) * (PROBABILIDAD_ETAPA[o.etapa] ?? 0),
                0
              );
              return (
                <tr key={ej.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{ej.nombre}</td>
                  <td className="px-4 py-2 text-gray-600">{susLeads}</td>
                  <td className="px-4 py-2 text-gray-600">{susOportunidades.length}</td>
                  <td className="px-4 py-2 text-indigo-700 font-medium">
                    {Math.round(forecast).toLocaleString("es-BO")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Para más detalle o cruces personalizados, usa{" "}
        <Link href="/admin/reportes/exportar" className="text-emerald-700 hover:underline">
          Exportar CSV
        </Link>{" "}
        y ábrelo en Excel o Power BI.
      </p>
    </div>
  );
}

function TablaDesglose({ titulo, filas }: { titulo: string; filas: { valor: string; count: number }[] }) {
  const max = Math.max(1, ...filas.map((f) => f.count));
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{titulo}</h2>
      <div className="space-y-2">
        {filas.slice(0, 8).map((f) => (
          <div key={f.valor} className="flex items-center gap-3">
            <div className="w-32 shrink-0 text-xs text-gray-600 truncate">{f.valor}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-2.5 rounded-full"
                style={{ width: `${(f.count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-xs text-gray-600">{f.count}</span>
          </div>
        ))}
        {filas.length === 0 && <p className="text-xs text-gray-400">Sin datos.</p>}
      </div>
    </div>
  );
}
