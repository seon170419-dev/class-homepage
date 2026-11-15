import { prisma } from "@/lib/prisma";
import { resourceCategoryLabel } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceCategory } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { createdAt: "desc" } });

  const grouped = new Map<ResourceCategory, typeof resources>();
  for (const r of resources) {
    const list = grouped.get(r.category) ?? [];
    list.push(r);
    grouped.set(r.category, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">우리 반 자료실</h1>
        <p className="text-sm text-muted-foreground">
          가정통신문, 체험학습, 수행평가 양식 등을 모아두었어요.
        </p>
      </div>

      {resources.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 자료가 없어요.</p>
      )}

      {Array.from(grouped.entries()).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{resourceCategoryLabel[category]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border p-3 text-sm hover:bg-accent"
              >
                📎 {item.title}
              </a>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
