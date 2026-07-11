-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'ejecutiva');

-- CreateEnum
CREATE TYPE "PaisEjecutiva" AS ENUM ('PE', 'EC');

-- CreateEnum
CREATE TYPE "EstadoLead" AS ENUM ('nuevo', 'asignado', 'contactado', 'respondio', 'agendado', 'calificado', 'descartado');

-- CreateEnum
CREATE TYPE "OrigenLead" AS ENUM ('lusha', 'manual', 'csv');

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('asignacion', 'whatsapp_abierto', 'cambio_estado', 'nota');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "pais" "PaisEjecutiva",
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "contacto_nombre" TEXT,
    "cargo" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "sector" TEXT,
    "ciudad" TEXT,
    "departamento" TEXT,
    "origen" "OrigenLead" NOT NULL DEFAULT 'manual',
    "lusha_id" TEXT,
    "estado" "EstadoLead" NOT NULL DEFAULT 'nuevo',
    "asignada_a_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "detalle" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agente_runs" (
    "id" TEXT NOT NULL,
    "ejecutado_por_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filtros_usados" JSONB NOT NULL,
    "leads_traidos" INTEGER NOT NULL,
    "leads_nuevos" INTEGER NOT NULL,

    CONSTRAINT "agente_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "leads_asignada_a_id_idx" ON "leads"("asignada_a_id");

-- CreateIndex
CREATE INDEX "leads_estado_idx" ON "leads"("estado");

-- CreateIndex
CREATE INDEX "actividades_lead_id_idx" ON "actividades"("lead_id");

-- CreateIndex
CREATE INDEX "actividades_user_id_idx" ON "actividades"("user_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_asignada_a_id_fkey" FOREIGN KEY ("asignada_a_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agente_runs" ADD CONSTRAINT "agente_runs_ejecutado_por_id_fkey" FOREIGN KEY ("ejecutado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
