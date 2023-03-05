/*
  Warnings:

  - Added the required column `content` to the `Chain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chain" ADD COLUMN     "content" TEXT NOT NULL;
