"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { PaisEjecutiva, Rol } from "@prisma/client";

function parsePais(valor: FormDataEntryValue | null): PaisEjecutiva | null {
  return valor === "PE" || valor === "EC" ? (valor as PaisEjecutiva) : null;
}

export async function crearUsuario(formData: FormData) {
  await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "ejecutiva") as Rol;
  const pais = parsePais(formData.get("pais"));

  if (!nombre || !email || password.length < 8) {
    throw new Error("Datos inválidos: nombre, email y contraseña (mín. 8 caracteres) son obligatorios.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { nombre, email, passwordHash, rol, pais: pais ?? undefined },
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function actualizarUsuario(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rol = String(formData.get("rol") ?? "ejecutiva") as Rol;
  const pais = parsePais(formData.get("pais"));
  const activo = formData.get("activo") === "on";
  const nuevaPassword = String(formData.get("nuevaPassword") ?? "");

  if (!id || !nombre || !email) {
    throw new Error("Datos inválidos.");
  }

  await prisma.user.update({
    where: { id },
    data: {
      nombre,
      email,
      rol,
      pais: pais ?? undefined,
      activo,
      ...(nuevaPassword.length >= 8
        ? { passwordHash: await bcrypt.hash(nuevaPassword, 10) }
        : {}),
    },
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}
