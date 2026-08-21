/*
  Warnings:

  - A unique constraint covering the columns `[free_slot_property_id]` on the table `host_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('YAPE', 'PLIN', 'TRANSFER', 'CASH');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING_PAYMENT', 'IN_REVIEW', 'ACTIVE', 'EXPIRED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "host_profiles" ADD COLUMN     "free_slot_property_id" UUID;

-- CreateTable
CREATE TABLE "host_plans" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "days" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'PEN',
    "tagline" VARCHAR(160),
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_subscriptions" (
    "id" UUID NOT NULL,
    "host_profile_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'PEN',
    "method" "PaymentMethod",
    "operation_number" VARCHAR(60),
    "proof_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "reported_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" UUID,
    "rejection_reason" VARCHAR(500),
    "admin_notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "host_plans_code_key" ON "host_plans"("code");

-- CreateIndex
CREATE INDEX "host_plans_is_active_sort_order_idx" ON "host_plans"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "host_subscriptions_host_profile_id_status_idx" ON "host_subscriptions"("host_profile_id", "status");

-- CreateIndex
CREATE INDEX "host_subscriptions_status_ends_at_idx" ON "host_subscriptions"("status", "ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "host_profiles_free_slot_property_id_key" ON "host_profiles"("free_slot_property_id");

-- AddForeignKey
ALTER TABLE "host_subscriptions" ADD CONSTRAINT "host_subscriptions_host_profile_id_fkey" FOREIGN KEY ("host_profile_id") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_subscriptions" ADD CONSTRAINT "host_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "host_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_subscriptions" ADD CONSTRAINT "host_subscriptions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
