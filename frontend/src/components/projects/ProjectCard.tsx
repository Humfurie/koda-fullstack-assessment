import { Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectCard({
  project,
  onView,
  onEdit,
  onDelete,
}: {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="h-1.5 w-full bg-gradient-to-r from-koda-gold to-koda-teal" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-koda-teal">
              {project.clientName}
            </p>
            <button
              onClick={() => onView(project)}
              className="mt-0.5 text-left text-lg font-semibold leading-snug text-zinc-900 hover:text-koda-teal-dark"
            >
              {project.projectName}
            </button>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {project.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 font-mono text-xs text-zinc-500">
          <span>
            {formatDate(project.startDate)} &rarr; {formatDate(project.dueDate)}
          </span>
          <PriorityBadge priority={project.priority} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-100 px-5 py-3">
        <button
          onClick={() => onEdit(project)}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(project)}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
