"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { deleteScheduleAction } from "@/lib/actions/schedules";

export function ScheduleDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteScheduleAction(id)}
      confirmMessage="이 일정을 삭제할까요?"
    />
  );
}
