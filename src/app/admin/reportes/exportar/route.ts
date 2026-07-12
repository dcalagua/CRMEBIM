import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escaparCSV(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (texto.includes(",") || texto.includes("\n") || texto.includes('"')) {
    return `"${texto.replaceAll('"', '""')}"`;
  }
  return texto;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const leads = await prisma.lead.findMany({
    include: { asignadaA: true, oportunidades: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  const columnas = [
    "empresa",
    "contacto_nombre",
    "contacto_apellido",
    "cargo",
    "nivel_decision",
    "telefono",
    "email",
    "sector",
    "tamano_empresa",
    "ciudad",
    "departamento",
    "segmento",
    "origen",
    "estado",
    "ejecutiva",
    "oportunidad_etapa",
    "oportunidad_valor",
    "oportunidad_moneda",
    "creado_en",
  ];

  const filas = leads.map((l) => {
    const oportunidad = l.oportunidades[0];
    return [
      l.empresa,
      l.contactoNombre,
      l.contactoApellido,
      l.cargo,
      l.nivelDecision,
      l.telefono,
      l.email,
      l.sector,
      l.tamanoEmpresa,
      l.ciudad,
      l.departamento,
      l.segmento,
      l.origen,
      l.estado,
      l.asignadaA?.nombre,
      oportunidad?.etapa ?? "",
      oportunidad?.valorEstimado?.toString() ?? "",
      oportunidad?.moneda ?? "",
      l.createdAt.toISOString(),
    ]
      .map(escaparCSV)
      .join(",");
  });

  const csv = [columnas.join(","), ...filas].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ebim_leads_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
