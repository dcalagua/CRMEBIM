-- AlterEnum
ALTER TYPE "TipoActividad" ADD VALUE 'reunion';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "proxima_accion_fecha" TIMESTAMP(3),
ADD COLUMN     "reunion_fecha" TIMESTAMP(3),
ADD COLUMN     "reunion_notas" TEXT;
