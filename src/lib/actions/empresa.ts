"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function actualizarEmpresa(formData: FormData) {
  await requireSession();

  const empresaId = String(formData.get("empresaId") ?? "");
  const leadId = String(formData.get("leadId") ?? "");
  if (!empresaId) throw new Error("Empresa no encontrada.");

  const sitioWeb = String(formData.get("sitioWeb") ?? "").trim();
  const linkedinEmpresa = String(formData.get("linkedinEmpresa") ?? "").trim();
  const resumen = String(formData.get("resumen") ?? "").trim();
  const tecnologiasRaw = String(formData.get("tecnologias") ?? "").trim();
  const tecnologias = tecnologiasRaw
    ? tecnologiasRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await prisma.empresa.update({
    where: { id: empresaId },
    data: {
      sitioWeb: sitioWeb || null,
      linkedinEmpresa: linkedinEmpresa || null,
      resumen: resumen || null,
      tecnologias,
    },
  });

  if (leadId) {
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath(`/ejecutiva/leads/${leadId}`);
  }
}
