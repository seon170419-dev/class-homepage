-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('URGENT', 'ASSESSMENT', 'SCHOOL_EVENT', 'RECRUIT', 'SUPPLIES', 'CLASS_NOTICE');

-- CreateEnum
CREATE TYPE "ScheduleCategory" AS ENUM ('ASSESSMENT', 'EXAM', 'SCHOOL_EVENT', 'RECRUIT', 'CLASS_EVENT', 'SUPPLIES');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'CONFIRMING', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ComplimentVisibility" AS ENUM ('CLASS_PUBLIC', 'TARGET_ONLY', 'TEACHER_ONLY');

-- CreateEnum
CREATE TYPE "ComplimentValueTag" AS ENUM ('CARE', 'RESPONSIBILITY', 'COOPERATION', 'DILIGENCE', 'CHALLENGE', 'SERVICE', 'CONFLICT_RESOLUTION');

-- CreateEnum
CREATE TYPE "SuggestionCategory" AS ENUM ('SEATING', 'CLEANING', 'CLASS_EVENT', 'CLASSROOM_ENV', 'CLASS_RULE', 'ETC');

-- CreateEnum
CREATE TYPE "SuggestionVisibility" AS ENUM ('TEACHER_ONLY', 'CLASS_MEETING_PUBLIC');

-- CreateEnum
CREATE TYPE "CounselingCategory" AS ENUM ('ACADEMIC', 'CAREER', 'FRIENDSHIP', 'SCHOOL_LIFE', 'FAMILY', 'OTHER', 'URGENT');

-- CreateEnum
CREATE TYPE "CounselingStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'DONE');

-- CreateEnum
CREATE TYPE "LostItemStatus" AS ENUM ('UNCLAIMED', 'CLAIMED');

-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('NOTICE_LETTER', 'FIELD_TRIP', 'ATTENDANCE', 'ASSESSMENT_FORM', 'SURVEY', 'SCHOOL_LIFE', 'FAQ', 'ETC');

-- CreateEnum
CREATE TYPE "ActivityArea" AS ENUM ('AUTONOMY', 'CAREER', 'SERVICE_COMMUNITY', 'CLUB', 'ETC');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('COLLECTING', 'DRAFTED', 'STUDENT_CONFIRMED', 'TEACHER_REVIEW', 'FINALIZED');

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '담임 선생님',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "number" INTEGER,
    "birthdayPublic" BOOLEAN NOT NULL DEFAULT true,
    "popupOptIn" BOOLEAN NOT NULL DEFAULT true,
    "commentOptIn" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "AnnouncementCategory" NOT NULL DEFAULT 'CLASS_NOTICE',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ScheduleCategory" NOT NULL,
    "subject" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "submissionMethod" TEXT,
    "submissionLink" TEXT,
    "materials" TEXT,
    "submissionRequired" BOOLEAN NOT NULL DEFAULT false,
    "notifyFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "scheduleItemId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirthdayMessage" (
    "id" TEXT NOT NULL,
    "targetStudentId" TEXT NOT NULL,
    "authorStudentId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "flaggedByAi" BOOLEAN NOT NULL DEFAULT false,
    "aiFlagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BirthdayMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compliment" (
    "id" TEXT NOT NULL,
    "targetStudentId" TEXT NOT NULL,
    "authorStudentId" TEXT NOT NULL,
    "occurredAt" TEXT NOT NULL,
    "whatDidText" TEXT NOT NULL,
    "whatToLearnText" TEXT NOT NULL,
    "valueTag" "ComplimentValueTag" NOT NULL,
    "visibility" "ComplimentVisibility" NOT NULL DEFAULT 'CLASS_PUBLIC',
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "flaggedByAi" BOOLEAN NOT NULL DEFAULT false,
    "aiFlagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Compliment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" "SuggestionCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" "SuggestionVisibility" NOT NULL DEFAULT 'TEACHER_ONLY',
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselingRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "category" "CounselingCategory" NOT NULL,
    "preferredTime" TEXT,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "status" "CounselingStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounselingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "photoUrl" TEXT,
    "foundLocation" TEXT NOT NULL,
    "status" "LostItemStatus" NOT NULL DEFAULT 'UNCLAIMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassRole" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "area" "ActivityArea" NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT,
    "actions" TEXT,
    "difficulty" TEXT,
    "solution" TEXT,
    "learned" TEXT,
    "evidenceUrl" TEXT,
    "peerOrTeacherConfirmable" BOOLEAN NOT NULL DEFAULT false,
    "status" "ActivityStatus" NOT NULL DEFAULT 'COLLECTING',
    "teacherDraftText" TEXT,
    "studentNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGoal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "month" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveEntry" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "photoUrls" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_username_key" ON "Teacher"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Student_loginId_key" ON "Student"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementRead_announcementId_studentId_key" ON "AnnouncementRead"("announcementId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_scheduleItemId_studentId_key" ON "Submission"("scheduleItemId", "studentId");

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_scheduleItemId_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "ScheduleItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayMessage" ADD CONSTRAINT "BirthdayMessage_targetStudentId_fkey" FOREIGN KEY ("targetStudentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayMessage" ADD CONSTRAINT "BirthdayMessage_authorStudentId_fkey" FOREIGN KEY ("authorStudentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compliment" ADD CONSTRAINT "Compliment_targetStudentId_fkey" FOREIGN KEY ("targetStudentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compliment" ADD CONSTRAINT "Compliment_authorStudentId_fkey" FOREIGN KEY ("authorStudentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingRequest" ADD CONSTRAINT "CounselingRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRole" ADD CONSTRAINT "ClassRole_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityRecord" ADD CONSTRAINT "ActivityRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
