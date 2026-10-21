-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "shortTerm" JSONB NOT NULL,
    "mediumTerm" JSONB NOT NULL,
    "longTerm" JSONB NOT NULL,
    "explanations" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prediction_symbol_timestamp_idx" ON "Prediction"("symbol", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_symbol_timestamp_key" ON "Prediction"("symbol", "timestamp");
