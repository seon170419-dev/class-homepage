import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const entries = await prisma.archiveEntry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">학급 아카이브</h1>
        <p className="text-sm text-muted-foreground">
          우리 반의 소중한 순간들을 모아두었어요.
        </p>
      </div>

      {entries.map((entry) => {
        const photos: string[] = JSON.parse(entry.photoUrls || "[]");
        return (
          <Card key={entry.id}>
            <CardHeader>
              <CardTitle>
                {entry.month} · {entry.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {entry.description}
                </p>
              )}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((url) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                      <Image src={url} alt={entry.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">아직 등록된 아카이브가 없어요.</p>
      )}
    </div>
  );
}
