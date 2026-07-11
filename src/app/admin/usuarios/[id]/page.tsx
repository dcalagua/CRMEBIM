import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { actualizarUsuario } from "@/lib/actions/usuarios";

export default async function EditarUsuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const usuario = await prisma.user.findUnique({ where: { id: params.id } });
  if (!usuario) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Editar usuario</h1>
      <form action={actualizarUsuario} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <input type="hidden" name="id" value={usuario.id} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            name="nombre"
            defaultValue={usuario.nombre}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={usuario.email}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              name="rol"
              defaultValue={usuario.rol}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ejecutiva">Ejecutiva</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País (ejecutiva)
            </label>
            <select
              name="pais"
              defaultValue={usuario.pais ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">—</option>
              <option value="PE">Perú</option>
              <option value="EC">Ecuador</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva contraseña (opcional)
          </label>
          <input
            type="password"
            name="nuevaPassword"
            minLength={8}
            placeholder="Dejar en blanco para no cambiar"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="activo" defaultChecked={usuario.activo} />
          Usuario activo
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-600 text-white text-sm font-medium py-2 hover:bg-emerald-700 transition-colors"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
