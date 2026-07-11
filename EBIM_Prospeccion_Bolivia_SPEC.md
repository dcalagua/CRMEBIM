# EBIM — Plataforma de Prospección Bolivia
## Especificación de arranque para Claude Code

> Documento base para iniciar el desarrollo. Denis = admin. Plataforma **independiente de Odoo**. Canal único de contacto: **WhatsApp Business**. Fuente de leads: **Lusha**. Objetivo central: **trazabilidad + dashboard de actividad**.

---

## 1. Objetivo

Plataforma web propia donde Denis (admin) registra ejecutivas (Talia, Nicolás, Marisela), un agente trae leads bolivianos calificados desde Lusha, se asignan a las ejecutivas, ellas los trabajan por WhatsApp Business, y toda la actividad queda registrada para un dashboard de trazabilidad.

**No incluye:** llamadas telefónicas (descartadas), integración con Odoo (desarrollo aparte).

---

## 2. Stack técnico

Alineado al stack que EBIM ya usa:

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes (o servicio Node.js/Express separado para el agente)
- **Base de datos:** PostgreSQL + Prisma (ORM)
- **Autenticación:** NextAuth (credenciales usuario/contraseña, roles admin/ejecutiva)
- **Infraestructura:** droplet DigitalOcean existente (Ubuntu 24.04), PM2
- **Fuente de leads:** Lusha (vía API/MCP — confirmar acceso en el plan)

---

## 3. Roles

**Admin (Denis)**
- Crea/edita/desactiva usuarios ejecutivos
- Dispara o programa el agente de captación Lusha
- Asigna leads a ejecutivas (manual o por reglas: país/sector)
- Ve el dashboard completo de trazabilidad

**Ejecutiva (Talia, Nicolás, Marisela)**
- Login propio
- Ve solo sus leads asignados
- Abre WhatsApp del lead (botón click-to-chat)
- Actualiza el estado del lead en el embudo
- Registra notas por lead

---

## 4. Modelo de datos (PostgreSQL / Prisma)

### `User`
- id, nombre, email, password_hash
- rol: `admin` | `ejecutiva`
- pais: `PE` | `EC` (ubicación de la ejecutiva)
- activo: boolean
- created_at

### `Lead`
- id
- empresa (razón social)
- contacto_nombre
- cargo
- telefono (formato E.164, +591…)
- email
- sector
- ciudad / departamento (Bolivia)
- origen: `lusha` | `manual` | `csv`
- lusha_id (referencia externa, si aplica)
- estado: enum embudo (ver abajo)
- asignada_a: FK → User (ejecutiva)
- created_at, updated_at

### `Actividad` (tabla de trazabilidad — corazón del sistema)
- id
- lead_id: FK
- user_id: FK (quién hizo la acción)
- tipo: `asignacion` | `whatsapp_abierto` | `cambio_estado` | `nota`
- detalle (texto / estado anterior→nuevo)
- timestamp

### `AgenteRun` (log de cada corrida del agente Lusha)
- id, ejecutado_por, fecha
- filtros_usados (JSON: país, sector, cargos)
- leads_traidos (int)
- leads_nuevos (int, descontando duplicados)

---

## 5. Embudo de estados (Lead.estado)

```
nuevo → asignado → contactado → respondio → agendado → calificado → descartado
```

Cada cambio de estado escribe un registro en `Actividad`.

---

## 6. Módulos a construir (orden sugerido)

### Fase 1 — Base (sin costo externo)
1. **Auth + roles** (NextAuth, login, middleware admin/ejecutiva)
2. **CRUD de usuarios** (panel admin)
3. **Modelo de leads + carga manual/CSV** (para arrancar con leads exportados de Lusha aunque el agente aún no esté)
4. **Panel de ejecutiva**: lista de leads asignados, ficha de lead, botón WhatsApp, cambio de estado, notas
5. **Botón WhatsApp**: link `https://wa.me/<telefono>?text=<plantilla>` — abre WhatsApp Business del navegador/celular. Registra evento `whatsapp_abierto` en Actividad.
6. **Dashboard admin v1**: leads por estado, actividad por ejecutiva, leads sin trabajar, embudo.

### Fase 2 — Agente Lusha
7. **Agente de captación**: servicio que consulta Lusha (API o MCP) con filtros Bolivia + ICP, trae leads, deduplica contra los existentes, los inserta como `nuevo`. Registra `AgenteRun`.
8. **Programación**: correr manual (botón admin) o cron (PM2). 
9. **Auto-asignación opcional**: reglas para repartir leads nuevos entre ejecutivas.

### Fase 3 — Trazabilidad avanzada (opcional futuro)
10. WhatsApp Business **API** (Meta Cloud API o vía proveedor) para trazabilidad automática de mensajes entrantes/salientes dentro de la plataforma, en lugar del marcado manual.

---

## 7. Integración WhatsApp — decisión de arranque

**Fase 1 (recomendado para arrancar): `wa.me` click-to-chat.**
- Cero costo, cero verificación compleja.
- Usa el número Tigo boliviano en WhatsApp Business App.
- Trazabilidad: la plataforma registra que se abrió el chat; la ejecutiva marca manualmente el resultado (respondió / agendó).
- Limitación: la plataforma no ve el contenido de los mensajes.

**Fase 3 (si se necesita trazabilidad total): WhatsApp Business API (Meta Cloud API).**
- Mensajes dentro de la plataforma, trazabilidad automática.
- Costo por conversación + verificación de número de empresa (Meta Business).
- Migración prevista: mantener WhatsApp como módulo intercambiable para no reescribir.

---

## 8. Dashboard admin — métricas mínimas

- Leads captados de Lusha por período (línea de tiempo)
- Embudo: conteo por estado (nuevo → … → calificado/descartado)
- Actividad por ejecutiva: leads asignados, contactados, respondidos, agendados
- Leads sin tocar (asignados pero sin actividad en X días) — alerta de productividad
- Tasa de respuesta por ejecutiva (respondio / contactado)
- Ranking / comparativa entre ejecutivas

---

## 9. Instrucciones para Claude Code (primer prompt sugerido)

> "Crea un proyecto Next.js 14 + TypeScript + Tailwind + Prisma + PostgreSQL para una plataforma de prospección. Implementa primero: (1) el esquema Prisma con los modelos User, Lead, Actividad, AgenteRun según la especificación; (2) autenticación con NextAuth por credenciales con roles admin/ejecutiva; (3) el CRUD de usuarios para el admin. No implementes aún el agente de Lusha ni WhatsApp API — deja esos como módulos separados. Sigue el orden de fases del documento."

Luego avanzar módulo por módulo, validando cada uno antes del siguiente.

---

## 10. Pendientes a confirmar antes/durante

1. **¿El plan Lusha incluye acceso API/MCP?** Si sí → agente automático (Fase 2). Si no → import CSV en Fase 1 y evaluar upgrade.
2. **Cobertura Lusha en Bolivia**: correr una búsqueda real del ICP boliviano y contar resultados, para dimensionar el volumen de leads que alimentará la plataforma.
3. **Número WhatsApp**: confirmar el Tigo boliviano libre para WhatsApp Business App.
4. **Hosting**: mismo droplet DigitalOcean (junto al pipeline actual) o instancia separada.
5. **ICP boliviano**: definir sectores y cargos objetivo (para filtros del agente y del CSV).

---

*Documento de arranque. El desarrollo se ejecuta en Claude Code (VS Code) sobre el entorno EBIM.*
