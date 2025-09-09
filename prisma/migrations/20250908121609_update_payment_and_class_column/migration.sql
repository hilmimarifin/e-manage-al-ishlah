/*
  Warnings:

  - You are about to drop the column `capacity` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,month]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryYear` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payments_studentId_month_year_key";

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "capacity",
DROP COLUMN "level",
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "monthlyFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "year",
ADD COLUMN     "classId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "entryYear" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_studentId_month_key" ON "payments"("studentId", "month");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
