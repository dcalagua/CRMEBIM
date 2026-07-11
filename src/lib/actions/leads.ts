"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/session";
import { normalizarTelefono } from "@/lib/whatsapp";
import { cargaActualPorEjecutiva, elegirEjecutivaConMenosCarga } from "@/lib/asignacion";
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

export async function crearLeadManual(formData: FormData) {
  const session = await requireAdmin();

  const empresa = String(formData.get("empresa") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!empresa || !telefono) {
    throw new Error("Empresa y teléfono son obligatorios.");
  }

  let asignadaAId = String(formData.get("asignadaAId") ?? "") || null;
  let autoAsignado = false;

  if (!asignadaAId) {
    const cargas = await cargaActualPorEjecutiva();
    asignadaAId = elegirEjecutivaConMenosCarga(cargas);
    autoAsignado = !!asignadaAId;
  }

  const lead = await prisma.lead.create({
    data: {
      empresa,
      contactoNombre: String(formData.get("contactoNombre") ?? "").trim() || null,
      cargo: String(formData.get("cargo") ?? "").trim() || null,
      telefono: normalizarTelefono(telefono),
      email: String(formData.get("email") ?? "").trim() || null,
      sector: String(formData.get("sector") ?? "").trim() || null,
      ciudad: String(formData.get("ciudad") ?? "").trim() || null,
      departamento: String(formData.get("departamento") ?? "").trim() || null,
      origen: "manual",
      asignadaAId: asignadaAId ?? undefined,
      estado: asignadaAId ? "asignado" : "nuevo",
    },
  });

  if (asignadaAId) {
    await prisma.actividad.create({
      data: {
        leadId: lead.id,
        userId: session.user.id,
        tipo: "asignacion",
        detalle: autoAsignado
          ? "Lead creado y auto-asignado (round-robin por carga)"
          : "Lead creado y asignado",
      },
    });
  }

  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${lead.id}`);
}

type ResultadoImportacion = {
  ok: boolean;
  mensaje: string;
  traidos?: number;
  nuevos?: number;
  duplicados?: number;
};

export async function importarLeadsCSV(
  _prevState: ResultadoImportacion,
  formData: FormData
): Promise<ResultadoImportacion> {
  const session = await requireAdmin();

  const archivo = formData.get("archivo") as File | null;
  if (!archivo || archivo.size === 0) {
    return { ok: false, mensaje: "Selecciona un archivo CSV." };
  }

  const texto = await archivo.text();
  const { data, errors } = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (errors.length > 0 && data.length === 0) {
    return { ok: false, mensaje: "No se pudo leer el CSV. Verifica el formato." };
  }

  const existentes = new Set(
    (await prisma.lead.findMany({ select: { telefono: true } })).map(
      (l) => l.telefono
    )
  );

  let nuevos = 0;
  let duplicados = 0;
  const vistosEnArchivo = new Set<string>();
  const cargas = await cargaActualPorEjecutiva();

  for (const fila of data) {
    const empresa = (fila.empresa ?? "").trim();
    const telefonoRaw = (fila.telefono ?? "").trim();
    if (!empresa || !telefonoRaw) continue;

    const telefono = normalizarTelefono(telefonoRaw);
    if (existentes.has(telefono) || vistosEnArchivo.has(telefono)) {
      duplicados++;
      continue;
    }
    vistosEnArchivo.add(telefono);

    const asignadaAId = elegirEjecutivaConMenosCarga(cargas);

    const lead = await prisma.lead.create({
      data: {
        empresa,
        contactoNombre: fila.contacto_nombre?.trim() || null,
        cargo: fila.cargo?.trim() || null,
        telefono,
        email: fila.email?.trim() || null,
        sector: fila.sector?.trim() || null,
        ciudad: fila.ciudad?.trim() || null,
        departamento: fila.departamento?.trim() || null,
        origen: "csv",
        asignadaAId: asignadaAId ?? undefined,
        estado: asignadaAId ? "asignado" : "nuevo",
      },
    });
    nuevos++;

    if (asignadaAId) {
      cargas.set(asignadaAId, (cargas.get(asignadaAId) ?? 0) + 1);
      await prisma.actividad.create({
        data: {
          leadId: lead.id,
          userId: session.user.id,
          tipo: "asignacion",
          detalle: "Lead importado y auto-asignado (round-robin por carga)",
        },
      });
    }
  }

  revalidatePath("/admin/leads");
  revalidatePath("/ejecutiva");

  return {
    ok: true,
    mensaje: `Importación completa: ${nuevos} leads nuevos (auto-asignados), ${duplicados} duplicados omitidos (de ${data.length} filas leídas).`,
    traidos: data.length,
    nuevos,
    duplicados,
  };
}

export async function asignarLead(formData: FormData) {
  const session = await requireAdmin();

  const leadId = String(formData.get("leadId") ?? "");
  const asignadaAId = String(formData.get("asignadaAId") ?? "") || null;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead no encontrado.");

  const ejecutiva = asignadaAId
    ? await prisma.user.findUnique({ where: { id: asignadaAId } })
    : null;

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      asignadaAId: asignadaAId ?? null,
      estado: asignadaAId && lead.estado === "nuevo" ? "asignado" : lead.estado,
    },
  });

  await prisma.actividad.create({
    data: {
      leadId,
      userId: session.user.id,
      tipo: "asignacion",
      detalle: ejecutiva ? `Asignado a ${ejecutiva.nombre}` : "Asignación removida",
    },
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

async function verificarAccesoLead(leadId: string) {
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead no encontrado.");

  if (session.user.rol === "ejecutiva" && lead.asignadaAId !== session.user.id) {
    throw new Error("No tienes acceso a este lead.");
  }

  return { session, lead };
}

export async function cambiarEstadoLead(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const nuevoEstado = String(formData.get("estado") ?? "") as EstadoLead;

  if (!ESTADOS.includes(nuevoEstado)) {
    throw new Error("Estado inválido.");
  }

  const { session, lead } = await verificarAccesoLead(leadId);

  await prisma.lead.update({
    where: { id: leadId },
    data: { estado: nuevoEstado },
  });

  await prisma.actividad.create({
    data: {
      leadId,
      userId: session.user.id,
      tipo: "cambio_estado",
      detalle: `${lead.estado} → ${nuevoEstado}`,
    },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath(`/ejecutiva/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/ejecutiva");
}

export async function agregarNota(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) return;

  const { session } = await verificarAccesoLead(leadId);

  await prisma.actividad.create({
    data: {
      leadId,
      userId: session.user.id,
      tipo: "nota",
      detalle: texto,
    },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath(`/ejecutiva/leads/${leadId}`);
}

export async function registrarWhatsappAbierto(leadId: string) {
  const { session } = await verificarAccesoLead(leadId);

  await prisma.actividad.create({
    data: {
      leadId,
      userId: session.user.id,
      tipo: "whatsapp_abierto",
      detalle: null,
    },
  });

  if (session.user.rol === "ejecutiva") {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (lead?.estado === "asignado" || lead?.estado === "nuevo") {
      await prisma.lead.update({
        where: { id: leadId },
        data: { estado: "contactado" },
      });
      await prisma.actividad.create({
        data: {
          leadId,
          userId: session.user.id,
          tipo: "cambio_estado",
          detalle: `${lead.estado} → contactado`,
        },
      });
    }
  }

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath(`/ejecutiva/leads/${leadId}`);
  revalidatePath("/ejecutiva");
  revalidatePath("/admin/leads");
}
