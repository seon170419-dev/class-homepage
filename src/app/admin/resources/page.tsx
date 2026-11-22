import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resourceCategoryLabel } from "@/lib/labels";
import { ResourceForm } from "@/components/admin/resource-form";
import { ResourceDeleteButton } from "@/components/admin/resource-delete-button";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>자료 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceForm />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {resources.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {resourceCategoryLabel[r.category]}
                </p>
              </div>
              <ResourceDeleteButton id={r.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
