import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMonthDay } from "@/lib/dates";
import { activityAreaLabel, activityStatusLabel } from "@/lib/labels";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";

export const dynamic = "force-dynamic";

const STATUS_COLOR = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";

export default async function AdminActivitiesPage() {
  const records = await prisma.activityRecord.findMany({
    orderBy: { updatedAt: "desc" },
    include: { student: { select: { name: true, number: true } } },
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">생기부 초안 검토</h1>
      {records.map((r) => (
        <Link key={r.id} href={`/admin/activities/${r.id}`}>
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="space-y-1 py-3">
              <div className="flex items-center justify-between">
                <CategoryBadge label={activityAreaLabel[r.area]} colorClass={STATUS_COLOR} />
                <span className="text-xs text-muted-foreground">
                  {activityStatusLabel[r.status]}
                </span>
              </div>
              <p className="font-medium">
                {r.student.name} · {r.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatMonthDay(r.date)}
                {r.studentEditedAt && " · ✏️ 수정됨"}
              </p>
              {r.studentNote && (
                <p className="text-xs text-amber-600">💬 학생 요청: {r.studentNote}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
      {records.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 활동 기록이 없어요.</p>
      )}
    </div>
  );
}
