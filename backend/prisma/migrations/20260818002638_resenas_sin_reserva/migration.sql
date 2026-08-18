/*
  Warnings:

  - A unique constraint covering the columns `[property_id,user_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "reservation_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_property_id_user_id_key" ON "reviews"("property_id", "user_id");
