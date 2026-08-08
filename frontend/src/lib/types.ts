export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed";

export type ProjectPriority = "low" | "medium" | "high";

export interface Project {
  id: number;
  client_name: string;
  project_name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export type ProjectInput = Pick<
  Project,
  "client_name" | "project_name" | "description" | "status" | "priority" | "start_date" | "due_date"
>;

export const PROJECT_STATUSES: ProjectStatus[] = [
  "planning",
  "in_progress",
  "on_hold",
  "completed",
];

export const PROJECT_PRIORITIES: ProjectPriority[] = ["low", "medium", "high"];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}
