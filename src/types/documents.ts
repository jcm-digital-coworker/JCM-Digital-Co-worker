import type { Department } from "./machine";

export type DocumentCategory =
  | "Print"
  | "Program"
  | "Macro"
  | "Setup Guide"
  | "Maintenance"
  | "Manual"
  | "Inspection";

export type PlantDocument = {
  id: string;
  title: string;
  department: Department;
  machineId?: string;
  category: DocumentCategory;
  description: string;
  status: "Available" | "Placeholder" | "Needs Upload";
};