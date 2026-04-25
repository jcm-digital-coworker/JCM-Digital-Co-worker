import type { Department } from "./machine";

export type DocumentCategory =
  | "Simulation"
  | "Maintenance"
  | "Program / Macro"
  | "Print"
  | "Manual"
  | "Inspection"
  | "Setup Guide";

export type DocumentStatus = "Available" | "Placeholder" | "Needs Upload";

export type PlantDocument = {
  id: string;
  title: string;
  department: Department;
  machineId?: string;
  category: DocumentCategory;
  status: DocumentStatus;
  description: string;
  ownerRole: "Operator" | "Maintenance" | "Lead / Engineer" | "Shared";
};