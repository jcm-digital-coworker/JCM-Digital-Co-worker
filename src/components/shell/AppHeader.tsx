export default function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
      <header style={topShellStyle}>
        <button onClick={onMenuClick} style={menuButtonStyle}>
          ☰
        </button>
  
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={appTitleStyle}>JCM Digital Co-worker</h1>
          <p style={appSubtitleStyle}>
            Plant-wide machine, maintenance, simulation, and documentation companion
          </p>
        </div>
      </header>
    );
  }
  
  const topShellStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 12,
    borderRadius: 18,
    background: "white",
    border: "1px solid #e2e8f0",
  };
  
  const menuButtonStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#111827",
    color: "white",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
  };
  
  const appTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.1,
  };
  
  const appSubtitleStyle: React.CSSProperties = {
    color: "#64748b",
    margin: "5px 0 0 0",
    fontSize: 13,
    lineHeight: 1.35,
  };