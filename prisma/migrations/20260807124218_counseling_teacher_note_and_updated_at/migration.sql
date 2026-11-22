/*
  Warnings:

  - Added the required column `updatedAt` to the `CounselingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CounselingRequest" ADD COLUMN     "teacherNote" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 기존 행은 지금 시점으로 백필. 이후 신규/수정 행은 Prisma의 @updatedAt이 관리하므로
-- 기본값 자체는 애플리케이션 레벨에서 더 이상 의존하지 않음(스키마상 default 유지는 무해).
