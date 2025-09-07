/*
  Warnings:

  - Added the required column `gender` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "gender" "Gender" NOT NULL;
