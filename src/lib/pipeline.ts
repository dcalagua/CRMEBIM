import { prisma } from "@/lib/prisma";

export type ColumnaPipeline =
  | "nuevo"
  | "asignado"
  | "contactado"
  | "respondio"
  | "agendado"
  | "calificado"
  | "propuesta_enviada"
  | "negociacion"
  | "ganado"
  | "perdido";

export const COLUMNAS: { id: ColumnaPipeline; titulo: string }[] = [
  { id: "nuevo", titulo: "Nuevo" },
  { id: "asignado", titulo: "Asignado" },
  { id: "contactado", titulo: "Contactado" },
  { id: "respondio", titulo: "Respondió" },
  { id: "agendado", titulo: "Agendado" },
  { id: "calificado", titulo: "Calificado" },
  { id: "propuesta_enviada", titulo: "Propuesta enviada" },
  { id: "negociacion", titulo: "Negociación" },
  { id: "ganado", titulo: "Ganado" },
  { id: "perdido", titulo: "Perdido / Descartado" },
];

export type TarjetaPipeline = {
  id: string;
  columna: ColumnaPipeline;
  empresa: string;
  contactoNombre: string | null;
  ejecutivaNombre: string | null;
  segmento: string | null;
  valorEstimado: number | null;
  href: string;
  updatedAt: Date;
};

/**
 * Trae leads + oportunidades de un dueño (ejecutiva) opcional y las combina en un
 * único set de tarjetas por columna, para el tablero Kanban del pipeline completo
 * (prospección WhatsApp -> oportunidad -> cierre).
 */
export async function obtenerTarjetasPipeline(opts?: {
  asignadaAId?: string;
  basePathLeads?: string;
}): Promise<TarjetaPipeline[]> {
  const filtroAsignada = opts?.asignadaAId ? { asignadaAId: opts.asignadaAId } : {};
  const basePathLeads = opts?.basePathLeads ?? "/admin/leads";

  const [leads, oportunidades] = await Promise.all([
    prisma.lead.findMany({
      where: { ...filtroAsignada },
      include: { asignadaA: true, oportunidades: { select: { id: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.oportunidad.findMany({
      where: { ...filtroAsignada },
      include: { lead: true, asignadaA: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const tarjetas: TarjetaPipeline[] = [];

  for (const lead of leads) {
    if (lead.estado === "descartado") {
      tarjetas.push({
        id: `lead-${lead.id}`,
        columna: "perdido",
        empresa: lead.empresa,
        contactoNombre: lead.contactoNombre,
        ejecutivaNombre: lead.asignadaA?.nombre ?? null,
        segmento: lead.segmento,
        valorEstimado: null,
        href: `${basePathLeads}/${lead.id}`,
        updatedAt: lead.updatedAt,
      });
      continue;
    }

    if (lead.estado === "calificado" && lead.oportunidades.length > 0) {
      // Ya tiene oportunidad: se representa por la tarjeta de oportunidad, no acá.
      continue;
    }

    tarjetas.push({
      id: `lead-${lead.id}`,
      columna: lead.estado as ColumnaPipeline,
      empresa: lead.empresa,
      contactoNombre: lead.contactoNombre,
      ejecutivaNombre: lead.asignadaA?.nombre ?? null,
      segmento: lead.segmento,
      valorEstimado: null,
      href: `${basePathLeads}/${lead.id}`,
      updatedAt: lead.updatedAt,
    });
  }

  for (const oportunidad of oportunidades) {
    const columna: ColumnaPipeline =
      oportunidad.etapa === "creada"
        ? "calificado"
        : oportunidad.etapa === "cerrada_ganada"
        ? "ganado"
        : oportunidad.etapa === "cerrada_perdida"
        ? "perdido"
        : (oportunidad.etapa as ColumnaPipeline);

    tarjetas.push({
      id: `oportunidad-${oportunidad.id}`,
      columna,
      empresa: oportunidad.lead.empresa,
      contactoNombre: oportunidad.lead.contactoNombre,
      ejecutivaNombre: oportunidad.asignadaA.nombre,
      segmento: oportunidad.lead.segmento,
      valorEstimado: oportunidad.valorEstimado ? Number(oportunidad.valorEstimado) : null,
      href: `${basePathLeads}/${oportunidad.leadId}`,
      updatedAt: oportunidad.updatedAt,
    });
  }

  return tarjetas;
}
