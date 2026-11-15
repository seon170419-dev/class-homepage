const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatKoreanDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

export function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatDateTime(date: Date): string {
  const h = date.getHours();
  const period = h < 12 ? "오전" : "오후";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${hour12}시 ${String(date.getMinutes()).padStart(2, "0")}분`;
}

export function mmddOf(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// 마감까지 남은 일수 기준 D-day 라벨 (날짜 단위 비교)
export function dDayLabel(dueDate: Date, from: Date = new Date()): string {
  const dueDay = startOfDay(dueDate).getTime();
  const fromDay = startOfDay(from).getTime();
  const diffDays = Math.round((dueDay - fromDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "D-Day";
  if (diffDays > 0) return `D-${diffDays}`;
  return "마감 지남";
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
