"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ModerationActions({
  onApprove,
  onReject,
}: {
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await onApprove();
              toast.success("승인했어요.");
            } catch {
              toast.error("처리 중 문제가 발생했어요.");
            }
          })
        }
      >
        승인
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await onReject();
              toast.success("거절했어요.");
            } catch {
              toast.error("처리 중 문제가 발생했어요.");
            }
          })
        }
      >
        거절
      </Button>
    </div>
  );
}
