import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { counselingCategoryLabel } from "@/lib/labels";
import { CounselingStatusSelect } from "@/components/admin/counseling-status-select";

export const dynamic = "force-dynamic";

export default async function AdminCounselingPage() {
  const requests = await prisma.counselingRequest.findMany({
    orderBy: [{ urgent: "desc" }, { createdAt: "desc" }],
    include: { student: { select: { name: true } } },
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">상담 신청</h1>
      {requests.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex items-start justify-between gap-2 py-4">
            <div>
              <p className="font-medium">
                {r.urgent && "🚨 "}
                {r.student.name} 학생 · {counselingCategoryLabel[r.category]}
              </p>
              {r.preferredTime && (
                <p className="text-xs text-muted-foreground">희망 시간: {r.preferredTime}</p>
              )}
            </div>
            <CounselingStatusSelect id={r.id} status={r.status} teacherNote={r.teacherNote} />
          </CardContent>
        </Card>
      ))}
      {requests.length === 0 && (
        <p className="text-sm text-muted-foreground">신청된 상담이 없어요.</p>
      )}
    </div>
  );
}
