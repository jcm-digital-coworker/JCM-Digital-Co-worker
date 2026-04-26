import type { CSSProperties, ReactNode } from "react";
import type { Department, Machine } from "../types/machine";
import StatusBadge from "../components/StatusBadge";
import { runLightMachineSimulation } from "../logic/machineSimulators";

const departmentOrder: Department[] = [
  "Machine Shop",
  "Saddles Dept",
  "Material Handling",
];

export default function SimulationPage({
  machines,
  onOpenSimulator,
}: {
  machines: Machine[];
  onOpenSimulator: (machine: Machine) => void;
}) {
  return (
    <DepartmentSections
      machines={machines}
      renderMachine={(machine) => (
        <SimulationCard
          key={machine.id}
          machine={machine}
          onOpenSimulator={() => onOpenSimulator(machine)}
        />
      )}
    />
  );
}

function DepartmentSections({
  machines,
  renderMachine,
}: {
  machines: Machine[];
  renderMachine: (machine: Machine) => ReactNode;
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

function isLv4500(machine: Machine) {
  return machine.name.includes("LV4500R");
}

function getMachineCardTint(machine: Machine) {
  if (machine.state === "ALARM") return { background: "#fff1f2", border: "#fda4af" };
  if (machine.state === "OFFLINE" || machine.alarmPriority === "RESET") {
    return { background: "#fffbeb", border: "#fcd34d" };
  }
  if (machine.simulationStatus === "CAUTION") {
    return { background: "#fefce8", border: "#fde68a" };
  }
  if (machine.state === "RUNNING") {
    return { background: "#ecfdf5", border: "#86efac" };
  }

  return { background: "white", border: "#ddd" };
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