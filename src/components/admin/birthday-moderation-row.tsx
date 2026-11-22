"use client";

import { ModerationActions } from "@/components/admin/moderation-actions";
import { moderateBirthdayMessageAction } from "@/lib/actions/birthday";

export function BirthdayModerationRow({ id }: { id: string }) {
  return (
    <ModerationActions
      onApprove={() => moderateBirthdayMessageAction(id, true)}
      onReject={() => moderateBirthdayMessageAction(id, false)}
    />
  );
}
