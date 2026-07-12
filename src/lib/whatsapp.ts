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

export type DatosPlaceholder = {
  nombre: string;
  empresa: string;
  cargo?: string | null;
};

export function aplicarPlaceholders(texto: string, datos: DatosPlaceholder): string {
  return texto
    .replaceAll("{{nombre}}", datos.nombre)
    .replaceAll("{{empresa}}", datos.empresa)
    .replaceAll("{{cargo}}", datos.cargo?.trim() || "");
}

export function construirLinkWhatsAppDesdeTexto(telefono: string, mensaje: string): string {
  const numero = normalizarTelefono(telefono);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
