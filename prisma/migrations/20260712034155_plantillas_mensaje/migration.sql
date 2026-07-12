-- CreateTable
CREATE TABLE "plantillas_mensaje" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "segmento" TEXT,
    "texto" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantillas_mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plantillas_mensaje_segmento_idx" ON "plantillas_mensaje"("segmento");
