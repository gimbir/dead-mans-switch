/*
  Warnings:

  - You are about to drop the column `checkInInterval` on the `switches` table. All the data in the column will be lost.
  - You are about to drop the column `gracePeriod` on the `switches` table. All the data in the column will be lost.
  - Added the required column `checkInIntervalDays` to the `switches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "switches" DROP COLUMN "checkInInterval",
DROP COLUMN "gracePeriod",
ADD COLUMN     "checkInIntervalDays" INTEGER NOT NULL,
ADD COLUMN     "gracePeriodDays" INTEGER NOT NULL DEFAULT 0;
