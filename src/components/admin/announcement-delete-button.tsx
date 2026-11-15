"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { deleteAnnouncementAction } from "@/lib/actions/announcements";

export function AnnouncementDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteAnnouncementAction(id)}
      confirmMessage="이 공지를 삭제할까요?"
    />
  );
}
