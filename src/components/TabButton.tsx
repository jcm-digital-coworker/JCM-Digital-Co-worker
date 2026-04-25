export default function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
    onClick={onClick}
    style={{
      flex: "1 1 30%",
      padding: "10px 8px",
      borderRadius: 12,
      border: active ? "1px solid #111827" : "1px solid #d1d5db",
      background: active ? "#111827" : "white",
      color: active ? "white" : "#111827",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
      {children}
    </button>
  );
}