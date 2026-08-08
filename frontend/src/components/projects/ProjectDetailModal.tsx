import { Project } from "@/lib/types";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectDetailModal({
  project,
  onClose,
  onEdit,
}: {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
}) {
  return (
    <Modal title="Project details" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-koda-teal">
              {project.clientName}
            </p>
            <h3 className="mt-0.5 text-xl font-semibold text-zinc-900">
              {project.projectName}
            </h3>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {project.description && (
          <p className="text-sm leading-relaxed text-zinc-600">{project.description}</p>
        )}

        <dl className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-400">Priority</dt>
            <dd className="mt-1">
              <PriorityBadge priority={project.priority} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-400">Status</dt>
            <dd className="mt-1 text-zinc-800">{project.status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-400">Start date</dt>
            <dd className="mt-1 font-mono text-zinc-800">{formatDate(project.startDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-400">Due date</dt>
            <dd className="mt-1 font-mono text-zinc-800">{formatDate(project.dueDate)}</dd>
          </div>
        </dl>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(project)}
            className="rounded-full bg-koda-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-koda-teal-dark"
          >
            Edit project
          </button>
        </div>
      </div>
    </Modal>
  );
}
