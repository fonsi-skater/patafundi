/*
  Warnings:

  - A unique constraint covering the columns `[authId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authId]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "authId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "authId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_authId_key" ON "Client"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_authId_key" ON "Worker"("authId");
