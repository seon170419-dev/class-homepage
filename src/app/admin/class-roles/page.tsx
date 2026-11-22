import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassRoleForm } from "@/components/admin/class-role-form";
import { ClassRoleDeleteButton } from "@/components/admin/class-role-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminClassRolesPage() {
  const [students, roles] = await Promise.all([
    prisma.student.findMany({ orderBy: { number: "asc" }, select: { id: true, name: true } }),
    prisma.classRole.findMany({
      where: { date: { gte: startOfDay(new Date()) } },
      orderBy: { date: "asc" },
      include: { student: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>당번/역할 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassRoleForm students={students} />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {roles.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between gap-2 py-3">
              <p className="text-sm">
                {r.date.getMonth() + 1}/{r.date.getDate()} · {r.student.name} · {r.role}
              </p>
              <ClassRoleDeleteButton id={r.id} />
            </CardContent>
          </Card>
        ))}
        {roles.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 역할이 없어요.</p>
        )}
      </div>
    </div>
  );
}
