-- Badge client électronique
ALTER TABLE "clients" ADD COLUMN "badgeCode" TEXT;
CREATE UNIQUE INDEX "clients_badgeCode_key" ON "clients"("badgeCode");

-- Ticket électronique de réservation
ALTER TABLE "bookings" ADD COLUMN "ticketCode" TEXT;
CREATE UNIQUE INDEX "bookings_ticketCode_key" ON "bookings"("ticketCode");
