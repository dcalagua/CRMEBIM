"use client";

import { useFormState, useFormStatus } from "react-dom";
import { importarLeadsCSV } from "@/lib/actions/leads";

const estadoInicial = { ok: false, mensaje: "" };

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 text-white text-sm font-medium px-4 py-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Importando..." : "Importar"}
    </button>
  );
}

export default function ImportarForm() {
  const [estado, formAction] = useFormState(importarLeadsCSV, estadoInicial);

  return (
    <form action={formAction} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Archivo CSV
        </label>
        <input
          type="file"
          name="archivo"
          accept=".csv,text/csv"
          required
          className="w-full text-sm"
        />
      </div>
      <BotonEnviar />
      {estado.mensaje && (
        <p className={`text-sm ${estado.ok ? "text-emerald-700" : "text-red-600"}`}>
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
