/*
  Warnings:

  - Added the required column `number` to the `ChainRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChainRun" ADD COLUMN     "number" INTEGER NOT NULL;
