/*
  Warnings:

  - You are about to drop the column `close` on the `StockData` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `StockData` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `StockData` table. All the data in the column will be lost.
  - You are about to drop the `FeatureRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchReport` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `StockData` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StockData_symbol_date_idx";

-- DropIndex
DROP INDEX "StockData_symbol_date_key";

-- AlterTable
ALTER TABLE "StockData" DROP COLUMN "close",
DROP COLUMN "createdAt",
DROP COLUMN "date",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "FeatureRequest";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "ResearchReport";

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "StockData_symbol_idx" ON "StockData"("symbol");

-- CreateIndex
CREATE INDEX "StockData_timestamp_idx" ON "StockData"("timestamp");
