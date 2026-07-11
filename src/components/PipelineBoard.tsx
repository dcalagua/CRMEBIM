import Link from "next/link";
import { COLUMNAS, type TarjetaPipeline } from "@/lib/pipeline";

const ESTILOS_COLUMNA: Record<string, string> = {
  nuevo: "border-t-blue-400",
  asignado: "border-t-indigo-400",
  contactado: "border-t-amber-400",
  respondio: "border-t-purple-400",
  agendado: "border-t-cyan-400",
  calificado: "border-t-emerald-400",
  propuesta_enviada: "border-t-amber-500",
  negociacion: "border-t-purple-500",
  ganado: "border-t-emerald-600",
  perdido: "border-t-gray-400",
};

export default function PipelineBoard({ tarjetas }: { tarjetas: TarjetaPipeline[] }) {
  const porColumna = new Map<string, TarjetaPipeline[]>();
  for (const col of COLUMNAS) porColumna.set(col.id, []);
  for (const t of tarjetas) porColumna.get(t.columna)?.push(t);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {COLUMNAS.map((columna) => {
          const items = porColumna.get(columna.id) ?? [];
          return (
            <div key={columna.id} className="w-64 shrink-0">
              <div
                className={`bg-white border border-gray-200 border-t-4 ${ESTILOS_COLUMNA[columna.id]} rounded-xl`}
              >
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{columna.titulo}</span>
                  <span className="text-xs text-gray-400">{items.length}</span>
                </div>
                <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
                  {items.map((t) => (
                    <Link
                      key={t.id}
                      href={t.href}
                      className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-emerald-300 hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">{t.empresa}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.contactoNombre ?? "Sin contacto"}
                      </p>
                      {t.ejecutivaNombre && (
                        <p className="text-xs text-gray-400 mt-1">{t.ejecutivaNombre}</p>
                      )}
                      {t.segmento && (
                        <p className="text-xs text-indigo-600 mt-1 truncate">{t.segmento}</p>
                      )}
                      {t.valorEstimado !== null && (
                        <p className="text-xs font-medium text-emerald-700 mt-1">
                          USD {t.valorEstimado.toLocaleString("es-BO")}
                        </p>
                      )}
                    </Link>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-gray-300 text-center py-4">Vacío</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
