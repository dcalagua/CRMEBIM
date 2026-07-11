export function normalizarTelefono(telefono: string): string {
  return telefono.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function construirLinkWhatsApp(
  telefono: string,
  empresa: string,
  contactoNombre?: string | null
): string {
  const numero = normalizarTelefono(telefono);
  const nombre = contactoNombre?.trim() || empresa;
  const mensaje = `Hola ${nombre}, te escribo de EBIM. ¿Tienes un momento para conversar sobre ${empresa}?`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
