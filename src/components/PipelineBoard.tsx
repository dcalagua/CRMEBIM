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
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${COLUMNAS.length}, minmax(0, 1fr))` }}
    >
      {COLUMNAS.map((columna) => {
        const items = porColumna.get(columna.id) ?? [];
        return (
          <div key={columna.id} className="min-w-0">
            <div
              className={`bg-white border border-gray-200 border-t-4 ${ESTILOS_COLUMNA[columna.id]} rounded-xl h-full flex flex-col`}
            >
              <div className="px-2 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 leading-tight break-words">
                  {columna.titulo}
                </p>
                <span className="text-[11px] text-gray-400">{items.length}</span>
              </div>
              <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto max-h-[75vh]">
                {items.map((t) => (
                  <Link
                    key={t.id}
                    href={t.href}
                    className="block rounded-md border border-gray-200 bg-white p-2 hover:border-emerald-300 hover:shadow-sm transition-shadow"
                  >
                    <p className="text-xs font-medium text-gray-900 truncate">{t.empresa}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {t.contactoNombre ?? "Sin contacto"}
                    </p>
                    {t.ejecutivaNombre && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {t.ejecutivaNombre}
                      </p>
                    )}
                    {t.valorEstimado !== null && (
                      <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                        USD {t.valorEstimado.toLocaleString("es-BO")}
                      </p>
                    )}
                  </Link>
                ))}
                {items.length === 0 && (
                  <p className="text-[11px] text-gray-300 text-center py-4">Vacío</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
