import { ProjectStatus } from "@/lib/types";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Planning: "bg-zinc-100 text-zinc-700 ring-zinc-300",
  "In Progress": "bg-koda-teal/10 text-koda-teal-dark ring-koda-teal/30",
  "On Hold": "bg-koda-gold/15 text-amber-800 ring-koda-gold/40",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-300",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
