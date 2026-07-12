import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EstadoBadge from "@/components/EstadoBadge";

const UN_DIA = 1000 * 60 * 60 * 24;

type ItemCola = {
  leadId: string;
  empresa: string;
  contacto: string;
  estado: string;
  prioridad: number;
  razon: string;
};

export default async function MiDiaPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const leads = await prisma.lead.findMany({
    where: { asignadaAId: userId, estado: { notIn: ["descartado"] } },
  });

  const ahora = Date.now();
  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const hoyFin = new Date(hoyInicio);
  hoyFin.setDate(hoyFin.getDate() + 1);

  const items = new Map<string, ItemCola>();

  function registrar(lead: (typeof leads)[number], prioridad: number, razon: string) {
    const existente = items.get(lead.id);
    if (existente && existente.prioridad <= prioridad) return;
    items.set(lead.id, {
      leadId: lead.id,
      empresa: lead.empresa,
      contacto: [lead.contactoNombre, lead.contactoApellido].filter(Boolean).join(" ") || "—",
      estado: lead.estado,
      prioridad,
      razon,
    });
  }

  for (const lead of leads) {
    if (lead.reunionFecha) {
      const t = lead.reunionFecha.getTime();
      if (t >= hoyInicio.getTime() && t < hoyFin.getTime()) {
        registrar(
          lead,
          4,
          `Reunión hoy a las ${lead.reunionFecha.toLocaleTimeString("es-BO", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        );
      } else if (t < ahora && lead.estado === "agendado") {
        registrar(lead, 3, "Reunión ya pasó — confirmar resultado");
      }
    }

    if (lead.proximaAccionFecha && lead.proximaAccionFecha.getTime() <= hoyFin.getTime()) {
      const vencida = lead.proximaAccionFecha.getTime() < hoyInicio.getTime();
      registrar(
        lead,
        3,
        vencida
          ? `Acción pendiente desde ${lead.proximaAccionFecha.toLocaleDateString("es-BO")}`
          : "Acción programada para hoy"
      );
    }

    const dias = (ahora - lead.updatedAt.getTime()) / UN_DIA;
    if (["nuevo", "asignado"].includes(lead.estado) && dias > 1) {
      registrar(lead, 2, `Sin contactar hace ${Math.floor(dias)} día(s)`);
    } else if (["contactado", "respondio", "agendado"].includes(lead.estado) && dias > 3) {
      registrar(lead, 1, `Sin seguimiento hace ${Math.floor(dias)} día(s)`);
    }
  }

  const cola = Array.from(items.values()).sort((a, b) => b.prioridad - a.prioridad);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Mi día</h1>
        <p className="text-sm text-gray-500">
          A quién contactar ahora y por qué — reuniones de hoy, acciones vencidas y leads sin
          seguimiento, en un solo orden de prioridad.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Por qué</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cola.map((item) => (
              <tr key={item.leadId}>
                <td className="px-4 py-2 font-medium text-gray-900">{item.empresa}</td>
                <td className="px-4 py-2 text-gray-600">{item.contacto}</td>
                <td className="px-4 py-2">
                  <EstadoBadge estado={item.estado} />
                </td>
                <td className="px-4 py-2 text-gray-700">{item.razon}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/ejecutiva/leads/${item.leadId}`}
                    className="text-emerald-700 hover:underline text-sm font-medium"
                  >
                    Atender →
                  </Link>
                </td>
              </tr>
            ))}
            {cola.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No tienes pendientes urgentes ahora mismo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
