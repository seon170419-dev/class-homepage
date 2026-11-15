"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { deleteArchiveEntryAction } from "@/lib/actions/archive";

export function ArchiveDeleteButton({ id }: { id: string }) {
  return <DeleteButton action={() => deleteArchiveEntryAction(id)} confirmMessage="삭제할까요?" />;
}
