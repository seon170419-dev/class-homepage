"use client";

import { ModerationActions } from "@/components/admin/moderation-actions";
import { updateSuggestionAction } from "@/lib/actions/suggestions";

export function SuggestionModerationRow({ id }: { id: string }) {
  return (
    <ModerationActions
      onApprove={() => updateSuggestionAction(id, { status: "APPROVED" })}
      onReject={() => updateSuggestionAction(id, { status: "REJECTED" })}
    />
  );
}
