import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { BirthdayModerationRow } from "@/components/admin/birthday-moderation-row";

export const dynamic = "force-dynamic";

export default async function AdminBirthdayMessagesPage() {
  const messages = await prisma.birthdayMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { target: { select: { name: true } }, author: { select: { name: true } } },
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">생일 메시지 승인</h1>
      {messages.map((m) => (
        <Card key={m.id}>
          <CardContent className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <strong>{m.author.name}</strong> → <strong>{m.target.name}</strong>
              </p>
              <span className="text-xs text-muted-foreground">
                {m.status === "PENDING" ? "대기" : m.status === "APPROVED" ? "승인됨" : "거절됨"}
              </span>
            </div>
            <p className="text-sm">{m.message}</p>
            {m.flaggedByAi && (
              <p className="text-xs text-amber-600">⚠️ AI 주의: {m.aiFlagReason}</p>
            )}
            {m.status === "PENDING" && <BirthdayModerationRow id={m.id} />}
          </CardContent>
        </Card>
      ))}
      {messages.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 생일 메시지가 없어요.</p>
      )}
    </div>
  );
}
