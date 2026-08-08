"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  PaginatedResponse,
  Project,
  ProjectInput,
  ProjectPriority,
  ProjectStatus,
} from "@/lib/types";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal";
import { ConfirmDeleteModal } from "@/components/projects/ConfirmDeleteModal";
import { Pagination } from "@/components/projects/Pagination";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; project: Project }
  | { type: "view"; project: Project }
  | { type: "delete"; project: Project };

export default function ProjectsPage() {
  const { user, token, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | "All">("All");

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isAuthLoading && !token) router.replace("/login");
  }, [isAuthLoading, token, router]);

  const fetchProjects = useCallback(
    async (page: number) => {
      if (!token) return;
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await api.get<PaginatedResponse<Project>>(
          `/projects?page=${page}`,
          token,
        );
        setProjects(res.data);
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
        setTotal(res.total);
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "Couldn't load projects.");
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    // Fetch on mount / when the auth token becomes available; fetchProjects owns its own setState calls.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) fetchProjects(1);
  }, [token, fetchProjects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !query ||
        p.project_name.toLowerCase().includes(query) ||
        p.client_name.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || p.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [projects, search, statusFilter, priorityFilter]);

  async function handleCreate(input: ProjectInput) {
    if (!token) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await api.post<Project>("/projects", input, token);
      setModal({ type: "none" });
      fetchProjects(currentPage);
    } catch (err) {
      if (err instanceof ApiError) setFormErrors(err.errors ?? {});
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(id: number, input: ProjectInput) {
    if (!token) return;
    setIsSubmitting(true);
    setFormErrors({});
    try {
      await api.put<Project>(`/projects/${id}`, input, token);
      setModal({ type: "none" });
      fetchProjects(currentPage);
    } catch (err) {
      if (err instanceof ApiError) setFormErrors(err.errors ?? {});
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!token) return;
    try {
      await api.delete(`/projects/${project.id}`, token);
      setModal({ type: "none" });
      const isLastItemOnPage = projects.length === 1 && currentPage > 1;
      fetchProjects(isLastItemOnPage ? currentPage - 1 : currentPage);
    } catch {
      setModal({ type: "none" });
      fetchProjects(currentPage);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (isAuthLoading || !token) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="bg-koda-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-white">KODA</span>
            <span className="text-lg font-light tracking-tight text-koda-teal">Projects</span>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="hidden text-sm text-white/70 sm:inline">{user.name}</span>}
            <button
              onClick={() => setModal({ type: "create" })}
              className="rounded-full bg-koda-teal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-koda-teal-dark"
            >
              New project
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
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
            {total} project{total === 1 ? "" : "s"} total &middot; showing page {currentPage} of{" "}
            {lastPage}
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

        {loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20 text-sm text-zinc-400">
            Loading projects…
          </div>
        ) : filteredProjects.length === 0 ? (
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

        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={(page) => fetchProjects(page)}
        />
      </main>

      <footer className="bg-koda-navy py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-white/40">
          KODA Kollectiv &middot; Client Project Tracker
        </div>
      </footer>

      {modal.type === "create" && (
        <ProjectFormModal
          onClose={() => setModal({ type: "none" })}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          serverErrors={formErrors}
        />
      )}
      {modal.type === "edit" && (
        <ProjectFormModal
          project={modal.project}
          onClose={() => setModal({ type: "none" })}
          onSubmit={(input) => handleUpdate(modal.project.id, input)}
          isSubmitting={isSubmitting}
          serverErrors={formErrors}
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
