import { requireEjecutiva } from "@/lib/session";
import NavShell from "@/components/NavShell";

const links = [{ href: "/ejecutiva", label: "Mis leads" }];

export default async function EjecutivaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireEjecutiva();

  return (
    <NavShell titulo="EBIM Prospección" usuario={session.user.name ?? ""} links={links}>
      {children}
    </NavShell>
  );
}
