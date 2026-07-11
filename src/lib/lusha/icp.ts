export type SegmentoId =
  | "sap_enterprise"
  | "sap_business_one"
  | "odoo"
  | "ia"
  | "portal_proveedores"
  | "portal_rendiciones"
  | "gmao";

export type CriteriosSegmento = {
  id: SegmentoId;
  nombre: string;
  descripcion: string;
  sectores: string[];
  cargos: string[];
  tamanoEmpresa: string[];
};

/**
 * Perfil de cliente ideal (ICP) por línea de negocio de EBIM, usado como filtros
 * de búsqueda del agente Lusha. Editable acá sin tocar la lógica del agente.
 */
export const SEGMENTOS: Record<SegmentoId, CriteriosSegmento> = {
  sap_enterprise: {
    id: "sap_enterprise",
    nombre: "SAP R/3 / S4HANA (consultoría e integraciones)",
    descripcion:
      "Empresas grandes que ya operan SAP y necesitan soporte, integraciones o desarrollos a medida.",
    sectores: ["Mining", "Oil & Energy", "Manufacturing", "Banking", "Retail"],
    cargos: [
      "CIO",
      "IT Director",
      "IT Manager",
      "Gerente de TI",
      "Gerente de Sistemas",
      "Jefe de Infraestructura TI",
      "SAP Manager",
    ],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000", "5001-10000", "10001+"],
  },
  sap_business_one: {
    id: "sap_business_one",
    nombre: "SAP Business One",
    descripcion:
      "Empresas medianas que necesitan un ERP robusto (SAP B1), mismo público que Odoo pero otro presupuesto.",
    sectores: ["Manufacturing", "Wholesale", "Retail", "Logistics", "Construction"],
    cargos: ["Gerente General", "Gerente Administrativo", "Gerente Financiero", "Gerente de TI", "CFO"],
    tamanoEmpresa: ["51-200", "201-500"],
  },
  odoo: {
    id: "odoo",
    nombre: "Odoo ERP (partner)",
    descripcion: "PyMEs y medianas sin ERP o con sistemas obsoletos, buscando un ERP moderno y accesible.",
    sectores: ["Retail", "Wholesale", "Construction", "Food & Beverages", "Professional Services"],
    cargos: ["Gerente General", "Gerente Administrativo", "Gerente Financiero", "Gerente de TI"],
    tamanoEmpresa: ["11-50", "51-200"],
  },
  ia: {
    id: "ia",
    nombre: "Soluciones de Inteligencia Artificial",
    descripcion: "Empresas con iniciativas de transformación digital, transversal a sector.",
    sectores: ["Banking", "Retail", "Manufacturing", "Insurance", "Telecommunications"],
    cargos: ["CTO", "Gerente de Innovación", "Gerente de TI", "CIO", "Gerente General"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000"],
  },
  portal_proveedores: {
    id: "portal_proveedores",
    nombre: "Portal de Proveedores",
    descripcion: "Empresas con volumen alto de proveedores que necesitan digitalizar la relación.",
    sectores: ["Retail", "Construction", "Mining", "Manufacturing"],
    cargos: ["Gerente de Compras", "Procurement Manager", "Gerente de Logística", "Gerente de Abastecimiento"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000"],
  },
  portal_rendiciones: {
    id: "portal_rendiciones",
    nombre: "Portal de Rendiciones",
    descripcion: "Empresas con fuerza de ventas o personal de campo que rinde gastos con frecuencia.",
    sectores: ["Consumer Goods", "Pharmaceuticals", "Insurance", "Professional Services"],
    cargos: ["Gerente de Finanzas", "Controller", "Gerente Administrativo", "Gerente de RRHH"],
    tamanoEmpresa: ["51-200", "201-500", "501-1000"],
  },
  gmao: {
    id: "gmao",
    nombre: "GMAO (Gestión de Mantenimiento)",
    descripcion: "Empresas con activos físicos intensivos que requieren gestión de mantenimiento.",
    sectores: ["Mining", "Manufacturing", "Utilities", "Transportation", "Hospitality", "Real Estate"],
    cargos: ["Gerente de Mantenimiento", "Gerente de Operaciones", "Gerente de Planta", "Jefe de Activos"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000"],
  },
};

export const PAIS_OBJETIVO = "Bolivia";
