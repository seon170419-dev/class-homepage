"use client";

import { ModerationActions } from "@/components/admin/moderation-actions";
import { moderateComplimentAction } from "@/lib/actions/compliments";

export function ComplimentModerationRow({ id }: { id: string }) {
  return (
    <ModerationActions
      onApprove={() => moderateComplimentAction(id, true)}
      onReject={() => moderateComplimentAction(id, false)}
    />
  );
}
