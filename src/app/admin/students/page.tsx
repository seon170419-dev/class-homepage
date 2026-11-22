import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "@/components/admin/student-form";
import { StudentRowActions } from "@/components/admin/student-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({ orderBy: { number: "asc" } });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>학생 계정 발급</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {students.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">
                  {s.number ? `${s.number}번 ` : ""}
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  아이디: {s.loginId} · 생일: {s.birthDate}
                  {s.lockedUntil && s.lockedUntil > new Date() && " · 🔒 잠김"}
                </p>
              </div>
              <StudentRowActions
                studentId={s.id}
                studentName={s.name}
                studentNumber={s.number}
                studentBirthDate={s.birthDate}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
