import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LostItemForm } from "@/components/lost-item-form";
import { LostItemClaimButton } from "@/components/lost-item-claim-button";
import { LoginRequired } from "@/components/login-required";

export const dynamic = "force-dynamic";

export default async function LostAndFoundPage() {
  const session = await getSession();
  const items = await prisma.lostItem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">분실물 게시판</h1>
        <p className="text-sm text-muted-foreground">
          주운 물건을 등록하고, 주인을 찾으면 찾아감으로 표시해 주세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>분실물 등록</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <LostItemForm />
          ) : (
            <LoginRequired message="분실물을 등록하려면 로그인이 필요해요." />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Card key={item.id} className={item.status === "CLAIMED" ? "opacity-50" : ""}>
            <CardContent className="space-y-2 py-4">
              {item.photoUrl && (
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                  <Image src={item.photoUrl} alt={item.title} fill className="object-cover" />
                </div>
              )}
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">발견 장소: {item.foundLocation}</p>
              {item.status === "CLAIMED" ? (
                <p className="text-xs font-medium">✅ 찾아감</p>
              ) : session ? (
                <LostItemClaimButton id={item.id} />
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 분실물이 없어요.</p>
      )}
    </div>
  );
}
