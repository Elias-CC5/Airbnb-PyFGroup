-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('FLEXIBLE', 'MODERATE', 'STRICT');

-- CreateEnum
CREATE TYPE "BedType" AS ENUM ('SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'BUNK', 'SOFA_BED');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "area_m2" INTEGER,
ADD COLUMN     "bed_type" "BedType",
ADD COLUMN     "cancellation_policy" "CancellationPolicy" NOT NULL DEFAULT 'MODERATE',
ADD COLUMN     "extra_guest_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "has_elevator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "house_rules" TEXT,
ADD COLUMN     "monthly_discount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parties_allowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pets_allowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quiet_hours_from" VARCHAR(5),
ADD COLUMN     "quiet_hours_to" VARCHAR(5),
ADD COLUMN     "security_deposit" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "smoking_allowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suitable_for_children" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "view_type" VARCHAR(60),
ADD COLUMN     "weekly_discount" INTEGER NOT NULL DEFAULT 0;
