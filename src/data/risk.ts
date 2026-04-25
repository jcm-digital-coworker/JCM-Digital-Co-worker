import type { RiskItem } from "../types/risk";

export const riskItems: RiskItem[] = [
  {
    id: "risk-1",
    machineId: "7",
    department: "Saddles Dept",
    title: "LV4500 fixture clearance caution",
    level: "HIGH_RISK",
    source: "Simulation",
    description:
      "Any simulated prep or thread depth near the 1.5 inch fixture clearance limit should be treated as high risk.",
    recommendedAction:
      "Run the JCM simulator and require supervisor review before running questionable combinations.",
    requiredSignoff: "Supervisor",
    signoffStatus: "Pending",
  },
  {
    id: "risk-2",
    machineId: "8",
    department: "Saddles Dept",
    title: "LV4500 small boss tap-code restriction",
    level: "CAUTION",
    source: "Program",
    description:
      "Small boss castings only allow approved lower tap codes. Invalid combinations should be rejected before the machine runs.",
    recommendedAction:
      "Validate casting and tap code in the JCM simulator before production.",
    requiredSignoff: "Co-worker",
    signoffStatus: "Pending",
  },
  {
    id: "risk-3",
    machineId: "1",
    department: "Machine Shop",
    title: "KH80 heavy roughing load watch",
    level: "WATCH",
    source: "Setup",
    description:
      "KH80 has shown roughing load sensitivity during heavy tool engagement.",
    recommendedAction:
      "Check tool condition, roughing entry, and recent spindle load before restart.",
    requiredSignoff: "Operator",
    signoffStatus: "Pending",
  },
  {
    id: "risk-4",
    machineId: "3",
    department: "Machine Shop",
    title: "Yama touch-off / reused offset concern",
    level: "CAUTION",
    source: "Setup",
    description:
      "Setup-sensitive machine with operator-dependent touch-off and heavy tool alignment risk.",
    recommendedAction:
      "Use a second-look touch-off verification before running.",
    requiredSignoff: "Co-worker",
    signoffStatus: "Pending",
  },
  {
    id: "risk-5",
    machineId: "11",
    department: "Material Handling",
    title: "Material handling readiness placeholder",
    level: "WATCH",
    source: "Material",
    description:
      "Material staging, consumables, cut file readiness, and thickness verification still need department-specific detail.",
    recommendedAction:
      "Use placeholder readiness checks until exact machine profiles are completed.",
    requiredSignoff: "Operator",
    signoffStatus: "Pending",
  },
];