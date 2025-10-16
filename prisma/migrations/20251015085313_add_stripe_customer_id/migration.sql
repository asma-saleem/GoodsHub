/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `availabilityStatus` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "stripeSessionId" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "isDeleted",
ADD COLUMN     "isProductDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."ProductVariant" DROP COLUMN "availabilityStatus",
ADD COLUMN     "isVariantDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stripeCustomerId" TEXT;

-- DropEnum
DROP TYPE "public"."VariantAvailability";
