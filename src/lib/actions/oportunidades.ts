"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import type { EtapaOportunidad } from "@prisma/client";

const ETAPAS: EtapaOportunidad[] = [
  "creada",
  "propuesta_enviada",
  "negociacion",
  "cerrada_ganada",
  "cerrada_perdida",
];

const ETIQUETAS_ETAPA: Record<EtapaOportunidad, string> = {
  creada: "Creada",
  propuesta_enviada: "Propuesta enviada",
  negociacion: "Negociación",
  cerrada_ganada: "Cerrada (ganada)",
  cerrada_perdida: "Cerrada (perdida)",
};

async function verificarAccesoLead(leadId: string) {
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead no encontrado.");

  if (session.user.rol === "ejecutiva" && lead.asignadaAId !== session.user.id) {
    throw new Error("No tienes acceso a este lead.");
  }

  return { session, lead };
}

async function verificarAccesoOportunidad(oportunidadId: string) {
  const session = await requireSession();
  const oportunidad = await prisma.oportunidad.findUnique({ where: { id: oportunidadId } });
  if (!oportunidad) throw new Error("Oportunidad no encontrada.");

  if (session.user.rol === "ejecutiva" && oportunidad.asignadaAId !== session.user.id) {
    throw new Error("No tienes acceso a esta oportunidad.");
  }

  return { session, oportunidad };
}

function parseValor(valor: FormDataEntryValue | null): number | null {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}

export async function crearOportunidad(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const { session, lead } = await verificarAccesoLead(leadId);

  if (lead.estado !== "calificado") {
    throw new Error("Solo se puede crear una oportunidad para un lead calificado.");
  }
  if (!lead.asignadaAId) {
    throw new Error("El lead debe tener una ejecutiva asignada.");
  }

  const valorEstimado = parseValor(formData.get("valorEstimado"));
  const fechaCierreRaw = String(formData.get("fechaCierreEstimada") ?? "");

  await prisma.oportunidad.create({
    data: {
      leadId: lead.id,
      asignadaAId: lead.asignadaAId,
      etapa: "creada",
      valorEstimado: valorEstimado ?? undefined,
      fechaCierreEstimada: fechaCierreRaw ? new Date(fechaCierreRaw) : undefined,
    },
  });

  await prisma.actividad.create({
    data: {
      leadId: lead.id,
      userId: session.user.id,
      tipo: "oportunidad",
      detalle: `Oportunidad creada${valorEstimado ? ` · valor estimado USD ${valorEstimado}` : ""}`,
    },
  });

  revalidatePath(`/admin/leads/${lead.id}`);
  revalidatePath(`/ejecutiva/leads/${lead.id}`);
  revalidatePath("/admin/oportunidades");
  revalidatePath("/ejecutiva/oportunidades");
}

export async function actualizarOportunidad(formData: FormData) {
  const oportunidadId = String(formData.get("oportunidadId") ?? "");
  const { session, oportunidad } = await verificarAccesoOportunidad(oportunidadId);

  const nuevaEtapa = String(formData.get("etapa") ?? "") as EtapaOportunidad;
  if (!ETAPAS.includes(nuevaEtapa)) {
    throw new Error("Etapa inválida.");
  }

  const valorEstimado = parseValor(formData.get("valorEstimado"));
  const fechaCierreRaw = String(formData.get("fechaCierreEstimada") ?? "");
  const motivoPerdida = String(formData.get("motivoPerdida") ?? "").trim();

  if (nuevaEtapa === "cerrada_perdida" && !motivoPerdida) {
    throw new Error("Indica el motivo de la pérdida.");
  }

  const esCierre = nuevaEtapa === "cerrada_ganada" || nuevaEtapa === "cerrada_perdida";
  const yaEstabaCerrada =
    oportunidad.etapa === "cerrada_ganada" || oportunidad.etapa === "cerrada_perdida";

  await prisma.oportunidad.update({
    where: { id: oportunidadId },
    data: {
      etapa: nuevaEtapa,
      valorEstimado: valorEstimado ?? undefined,
      fechaCierreEstimada: fechaCierreRaw ? new Date(fechaCierreRaw) : undefined,
      motivoPerdida: nuevaEtapa === "cerrada_perdida" ? motivoPerdida : null,
      cerradaEn: esCierre ? (yaEstabaCerrada ? oportunidad.cerradaEn : new Date()) : null,
    },
  });

  if (nuevaEtapa !== oportunidad.etapa) {
    await prisma.actividad.create({
      data: {
        leadId: oportunidad.leadId,
        userId: session.user.id,
        tipo: "oportunidad",
        detalle: `${ETIQUETAS_ETAPA[oportunidad.etapa]} → ${ETIQUETAS_ETAPA[nuevaEtapa]}${
          nuevaEtapa === "cerrada_perdida" ? ` (motivo: ${motivoPerdida})` : ""
        }`,
      },
    });
  }

  revalidatePath(`/admin/leads/${oportunidad.leadId}`);
  revalidatePath(`/ejecutiva/leads/${oportunidad.leadId}`);
  revalidatePath("/admin/oportunidades");
  revalidatePath("/ejecutiva/oportunidades");
  revalidatePath("/admin");
}
