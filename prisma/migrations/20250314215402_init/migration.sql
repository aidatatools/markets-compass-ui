-- CreateTable
CREATE TABLE "StockData" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "adjClose" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchReport" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockData_symbol_idx" ON "StockData"("symbol");

-- CreateIndex
CREATE INDEX "StockData_timestamp_idx" ON "StockData"("timestamp");

-- CreateIndex
CREATE INDEX "ResearchReport_symbol_createdAt_idx" ON "ResearchReport"("symbol", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchReport_symbol_createdAt_key" ON "ResearchReport"("symbol", "createdAt");
