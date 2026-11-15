/*
  Warnings:

  - You are about to drop the column `sessionSecret` on the `SiteSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SiteSetting" DROP COLUMN "sessionSecret";
