-- CreateEnum
CREATE TYPE "ClientSegment" AS ENUM ('ARTIST', 'LABEL', 'ADVERTISING_AGENCY', 'COMPANY', 'INSTITUTION', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('RECORDING', 'MIXING', 'MASTERING', 'POST_PRODUCTION', 'VOICE_OVER', 'EQUIPMENT_RENTAL', 'LIVE_EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('QUOTE', 'VALIDATED', 'IN_PROGRESS', 'REVIEW', 'DELIVERED', 'INVOICED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('MGA', 'EUR', 'USD');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" "ClientSegment" NOT NULL DEFAULT 'OTHER',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 100,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'QUOTE',
    "description" TEXT,
    "budgetAmount" DECIMAL(14,2),
    "budgetCurrency" "Currency" NOT NULL DEFAULT 'MGA',
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "clientId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_reference_key" ON "projects"("reference");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
