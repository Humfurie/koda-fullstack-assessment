import { PRIORITY_LABELS, ProjectPriority } from "@/lib/types";

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  low: "text-zinc-500",
  medium: "text-koda-gold",
  high: "text-koda-teal",
};

const PRIORITY_DOTS: Record<ProjectPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  const filled = PRIORITY_DOTS[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${PRIORITY_STYLES[priority]}`}
    >
      <span className="flex items-center gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 w-1.5 rounded-full ${n <= filled ? "bg-current" : "bg-current/20"}`}
          />
        ))}
      </span>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
