import type { AppTab, RoleView } from "../types/app";
import type { Department, Machine } from "../types/machine";
import type { MaintenanceTask } from "../types/maintenance";
import type { RiskItem } from "../types/risk";

export default function DashboardPage({
  machines,
  alerts,
  tasks,
  risks,
  roleView,
  onOpenMachine,
  onGoToTab,
}: {
  machines: Machine[];
  alerts: Machine[];
  tasks: (MaintenanceTask & { department: Department })[];
  risks: RiskItem[];
  roleView: RoleView;
  onOpenMachine: (machine: Machine) => void;
  onGoToTab: (tab: AppTab) => void;
}) {
  return (
    <div style={{ padding: 16, borderRadius: 16, background: "white", textAlign: "center" }}>
      <h2>Dashboard Page Works</h2>
      <p>Role: {roleView}</p>
      <p>Machines: {machines.length}</p>
      <p>Alerts: {alerts.length}</p>
      <p>Maintenance tasks: {tasks.length}</p>
      <p>Risks: {risks.length}</p>

      <button onClick={() => onGoToTab("machines")}>
        Go to Machines
      </button>
    </div>
  );
}