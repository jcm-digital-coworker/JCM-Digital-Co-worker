import type { Department, Machine } from "../../types/machine";
import type { MaintenanceTask } from "../../types/maintenance";
import type { DepartmentFilter } from "../../types/app";
import type { CSSProperties } from "react";

const departmentOrder: Department[] = [
  "Machine Shop",
  "Saddles Dept",
  "Material Handling",
];

export default function DepartmentCards({
  machines,
  alerts,
  tasks,
  selected,
  onSelect,
}: {
  machines: Machine[];
  alerts: Machine[];
  tasks: MaintenanceTask[];
  selected: DepartmentFilter;
  onSelect: (department: DepartmentFilter) => void;
}) {
  const options: DepartmentFilter[] = ["All", ...departmentOrder];

  return (
    <div style={departmentCardGridStyle}>
      {options.map((department) => {
        const deptMachines =
          department === "All"
            ? machines
            : machines.filter((m) => m.department === department);

        const deptAlerts =
          department === "All"
            ? alerts
            : alerts.filter((m) => m.department === department);

        const deptTasks =
          department === "All"
            ? tasks
            : tasks.filter((task) => {
                const machine = machines.find((m) => m.id === task.machineId);
                return machine?.department === department;
              });

        const active = selected === department;

        return (
          <button
            key={department}
            onClick={() => onSelect(department)}
            style={{
              ...departmentCardStyle,
              border: active ? "2px solid #111827" : "1px solid #d1d5db",
              background: active ? "#f8fafc" : "white",
            }}
          >
            <div style={{ fontWeight: 900 }}>{department}</div>
            <div style={{ color: "#64748b", marginTop: 6 }}>
              {deptMachines.length} machines
            </div>
            <div style={{ color: "#b91c1c", marginTop: 4 }}>
              {deptAlerts.length} alerts
            </div>
            <div style={{ color: "#92400e", marginTop: 4 }}>
              {deptTasks.filter((t) => t.status !== "OK").length} maintenance
            </div>
          </button>
        );
      })}
    </div>
  );
}

const departmentCardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const departmentCardStyle: CSSProperties = {
  padding: 12,
  borderRadius: 16,
  cursor: "pointer",
  textAlign: "center",
};