/*
  Warnings:

  - A unique constraint covering the columns `[orderNo]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNo` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderNo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "public"."Order"("orderNo");
