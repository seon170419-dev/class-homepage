"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateStudentAction,
  resetStudentPasswordAction,
  deleteStudentAction,
} from "@/lib/actions/students";

export function StudentRowActions({
  studentId,
  studentName,
  studentNumber,
  studentBirthDate,
}: {
  studentId: string;
  studentName: string;
  studentNumber: number | null;
  studentBirthDate: string;
}) {
  const [pending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(studentName);
  const [number, setNumber] = useState(studentNumber?.toString() ?? "");
  const [birthDate, setBirthDate] = useState(studentBirthDate);

  if (editing) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="grid grid-cols-3 gap-2">
          <Input
            className="col-span-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
          />
          <Input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="번호"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="sr-only" htmlFor={`birthDate-${studentId}`}>
            생일
          </Label>
          <Input
            id={`birthDate-${studentId}`}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            placeholder="생일 (MM-DD)"
          />
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await updateStudentAction(studentId, {
                  name,
                  birthDate,
                  number: number ? Number(number) : null,
                });
                if (result.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("학생 정보를 수정했어요.");
                setEditing(false);
              });
            }}
          >
            저장
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setName(studentName);
              setNumber(studentNumber?.toString() ?? "");
              setBirthDate(studentBirthDate);
              setEditing(false);
            }}
          >
            취소
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => setEditing(true)}
        >
          수정
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`${studentName} 학생의 비밀번호를 재발급할까요?`)) return;
            startTransition(async () => {
              try {
                const { password } = await resetStudentPasswordAction(studentId);
                setNewPassword(password);
              } catch {
                toast.error("처리 중 문제가 발생했어요.");
              }
            });
          }}
        >
          비밀번호 재발급
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`${studentName} 학생 계정을 삭제할까요?`)) return;
            startTransition(async () => {
              try {
                await deleteStudentAction(studentId);
              } catch {
                toast.error("삭제 중 문제가 발생했어요.");
              }
            });
          }}
        >
          삭제
        </Button>
      </div>
      {newPassword && (
        <p className="text-xs text-muted-foreground">
          새 비밀번호: <strong>{newPassword}</strong> (지금 바로 전달해 주세요)
        </p>
      )}
    </div>
  );
}
