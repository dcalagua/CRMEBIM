const ESTILOS: Record<string, string> = {
  nuevo: "bg-blue-50 text-blue-700",
  asignado: "bg-indigo-50 text-indigo-700",
  contactado: "bg-amber-50 text-amber-700",
  respondio: "bg-purple-50 text-purple-700",
  agendado: "bg-cyan-50 text-cyan-700",
  calificado: "bg-emerald-50 text-emerald-700",
  descartado: "bg-gray-100 text-gray-500",
};

export default function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        ESTILOS[estado] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {estado}
    </span>
  );
}
