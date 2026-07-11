import ImportarForm from "./ImportarForm";

export default function ImportarLeadsPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Importar leads (CSV)</h1>
      <p className="text-sm text-gray-500">
        El archivo debe tener encabezados:{" "}
        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
          empresa, contacto_nombre, cargo, telefono, email, sector, ciudad, departamento
        </code>
        . Los leads con teléfono ya existente se omiten automáticamente.
      </p>
      <ImportarForm />
    </div>
  );
}
