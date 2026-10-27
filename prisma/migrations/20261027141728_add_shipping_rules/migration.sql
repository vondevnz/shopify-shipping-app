-- CreateTable
CREATE TABLE "ShippingRule" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "minWeightGrams" INTEGER NOT NULL,
    "maxWeightGrams" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "shop" TEXT NOT NULL,

    CONSTRAINT "ShippingRule_pkey" PRIMARY KEY ("id")
);
