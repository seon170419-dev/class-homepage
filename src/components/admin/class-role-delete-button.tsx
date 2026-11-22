"use client";

import { DeleteButton } from "@/components/admin/delete-button";
import { deleteClassRoleAction } from "@/lib/actions/class-roles";

export function ClassRoleDeleteButton({ id }: { id: string }) {
  return <DeleteButton action={() => deleteClassRoleAction(id)} confirmMessage="삭제할까요?" />;
}
