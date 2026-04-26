import type { Department } from "../../types/machine";
import type { AppTab, DepartmentFilter, RoleView } from "../../types/app";

const departmentOrder: Department[] = [
  "Machine Shop",
  "Saddles Dept",
  "Material Handling",
];

export default function AppDrawer({
  open,
  tab,
  setTab,
  roleView,
  setRoleView,
  departmentFilter,
  setDepartmentFilter,
  onClose,
}: {
  open: boolean;
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  roleView: RoleView;
  setRoleView: (role: RoleView) => void;
  departmentFilter: DepartmentFilter;
  setDepartmentFilter: (department: DepartmentFilter) => void;
  onClose: () => void;
}) {
  const tabs: { id: AppTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "machines", label: "Machines" },
    { id: "alerts", label: "Alerts" },
    { id: "simulation", label: "Simulation" },
    { id: "maintenance", label: "Maintenance" },
    { id: "documents", label: "Documents" },
    { id: "risk", label: "Risk / Signoffs" },
  ];

  const departments: DepartmentFilter[] = ["All", ...departmentOrder];
  const roles: RoleView[] = ["Operator", "Maintenance", "Lead / Engineer"];

  if (!open) return null;

  return (
    <>
      <div style={drawerBackdropStyle} onClick={onClose} />

      <aside style={drawerStyle}>
        <div style={drawerHeaderStyle}>
          <strong>JCM Digital Co-worker</strong>
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={drawerSectionStyle}>
          <div style={drawerLabelStyle}>Menu</div>
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                ...drawerNavButtonStyle,
                background: tab === item.id ? "#111827" : "white",
                color: tab === item.id ? "white" : "#111827",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={drawerSectionStyle}>
          <div style={drawerLabelStyle}>Department</div>
          {departments.map((department) => (
            <button
              key={department}
              onClick={() => setDepartmentFilter(department)}
              style={{
                ...drawerNavButtonStyle,
                background: departmentFilter === department ? "#eff6ff" : "white",
                color: "#111827",
                border:
                  departmentFilter === department
                    ? "1px solid #93c5fd"
                    : "1px solid #e2e8f0",
              }}
            >
              {department}
            </button>
          ))}
        </div>

        <div style={drawerSectionStyle}>
          <div style={drawerLabelStyle}>Role View</div>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setRoleView(role)}
              style={{
                ...drawerNavButtonStyle,
                background: roleView === role ? "#111827" : "white",
                color: roleView === role ? "white" : "#111827",
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

const drawerBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.35)",
  zIndex: 20,
};

const drawerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 310,
  maxWidth: "85vw",
  height: "100vh",
  background: "#f8fafc",
  zIndex: 30,
  padding: 16,
  boxShadow: "8px 0 24px rgba(0,0,0,0.18)",
  overflowY: "auto",
};

const drawerHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const closeButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
  fontSize: 24,
  cursor: "pointer",
};

const drawerSectionStyle: React.CSSProperties = {
  marginTop: 16,
};

const drawerLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
};

const drawerNavButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  marginBottom: 8,
  fontWeight: 800,
  textAlign: "left",
  cursor: "pointer",
};