import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { machines } from "./data/machine";
import { maintenanceTasks } from "./data/maintenance";
import { plantDocuments } from "./data/documents";
import { riskItems } from "./data/risk";

import type { Department, Machine } from "./types/machine";
import type { MaintenanceTask } from "./types/maintenance";
import type { AppTab, DepartmentFilter, RoleView } from "./types/app";

import MachineDetail from "./components/MachineDetail";
import Lv4500JcmSimulator from "./components/Lv4500JcmSimulator";
import AppHeader from "./components/shell/AppHeader";
import AppDrawer from "./components/shell/AppDrawer";
import DepartmentCards from "./components/shell/DepartmentCards";

import DashboardPage from "./pages/DashboardPage";
import MachinesPage, { AlertsPage } from "./pages/MachinesPage";
import SimulationPage from "./pages/SimulationPage";
import MaintenancePage from "./pages/MaintenancePage";
import DocumentsPage from "./pages/DocumentsPage";
import RiskPage from "./pages/RiskPage";

type DetailTab = "overview" | "setup" | "history" | "notes";

const departmentOrder: Department[] = [
  "Machine Shop",
  "Saddles Dept",
  "Material Handling",
];

function priorityRank(priority: Machine["alarmPriority"]) {
  if (priority === "ESTOP") return 0;
  if (priority === "ALARM") return 1;
  if (priority === "RESET") return 2;
  return 3;
}

function filterByDepartment<T extends { department: Department }>(
  items: T[],
  filter: DepartmentFilter
) {
  if (filter === "All") return items;
  return items.filter((item) => item.department === filter);
}

export default function App() {
  const [selected, setSelected] = useState<Machine | null>(null);
  const [tab, setTab] = useState<AppTab>("dashboard");
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [simulatorMachine, setSimulatorMachine] = useState<Machine | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>("All");
  const [roleView, setRoleView] = useState<RoleView>("Operator");
  const [menuOpen, setMenuOpen] = useState(false);

  const sortedMachines = useMemo(() => {
    return [...machines].sort((a, b) => {
      const deptDiff =
        departmentOrder.indexOf(a.department) - departmentOrder.indexOf(b.department);
      if (deptDiff !== 0) return deptDiff;

      const priorityDiff =
        priorityRank(a.alarmPriority) - priorityRank(b.alarmPriority);
      if (priorityDiff !== 0) return priorityDiff;

      return a.name.localeCompare(b.name);
    });
  }, []);

  const alerts = useMemo(() => {
    return sortedMachines.filter(
      (m) =>
        m.alarmPriority !== "NORMAL" ||
        m.state === "ALARM" ||
        m.state === "OFFLINE"
    );
  }, [sortedMachines]);

  const maintenanceWithDepartment = maintenanceTasks.map((task) => {
    const machine = machines.find((m) => m.id === task.machineId);
    return { ...task, department: machine?.department ?? "Machine Shop" };
  });

  const filteredMachines = filterByDepartment(sortedMachines, departmentFilter);
  const filteredAlerts = filterByDepartment(alerts, departmentFilter);
  const filteredMaintenanceTasks = filterByDepartment(
    maintenanceWithDepartment,
    departmentFilter
  );
  const filteredDocuments = filterByDepartment(plantDocuments, departmentFilter);
  const filteredRisks = filterByDepartment(riskItems, departmentFilter);

  if (simulatorMachine) {
    return (
      <div>
        <div style={{ padding: 16, background: "#f8fafc", textAlign: "center" }}>
          <button onClick={() => setSimulatorMachine(null)} style={backButtonStyle}>
            ← Back to Simulation
          </button>
          <h3 style={{ marginBottom: 0 }}>{simulatorMachine.name}</h3>
          <p style={{ marginTop: 4, color: "#64748b" }}>
            Read-only machine simulator
          </p>
        </div>

        <Lv4500JcmSimulator />
      </div>
    );
  }

  if (selected) {
    return (
      <MachineDetail
        machine={selected}
        detailTab={detailTab}
        setDetailTab={setDetailTab}
        onBack={() => {
          setSelected(null);
          setDetailTab("overview");
        }}
      />
    );
  }

  return (
    <div style={pageStyle}>
      <AppDrawer
        open={menuOpen}
        tab={tab}
        setTab={(nextTab) => {
          setTab(nextTab);
          setMenuOpen(false);
        }}
        roleView={roleView}
        setRoleView={setRoleView}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        onClose={() => setMenuOpen(false)}
      />

      <AppHeader onMenuClick={() => setMenuOpen(true)} />

      <DepartmentCards
        machines={sortedMachines}
        alerts={alerts}
        tasks={maintenanceTasks}
        selected={departmentFilter}
        onSelect={setDepartmentFilter}
      />

{tab === "dashboard" && (
  <DashboardPage
    machines={filteredMachines}
    alerts={filteredAlerts}
    tasks={filteredMaintenanceTasks}
    risks={filteredRisks}
    roleView={roleView}
    onOpenMachine={setSelected}
    onGoToTab={setTab}
  />
)}
      
      {tab === "machines" && (
  <MachinesPage
    machines={filteredMachines}
    onOpenMachine={setSelected}
  />
)}

{tab === "alerts" && (
  <AlertsPage
    alerts={filteredAlerts}
    onOpenMachine={setSelected}
  />
)}

{tab === "simulation" && (
  <SimulationPage
    machines={filteredMachines}
    onOpenSimulator={setSimulatorMachine}
  />
)}

{tab === "maintenance" && (
  <MaintenancePage
    machines={filteredMachines}
    tasks={filteredMaintenanceTasks}
  />
)}

{tab === "documents" && <DocumentsPage documents={filteredDocuments} />}

{tab === "risk" && <RiskPage risks={filteredRisks} roleView={roleView} />}
</div>
);
}

const pageStyle: CSSProperties = {
  padding: 16,
  fontFamily: "Arial, sans-serif",
  background: "#f8fafc",
  minHeight: "100vh",
};

const backButtonStyle: CSSProperties = {
  marginBottom: 16,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};