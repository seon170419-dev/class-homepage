"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/category-badge";
import { ScheduleForm } from "@/components/admin/schedule-form";
import { ScheduleDeleteButton } from "@/components/admin/schedule-delete-button";
import { formatDateTime } from "@/lib/dates";
import {
  scheduleCategoryLabel,
  scheduleCategoryColor,
  scheduleCategoryIcon,
} from "@/lib/labels";
import type { ScheduleCategory } from "@/generated/prisma/enums";

export function ScheduleAdminCard({
  item,
}: {
  item: {
    id: string;
    title: string;
    category: ScheduleCategory;
    subject: string | null;
    startAt: Date;
    dueAt: Date;
    description: string | null;
    submissionMethod: string | null;
    submissionLink: string | null;
    materials: string | null;
    submissionRequired: boolean;
  };
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card>
        <CardContent className="py-4">
          <ScheduleForm editTarget={item} onDone={() => setEditing(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-1 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>{scheduleCategoryIcon[item.category]}</span>
            <CategoryBadge
              label={scheduleCategoryLabel[item.category]}
              colorClass={scheduleCategoryColor[item.category]}
            />
          </div>
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
              수정
            </Button>
            <ScheduleDeleteButton id={item.id} />
          </div>
        </div>
        <p className="font-medium">
          {item.subject ? `[${item.subject}] ` : ""}
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground">{formatDateTime(item.dueAt)}까지</p>
      </CardContent>
    </Card>
  );
}
