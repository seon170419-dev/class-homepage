import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { startOfDay, isSameDay } from "@/lib/dates";
import {
  scheduleCategoryLabel,
  scheduleCategoryColor,
  scheduleCategoryIcon,
} from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { ScheduleDetailDialog } from "@/components/schedule-detail-dialog";

export const dynamic = "force-dynamic";

function parseMonth(monthParam: string | undefined): { year: number; month: number } {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonth(monthParam);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const gridStart = startOfDay(new Date(monthStart));
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
  gridEnd.setHours(23, 59, 59, 999);

  const session = await getSession();
  const isLoggedInStudent = session?.role === "student";

  const items = await prisma.scheduleItem.findMany({
    where: { startAt: { lte: gridEnd }, dueAt: { gte: gridStart } },
    orderBy: { dueAt: "asc" },
  });

  const submissions = isLoggedInStudent
    ? await prisma.submission.findMany({
        where: {
          studentId: session!.role === "student" ? session.studentId : "",
          scheduleItemId: { in: items.map((i) => i.id) },
        },
      })
    : [];
  const submissionMap = new Map(submissions.map((s) => [s.scheduleItemId, s.status]));

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const today = new Date();

  const monthItems = items
    .filter((i) => i.dueAt >= monthStart && i.dueAt <= monthEnd)
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/calendar?month=${monthKey(prevMonth.getFullYear(), prevMonth.getMonth())}`}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          ← 이전 달
        </Link>
        <h1 className="text-xl font-bold">
          {year}년 {month + 1}월
        </h1>
        <Link
          href={`/calendar?month=${monthKey(nextMonth.getFullYear(), nextMonth.getMonth())}`}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          다음 달 →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div key={w} className="font-medium text-muted-foreground">
            {w}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = day.getMonth() === month;
          const dayItems = items.filter((i) => i.startAt <= day && i.dueAt >= day);
          const isToday = isSameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-16 rounded-md border p-1 ${inMonth ? "" : "opacity-30"} ${isToday ? "border-primary" : ""}`}
            >
              <div className={`text-right text-xs ${isToday ? "font-bold text-primary" : ""}`}>
                {day.getDate()}
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                {dayItems.slice(0, 3).map((i) => (
                  <span key={i.id} title={i.title} className="text-[10px]">
                    {scheduleCategoryIcon[i.category]}
                  </span>
                ))}
                {dayItems.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayItems.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>이번 달 일정 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {monthItems.length === 0 && (
            <p className="text-sm text-muted-foreground">이번 달 등록된 일정이 없어요.</p>
          )}
          {monthItems.map((item) => (
            <ScheduleDetailDialog
              key={item.id}
              item={item}
              mySubmissionStatus={submissionMap.get(item.id) ?? null}
              isLoggedInStudent={isLoggedInStudent}
              trigger={
                <div className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 hover:bg-accent">
                  <div className="flex min-w-0 items-center gap-2">
                    <span>{scheduleCategoryIcon[item.category]}</span>
                    <div className="min-w-0">
                      <CategoryBadge
                        label={scheduleCategoryLabel[item.category]}
                        colorClass={scheduleCategoryColor[item.category]}
                      />
                      <p className="truncate font-medium">
                        {item.subject ? `[${item.subject}] ` : ""}
                        {item.title}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.dueAt.getMonth() + 1}/{item.dueAt.getDate()}
                  </span>
                </div>
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
