import type { Department, Machine } from "../types/machine";
import StatusBadge from "../components/StatusBadge";

const departmentOrder: Department[] = [
  "Machine Shop",
  "Saddles Dept",
  "Material Handling",
];

export default function MachinesPage({
  machines,
  onOpenMachine,
}: {
  machines: Machine[];
  onOpenMachine: (machine: Machine) => void;
}) {
  return (
    <DepartmentSections
      machines={machines}
      renderMachine={(machine) => (
        <MachineCard
          key={machine.id}
          machine={machine}
          onClick={() => onOpenMachine(machine)}
        />
      )}
    />
  );
}

export function AlertsPage({
  alerts,
  onOpenMachine,
}: {
  alerts: Machine[];
  onOpenMachine: (machine: Machine) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>No Active Alerts</h3>
        <p style={{ color: "#64748b" }}>Nothing currently needs attention.</p>
      </div>
    );
  }

  return (
    <DepartmentSections
      machines={alerts}
      renderMachine={(machine) => (
        <MachineCard
          key={machine.id}
          machine={machine}
          onClick={() => onOpenMachine(machine)}
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
        <div>
          <strong>Program:</strong> {machine.program}
        </div>
        <div>
          <strong>Last Tool:</strong> {machine.lastTool.toolNumber} -{" "}
          {machine.lastTool.description}
        </div>
      </div>
    </div>
  );
}

function getMachineCardTint(machine: Machine) {
  if (machine.state === "ALARM") {
    return { background: "#fff1f2", border: "#fda4af" };
  }

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

const departmentSectionStyle: React.CSSProperties = {
  marginTop: 18,
};

const departmentHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 4px",
  color: "#111827",
};

const departmentCountStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#64748b",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 999,
  padding: "5px 10px",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 16,
  padding: 16,
  marginTop: 12,
  background: "white",
};