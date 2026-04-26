import type { Department } from "./machine";

export type AppTab =
  | "dashboard"
  | "machines"
  | "alerts"
  | "simulation"
  | "maintenance"
  | "documents"
  | "risk";

export type DepartmentFilter = Department | "All";

export type RoleView = "Operator" | "Maintenance" | "Lead / Engineer";