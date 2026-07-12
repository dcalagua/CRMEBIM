export type SegmentoId =
  | "sap_enterprise"
  | "sap_business_one"
  | "sap_ams"
  | "odoo"
  | "ia"
  | "software_factory"
  | "business_intelligence"
  | "portal_proveedores"
  | "portal_rendiciones"
  | "gmao"
  | "wms"
  | "tms"
  | "staffing_ti"
  | "helpdesk";

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
  sap_ams: {
    id: "sap_ams",
    nombre: "SAP AMS + Bolsas de Horas",
    descripcion: "Empresas que ya operan SAP y necesitan soporte continuo (application management) o staffing por horas.",
    sectores: ["Mining", "Oil & Energy", "Manufacturing", "Banking"],
    cargos: ["Gerente de TI", "IT Manager", "SAP Manager", "CIO"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000", "5001-10000"],
  },
  software_factory: {
    id: "software_factory",
    nombre: "Software Factory / Desarrollo a Medida",
    descripcion: "Empresas con necesidades de desarrollo custom o proyectos de digitalización, transversal a sector.",
    sectores: ["Technology, Information & Media", "Financial Services", "Retail & Wholesale Trade", "Manufacturing"],
    cargos: ["CTO", "Gerente de TI", "Gerente de Desarrollo", "Product Manager"],
    tamanoEmpresa: ["51-200", "201-500", "501-1000"],
  },
  business_intelligence: {
    id: "business_intelligence",
    nombre: "PowerBI / Servicios BI",
    descripcion: "Empresas que necesitan analítica y reportería gerencial, transversal a sector.",
    sectores: ["Banking", "Retail & Wholesale Trade", "Manufacturing", "Oil, Gas & Mining"],
    cargos: ["Gerente de TI", "CFO", "Gerente de Finanzas", "Gerente de Business Intelligence"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000"],
  },
  wms: {
    id: "wms",
    nombre: "WMS (Gestión de Almacenes)",
    descripcion: "Empresas con operaciones logísticas y almacenes de volumen relevante.",
    sectores: ["Retail & Wholesale Trade", "Transportation & Logistics", "Manufacturing"],
    cargos: ["Gerente de Logística", "Gerente de Almacén", "Supply Chain Manager", "Gerente de Operaciones"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000"],
  },
  tms: {
    id: "tms",
    nombre: "TMS (Gestión de Transporte)",
    descripcion: "Empresas con flotas propias o gestión de transporte/distribución.",
    sectores: ["Transportation & Logistics", "Retail & Wholesale Trade", "Oil, Gas & Mining"],
    cargos: ["Gerente de Transporte", "Gerente de Logística", "Gerente de Flota", "Gerente de Operaciones"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000"],
  },
  staffing_ti: {
    id: "staffing_ti",
    nombre: "Staffing de TI",
    descripcion: "Empresas que cubren posiciones de TI de forma temporal o tercerizada, transversal a sector.",
    sectores: ["Technology, Information & Media", "Banking", "Retail & Wholesale Trade", "Manufacturing"],
    cargos: ["Gerente de TI", "Gerente de RRHH", "IT Manager", "CIO"],
    tamanoEmpresa: ["51-200", "201-500", "501-1000"],
  },
  helpdesk: {
    id: "helpdesk",
    nombre: "Helpdesk / Mesa de Ayuda",
    descripcion: "Empresas grandes con muchos usuarios internos que requieren soporte TI tercerizado.",
    sectores: ["Banking", "Retail & Wholesale Trade", "Manufacturing", "Oil, Gas & Mining"],
    cargos: ["Gerente de TI", "IT Manager", "Gerente de Infraestructura", "CIO"],
    tamanoEmpresa: ["201-500", "501-1000", "1001-5000", "5001-10000"],
  },
};

export const PAIS_OBJETIVO = "Bolivia";
