-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "empresa_id" TEXT;

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sitio_web" TEXT,
    "linkedin_empresa" TEXT,
    "tecnologias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resumen" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "empresas_nombre_idx" ON "empresas"("nombre");

-- CreateIndex
CREATE INDEX "leads_empresa_id_idx" ON "leads"("empresa_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
