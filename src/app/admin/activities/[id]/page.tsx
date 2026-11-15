import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMonthDay, formatDateTime } from "@/lib/dates";
import { activityAreaLabel } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { ActivityReviewForm } from "@/components/admin/activity-review-form";

export const dynamic = "force-dynamic";

const STATUS_COLOR = "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";

export default async function AdminActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.activityRecord.findUnique({
    where: { id },
    include: { student: { select: { name: true, number: true } } },
  });
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <CategoryBadge label={activityAreaLabel[record.area]} colorClass={STATUS_COLOR} />
        <h1 className="mt-1 text-xl font-bold">
          {record.student.name} · {record.title}
        </h1>
        <p className="text-sm text-muted-foreground">{formatMonthDay(record.date)}</p>
      </div>

      <Card>
        <CardContent className="space-y-2 py-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="font-heading text-base font-medium">학생이 작성한 내용</p>
            {record.studentEditedAt && (
              <span className="text-xs text-muted-foreground">
                {formatDateTime(record.studentEditedAt)}에 수정됨
              </span>
            )}
          </div>
          {record.role && <p><span className="text-muted-foreground">역할: </span>{record.role}</p>}
          {record.actions && <p><span className="text-muted-foreground">한 행동: </span>{record.actions}</p>}
          {record.difficulty && <p><span className="text-muted-foreground">어려웠던 점: </span>{record.difficulty}</p>}
          {record.solution && <p><span className="text-muted-foreground">해결 방법: </span>{record.solution}</p>}
          {record.learned && <p><span className="text-muted-foreground">알게 된 점: </span>{record.learned}</p>}
          {record.evidenceUrl && (
            <p>
              <a href={record.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                증빙자료 보기
              </a>
            </p>
          )}
          {record.studentNote && (
            <p className="rounded-md bg-amber-50 p-2 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              💬 학생 사실확인 요청: {record.studentNote}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>생기부 초안 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityReviewForm
            id={record.id}
            initialDraft={record.teacherDraftText ?? ""}
            initialStatus={record.status}
          />
        </CardContent>
      </Card>
    </div>
  );
}
