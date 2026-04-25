import type { Machine } from "../types/machine";

function getStateStyle(state: Machine["state"]) {
  if (state === "RUNNING") return { background: "#dcfce7", color: "#166534", border: "#86efac" };
  if (state === "IDLE") return { background: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  if (state === "ALARM") return { background: "#fee2e2", color: "#b91c1c", border: "#fca5a5" };
  return { background: "#e5e7eb", color: "#374151", border: "#d1d5db" };
}

export default function StatusBadge({ state }: { state: Machine["state"] }) {
  const style = getStateStyle(state);

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {state}
    </span>
  );
}