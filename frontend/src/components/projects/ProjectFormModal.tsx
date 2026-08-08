"use client";

import { FormEvent, useState } from "react";
import { PROJECT_PRIORITIES, PROJECT_STATUSES, Project, ProjectInput } from "@/lib/types";
import { Modal } from "./Modal";

const EMPTY_FORM: ProjectInput = {
  clientName: "",
  projectName: "",
  description: "",
  status: "Planning",
  priority: "Medium",
  startDate: "",
  dueDate: "",
};

type FormErrors = Partial<Record<keyof ProjectInput, string>>;

/**
 * TODO(you): implement field validation for the project form.
 *
 * This drives real UX decisions the rest of the form defers to you:
 *  - Which fields are required beyond the OpenAPI `required` list
 *    (clientName, projectName, status, priority, startDate, dueDate)?
 *  - Should dueDate < startDate block submission, or just warn?
 *  - Any length limits worth enforcing client-side before hitting the API?
 *
 * Return an object keyed by ProjectInput field names -> error message.
 * An empty object means the form is valid.
 */
function validate(form: ProjectInput): FormErrors {
  // TODO(you): replace with real validation logic.
  return {};
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-koda-teal focus:ring-2 focus:ring-koda-teal/20";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-zinc-500";

export function ProjectFormModal({
  project,
  onClose,
  onSubmit,
}: {
  project?: Project;
  onClose: () => void;
  onSubmit: (input: ProjectInput) => void;
}) {
  const [form, setForm] = useState<ProjectInput>(
    project
      ? {
          clientName: project.clientName,
          projectName: project.projectName,
          description: project.description ?? "",
          status: project.status,
          priority: project.priority,
          startDate: project.startDate,
          dueDate: project.dueDate,
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(form);
  }

  return (
    <Modal title={project ? "Edit project" : "New project"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Client name</label>
            <input
              className={inputClass}
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              placeholder="Acme Corporation"
            />
            {errors.clientName && (
              <p className="text-xs text-red-600">{errors.clientName}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Project name</label>
            <input
              className={inputClass}
              value={form.projectName}
              onChange={(e) => update("projectName", e.target.value)}
              placeholder="Website Redesign"
            />
            {errors.projectName && (
              <p className="text-xs text-red-600">{errors.projectName}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} min-h-20 resize-none`}
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What's this project about?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => update("status", e.target.value as ProjectInput["status"])}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Priority</label>
            <select
              className={inputClass}
              value={form.priority}
              onChange={(e) => update("priority", e.target.value as ProjectInput["priority"])}
            >
              {PROJECT_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Start date</label>
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
            />
            {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Due date</label>
            <input
              type="date"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
            />
            {errors.dueDate && <p className="text-xs text-red-600">{errors.dueDate}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-koda-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-koda-teal-dark"
          >
            {project ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
