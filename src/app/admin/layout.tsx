import { requireAdmin } from "@/lib/session";
import NavShell from "@/components/NavShell";

const links = [
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/oportunidades", label: "Oportunidades" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/agente", label: "Agente Lusha" },
  { href: "/admin/plantillas", label: "Plantillas" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <NavShell titulo="EBIM Prospección · Admin" usuario={session.user.name ?? ""} links={links}>
      {children}
    </NavShell>
  );
}
