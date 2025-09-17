/*
  Warnings:

  - You are about to drop the column `orderNo` on the `Order` table. All the data in the column will be lost.
  - Added the required column `tax` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Order_orderNo_key";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "orderNo",
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL;
