import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { obtenerTarjetasPipeline } from "@/lib/pipeline";
import PipelineBoard from "@/components/PipelineBoard";

export default async function EjecutivaPipelinePage() {
  const session = await getServerSession(authOptions);

  const tarjetas = await obtenerTarjetasPipeline({
    asignadaAId: session!.user.id,
    basePathLeads: "/ejecutiva/leads",
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Mi pipeline</h1>
        <p className="text-sm text-gray-500">
          Tu recorrido completo: desde los leads nuevos hasta las oportunidades cerradas.
        </p>
      </div>
      <PipelineBoard tarjetas={tarjetas} />
    </div>
  );
}
