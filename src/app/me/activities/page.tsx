import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { formatMonthDay } from "@/lib/dates";
import { activityAreaLabel, activityStatusLabel } from "@/lib/labels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/category-badge";

export const dynamic = "force-dynamic";

const STATUS_COLOR = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";

export default async function MyActivitiesPage() {
  const session = await requireStudent();
  if (!session) return null;

  const records = await prisma.activityRecord.findMany({
    where: { studentId: session.studentId },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">나의 활동 기록</h1>
        <Link href="/me/activities/new">
          <Button size="sm">+ 활동 추가</Button>
        </Link>
      </div>

      {records.length === 0 && (
        <p className="text-sm text-muted-foreground">
          아직 기록한 활동이 없어요. 첫 활동을 추가해 보세요.
        </p>
      )}

      <div className="space-y-2">
        {records.map((r) => (
          <Link key={r.id} href={`/me/activities/${r.id}`}>
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="space-y-1 py-3">
                <div className="flex items-center justify-between">
                  <CategoryBadge label={activityAreaLabel[r.area]} colorClass={STATUS_COLOR} />
                  <span className="text-xs text-muted-foreground">
                    {activityStatusLabel[r.status]}
                  </span>
                </div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{formatMonthDay(r.date)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
