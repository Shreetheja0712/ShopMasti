-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- Normalize any existing text values before converting the columns to enums.
UPDATE "Orders"
SET "status" = CASE UPPER("status")
  WHEN 'PENDING' THEN 'PENDING'
  WHEN 'SHIPPED' THEN 'SHIPPED'
  WHEN 'DELIVERED' THEN 'DELIVERED'
  WHEN 'CANCELLED' THEN 'CANCELLED'
  ELSE 'PENDING'
END
WHERE "status" IS NOT NULL;

UPDATE "Orders"
SET "payment_status" = CASE UPPER("payment_status")
  WHEN 'PENDING' THEN 'PENDING'
  WHEN 'SUCCESS' THEN 'SUCCESS'
  WHEN 'FAILED' THEN 'FAILED'
  ELSE 'PENDING'
END
WHERE "payment_status" IS NOT NULL;

-- AlterTable
ALTER TABLE "Orders"
ALTER COLUMN "status" TYPE "OrderStatus" USING ("status"::"OrderStatus"),
ALTER COLUMN "payment_status" TYPE "PaymentStatus" USING ("payment_status"::"PaymentStatus");
