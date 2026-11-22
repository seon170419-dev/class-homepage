"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityRecordForm } from "@/components/activity-record-form";
import { formatDateTime } from "@/lib/dates";
import type { ActivityArea } from "@/generated/prisma/enums";

export function ActivityRecordContentCard({
  record,
}: {
  record: {
    id: string;
    date: Date;
    area: ActivityArea;
    title: string;
    role: string | null;
    actions: string | null;
    difficulty: string | null;
    solution: string | null;
    learned: string | null;
    evidenceUrl: string | null;
    peerOrTeacherConfirmable: boolean;
    studentEditedAt: Date | null;
  };
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>내가 작성한 내용 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityRecordForm editTarget={record} onDone={() => setEditing(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2 py-4 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="font-heading text-base font-medium">내가 작성한 내용</p>
          <div className="flex items-center gap-2">
            {record.studentEditedAt && (
              <span className="text-xs text-muted-foreground">
                {formatDateTime(record.studentEditedAt)}에 수정됨
              </span>
            )}
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
              수정
            </Button>
          </div>
        </div>
        {record.role && <p><span className="text-muted-foreground">역할: </span>{record.role}</p>}
        {record.actions && <p><span className="text-muted-foreground">한 행동: </span>{record.actions}</p>}
        {record.difficulty && <p><span className="text-muted-foreground">어려웠던 점: </span>{record.difficulty}</p>}
        {record.solution && <p><span className="text-muted-foreground">해결 방법: </span>{record.solution}</p>}
        {record.learned && <p><span className="text-muted-foreground">알게 된 점: </span>{record.learned}</p>}
        {record.evidenceUrl && (
          <p>
            <a href={record.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              증빙자료 보기
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
