-- CreateTable
CREATE TABLE "UserFolder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "UserFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataObjects" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userFolderId" TEXT NOT NULL,

    CONSTRAINT "DataObjects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserFolder" ADD CONSTRAINT "UserFolder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataObjects" ADD CONSTRAINT "DataObjects_userFolderId_fkey" FOREIGN KEY ("userFolderId") REFERENCES "UserFolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
