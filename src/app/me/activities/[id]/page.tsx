import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { formatMonthDay } from "@/lib/dates";
import { activityAreaLabel, activityStatusLabel } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { StudentNoteForm } from "@/components/student-note-form";
import { ActivityRecordContentCard } from "@/components/activity-record-content-card";

export const dynamic = "force-dynamic";

const STATUS_COLOR = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireStudent();
  if (!session) return null;

  const record = await prisma.activityRecord.findUnique({ where: { id } });
  if (!record || record.studentId !== session.studentId) notFound();

  return (
    <div className="space-y-6">
      <div>
        <CategoryBadge label={activityAreaLabel[record.area]} colorClass={STATUS_COLOR} />
        <h1 className="mt-1 text-xl font-bold">{record.title}</h1>
        <p className="text-sm text-muted-foreground">{formatMonthDay(record.date)}</p>
      </div>

      <ActivityRecordContentCard record={record} />

      <Card>
        <CardHeader>
          <CardTitle>생기부 반영 상태: {activityStatusLabel[record.status]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {record.teacherDraftText ? (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="mb-1 text-xs text-muted-foreground">현재 기록 초안</p>
              <p className="whitespace-pre-wrap">{record.teacherDraftText}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              아직 담임 선생님이 초안을 작성하지 않았어요.
            </p>
          )}

          <div>
            <p className="mb-1 text-sm font-medium">사실 확인 및 보완 요청</p>
            <StudentNoteForm activityId={record.id} initialNote={record.studentNote ?? ""} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
