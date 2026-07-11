import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { crearUsuario } from "@/lib/actions/usuarios";

export default async function UsuariosPage() {
  const usuarios = await prisma.user.findMany({
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Usuarios</h1>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Rol</th>
                <th className="px-4 py-2 font-medium">País</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u.id} className={!u.activo ? "opacity-50" : ""}>
                  <td className="px-4 py-2 font-medium text-gray-900">{u.nombre}</td>
                  <td className="px-4 py-2 text-gray-600">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className="capitalize">{u.rol}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{u.pais ?? "—"}</td>
                  <td className="px-4 py-2">
                    {u.activo ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      className="text-emerald-700 hover:underline text-sm font-medium"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    Aún no hay usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo usuario</h2>
        <form action={crearUsuario} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                name="rol"
                defaultValue="ejecutiva"
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
                defaultValue=""
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">—</option>
                <option value="PE">Perú</option>
                <option value="EC">Ecuador</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 text-white text-sm font-medium py-2 hover:bg-emerald-700 transition-colors"
          >
            Crear usuario
          </button>
        </form>
      </div>
    </div>
  );
}
