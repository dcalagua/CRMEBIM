import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FichaLead from "@/components/FichaLead";

export default async function EjecutivaLeadPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  const [lead, actividades, oportunidad] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: params.id },
      include: { asignadaA: true },
    }),
    prisma.actividad.findMany({
      where: { leadId: params.id },
      include: { user: true },
      orderBy: { timestamp: "desc" },
    }),
    prisma.oportunidad.findFirst({
      where: { leadId: params.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!lead) notFound();
  if (lead.asignadaAId !== session!.user.id) redirect("/ejecutiva");

  return (
    <FichaLead
      lead={lead}
      actividades={actividades}
      ejecutivas={[]}
      esAdmin={false}
      oportunidad={oportunidad}
    />
  );
}
