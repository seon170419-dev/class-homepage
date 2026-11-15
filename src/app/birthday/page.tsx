import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { mmddOf } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BirthdayMessageForm } from "@/components/birthday-message-form";
import { LoginRequired } from "@/components/login-required";

export const dynamic = "force-dynamic";

export default async function BirthdayPage() {
  const session = await getSession();
  const isStudent = session?.role === "student";
  const today = mmddOf(new Date());

  const birthdayStudents = await prisma.student.findMany({
    where: { birthDate: today, birthdayPublic: true },
  });

  const messages = await prisma.birthdayMessage.findMany({
    where: {
      targetStudentId: { in: birthdayStudents.map((s) => s.id) },
      status: "APPROVED",
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">🎂 생일 축하</h1>
        <p className="text-sm text-muted-foreground">
          오늘 생일인 친구에게 따뜻한 메시지를 남겨 주세요.
        </p>
      </div>

      {birthdayStudents.length === 0 && (
        <p className="text-sm text-muted-foreground">오늘은 생일인 친구가 없어요.</p>
      )}

      {birthdayStudents.map((student) => {
        const studentMessages = messages.filter((m) => m.targetStudentId === student.id);
        return (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle>🎉 {student.name} 학생의 생일이에요!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!student.commentOptIn ? (
                <p className="text-sm text-muted-foreground">
                  이 학생은 축하 메시지 기능을 사용하지 않아요.
                </p>
              ) : (
                <>
                  {isStudent ? (
                    <BirthdayMessageForm targetStudentId={student.id} />
                  ) : (
                    <LoginRequired message="축하 메시지를 남기려면 학생 로그인이 필요해요." />
                  )}
                  <div className="space-y-2">
                    {studentMessages.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        아직 축하 메시지가 없어요. 첫 메시지를 남겨보세요!
                      </p>
                    )}
                    {studentMessages.map((m) => (
                      <p key={m.id} className="rounded-md bg-muted p-2 text-sm">
                        {m.message}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
