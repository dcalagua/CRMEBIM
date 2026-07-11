import { prisma } from "../src/lib/prisma";
import { correrAgenteLusha } from "../src/lib/lusha/agente";
import { SEGMENTOS, type SegmentoId } from "../src/lib/lusha/icp";

/**
 * Corrida programada del agente Lusha (cron / PM2), fuera del ciclo de request de Next.
 * Uso: npx tsx --env-file=.env scripts/run-agente-lusha.ts
 *
 * Variables de entorno opcionales:
 *  - LUSHA_AGENTE_EJECUTOR_EMAIL: admin al que se atribuye la corrida (default: primer admin activo)
 *  - LUSHA_AGENTE_SEGMENTOS: lista separada por comas de ids de segmento (default: todos)
 *  - LUSHA_AGENTE_LIMITE: leads a traer por segmento (default: 10)
 *  - LUSHA_AGENTE_AUTOASIGNAR: "false" para desactivar auto-asignación (default: true)
 */
async function main() {
  const email = process.env.LUSHA_AGENTE_EJECUTOR_EMAIL;
  const admin = email
    ? await prisma.user.findUniqueOrThrow({ where: { email } })
    : await prisma.user.findFirstOrThrow({ where: { rol: "admin", activo: true }, orderBy: { createdAt: "asc" } });

  const segmentosEnv = process.env.LUSHA_AGENTE_SEGMENTOS;
  const segmentos: SegmentoId[] = segmentosEnv
    ? (segmentosEnv.split(",").map((s) => s.trim()) as SegmentoId[])
    : (Object.keys(SEGMENTOS) as SegmentoId[]);

  const limitePorSegmento = Number(process.env.LUSHA_AGENTE_LIMITE ?? 10);
  const autoAsignar = process.env.LUSHA_AGENTE_AUTOASIGNAR !== "false";

  console.log(`Ejecutando agente Lusha como ${admin.email} | segmentos: ${segmentos.join(", ")} | límite/segmento: ${limitePorSegmento} | auto-asignar: ${autoAsignar}`);

  const resultado = await correrAgenteLusha({
    segmentos,
    limitePorSegmento,
    ejecutadoPorId: admin.id,
    autoAsignar,
  });

  console.log("Resultado:", resultado);
}

main()
  .catch((e) => {
    console.error("FALLO agente Lusha:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
