import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FichaLead from "@/components/FichaLead";

export default async function AdminLeadPage({
  params,
}: {
  params: { id: string };
}) {
  const [lead, actividades, ejecutivas, oportunidad] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: params.id },
      include: { asignadaA: true },
    }),
    prisma.actividad.findMany({
      where: { leadId: params.id },
      include: { user: true },
      orderBy: { timestamp: "desc" },
    }),
    prisma.user.findMany({
      where: { rol: "ejecutiva", activo: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.oportunidad.findFirst({
      where: { leadId: params.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!lead) notFound();

  return (
    <FichaLead
      lead={lead}
      actividades={actividades}
      ejecutivas={ejecutivas}
      esAdmin
      oportunidad={oportunidad}
    />
  );
}
