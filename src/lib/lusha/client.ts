import type { CriteriosSegmento } from "@/lib/lusha/icp";

const LUSHA_BASE_URL = "https://api.lusha.com";

export type LushaContacto = {
  lushaId: string;
  nombre: string;
  apellido: string | null;
  cargo: string | null;
  nivelDecision: string | null;
  telefono: string | null;
  email: string | null;
  linkedinContacto: string | null;
  empresa: string;
  sector: string | null;
  tamanoEmpresa: string | null;
  ciudad: string | null;
};

/**
 * Cliente de la Prospecting API de Lusha (v2): search (filtros -> IDs + datos básicos)
 * + enrich (IDs -> teléfono/email, consume créditos). Si tu cuenta Lusha expone otros
 * nombres de campo, este es el único archivo a ajustar.
 */
export class LushaClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${LUSHA_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_key: this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const texto = await res.text().catch(() => "");
      throw new Error(`Lusha API ${path} -> ${res.status}: ${texto.slice(0, 500)}`);
    }

    return res.json() as Promise<T>;
  }

  async prospectar(criterios: CriteriosSegmento, pais: string, limite: number): Promise<LushaContacto[]> {
    const search = await this.request<{
      requestId: string;
      data: Array<{
        contactId: string;
        firstName?: string;
        lastName?: string;
        jobTitle?: string;
        seniority?: string;
        linkedinUrl?: string;
        companyName?: string;
        companySize?: string;
        location?: { city?: string; country?: string };
        companyIndustry?: string;
      }>;
    }>("/prospecting/contact/search", {
      pages: { page: 0, size: limite },
      filters: {
        contacts: {
          locations: { include: [{ country: pais }] },
          jobTitles: { include: criterios.cargos },
        },
        companies: {
          industries: { include: criterios.sectores },
          sizes: { include: criterios.tamanoEmpresa },
        },
      },
    });

    if (!search.data || search.data.length === 0) return [];

    const contactIds = search.data.map((c) => c.contactId);

    const enrich = await this.request<{
      contacts: Array<{
        contactId: string;
        phoneNumbers?: Array<{ number: string }>;
        emailAddresses?: Array<{ email: string }>;
      }>;
    }>("/prospecting/contact/enrich", {
      requestId: search.requestId,
      contactIds,
    });

    const enrichPorId = new Map(enrich.contacts.map((c) => [c.contactId, c]));

    return search.data.map((c) => {
      const datosEnriquecidos = enrichPorId.get(c.contactId);
      return {
        lushaId: c.contactId,
        nombre: c.firstName ?? "Sin nombre",
        apellido: c.lastName ?? null,
        cargo: c.jobTitle ?? null,
        nivelDecision: c.seniority ?? null,
        telefono: datosEnriquecidos?.phoneNumbers?.[0]?.number ?? null,
        email: datosEnriquecidos?.emailAddresses?.[0]?.email ?? null,
        linkedinContacto: c.linkedinUrl ?? null,
        empresa: c.companyName ?? "Empresa sin nombre",
        sector: c.companyIndustry ?? null,
        tamanoEmpresa: c.companySize ?? null,
        ciudad: c.location?.city ?? null,
      };
    });
  }
}

export function crearClienteLusha(): LushaClient {
  const apiKey = process.env.LUSHA_API_KEY;
  if (!apiKey) throw new Error("Falta configurar LUSHA_API_KEY en el entorno.");
  return new LushaClient(apiKey);
}
