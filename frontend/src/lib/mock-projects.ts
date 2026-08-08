import { Project } from "./types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    clientName: "Acme Corporation",
    projectName: "Corporate Website Redesign",
    description:
      "Redesign and modernize the company's corporate website with a focus on conversion and accessibility.",
    status: "In Progress",
    priority: "High",
    startDate: "2026-06-01",
    dueDate: "2026-07-15",
  },
  {
    id: 2,
    clientName: "Likeli, Inc.",
    projectName: "Mobile App MVP",
    description:
      "Native iOS and Android app for the Likeli marketplace, including onboarding and payments.",
    status: "Planning",
    priority: "High",
    startDate: "2026-08-10",
    dueDate: "2026-10-30",
  },
  {
    id: 3,
    clientName: "Zeeno Labs",
    projectName: "Internal Ops Dashboard",
    description: "Backend system and dashboard for tracking fulfillment and inventory.",
    status: "On Hold",
    priority: "Medium",
    startDate: "2026-04-01",
    dueDate: "2026-09-01",
  },
  {
    id: 4,
    clientName: "Matey Studio",
    projectName: "E-commerce Storefront",
    description: "Headless storefront with Stripe checkout and affiliate marketing support.",
    status: "Completed",
    priority: "Medium",
    startDate: "2026-01-15",
    dueDate: "2026-03-20",
  },
  {
    id: 5,
    clientName: "TAS Group",
    projectName: "Bluetooth Device Companion App",
    description: "Companion app for BLE hardware integration and firmware updates.",
    status: "In Progress",
    priority: "Low",
    startDate: "2026-05-01",
    dueDate: "2026-11-01",
  },
];
