"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/category-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { AnnouncementDeleteButton } from "@/components/admin/announcement-delete-button";
import {
  setAnnouncementPinnedAction,
  setAnnouncementVisibleAction,
} from "@/lib/actions/announcements";
import { announcementCategoryLabel, announcementCategoryColor } from "@/lib/labels";
import type { AnnouncementCategory } from "@/generated/prisma/enums";

export function AnnouncementAdminCard({
  announcement,
  readCount,
  totalStudents,
}: {
  announcement: {
    id: string;
    title: string;
    body: string;
    category: AnnouncementCategory;
    pinned: boolean;
    visibleOnHome: boolean;
    attachmentUrl: string | null;
    attachmentName: string | null;
  };
  readCount: number;
  totalStudents: number;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card>
        <CardContent className="py-4">
          <AnnouncementForm editTarget={announcement} onDone={() => setEditing(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {announcement.pinned && <span className="text-xs">📌</span>}
            <CategoryBadge
              label={announcementCategoryLabel[announcement.category]}
              colorClass={announcementCategoryColor[announcement.category]}
            />
          </div>
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
              수정
            </Button>
            <AnnouncementDeleteButton id={announcement.id} />
          </div>
        </div>
        <p className="font-medium">{announcement.title}</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.body}</p>
        {announcement.attachmentUrl && (
          <a
            href={announcement.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-primary underline"
          >
            📎 {announcement.attachmentName ?? "첨부파일"}
          </a>
        )}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
          <label className="flex items-center gap-1.5">
            <Checkbox
              checked={announcement.pinned}
              disabled={pending}
              onCheckedChange={(checked) =>
                startTransition(async () => {
                  try {
                    await setAnnouncementPinnedAction(announcement.id, checked === true);
                  } catch {
                    toast.error("처리 중 문제가 발생했어요.");
                  }
                })
              }
            />
            상단 고정
          </label>
          <label className="flex items-center gap-1.5">
            <Checkbox
              checked={announcement.visibleOnHome}
              disabled={pending}
              onCheckedChange={(checked) =>
                startTransition(async () => {
                  try {
                    await setAnnouncementVisibleAction(announcement.id, checked === true);
                  } catch {
                    toast.error("처리 중 문제가 발생했어요.");
                  }
                })
              }
            />
            대시보드에 게시
          </label>
          <span className="text-muted-foreground">
            확인: {readCount} / {totalStudents}명
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
