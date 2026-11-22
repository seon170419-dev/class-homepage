import { dDayLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function DDayBadge({ dueAt, className }: { dueAt: Date; className?: string }) {
  const label = dDayLabel(dueAt);
  const isToday = label === "D-Day";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        isToday
          ? "bg-red-600 text-white"
          : "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}
