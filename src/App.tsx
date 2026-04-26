import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { machines } from "./data/machine";
import { maintenanceTasks } from "./data/maintenance";
import { plantDocuments } from "./data/documents";
import { riskItems } from "./data/risk";

import type { Department, Machine } from "./types/machine";
import type { MaintenanceTask } from "./types/maintenance";
import type { PlantDocument } from "./types/documents";
import type { RiskItem } from "./types/risk";
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

function isLv4500(machine: Machine) {
  return machine.name.includes("LV4500R");
}

function getMachineCardTint(machine: Machine) {
  if (machine.state === "ALARM") return { background: "#fff1f2", border: "#fda4af" };
  if (machine.state === "OFFLINE" || machine.alarmPriority === "RESET") {
    return { background: "#fffbeb", border: "#fcd34d" };
  }
  if (machine.simulationStatus === "CAUTION") return { background: "#fefce8", border: "#fde68a" };
  if (machine.state === "RUNNING") return { background: "#ecfdf5", border: "#86efac" };
  return { background: "white", border: "#ddd" };
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

const departmentSectionStyle: CSSProperties = {
  marginTop: 18,
};

const departmentHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 4px",
  color: "#111827",
};

const departmentCountStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#64748b",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 999,
  padding: "5px 10px",
};

const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 16,
  padding: 16,
  marginTop: 12,
  background: "white",
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

const primaryButtonStyle: CSSProperties = {
  marginTop: 8,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const placeholderStyle: CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "rgba(255,255,255,0.65)",
  border: "1px solid #e2e8f0",
  color: "#64748b",
  fontWeight: 700,
};

const statGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const statCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 10,
  background: "white",
};

const quickActionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const quickActionStyle: CSSProperties = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const simCheckPanelStyle: CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  background: "rgba(255,255,255,0.7)",
  textAlign: "left",
};

const warningPanelStyle: CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "#fff7ed",
  color: "#9a3412",
};

const recommendedPanelStyle: CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "#eff6ff",
  color: "#1e3a8a",
};