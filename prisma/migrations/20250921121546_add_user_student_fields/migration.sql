/*
  Warnings:

  - A unique constraint covering the columns `[studentId,month,classId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nik]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nik` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payments_studentId_month_key";

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "nik" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "nik" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_studentId_month_classId_key" ON "payments"("studentId", "month", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "students_nik_key" ON "students"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");
