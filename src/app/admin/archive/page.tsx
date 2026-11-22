import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArchiveForm } from "@/components/admin/archive-form";
import { ArchiveDeleteButton } from "@/components/admin/archive-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminArchivePage() {
  const entries = await prisma.archiveEntry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>아카이브 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <ArchiveForm />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {entries.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex items-center justify-between gap-2 py-3">
              <p className="text-sm">
                {e.month} · {e.title}
              </p>
              <ArchiveDeleteButton id={e.id} />
            </CardContent>
          </Card>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 아카이브가 없어요.</p>
        )}
      </div>
    </div>
  );
}
