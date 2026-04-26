import type { Department, Machine } from "../types/machine";
import type { MaintenanceTask } from "../types/maintenance";
import type { RiskItem } from "../types/risk";
import type { AppTab, RoleView } from "../types/app";
import { runLightMachineSimulation } from "../logic/machineSimulators";

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
        <button style={quickActionStyle} onClick={() => onGoToTab("alerts")}>
          View Alerts
        </button>
        <button style={quickActionStyle} onClick={() => onGoToTab("simulation")}>
          Open Simulation
        </button>
        <button style={quickActionStyle} onClick={() => onGoToTab("maintenance")}>
          Maintenance
        </button>
        <button style={quickActionStyle} onClick={() => onGoToTab("documents")}>
          Documents
        </button>
      </div>

      {highRisks.length > 0 && (
        <div
          style={{
            ...cardStyle,
            textAlign: "center",
            background: "#fff1f2",
            border: "1px solid #fca5a5",
          }}
        >
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

function DashboardStat({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
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

function riskLevelStyle(level: RiskItem["level"]) {
  if (level === "STOP") {
    return { background: "#7f1d1d", border: "#7f1d1d", color: "#ffffff" };
  }

  if (level === "HIGH_RISK") {
    return { background: "#fff1f2", border: "#fca5a5", color: "#b91c1c" };
  }

  if (level === "CAUTION") {
    return { background: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  }

  if (level === "WATCH") {
    return { background: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" };
  }

  return { background: "#ecfdf5", border: "#86efac", color: "#166534" };
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 16,
  padding: 16,
  marginTop: 12,
  background: "white",
};

const statGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const statCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 10,
  background: "white",
};

const quickActionGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const quickActionStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const attentionButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 8,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #fca5a5",
  background: "#fff1f2",
  color: "#991b1b",
  fontWeight: 900,
  cursor: "pointer",
};

const miniWatchCardStyle: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 14,
  border: "1px solid #fcd34d",
  background: "#fffbeb",
};