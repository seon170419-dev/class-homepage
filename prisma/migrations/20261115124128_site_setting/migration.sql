-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "siteTitle" TEXT NOT NULL DEFAULT '우리 반 홈페이지',
    "schoolName" TEXT,
    "className" TEXT,
    "teacherName" TEXT,
    "homeLinkUrl" TEXT,
    "homeLinkLabel" TEXT,
    "homeLinkImageUrl" TEXT,
    "sessionSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
