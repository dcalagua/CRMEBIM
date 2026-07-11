import { obtenerTarjetasPipeline } from "@/lib/pipeline";
import PipelineBoard from "@/components/PipelineBoard";

export default async function AdminPipelinePage() {
  const tarjetas = await obtenerTarjetasPipeline({ basePathLeads: "/admin/leads" });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500">
          Todo el recorrido: desde que el agente asigna el lead hasta que se cierra la
          oportunidad. Click en una tarjeta para ver la ficha completa.
        </p>
      </div>
      <PipelineBoard tarjetas={tarjetas} />
    </div>
  );
}
