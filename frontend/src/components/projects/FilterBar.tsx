import {
  PRIORITY_LABELS,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  ProjectPriority,
  ProjectStatus,
  STATUS_LABELS,
} from "@/lib/types";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: ProjectStatus | "All";
  onStatusChange: (value: ProjectStatus | "All") => void;
  priority: ProjectPriority | "All";
  onPriorityChange: (value: ProjectPriority | "All") => void;
}

const selectClass =
  "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 outline-none transition-colors focus:border-koda-teal focus:ring-2 focus:ring-koda-teal/20";

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by client or project name"
          className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-koda-teal focus:ring-2 focus:ring-koda-teal/20"
        />
      </div>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ProjectStatus | "All")}
        className={selectClass}
      >
        <option value="All">All statuses</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as ProjectPriority | "All")}
        className={selectClass}
      >
        <option value="All">All priorities</option>
        {PROJECT_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>
    </div>
  );
}
