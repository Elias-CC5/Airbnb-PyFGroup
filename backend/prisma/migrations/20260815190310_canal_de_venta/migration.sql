-- CreateEnum
CREATE TYPE "BookingChannel" AS ENUM ('DIRECT', 'AIRBNB', 'BOOKING', 'EXPEDIA', 'TIKTOK', 'OTHER');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "channel" "BookingChannel" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "guest_name" VARCHAR(120);
