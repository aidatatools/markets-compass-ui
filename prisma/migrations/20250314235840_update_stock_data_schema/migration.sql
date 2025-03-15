/*
  Warnings:

  - You are about to drop the column `price` on the `StockData` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `StockData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[symbol,date]` on the table `StockData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `close` to the `StockData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `StockData` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StockData_symbol_idx";

-- DropIndex
DROP INDEX "StockData_timestamp_idx";

-- AlterTable
ALTER TABLE "StockData" DROP COLUMN "price",
DROP COLUMN "timestamp",
ADD COLUMN     "close" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_symbol_date_idx" ON "Report"("symbol", "date");

-- CreateIndex
CREATE INDEX "StockData_symbol_date_idx" ON "StockData"("symbol", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StockData_symbol_date_key" ON "StockData"("symbol", "date");
