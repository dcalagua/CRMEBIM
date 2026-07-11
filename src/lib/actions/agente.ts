"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { correrAgenteLusha } from "@/lib/lusha/agente";
import type { SegmentoId } from "@/lib/lusha/icp";

export type ResultadoAgenteAction = {
  ok: boolean;
  mensaje: string;
};

const estadoInicial: ResultadoAgenteAction = { ok: false, mensaje: "" };
export { estadoInicial as estadoInicialAgente };

export async function ejecutarAgenteLusha(
  _prevState: ResultadoAgenteAction,
  formData: FormData
): Promise<ResultadoAgenteAction> {
  const session = await requireAdmin();

  const segmentos = formData.getAll("segmentos") as SegmentoId[];
  const limitePorSegmento = Number(formData.get("limitePorSegmento") ?? 10);
  const autoAsignar = formData.get("autoAsignar") === "on";

  if (segmentos.length === 0) {
    return { ok: false, mensaje: "Selecciona al menos un segmento." };
  }
  if (!Number.isFinite(limitePorSegmento) || limitePorSegmento < 10 || limitePorSegmento > 100) {
    return { ok: false, mensaje: "El límite por segmento debe ser entre 10 y 100 (mínimo exigido por Lusha)." };
  }

  try {
    const resultado = await correrAgenteLusha({
      segmentos,
      limitePorSegmento,
      ejecutadoPorId: session.user.id,
      autoAsignar,
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/agente");
    revalidatePath("/ejecutiva");
    revalidatePath("/admin");

    return {
      ok: true,
      mensaje: `Traídos: ${resultado.traidos} · Nuevos: ${resultado.nuevos} · Duplicados: ${resultado.duplicados} · Sin teléfono: ${resultado.sinTelefono} · Asignados: ${resultado.asignados}`,
    };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "Error desconocido al ejecutar el agente." };
  }
}
