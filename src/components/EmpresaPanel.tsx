import Link from "next/link";
import type { Empresa, Lead } from "@prisma/client";
import { actualizarEmpresa } from "@/lib/actions/empresa";
import { rangoNivelDecision } from "@/lib/empresa";

type ContactoResumen = Pick<
  Lead,
  "id" | "contactoNombre" | "contactoApellido" | "cargo" | "nivelDecision" | "telefono" | "email" | "estado"
>;

export default function EmpresaPanel({
  empresa,
  leadActual,
  hermanos,
  basePathLeads,
  puedeEditar,
}: {
  empresa: Empresa;
  leadActual: ContactoResumen;
  hermanos: ContactoResumen[];
  basePathLeads: string;
  puedeEditar: boolean;
}) {
  const todos = [leadActual, ...hermanos];
  const recomendadoId = [...todos].sort(
    (a, b) => rangoNivelDecision(b.nivelDecision) - rangoNivelDecision(a.nivelDecision)
  )[0]?.id;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Perfil de la empresa</h2>
        {empresa.resumen && <p className="text-sm text-gray-700 mb-2">{empresa.resumen}</p>}
        <div className="flex flex-wrap gap-2 mb-2">
          {empresa.tecnologias.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium"
            >
              {t}
            </span>
          ))}
          {empresa.tecnologias.length === 0 && !empresa.resumen && (
            <p className="text-xs text-gray-400">Sin datos de perfil todavía.</p>
          )}
        </div>
        <div className="flex gap-3 text-xs">
          {empresa.sitioWeb && (
            <a href={empresa.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
              Sitio web
            </a>
          )}
          {empresa.linkedinEmpresa && (
            <a href={empresa.linkedinEmpresa} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
              LinkedIn empresa
            </a>
          )}
        </div>
      </div>

      {puedeEditar && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
            Editar perfil de empresa
          </summary>
          <form action={actualizarEmpresa} className="space-y-3 mt-3">
            <input type="hidden" name="empresaId" value={empresa.id} />
            <input type="hidden" name="leadId" value={leadActual.id} />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Resumen</label>
              <textarea
                name="resumen"
                defaultValue={empresa.resumen ?? ""}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tecnologías (separadas por coma)
              </label>
              <input
                name="tecnologias"
                defaultValue={empresa.tecnologias.join(", ")}
                placeholder="SAP, Salesforce, AWS..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sitio web</label>
                <input
                  type="url"
                  name="sitioWeb"
                  defaultValue={empresa.sitioWeb ?? ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  LinkedIn empresa
                </label>
                <input
                  type="url"
                  name="linkedinEmpresa"
                  defaultValue={empresa.linkedinEmpresa ?? ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-md border border-gray-300 bg-white text-sm font-medium px-3 py-2 hover:bg-gray-50"
            >
              Guardar perfil
            </button>
          </form>
        </details>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Contactos en esta empresa ({todos.length})
        </h3>
        <ul className="space-y-2">
          {todos.map((c) => {
            const esActual = c.id === leadActual.id;
            const esRecomendado = c.id === recomendadoId;
            const nombreCompleto =
              [c.contactoNombre, c.contactoApellido].filter(Boolean).join(" ") || "Sin nombre";
            return (
              <li
                key={c.id}
                className={`rounded-lg border p-3 text-sm ${
                  esActual ? "border-emerald-300 bg-emerald-50/40" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{nombreCompleto}</span>
                  <div className="flex gap-1">
                    {esRecomendado && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-medium">
                        Recomendado llamar
                      </span>
                    )}
                    {esActual && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
                        Este lead
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  {c.cargo ?? "Cargo desconocido"}
                  {c.nivelDecision ? ` · ${c.nivelDecision}` : ""}
                </p>
                <p className="text-gray-700 text-xs mt-1">{c.telefono}</p>
                {c.email && <p className="text-gray-500 text-xs">{c.email}</p>}
                {!esActual && (
                  <Link
                    href={`${basePathLeads}/${c.id}`}
                    className="text-emerald-700 hover:underline text-xs font-medium mt-1 inline-block"
                  >
                    Ver ficha →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
