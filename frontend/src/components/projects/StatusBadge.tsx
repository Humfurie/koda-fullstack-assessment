import { ProjectStatus, STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planning: "bg-zinc-100 text-zinc-700 ring-zinc-300",
  in_progress: "bg-koda-teal/10 text-koda-teal-dark ring-koda-teal/30",
  on_hold: "bg-koda-gold/15 text-amber-800 ring-koda-gold/40",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-300",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
