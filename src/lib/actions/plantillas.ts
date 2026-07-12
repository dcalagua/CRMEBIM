"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function crearPlantilla(formData: FormData) {
  await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const segmento = String(formData.get("segmento") ?? "").trim() || null;
  const texto = String(formData.get("texto") ?? "").trim();

  if (!nombre || !texto) {
    throw new Error("Nombre y texto son obligatorios.");
  }

  await prisma.plantillaMensaje.create({
    data: { nombre, segmento, texto },
  });

  revalidatePath("/admin/plantillas");
}

export async function actualizarPlantilla(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const segmento = String(formData.get("segmento") ?? "").trim() || null;
  const texto = String(formData.get("texto") ?? "").trim();
  const activa = formData.get("activa") === "on";

  if (!id || !nombre || !texto) {
    throw new Error("Datos inválidos.");
  }

  await prisma.plantillaMensaje.update({
    where: { id },
    data: { nombre, segmento, texto, activa },
  });

  revalidatePath("/admin/plantillas");
}
