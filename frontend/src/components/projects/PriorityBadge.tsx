import { ProjectPriority } from "@/lib/types";

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  Low: "text-zinc-500",
  Medium: "text-koda-gold",
  High: "text-koda-teal",
};

const PRIORITY_DOTS: Record<ProjectPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
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
      {priority}
    </span>
  );
}
