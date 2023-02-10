-- CreateTable
CREATE TABLE "ChainRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,

    CONSTRAINT "ChainRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChainRun" ADD CONSTRAINT "ChainRun_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
