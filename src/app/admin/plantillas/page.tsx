import { prisma } from "@/lib/prisma";
import { SEGMENTOS } from "@/lib/lusha/icp";
import { crearPlantilla } from "@/lib/actions/plantillas";
import PlantillaEditForm from "./PlantillaEditForm";

export default async function PlantillasPage() {
  const plantillas = await prisma.plantillaMensaje.findMany({
    orderBy: [{ activa: "desc" }, { nombre: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Plantillas de mensaje</h1>
        <p className="text-sm text-gray-500 mb-4">
          Se usan al abrir WhatsApp desde la ficha de un lead. Placeholders disponibles:{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
            {"{{nombre}}"} {"{{empresa}}"} {"{{cargo}}"}
          </code>
          . Deja el segmento vacío para que sea la plantilla general (fallback).
        </p>

        <div className="space-y-4">
          {plantillas.map((p) => (
            <PlantillaEditForm key={p.id} plantilla={p} />
          ))}
          {plantillas.length === 0 && (
            <p className="text-sm text-gray-400">Aún no hay plantillas creadas.</p>
          )}
        </div>
      </div>

      <div className="max-w-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nueva plantilla</h2>
        <form action={crearPlantilla} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre"
              required
              placeholder="Primer contacto - SAP B1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
            <select name="segmento" defaultValue="" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">General (todos los segmentos)</option>
              {Object.values(SEGMENTOS).map((s) => (
                <option key={s.id} value={s.nombre}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
            <textarea
              name="texto"
              required
              rows={4}
              placeholder="Hola {{nombre}}, te escribo de EBIM..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 text-white text-sm font-medium py-2 hover:bg-emerald-700"
          >
            Crear plantilla
          </button>
        </form>
      </div>
    </div>
  );
}
