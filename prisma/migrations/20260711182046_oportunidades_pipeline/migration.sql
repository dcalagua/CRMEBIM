-- CreateEnum
CREATE TYPE "EtapaOportunidad" AS ENUM ('creada', 'propuesta_enviada', 'negociacion', 'cerrada_ganada', 'cerrada_perdida');

-- AlterEnum
ALTER TYPE "TipoActividad" ADD VALUE 'oportunidad';

-- CreateTable
CREATE TABLE "oportunidades" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "asignada_a_id" TEXT NOT NULL,
    "etapa" "EtapaOportunidad" NOT NULL DEFAULT 'creada',
    "valor_estimado" DECIMAL(12,2),
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "fecha_cierre_estimada" TIMESTAMP(3),
    "motivo_perdida" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cerrada_en" TIMESTAMP(3),

    CONSTRAINT "oportunidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "oportunidades_lead_id_idx" ON "oportunidades"("lead_id");

-- CreateIndex
CREATE INDEX "oportunidades_asignada_a_id_idx" ON "oportunidades"("asignada_a_id");

-- CreateIndex
CREATE INDEX "oportunidades_etapa_idx" ON "oportunidades"("etapa");

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_asignada_a_id_fkey" FOREIGN KEY ("asignada_a_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
