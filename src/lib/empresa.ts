import { prisma } from "@/lib/prisma";

/**
 * Encuentra o crea el registro de Empresa para agrupar todos los contactos
 * (leads) de una misma compañía, y así poder mostrar perfil compartido
 * (tecnologías, resumen) y "otros contactos en esta empresa" en la ficha.
 * Dedup simple por nombre exacto (trim) - suficiente para v1.
 */
export async function upsertEmpresaParaLead(nombreEmpresa: string): Promise<string> {
  const nombre = nombreEmpresa.trim();

  const existente = await prisma.empresa.findFirst({ where: { nombre } });
  if (existente) return existente.id;

  const creada = await prisma.empresa.create({ data: { nombre } });
  return creada.id;
}

const RANGO_NIVEL_DECISION: Record<string, number> = {
  "c-suite": 4,
  "vice president": 3,
  director: 3,
  manager: 2,
  "non-manager": 1,
};

export function rangoNivelDecision(nivel: string | null): number {
  if (!nivel) return 0;
  return RANGO_NIVEL_DECISION[nivel.toLowerCase()] ?? 0;
}

export type ContactoEmpresa = {
  leadId: string;
  nombreCompleto: string;
  cargo: string | null;
  nivelDecision: string | null;
  telefono: string;
  email: string | null;
  esActual: boolean;
};

/**
 * Ordena los contactos de una empresa (el lead actual + hermanos) para
 * recomendar a quién priorizar: mayor nivel de decisión primero, y entre
 * empates, quien tenga teléfono (todos deberían, pero por si acaso).
 */
export function recomendarContacto(contactos: ContactoEmpresa[]): string | null {
  if (contactos.length === 0) return null;
  const ordenados = [...contactos].sort(
    (a, b) => rangoNivelDecision(b.nivelDecision) - rangoNivelDecision(a.nivelDecision)
  );
  return ordenados[0]?.leadId ?? null;
}
