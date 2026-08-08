"use client";

import { FormEvent, useState } from "react";
import {
  PRIORITY_LABELS,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  Project,
  ProjectInput,
  STATUS_LABELS,
} from "@/lib/types";
import { Modal } from "./Modal";
import { toDateInputValue } from "@/lib/date";

const EMPTY_FORM: ProjectInput = {
  client_name: "",
  project_name: "",
  description: "",
  status: "planning",
  priority: "medium",
  start_date: "",
  due_date: "",
};

type FormErrors = Partial<Record<keyof ProjectInput, string>>;

function validate(form: ProjectInput): FormErrors {
  const errors: FormErrors = {};

  if (!form.client_name.trim()) errors.client_name = "Client name is required.";
  if (!form.project_name.trim()) errors.project_name = "Project name is required.";
  if (!form.start_date) errors.start_date = "Start date is required.";
  if (!form.due_date) errors.due_date = "Due date is required.";
  if (form.start_date && form.due_date && form.due_date < form.start_date) {
    errors.due_date = "Due date can't be before the start date.";
  }

  return errors;
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-koda-teal focus:ring-2 focus:ring-koda-teal/20";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-zinc-500";

export function ProjectFormModal({
  project,
  onClose,
  onSubmit,
  isSubmitting = false,
  serverErrors = {},
}: {
  project?: Project;
  onClose: () => void;
  onSubmit: (input: ProjectInput) => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}) {
  const [form, setForm] = useState<ProjectInput>(
    project
      ? {
          client_name: project.client_name,
          project_name: project.project_name,
          description: project.description ?? "",
          status: project.status,
          priority: project.priority,
          start_date: toDateInputValue(project.start_date),
          due_date: toDateInputValue(project.due_date),
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const mergedErrors: FormErrors = {
    ...errors,
    ...Object.fromEntries(
      Object.entries(serverErrors).map(([key, messages]) => [key, messages[0]]),
    ),
  };

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
              value={form.client_name}
              onChange={(e) => update("client_name", e.target.value)}
              placeholder="Acme Corporation"
            />
            {mergedErrors.client_name && (
              <p className="text-xs text-red-600">{mergedErrors.client_name}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Project name</label>
            <input
              className={inputClass}
              value={form.project_name}
              onChange={(e) => update("project_name", e.target.value)}
              placeholder="Website Redesign"
            />
            {mergedErrors.project_name && (
              <p className="text-xs text-red-600">{mergedErrors.project_name}</p>
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
                  {STATUS_LABELS[s]}
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
                  {PRIORITY_LABELS[p]}
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
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
            />
            {mergedErrors.start_date && (
              <p className="text-xs text-red-600">{mergedErrors.start_date}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Due date</label>
            <input
              type="date"
              className={inputClass}
              value={form.due_date}
              onChange={(e) => update("due_date", e.target.value)}
            />
            {mergedErrors.due_date && (
              <p className="text-xs text-red-600">{mergedErrors.due_date}</p>
            )}
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
            disabled={isSubmitting}
            className="rounded-full bg-koda-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-koda-teal-dark disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : project ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
