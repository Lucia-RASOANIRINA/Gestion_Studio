-- CreateEnum
CREATE TYPE "StudioRoom" AS ENUM ('STUDIO_A', 'STUDIO_B', 'STUDIO_C', 'MOBILE');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('SESSION', 'UNAVAILABILITY');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "studio" "StudioRoom" NOT NULL,
    "type" "BookingType" NOT NULL DEFAULT 'SESSION',
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "projectId" TEXT,
    "engineerId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
