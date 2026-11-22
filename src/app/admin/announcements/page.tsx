import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { AnnouncementAdminCard } from "@/components/admin/announcement-admin-card";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const [announcements, totalStudents] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { reads: true } } },
    }),
    prisma.student.count(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>공지 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {announcements.map((a) => (
          <AnnouncementAdminCard
            key={a.id}
            announcement={a}
            readCount={a._count.reads}
            totalStudents={totalStudents}
          />
        ))}
      </div>
    </div>
  );
}
