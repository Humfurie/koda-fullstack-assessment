import { Project } from "@/lib/types";
import { Modal } from "./Modal";

export function ConfirmDeleteModal({
  project,
  onCancel,
  onConfirm,
}: {
  project: Project;
  onCancel: () => void;
  onConfirm: (project: Project) => void;
}) {
  return (
    <Modal title="Delete project" onClose={onCancel} maxWidthClass="max-w-sm">
      <div className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-zinc-600">
          This removes{" "}
          <span className="font-semibold text-zinc-900">{project.project_name}</span> for{" "}
          {project.client_name}. This can&apos;t be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(project)}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Delete project
          </button>
        </div>
      </div>
    </Modal>
  );
}
