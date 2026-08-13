-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('RECLAMO', 'QUEJA');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'RESUELTO');

-- CreateTable
CREATE TABLE "complaint_book" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" "ComplaintType" NOT NULL,
    "full_name" VARCHAR(160) NOT NULL,
    "doc_type" VARCHAR(20) NOT NULL,
    "doc_number" VARCHAR(20) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "email" VARCHAR(160) NOT NULL,
    "item_description" VARCHAR(500) NOT NULL,
    "amount" DECIMAL(10,2),
    "reservation_code" VARCHAR(20),
    "detail" VARCHAR(2000) NOT NULL,
    "request" VARCHAR(1000) NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDIENTE',
    "response" VARCHAR(2000),
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaint_book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "complaint_book_code_key" ON "complaint_book"("code");

-- CreateIndex
CREATE INDEX "complaint_book_status_idx" ON "complaint_book"("status");

-- CreateIndex
CREATE INDEX "complaint_book_created_at_idx" ON "complaint_book"("created_at");
