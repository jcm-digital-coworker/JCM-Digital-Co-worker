export type RiskLevel = "INFO" | "WATCH" | "CAUTION" | "HIGH_RISK" | "STOP";

export type SignoffRole =
  | "None"
  | "Operator"
  | "Co-worker"
  | "Supervisor"
  | "Maintenance"
  | "Engineering";

export type SignoffStatus = "Not Required" | "Pending" | "Signed" | "Escalated";

export type RiskItem = {
  id: string;
  machineId?: string;
  department: "Machine Shop" | "Saddles Dept" | "Material Handling";
  title: string;
  level: RiskLevel;
  source: "Simulation" | "Maintenance" | "Setup" | "Material" | "Program" | "System";
  description: string;
  recommendedAction: string;
  requiredSignoff: SignoffRole;
  signoffStatus: SignoffStatus;
};