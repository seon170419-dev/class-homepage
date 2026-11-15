import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleForm } from "@/components/admin/schedule-form";
import { ScheduleAdminCard } from "@/components/admin/schedule-admin-card";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage() {
  const items = await prisma.scheduleItem.findMany({ orderBy: { dueAt: "desc" } });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>일정 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <ScheduleAdminCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
