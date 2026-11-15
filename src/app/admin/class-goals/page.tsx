import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassGoalForm } from "@/components/admin/class-goal-form";
import { ClassGoalProgress } from "@/components/admin/class-goal-progress";

export const dynamic = "force-dynamic";

export default async function AdminClassGoalsPage() {
  const goals = await prisma.classGoal.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>학급 목표 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassGoalForm />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {goals.map((g) => (
          <Card key={g.id}>
            <CardContent className="space-y-2 py-4">
              <p className="font-medium">
                {g.month} · {g.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {g.currentValue} / {g.targetValue}
              </p>
              <ClassGoalProgress id={g.id} currentValue={g.currentValue} targetValue={g.targetValue} />
            </CardContent>
          </Card>
        ))}
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 목표가 없어요.</p>
        )}
      </div>
    </div>
  );
}
