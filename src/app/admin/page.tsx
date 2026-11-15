import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function StatCard({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: number | string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [
    dueTodayCount,
    pendingCompliments,
    pendingBirthdayMessages,
    activitiesToReview,
    counselingRequested,
    pendingSuggestions,
    totalStudents,
    latestAnnouncement,
  ] = await Promise.all([
    prisma.scheduleItem.count({ where: { dueAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.compliment.count({ where: { status: "PENDING" } }),
    prisma.birthdayMessage.count({ where: { status: "PENDING" } }),
    prisma.activityRecord.count({
      where: { status: { in: ["DRAFTED", "STUDENT_CONFIRMED"] } },
    }),
    prisma.counselingRequest.count({ where: { status: "REQUESTED" } }),
    prisma.suggestion.count({ where: { status: "PENDING" } }),
    prisma.student.count(),
    prisma.announcement.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  let unreadCount = 0;
  if (latestAnnouncement) {
    const readCount = await prisma.announcementRead.count({
      where: { announcementId: latestAnnouncement.id },
    });
    unreadCount = totalStudents - readCount;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">관리자 대시보드</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard href="/admin/schedules" label="오늘 마감 일정" value={dueTodayCount} />
        <StatCard
          href="/admin/announcements"
          label="최신 공지 미확인 인원"
          value={latestAnnouncement ? `${unreadCount} / ${totalStudents}명` : "-"}
        />
        <StatCard href="/admin/compliments" label="칭찬함 승인 대기" value={pendingCompliments} />
        <StatCard
          href="/admin/birthday-messages"
          label="생일메시지 승인 대기"
          value={pendingBirthdayMessages}
        />
        <StatCard href="/admin/activities" label="활동기록 검토 대기" value={activitiesToReview} />
        <StatCard href="/admin/counseling" label="상담 신청" value={counselingRequested} />
        <StatCard href="/admin/suggestions" label="건의함 대기" value={pendingSuggestions} />
        <StatCard href="/admin/students" label="전체 학생 수" value={totalStudents} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin/announcements" className="rounded-md border px-3 py-1.5 hover:bg-accent">
            + 공지 등록
          </Link>
          <Link href="/admin/schedules" className="rounded-md border px-3 py-1.5 hover:bg-accent">
            + 일정 등록
          </Link>
          <Link href="/admin/students" className="rounded-md border px-3 py-1.5 hover:bg-accent">
            + 학생 계정 발급
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
