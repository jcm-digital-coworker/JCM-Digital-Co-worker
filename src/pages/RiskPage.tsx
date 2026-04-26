import type { CSSProperties } from "react";
import type { RiskItem } from "../types/risk";
import type { RoleView } from "../types/app";

export default function RiskPage({
  risks,
  roleView,
}: {
  risks: RiskItem[];
  roleView: RoleView;
}) {
  const openRisks = risks.filter((risk) => risk.signoffStatus !== "Signed");

  return (
    <div>
      <div style={{ ...cardStyle, textAlign: "center", background: "#eff6ff" }}>
        <h3 style={{ marginTop: 0 }}>Risk / Signoffs</h3>
        <p style={{ color: "#1e3a8a" }}>
          Current role: {roleView}. Read-only signoff workflow preview.
        </p>

        <div style={statGridStyle}>
          <RiskStat label="Open Risks" value={String(openRisks.length)} />
          <RiskStat
            label="High Risk"
            value={String(
              openRisks.filter(
                (r) => r.level === "HIGH_RISK" || r.level === "STOP"
              ).length
            )}
          />
          <RiskStat
            label="Pending"
            value={String(openRisks.filter((r) => r.signoffStatus === "Pending").length)}
          />
        </div>
      </div>

      {openRisks.length === 0 && (
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <h3 style={{ marginTop: 0 }}>No Open Risks</h3>
          <p style={{ color: "#64748b" }}>No pending signoff items for this department.</p>
        </div>
      )}

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
        <strong>Source:</strong> {risk.source}
      </p>

      <p style={{ color: "#64748b", marginTop: 6, marginBottom: 0 }}>
        <strong>Signoff:</strong> {risk.requiredSignoff} · {risk.signoffStatus}
      </p>
    </div>
  );
}

function RiskStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{value}</div>
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