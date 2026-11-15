import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { lostItemStatusLabel } from "@/lib/labels";
import { LostItemDeleteButton } from "@/components/admin/lost-item-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminLostAndFoundPage() {
  const items = await prisma.lostItem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">분실물 관리</h1>
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center justify-between gap-2 py-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.foundLocation} · {lostItemStatusLabel[item.status]}
              </p>
            </div>
            <LostItemDeleteButton id={item.id} />
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 분실물이 없어요.</p>
      )}
    </div>
  );
}
