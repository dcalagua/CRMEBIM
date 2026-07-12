import type { PlantillaMensaje } from "@prisma/client";
import { SEGMENTOS } from "@/lib/lusha/icp";
import { actualizarPlantilla } from "@/lib/actions/plantillas";

export default function PlantillaEditForm({ plantilla }: { plantilla: PlantillaMensaje }) {
  return (
    <details className={`bg-white border rounded-xl p-4 ${plantilla.activa ? "border-gray-200" : "border-gray-200 opacity-50"}`}>
      <summary className="cursor-pointer flex items-center justify-between">
        <span className="font-medium text-gray-900 text-sm">{plantilla.nombre}</span>
        <span className="text-xs text-gray-400">{plantilla.segmento ?? "General"}</span>
      </summary>
      <form action={actualizarPlantilla} className="space-y-3 mt-4">
        <input type="hidden" name="id" value={plantilla.id} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
          <input
            name="nombre"
            defaultValue={plantilla.nombre}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Segmento</label>
          <select
            name="segmento"
            defaultValue={plantilla.segmento ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">General (todos los segmentos)</option>
            {Object.values(SEGMENTOS).map((s) => (
              <option key={s.id} value={s.nombre}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Texto</label>
          <textarea
            name="texto"
            defaultValue={plantilla.texto}
            required
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="activa" defaultChecked={plantilla.activa} />
          Activa
        </label>
        <button
          type="submit"
          className="rounded-md border border-gray-300 bg-white text-sm font-medium px-3 py-2 hover:bg-gray-50"
        >
          Guardar cambios
        </button>
      </form>
    </details>
  );
}
