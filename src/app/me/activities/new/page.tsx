import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityRecordForm } from "@/components/activity-record-form";

export default function NewActivityRecordPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">나의 활동 추가하기</h1>
      <Card>
        <CardHeader>
          <CardTitle>활동 기록 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityRecordForm />
        </CardContent>
      </Card>
    </div>
  );
}
