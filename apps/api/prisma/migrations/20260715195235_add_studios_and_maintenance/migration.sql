-- CreateEnum
CREATE TYPE "StudioType" AS ENUM ('RECORDING', 'PODCAST', 'LIVE', 'VIDEO', 'REHEARSAL', 'OTHER');

-- CreateEnum
CREATE TYPE "StudioStatus" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'CLOSED');

-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "nextMaintenanceAt" TIMESTAMP(3),
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "warrantyUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(14,2),
    "technician" TEXT,
    "partsReplaced" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StudioType" NOT NULL DEFAULT 'RECORDING',
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "hourlyPrice" DECIMAL(14,2),
    "status" "StudioStatus" NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT,
    "equipmentSummary" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
