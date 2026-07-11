import { prisma } from "@/lib/prisma";
import { crearClienteLusha } from "@/lib/lusha/client";
import { SEGMENTOS, PAIS_OBJETIVO, type SegmentoId } from "@/lib/lusha/icp";
import { normalizarTelefono } from "@/lib/whatsapp";
import { cargaActualPorEjecutiva, elegirEjecutivaConMenosCarga } from "@/lib/asignacion";

export type ResultadoAgente = {
  traidos: number;
  nuevos: number;
  duplicados: number;
  sinTelefono: number;
  asignados: number;
};

export async function correrAgenteLusha(opts: {
  segmentos: SegmentoId[];
  limitePorSegmento: number;
  ejecutadoPorId: string;
  autoAsignar: boolean;
}): Promise<ResultadoAgente> {
  const cliente = crearClienteLusha();

  const existentes = new Set(
    (await prisma.lead.findMany({ select: { telefono: true } })).map((l) => l.telefono)
  );

  const cargas = opts.autoAsignar ? await cargaActualPorEjecutiva() : new Map<string, number>();

  let traidos = 0;
  let nuevos = 0;
  let duplicados = 0;
  let sinTelefono = 0;
  let asignados = 0;

  for (const segmentoId of opts.segmentos) {
    const criterios = SEGMENTOS[segmentoId];
    const contactos = await cliente.prospectar(criterios, PAIS_OBJETIVO, opts.limitePorSegmento);
    traidos += contactos.length;

    for (const contacto of contactos) {
      if (!contacto.telefono) {
        sinTelefono++;
        continue;
      }

      const telefono = normalizarTelefono(contacto.telefono);
      if (existentes.has(telefono)) {
        duplicados++;
        continue;
      }
      existentes.add(telefono);

      let asignadaAId: string | null = null;
      if (opts.autoAsignar && cargas.size > 0) {
        asignadaAId = elegirEjecutivaConMenosCarga(cargas);
        if (asignadaAId) cargas.set(asignadaAId, (cargas.get(asignadaAId) ?? 0) + 1);
      }

      const lead = await prisma.lead.create({
        data: {
          empresa: contacto.empresa,
          contactoNombre: contacto.nombre,
          contactoApellido: contacto.apellido,
          cargo: contacto.cargo,
          nivelDecision: contacto.nivelDecision,
          telefono,
          email: contacto.email,
          linkedinContacto: contacto.linkedinContacto,
          sector: contacto.sector,
          tamanoEmpresa: contacto.tamanoEmpresa,
          ciudad: contacto.ciudad,
          origen: "lusha",
          lushaId: contacto.lushaId,
          segmento: criterios.nombre,
          estado: asignadaAId ? "asignado" : "nuevo",
          asignadaAId: asignadaAId ?? undefined,
        },
      });
      nuevos++;

      if (asignadaAId) {
        asignados++;
        await prisma.actividad.create({
          data: {
            leadId: lead.id,
            userId: opts.ejecutadoPorId,
            tipo: "asignacion",
            detalle: `Auto-asignado por agente Lusha (${criterios.nombre})`,
          },
        });
      }
    }
  }

  await prisma.agenteRun.create({
    data: {
      ejecutadoPorId: opts.ejecutadoPorId,
      filtrosUsados: {
        segmentos: opts.segmentos,
        limitePorSegmento: opts.limitePorSegmento,
        pais: PAIS_OBJETIVO,
        autoAsignar: opts.autoAsignar,
      },
      leadsTraidos: traidos,
      leadsNuevos: nuevos,
    },
  });

  return { traidos, nuevos, duplicados, sinTelefono, asignados };
}
