import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== "admin") {
    redirect("/login");
  }
  return session;
}

export async function requireEjecutiva() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== "ejecutiva") {
    redirect("/login");
  }
  return session;
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return session;
}
