-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HostApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IdDocumentType" AS ENUM ('DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "PropertyStatus" ADD VALUE 'PAUSED';
ALTER TYPE "PropertyStatus" ADD VALUE 'REJECTED';
ALTER TYPE "PropertyStatus" ADD VALUE 'ARCHIVED';

-- CreateTable
CREATE TABLE "host_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(80) NOT NULL,
    "bio" VARCHAR(1000),
    "avatar_url" TEXT,
    "cover_url" TEXT,
    "city" VARCHAR(80),
    "country" VARCHAR(60) NOT NULL DEFAULT 'Perú',
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "HostStatus" NOT NULL DEFAULT 'PENDING',
    "host_since" TIMESTAMP(3),
    "whatsapp" VARCHAR(30),
    "contact_email" VARCHAR(160),
    "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "properties_count" INTEGER NOT NULL DEFAULT 0,
    "suspended_at" TIMESTAMP(3),
    "suspended_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "HostApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "full_name" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "occupation" VARCHAR(120),
    "motivation" VARCHAR(1000) NOT NULL,
    "city" VARCHAR(80),
    "document_type" "IdDocumentType" NOT NULL,
    "document_number" VARCHAR(20) NOT NULL,
    "document_front_url" TEXT,
    "document_back_url" TEXT,
    "selfie_url" TEXT,
    "documents_purged_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" UUID,
    "rejection_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_document_accesses" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "viewed_by_id" UUID NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" VARCHAR(45),

    CONSTRAINT "host_document_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_settings" (
    "id" UUID NOT NULL,
    "host_profile_id" UUID NOT NULL,
    "notify_on_reservation" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_cancel" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_review" BOOLEAN NOT NULL DEFAULT true,
    "notify_by_email" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "host_profiles_user_id_key" ON "host_profiles"("user_id");

-- CreateIndex
CREATE INDEX "host_profiles_status_idx" ON "host_profiles"("status");

-- CreateIndex
CREATE INDEX "host_applications_status_submitted_at_idx" ON "host_applications"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "host_applications_user_id_idx" ON "host_applications"("user_id");

-- CreateIndex
CREATE INDEX "host_document_accesses_application_id_viewed_at_idx" ON "host_document_accesses"("application_id", "viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "host_settings_host_profile_id_key" ON "host_settings"("host_profile_id");

-- AddForeignKey
ALTER TABLE "host_profiles" ADD CONSTRAINT "host_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_applications" ADD CONSTRAINT "host_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_applications" ADD CONSTRAINT "host_applications_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_document_accesses" ADD CONSTRAINT "host_document_accesses_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "host_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_document_accesses" ADD CONSTRAINT "host_document_accesses_viewed_by_id_fkey" FOREIGN KEY ("viewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_settings" ADD CONSTRAINT "host_settings_host_profile_id_fkey" FOREIGN KEY ("host_profile_id") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
