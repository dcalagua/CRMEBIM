import { prisma } from "@/lib/prisma";
import type { PlantillaMensaje } from "@prisma/client";

/**
 * Plantillas activas aplicables a un lead: primero las específicas de su
 * segmento, después la(s) general(es) como fallback.
 */
export async function obtenerPlantillasAplicables(
  segmento: string | null
): Promise<PlantillaMensaje[]> {
  const [especificas, generales] = await Promise.all([
    segmento
      ? prisma.plantillaMensaje.findMany({
          where: { segmento, activa: true },
          orderBy: { nombre: "asc" },
        })
      : Promise.resolve([]),
    prisma.plantillaMensaje.findMany({
      where: { segmento: null, activa: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return [...especificas, ...generales];
}
