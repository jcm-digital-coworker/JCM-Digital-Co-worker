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
import StatusBadge from "./components/StatusBadge";
import Lv4500JcmSimulator from "./components/Lv4500JcmSimulator";
import AppHeader from "./components/shell/AppHeader";
import AppDrawer from "./components/shell/AppDrawer";
import DepartmentCards from "./components/shell/DepartmentCards";

import { runLightMachineSimulation } from "./logic/machineSimulators";

import DashboardPage from "./pages/DashboardPage";

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
        <DepartmentSections
          machines={filteredMachines}
          renderMachine={(machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onClick={() => setSelected(machine)}
            />
          )}
        />
      )}

      {tab === "alerts" && (
        <>
          {filteredAlerts.length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <h3 style={{ marginTop: 0 }}>No Active Alerts</h3>
              <p style={{ color: "#64748b" }}>Nothing currently needs attention.</p>
            </div>
          )}

          <DepartmentSections
            machines={filteredAlerts}
            renderMachine={(machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onClick={() => setSelected(machine)}
              />
            )}
          />
        </>
      )}

      {tab === "simulation" && (
        <DepartmentSections
          machines={filteredMachines}
          renderMachine={(machine) => (
            <SimulationCard
              key={machine.id}
              machine={machine}
              onOpenSimulator={() => setSimulatorMachine(machine)}
            />
          )}
        />
      )}

      {tab === "maintenance" && (
        <MaintenanceView machines={filteredMachines} tasks={filteredMaintenanceTasks} />
      )}

      {tab === "documents" && <DocumentsView documents={filteredDocuments} />}

      {tab === "risk" && <RiskView risks={filteredRisks} roleView={roleView} />}
    </div>
  );
}

 {
  const openMaintenance = tasks.filter((task) => task.status !== "OK");
  const openRisks = risks.filter((risk) => risk.signoffStatus !== "Signed");
  const highRisks = openRisks.filter(
    (risk) => risk.level === "HIGH_RISK" || risk.level === "STOP"
  );
  const cautionSims = machines.filter((machine) => {
    const sim = runLightMachineSimulation(machine);
    return sim.status === "CAUTION" || sim.status === "BLOCKED";
  });

  return (
    <div>
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <p style={{ color: "#64748b" }}>
          Current role: {roleView}. Focused on what needs attention now.
        </p>

        <div style={statGridStyle}>
          <DashboardStat label="Machines" value={String(machines.length)} />
          <DashboardStat label="Alerts" value={String(alerts.length)} danger={alerts.length > 0} />
          <DashboardStat label="Open Risks" value={String(openRisks.length)} danger={highRisks.length > 0} />
          <DashboardStat label="Maintenance" value={String(openMaintenance.length)} danger={openMaintenance.length > 0} />
        </div>
      </div>

      <div style={quickActionGridStyle}>
        <button style={quickActionStyle} onClick={() => onGoToTab("alerts")}>View Alerts</button>
        <button style={quickActionStyle} onClick={() => onGoToTab("simulation")}>Open Simulation</button>
        <button style={quickActionStyle} onClick={() => onGoToTab("maintenance")}>Maintenance</button>
        <button style={quickActionStyle} onClick={() => onGoToTab("documents")}>Documents</button>
      </div>

      {highRisks.length > 0 && (
        <div style={{ ...cardStyle, textAlign: "center", background: "#fff1f2", border: "1px solid #fca5a5" }}>
          <h3 style={{ marginTop: 0 }}>High Risk Items</h3>
          {highRisks.slice(0, 3).map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <h3 style={{ marginTop: 0 }}>Machines Needing Attention</h3>
          {alerts.slice(0, 4).map((machine) => (
            <button
              key={machine.id}
              onClick={() => onOpenMachine(machine)}
              style={attentionButtonStyle}
            >
              {machine.name} · {machine.state}
            </button>
          ))}
        </div>
      )}

      {cautionSims.length > 0 && (
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <h3 style={{ marginTop: 0 }}>Simulation Watchlist</h3>
          {cautionSims.slice(0, 4).map((machine) => {
            const sim = runLightMachineSimulation(machine);
            return (
              <div key={machine.id} style={miniWatchCardStyle}>
                <strong>{machine.name}</strong>
                <p style={{ margin: "6px 0", color: "#334155" }}>
                  {sim.status} — {sim.title}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DepartmentSections({
  machines,
  renderMachine,
}: {
  machines: Machine[];
  renderMachine: (machine: Machine) => React.ReactNode;
}) {
  return (
    <>
      {departmentOrder.map((department) => {
        const group = machines.filter((machine) => machine.department === department);
        if (group.length === 0) return null;

        return (
          <section key={department} style={departmentSectionStyle}>
            <div style={departmentHeaderStyle}>
              <h3 style={{ margin: 0 }}>{department}</h3>
              <span style={departmentCountStyle}>
                {group.length} machine{group.length === 1 ? "" : "s"}
              </span>
            </div>

            {group.map(renderMachine)}
          </section>
        );
      })}
    </>
  );
}

function MachineCard({
  machine,
  onClick,
}: {
  machine: Machine;
  onClick: () => void;
}) {
  const tint = getMachineCardTint(machine);

  return (
    <div
      onClick={onClick}
      style={{
        ...cardStyle,
        cursor: "pointer",
        background: tint.background,
        border: `1px solid ${tint.border}`,
        textAlign: "center",
      }}
    >
      <strong>{machine.name}</strong>

      <div style={{ color: "#64748b", marginTop: 4 }}>
        {machine.control} · {machine.suite}
      </div>

      <div style={{ marginTop: 10 }}>
        <StatusBadge state={machine.state} />
      </div>

      <div style={{ marginTop: 12 }}>
        <div><strong>Program:</strong> {machine.program}</div>
        <div>
          <strong>Last Tool:</strong> {machine.lastTool.toolNumber} -{" "}
          {machine.lastTool.description}
        </div>
      </div>
    </div>
  );
}

function SimulationCard({
  machine,
  onOpenSimulator,
}: {
  machine: Machine;
  onOpenSimulator: () => void;
}) {
  const tint = getMachineCardTint(machine);
  const sim = runLightMachineSimulation(machine);

  return (
    <div
      style={{
        ...cardStyle,
        background: tint.background,
        border: `1px solid ${tint.border}`,
        textAlign: "center",
      }}
    >
      <strong>{machine.name}</strong>
      <div style={{ color: "#64748b", marginTop: 4 }}>
        {machine.control} · {machine.suite}
      </div>

      <div style={{ marginTop: 10 }}>
        <StatusBadge state={machine.state} />
      </div>

      <div style={{ marginTop: 12 }}>
        <StatusLikePill status={sim.status} />
      </div>

      <h3 style={{ marginBottom: 4 }}>{sim.title}</h3>
      <p style={{ color: "#334155", lineHeight: 1.45 }}>{sim.summary}</p>

      {isLv4500(machine) ? (
        <button onClick={onOpenSimulator} style={primaryButtonStyle}>
          Open JCM Suite Simulator
        </button>
      ) : (
        <div style={simCheckPanelStyle}>
          <strong>Light Simulator Checks</strong>

          {sim.checks.map((check, index) => (
            <p key={index} style={{ margin: "8px 0", color: "#334155" }}>
              • {check}
            </p>
          ))}

          {sim.warnings.length > 0 && (
            <div style={warningPanelStyle}>
              <strong>Warnings</strong>
              {sim.warnings.map((warning, index) => (
                <p key={index} style={{ margin: "8px 0" }}>
                  • {warning}
                </p>
              ))}
            </div>
          )}

          <div style={recommendedPanelStyle}>
            <strong>Recommended Action</strong>
            <p style={{ marginBottom: 0 }}>{sim.recommendedAction}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MaintenanceView({
  machines,
  tasks,
}: {
  machines: Machine[];
  tasks: (MaintenanceTask & { department: Department })[];
}) {
  const openTasks = tasks.filter((task) => task.status !== "OK");

  return (
    <div>
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Fleet Maintenance Overview</h3>
        <p style={{ color: "#64748b" }}>
          Read-only maintenance view for PM checks, watch items, and recurring issues.
        </p>

        <div style={statGridStyle}>
          <MaintenanceStat label="Open Items" value={String(openTasks.length)} />
          <MaintenanceStat label="Overdue" value={String(tasks.filter((t) => t.status === "OVERDUE").length)} />
          <MaintenanceStat label="Due Soon" value={String(tasks.filter((t) => t.status === "DUE_SOON").length)} />
          <MaintenanceStat label="Watch" value={String(tasks.filter((t) => t.status === "WATCH").length)} />
        </div>
      </div>

      {machines.map((machine) => {
        const machineTasks = tasks.filter((task) => task.machineId === machine.id);
        if (machineTasks.length === 0) return null;

        return (
          <div key={machine.id} style={{ ...cardStyle, textAlign: "center" }}>
            <h3 style={{ marginTop: 0 }}>{machine.name}</h3>
            <p style={{ color: "#64748b" }}>
              {machine.control} · {machine.suite}
            </p>

            {machineTasks.map((task) => (
              <MaintenanceTaskCard key={task.id} task={task} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function MaintenanceTaskCard({ task }: { task: MaintenanceTask }) {
  const style = maintenanceStatusStyle(task.status);

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${style.border}`,
        background: style.background,
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
          color: style.color,
          background: "white",
          border: `1px solid ${style.border}`,
          marginBottom: 8,
        }}
      >
        {task.status}
      </span>

      <div style={{ fontWeight: 800 }}>{task.title}</div>
      <div style={{ color: "#64748b", marginTop: 4 }}>
        {task.category} · {task.interval}
      </div>

      <p style={{ marginBottom: 4 }}>
        <strong>Last completed:</strong> {task.lastCompleted}
      </p>
      <p style={{ marginTop: 4 }}>
        <strong>Next due:</strong> {task.nextDue}
      </p>

      <p style={{ color: "#334155", lineHeight: 1.45 }}>{task.notes}</p>
    </div>
  );
}

function MaintenanceStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

 {
  return (
    <div
      style={{
        ...statCardStyle,
        border: danger ? "1px solid #fca5a5" : "1px solid #e2e8f0",
        background: danger ? "#fff1f2" : "white",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function DocumentsView({ documents }: { documents: PlantDocument[] }) {
  const categories: PlantDocument["category"][] = [
    "Simulation",
    "Maintenance",
    "Program / Macro",
    "Print",
    "Manual",
    "Inspection",
    "Setup Guide",
  ];

  return (
    <div>
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Plant Documents</h3>
        <p style={{ color: "#64748b" }}>
          Read-only document hub for simulation references, prints, programs,
          macros, maintenance docs, manuals, and setup guides.
        </p>

        <div style={statGridStyle}>
          <MaintenanceStat label="Total Docs" value={String(documents.length)} />
          <MaintenanceStat label="Available" value={String(documents.filter((d) => d.status === "Available").length)} />
          <MaintenanceStat label="Placeholders" value={String(documents.filter((d) => d.status === "Placeholder").length)} />
          <MaintenanceStat label="Needs Upload" value={String(documents.filter((d) => d.status === "Needs Upload").length)} />
        </div>
      </div>

      <OfficialResourcesCard />

      {categories.map((category) => {
        const categoryDocs = documents.filter((doc) => doc.category === category);
        if (categoryDocs.length === 0) return null;

        return (
          <section key={category} style={departmentSectionStyle}>
            <div style={departmentHeaderStyle}>
              <h3 style={{ margin: 0 }}>{category}</h3>
              <span style={departmentCountStyle}>
                {categoryDocs.length} doc{categoryDocs.length === 1 ? "" : "s"}
              </span>
            </div>

            {categoryDocs.map((doc) => (
              <div key={doc.id} style={{ ...cardStyle, textAlign: "center" }}>
                <span style={documentPillStyle(doc.status)}>{doc.status}</span>

                <h3>{doc.title}</h3>

                <p style={{ color: "#64748b" }}>
                  {doc.department} · {doc.category} · {doc.ownerRole}
                </p>

                {doc.machineId && (
                  <p style={{ color: "#64748b", marginTop: -6 }}>
                    Machine ID: {doc.machineId}
                  </p>
                )}

                <p style={{ color: "#334155", lineHeight: 1.45 }}>
                  {doc.description}
                </p>

                <div style={placeholderStyle}>File attachment/link coming later</div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function OfficialResourcesCard() {
  const links = [
    { label: "JCM Resources", url: "https://www.jcmindustries.com/resources/" },
    { label: "Product Specifications", url: "https://www.jcmindustries.com/products/product-specifications/" },
    { label: "Installation Instructions", url: "https://www.jcmindustries.com/resources/installation-instructions/" },
    { label: "JCMU Training", url: "https://www.jcmindustries.com/JCM" },
  ];

  return (
    <div style={{ ...cardStyle, textAlign: "center", background: "#eff6ff" }}>
      <h3 style={{ marginTop: 0 }}>Official JCM Website Resources</h3>
      <p style={{ color: "#1e3a8a" }}>
        External links for product resources, installation instructions, specifications, and training.
      </p>

      <div style={quickActionGridStyle}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            style={resourceLinkStyle}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function RiskView({ risks, roleView }: { risks: RiskItem[]; roleView: RoleView }) {
  const openRisks = risks.filter((risk) => risk.signoffStatus !== "Signed");

  return (
    <div>
      <div style={{ ...cardStyle, textAlign: "center", background: "#eff6ff" }}>
        <h3 style={{ marginTop: 0 }}>Risk / Signoffs</h3>
        <p style={{ color: "#1e3a8a" }}>
          Current role: {roleView}. Read-only signoff workflow preview.
        </p>

        <div style={statGridStyle}>
          <MaintenanceStat label="Open Risks" value={String(openRisks.length)} />
          <MaintenanceStat label="High Risk" value={String(openRisks.filter((r) => r.level === "HIGH_RISK" || r.level === "STOP").length)} />
          <MaintenanceStat label="Pending" value={String(openRisks.filter((r) => r.signoffStatus === "Pending").length)} />
        </div>
      </div>

      {openRisks.map((risk) => (
        <RiskCard key={risk.id} risk={risk} />
      ))}
    </div>
  );
}

function RiskCard({ risk }: { risk: RiskItem }) {
  const style = riskLevelStyle(risk.level);

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${style.border}`,
        background: style.background,
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 900,
          color: style.color,
          background: "white",
          border: `1px solid ${style.border}`,
          marginBottom: 8,
        }}
      >
        {risk.level}
      </span>

      <div style={{ fontWeight: 900 }}>{risk.title}</div>

      <p style={{ color: "#334155", lineHeight: 1.45 }}>{risk.description}</p>

      <p style={{ color: "#1e3a8a", lineHeight: 1.45 }}>
        <strong>Recommended:</strong> {risk.recommendedAction}
      </p>

      <p style={{ color: "#64748b", marginBottom: 0 }}>
        <strong>Signoff:</strong> {risk.requiredSignoff} · {risk.signoffStatus}
      </p>
    </div>
  );
}

function StatusLikePill({ status }: { status: "READY" | "CAUTION" | "BLOCKED" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        background:
          status === "READY"
            ? "#dcfce7"
            : status === "CAUTION"
            ? "#fef3c7"
            : "#fee2e2",
        color:
          status === "READY"
            ? "#166534"
            : status === "CAUTION"
            ? "#92400e"
            : "#b91c1c",
      }}
    >
      {status}
    </span>
  );
}

function maintenanceStatusStyle(status: MaintenanceTask["status"]) {
  if (status === "OVERDUE") return { background: "#fff1f2", border: "#fca5a5", color: "#b91c1c" };
  if (status === "DUE_SOON") return { background: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  if (status === "WATCH") return { background: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" };
  return { background: "#ecfdf5", border: "#86efac", color: "#166534" };
}

function riskLevelStyle(level: RiskItem["level"]) {
  if (level === "STOP") return { background: "#7f1d1d", border: "#7f1d1d", color: "#ffffff" };
  if (level === "HIGH_RISK") return { background: "#fff1f2", border: "#fca5a5", color: "#b91c1c" };
  if (level === "CAUTION") return { background: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  if (level === "WATCH") return { background: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" };
  return { background: "#ecfdf5", border: "#86efac", color: "#166534" };
}

function documentPillStyle(status: PlantDocument["status"]): CSSProperties {
  if (status === "Available") return { ...pillStyle, background: "#dcfce7", color: "#166534" };
  if (status === "Needs Upload") return { ...pillStyle, background: "#fee2e2", color: "#b91c1c" };
  return { ...pillStyle, background: "#fef3c7", color: "#92400e" };
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

const resourceLinkStyle: CSSProperties = {
  display: "block",
  textDecoration: "none",
  textAlign: "center",
  padding: 12,
  borderRadius: 14,
  background: "white",
  border: "1px solid #93c5fd",
  color: "#1d4ed8",
  fontWeight: 900,
};

const pillStyle: CSSProperties = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};