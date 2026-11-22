"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { deleteLostItemAction } from "@/lib/actions/lost-items";

export function LostItemDeleteButton({ id }: { id: string }) {
  return <DeleteButton action={() => deleteLostItemAction(id)} confirmMessage="삭제할까요?" />;
}
