import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSiteSettings, isDatabaseConfigured, isSetupComplete } from "@/lib/site";
import { DbNotConfigured } from "@/components/db-not-configured";
import {
  startOfDay,
  endOfDay,
  addDays,
  formatKoreanDate,
  formatDateTime,
  mmddOf,
} from "@/lib/dates";
import {
  scheduleCategoryLabel,
  scheduleCategoryColor,
  scheduleCategoryIcon,
  announcementCategoryLabel,
  announcementCategoryColor,
  complimentValueTagLabel,
} from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { DDayBadge } from "@/components/dday-badge";
import { QuickMenu } from "@/components/quick-menu";
import { BirthdayPopup } from "@/components/birthday-popup";
import { ScheduleDetailDialog } from "@/components/schedule-detail-dialog";
import { AnnouncementDetailDialog } from "@/components/announcement-detail-dialog";
import type { ScheduleCategory, SubmissionStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isDatabaseConfigured()) return <DbNotConfigured />;
  if (!(await isSetupComplete())) redirect("/setup");
  const settings = await getSiteSettings();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const soonEnd = endOfDay(addDays(now, 5));

  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const session = await getSession();
  const isLoggedInStudent = session?.role === "student";

  const [
    dueToday,
    dueSoon,
    announcements,
    todayBirthdayStudents,
    todayRoles,
    classGoals,
    featuredCompliments,
  ] = await Promise.all([
      prisma.scheduleItem.findMany({
        where: { dueAt: { gte: todayStart, lte: todayEnd } },
        orderBy: { dueAt: "asc" },
      }),
      prisma.scheduleItem.findMany({
        where: { dueAt: { gt: todayEnd, lte: soonEnd } },
        orderBy: { dueAt: "asc" },
        take: 5,
      }),
      prisma.announcement.findMany({
        where: { visibleOnHome: true },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 5,
      }),
      prisma.student.findMany({
        where: { birthDate: mmddOf(now), birthdayPublic: true },
        select: { id: true, name: true, popupOptIn: true },
      }),
      prisma.classRole.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
        include: { student: { select: { name: true } } },
      }),
      prisma.classGoal.findMany({ where: { month: monthKey } }),
      prisma.compliment.findMany({
        where: { featuredOnHome: true, status: "APPROVED", visibility: "CLASS_PUBLIC" },
        orderBy: { createdAt: "desc" },
        include: { target: { select: { name: true } } },
      }),
    ]);

  const visibleScheduleIds = [...dueToday, ...dueSoon].map((i) => i.id);
  const mySubmissions =
    isLoggedInStudent && session.role === "student"
      ? await prisma.submission.findMany({
          where: { studentId: session.studentId, scheduleItemId: { in: visibleScheduleIds } },
        })
      : [];
  const submissionMap = new Map(mySubmissions.map((s) => [s.scheduleItemId, s.status]));

  const recruitSoonCount = dueSoon.filter((s) => s.category === "RECRUIT").length;
  const popupNames = todayBirthdayStudents
    .filter((s) => s.popupOptIn)
    .map((s) => s.name);

  return (
    <div className="space-y-6">
      <BirthdayPopup names={popupNames} dateKey={mmddOf(now)} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold">{formatKoreanDate(now)}</p>
          <p className="mt-1 text-muted-foreground">
            오늘 마감 {dueToday.length}건 · 곧 마감 모집 {recruitSoonCount}건 · 오늘 생일{" "}
            {todayBirthdayStudents.length}명
          </p>
        </div>
        {settings.homeLinkUrl && (
          <a
            href={settings.homeLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
            aria-label={settings.homeLinkLabel ?? "바로가기"}
          >
            {settings.homeLinkImageUrl ? (
              <Image
                src={settings.homeLinkImageUrl}
                alt={settings.homeLinkLabel ?? "바로가기"}
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <span className="inline-block rounded-full border px-3 py-2 text-sm font-medium hover:bg-accent">
                {settings.homeLinkLabel ?? "바로가기"} ↗
              </span>
            )}
          </a>
        )}
      </div>

      {todayBirthdayStudents.length > 0 && (
        <Link href="/birthday">
          <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
            <CardContent className="py-4">
              <p className="font-semibold">
                🎂 오늘은 {todayBirthdayStudents.map((s) => s.name).join(", ")} 학생의
                생일입니다!
              </p>
              <p className="text-sm text-muted-foreground">
                눌러서 축하 메시지를 남겨 주세요.
              </p>
            </CardContent>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader>
          <CardTitle>오늘 마감</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dueToday.length === 0 && (
            <p className="text-sm text-muted-foreground">오늘 마감인 항목이 없어요.</p>
          )}
          {dueToday.map((item) => (
            <ScheduleRow
              key={item.id}
              item={item}
              mySubmissionStatus={submissionMap.get(item.id) ?? null}
              isLoggedInStudent={isLoggedInStudent}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>곧 마감</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dueSoon.length === 0 && (
            <p className="text-sm text-muted-foreground">
              5일 이내 마감 예정 항목이 없어요.
            </p>
          )}
          {dueSoon.map((item) => (
            <ScheduleRow
              key={item.id}
              item={item}
              mySubmissionStatus={submissionMap.get(item.id) ?? null}
              isLoggedInStudent={isLoggedInStudent}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>담임 공지</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.length === 0 && (
            <p className="text-sm text-muted-foreground">등록된 공지가 없어요.</p>
          )}
          {announcements.map((a) => (
            <AnnouncementDetailDialog
              key={a.id}
              item={a}
              trigger={
                <div className="cursor-pointer space-y-1 border-b pb-3 last:border-none last:pb-0">
                  <div className="flex items-center gap-2">
                    {a.pinned && <span className="text-xs">📌</span>}
                    <CategoryBadge
                      label={announcementCategoryLabel[a.category]}
                      colorClass={announcementCategoryColor[a.category]}
                    />
                  </div>
                  <p className="font-medium">{a.title}</p>
                  <p className="line-clamp-3 text-sm text-muted-foreground whitespace-pre-wrap">
                    {a.body}
                  </p>
                  {a.attachmentUrl && (
                    <span className="inline-block text-xs text-primary underline">
                      📎 {a.attachmentName ?? "첨부파일"}
                    </span>
                  )}
                </div>
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>오늘의 학급</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            🎂 오늘 생일:{" "}
            {todayBirthdayStudents.length > 0
              ? todayBirthdayStudents.map((s) => s.name).join(", ")
              : "없음"}
          </p>
          <p>
            🧹 오늘 당번:{" "}
            {todayRoles.length > 0
              ? todayRoles.map((r) => `${r.student.name}(${r.role})`).join(", ")
              : "미지정"}
          </p>
        </CardContent>
      </Card>

      {featuredCompliments.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
          <CardHeader>
            <CardTitle>🌟칭찬합니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredCompliments.map((c) => (
              <div key={c.id} className="space-y-1 border-b pb-3 last:border-none last:pb-0">
                <div className="flex items-center justify-between">
                  <CategoryBadge
                    label={complimentValueTagLabel[c.valueTag]}
                    colorClass="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                  />
                  <span className="text-xs text-muted-foreground">{c.occurredAt}</span>
                </div>
                <p className="text-sm">
                  <strong>{c.target.name}</strong> 학생: {c.whatDidText}
                </p>
              </div>
            ))}
            <Link href="/compliments" className="inline-block text-sm text-primary underline">
              칭찬함에서 더 보기 →
            </Link>
          </CardContent>
        </Card>
      )}

      {classGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>이번 달 목표</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classGoals.map((goal) => {
              const percent = Math.min(
                100,
                Math.round((goal.currentValue / goal.targetValue) * 100)
              );
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{goal.title}</span>
                    <span className="text-muted-foreground">
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">빠른 메뉴</h2>
        <QuickMenu />
      </div>
    </div>
  );
}

function ScheduleRow({
  item,
  mySubmissionStatus,
  isLoggedInStudent,
}: {
  item: {
    id: string;
    title: string;
    category: ScheduleCategory;
    subject: string | null;
    startAt: Date;
    dueAt: Date;
    description: string | null;
    submissionMethod: string | null;
    submissionLink: string | null;
    materials: string | null;
    submissionRequired: boolean;
  };
  mySubmissionStatus: SubmissionStatus | null;
  isLoggedInStudent: boolean;
}) {
  return (
    <ScheduleDetailDialog
      item={item}
      mySubmissionStatus={mySubmissionStatus}
      isLoggedInStudent={isLoggedInStudent}
      trigger={
        <div className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-accent">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span>{scheduleCategoryIcon[item.category]}</span>
              <CategoryBadge
                label={scheduleCategoryLabel[item.category]}
                colorClass={scheduleCategoryColor[item.category]}
              />
            </div>
            <p className="truncate font-medium">
              {item.subject ? `[${item.subject}] ` : ""}
              {item.title}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(item.dueAt)}까지</p>
          </div>
          <DDayBadge dueAt={item.dueAt} />
        </div>
      }
    />
  );
}
