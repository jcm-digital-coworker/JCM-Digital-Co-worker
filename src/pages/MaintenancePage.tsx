import type { CSSProperties } from "react";
import type { Department, Machine } from "../types/machine";
import type { MaintenanceTask } from "../types/maintenance";

export default function MaintenancePage({
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

function maintenanceStatusStyle(status: MaintenanceTask["status"]) {
  if (status === "OVERDUE") return { background: "#fff1f2", border: "#fca5a5", color: "#b91c1c" };
  if (status === "DUE_SOON") return { background: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  if (status === "WATCH") return { background: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" };
  return { background: "#ecfdf5", border: "#86efac", color: "#166534" };
}

const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 16,
  padding: 16,
  marginTop: 12,
  background: "white",
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