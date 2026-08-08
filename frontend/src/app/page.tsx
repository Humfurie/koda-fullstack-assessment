"use client";

import { useMemo, useState } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-projects";
import { Project, ProjectInput, ProjectPriority, ProjectStatus } from "@/lib/types";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal";
import { ConfirmDeleteModal } from "@/components/projects/ConfirmDeleteModal";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; project: Project }
  | { type: "view"; project: Project }
  | { type: "delete"; project: Project };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | "All">("All");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !query ||
        p.projectName.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || p.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  function handleCreate(input: ProjectInput) {
    setProjects((prev) => [
      { ...input, id: Math.max(0, ...prev.map((p) => p.id)) + 1 },
      ...prev,
    ]);
    setModal({ type: "none" });
  }

  function handleUpdate(id: number, input: ProjectInput) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...input, id } : p)));
    setModal({ type: "none" });
  }

  function handleDelete(project: Project) {
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    setModal({ type: "none" });
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="bg-koda-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-white">KODA</span>
            <span className="text-lg font-light tracking-tight text-koda-teal">Projects</span>
          </div>
          <button
            onClick={() => setModal({ type: "create" })}
            className="rounded-full bg-koda-teal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-koda-teal-dark"
          >
            New project
          </button>
        </div>
      </header>

      <div className="bg-gradient-to-r from-koda-gold to-koda-teal">
        <div className="mx-auto max-w-6xl px-6 py-3 text-sm text-white/90">
          Tracking every client engagement in one place.
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Client <span className="text-koda-teal">Projects</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {filteredProjects.length} of {projects.length} project
            {projects.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mb-8">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-center">
            <p className="text-sm font-medium text-zinc-600">No projects match these filters</p>
            <p className="mt-1 text-sm text-zinc-400">
              Try clearing the search or filters, or create a new project.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={(p) => setModal({ type: "view", project: p })}
                onEdit={(p) => setModal({ type: "edit", project: p })}
                onDelete={(p) => setModal({ type: "delete", project: p })}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-koda-navy py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-white/40">
          KODA Kollectiv &middot; Client Project Tracker
        </div>
      </footer>

      {modal.type === "create" && (
        <ProjectFormModal onClose={() => setModal({ type: "none" })} onSubmit={handleCreate} />
      )}
      {modal.type === "edit" && (
        <ProjectFormModal
          project={modal.project}
          onClose={() => setModal({ type: "none" })}
          onSubmit={(input) => handleUpdate(modal.project.id, input)}
        />
      )}
      {modal.type === "view" && (
        <ProjectDetailModal
          project={modal.project}
          onClose={() => setModal({ type: "none" })}
          onEdit={(p) => setModal({ type: "edit", project: p })}
        />
      )}
      {modal.type === "delete" && (
        <ConfirmDeleteModal
          project={modal.project}
          onCancel={() => setModal({ type: "none" })}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
