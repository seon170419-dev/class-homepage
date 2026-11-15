"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryBadge } from "@/components/category-badge";
import { announcementCategoryLabel, announcementCategoryColor } from "@/lib/labels";
import { formatDateTime } from "@/lib/dates";
import type { AnnouncementCategory } from "@/generated/prisma/enums";

export type AnnouncementDetailItem = {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  pinned: boolean;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: Date;
};

export function AnnouncementDetailDialog({
  item,
  trigger,
}: {
  item: AnnouncementDetailItem;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {item.pinned && <span className="text-xs">📌</span>}
            <CategoryBadge
              label={announcementCategoryLabel[item.category]}
              colorClass={announcementCategoryColor[item.category]}
            />
          </div>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription className="whitespace-pre-wrap text-foreground">
            {item.body}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 text-sm">
          {item.attachmentUrl && (
            <p>
              <a
                href={item.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                📎 {item.attachmentName ?? "첨부파일"}
              </a>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            등록: {formatDateTime(item.createdAt)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
