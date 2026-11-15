"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { deleteResourceAction } from "@/lib/actions/resources";

export function ResourceDeleteButton({ id }: { id: string }) {
  return <DeleteButton action={() => deleteResourceAction(id)} confirmMessage="삭제할까요?" />;
}
