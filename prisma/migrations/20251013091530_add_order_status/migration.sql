-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderStatus" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING';
