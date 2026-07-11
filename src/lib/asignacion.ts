import { prisma } from "@/lib/prisma";

const ESTADOS_ABIERTOS = ["nuevo", "asignado", "contactado", "respondio", "agendado"] as const;

/**
 * Carga actual (leads no calificados/descartados) de cada ejecutiva activa,
 * usada para repartir leads nuevos de forma balanceada (round-robin por carga).
 */
export async function cargaActualPorEjecutiva(): Promise<Map<string, number>> {
  const ejecutivas = await prisma.user.findMany({
    where: { rol: "ejecutiva", activo: true },
    orderBy: { nombre: "asc" },
  });

  const conteos = await prisma.lead.groupBy({
    by: ["asignadaAId"],
    where: { estado: { in: [...ESTADOS_ABIERTOS] }, asignadaAId: { not: null } },
    _count: { _all: true },
  });

  const cargaPorId = new Map(conteos.map((c) => [c.asignadaAId as string, c._count._all]));

  return new Map(ejecutivas.map((e) => [e.id, cargaPorId.get(e.id) ?? 0]));
}

export function elegirEjecutivaConMenosCarga(cargas: Map<string, number>): string | null {
  let elegido: string | null = null;
  let menorCarga = Infinity;

  cargas.forEach((carga, id) => {
    if (carga < menorCarga) {
      elegido = id;
      menorCarga = carga;
    }
  });

  return elegido;
}

/**
 * Asigna automáticamente una ejecutiva (round-robin por carga) a un lead recién creado
 * que no tenga ejecutiva ya elegida manualmente. Devuelve el id asignado, o null si no
 * hay ejecutivas activas.
 */
export async function autoAsignarSiCorresponde(
  cargas: Map<string, number>
): Promise<string | null> {
  if (cargas.size === 0) return null;
  const elegido = elegirEjecutivaConMenosCarga(cargas);
  if (elegido) cargas.set(elegido, (cargas.get(elegido) ?? 0) + 1);
  return elegido;
}
