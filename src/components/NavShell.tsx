"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavLink = { href: string; label: string };

export default function NavShell({
  titulo,
  usuario,
  links,
  children,
}: {
  titulo: string;
  usuario: string;
  links: NavLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900">{titulo}</span>
            <nav className="flex gap-1">
              {links.map((link) => {
                const activo =
                  pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activo
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{usuario}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main
        className={`flex-1 w-full px-4 sm:px-6 py-6 ${
          pathname.includes("/pipeline") ? "" : "max-w-6xl mx-auto"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
