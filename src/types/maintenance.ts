export type MaintenanceStatus = "OK" | "DUE_SOON" | "OVERDUE" | "WATCH";

export type MaintenanceTask = {
  id: string;
  machineId: string;
  title: string;
  category:
    | "Lubrication"
    | "Coolant"
    | "Inspection"
    | "Tooling"
    | "Electrical"
    | "Mechanical"
    | "Controls"
    | "Fixture";
  interval: string;
  status: MaintenanceStatus;
  lastCompleted: string;
  nextDue: string;
  notes: string;
};