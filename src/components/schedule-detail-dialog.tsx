"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/category-badge";
import {
  scheduleCategoryLabel,
  scheduleCategoryColor,
  scheduleCategoryIcon,
  submissionStatusLabel,
} from "@/lib/labels";
import { formatDateTime, formatMonthDay } from "@/lib/dates";
import { setSubmissionStatusAction } from "@/lib/actions/schedules";
import type { ScheduleCategory, SubmissionStatus } from "@/generated/prisma/enums";

export type ScheduleDetailItem = {
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

export function ScheduleDetailDialog({
  item,
  mySubmissionStatus,
  isLoggedInStudent,
  trigger,
}: {
  item: ScheduleDetailItem;
  mySubmissionStatus: SubmissionStatus | null;
  isLoggedInStudent: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(mySubmissionStatus ?? "NOT_SUBMITTED");
  const [pending, startTransition] = useTransition();

  function toggleSubmitted() {
    const next: SubmissionStatus = status === "SUBMITTED" ? "NOT_SUBMITTED" : "SUBMITTED";
    startTransition(async () => {
      try {
        await setSubmissionStatusAction(item.id, next);
        setStatus(next);
        toast.success(next === "SUBMITTED" ? "제출 완료로 표시했어요." : "미제출로 변경했어요.");
      } catch {
        toast.error("처리 중 문제가 발생했어요.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span>{scheduleCategoryIcon[item.category]}</span>
            <CategoryBadge
              label={scheduleCategoryLabel[item.category]}
              colorClass={scheduleCategoryColor[item.category]}
            />
          </div>
          <DialogTitle>
            {item.subject ? `[${item.subject}] ` : ""}
            {item.title}
          </DialogTitle>
          {item.description && (
            <DialogDescription className="whitespace-pre-wrap">
              {item.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">제출 시작일: </span>
            {formatMonthDay(item.startAt)}
          </p>
          <p>
            <span className="text-muted-foreground">마감: </span>
            {formatDateTime(item.dueAt)}
          </p>
          {item.submissionMethod && (
            <p>
              <span className="text-muted-foreground">제출 방법: </span>
              {item.submissionMethod}
            </p>
          )}
          {item.materials && (
            <p>
              <span className="text-muted-foreground">준비물: </span>
              {item.materials}
            </p>
          )}
          {item.submissionLink && (
            <p>
              <a
                href={item.submissionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                제출 링크 바로가기 →
              </a>
            </p>
          )}
        </div>

        {item.submissionRequired && (
          <div className="rounded-md border p-3 text-sm">
            {isLoggedInStudent ? (
              <div className="flex items-center justify-between gap-2">
                <span>
                  내 제출 상태: <strong>{submissionStatusLabel[status]}</strong>
                </span>
                <Button size="sm" variant="outline" disabled={pending} onClick={toggleSubmitted}>
                  {status === "SUBMITTED" ? "미제출로 변경" : "제출 완료로 표시"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                로그인하면 제출 여부를 표시할 수 있어요.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
