import type { Machine } from "../types/machine";
import {
  getLikelyIssueSummary,
  getOperatorRisks,
  getSuggestedChecks,
} from "../logic/warnings";
import StatusBadge from "./StatusBadge";

type DetailTab = "overview" | "setup" | "history" | "notes";

type HistoryEntry = {
  date: string;
  type: "PART" | "SETUP" | "TOOL" | "PROGRAM" | "FIXTURE" | "MAINTENANCE";
  title: string;
  note: string;
};

type QuickNote = {
  category: "MACHINE_ISSUE" | "FIXTURING" | "PROGRAM_TOOL" | "MAINTENANCE";
  title: string;
  note: string;
};

const machineHistory: Record<string, HistoryEntry[]> = {
  "1": [
    {
      date: "2026-04-20",
      type: "TOOL",
      title: "Roughing tool change",
      note: "T12 roughing tool replaced after rising spindle load trend.",
    },
    {
      date: "2026-04-19",
      type: "PART",
      title: "Housing family run",
      note: "Stable until deeper roughing engagement near pocket entry.",
    },
  ],
  "3": [
    {
      date: "2026-04-22",
      type: "SETUP",
      title: "Manual touch-off adjustment",
      note: "Operator re-touched Z0 after prior dimension drift concern.",
    },
    {
      date: "2026-04-21",
      type: "TOOL",
      title: "Heavy boring head loaded",
      note: "T08 installed; alignment sensitivity noted after tool change.",
    },
  ],
  "7": [
    {
      date: "2026-04-24",
      type: "PROGRAM",
      title: "JCM suite simulator added",
      note: "Read-only simulator available for casting, tap code, batch, geometry, and fixture clearance validation.",
    },
  ],
  "8": [
    {
      date: "2026-04-24",
      type: "PROGRAM",
      title: "JCM suite simulator added",
      note: "Read-only simulator available for casting, tap code, batch, geometry, and fixture clearance validation.",
    },
  ],
};

const quickNotes: Record<string, QuickNote[]> = {
  "1": [
    {
      category: "MACHINE_ISSUE",
      title: "Watch overload near entry",
      note: "This machine tends to spike under deeper roughing engagement before full alarm if tooling gets tired.",
    },
  ],
  "3": [
    {
      category: "MACHINE_ISSUE",
      title: "Touch-off discipline matters",
      note: "Bad touch-off can create dimension drift or crash risk. Verify active tool offset and Z0 before running.",
    },
    {
      category: "FIXTURING",
      title: "Fixture cleanliness",
      note: "Clean fixture contact surfaces and confirm setup after interruptions or part-family changes.",
    },
  ],
  "7": [
    {
      category: "PROGRAM_TOOL",
      title: "JCM macro suite",
      note: "Use the LV4500 JCM simulator before running questionable casting/tap combinations.",
    },
    {
      category: "FIXTURING",
      title: "1.5 inch fixture limit",
      note: "Any simulated prep/thread depth near 1.5 inches needs attention before running.",
    },
  ],
  "8": [
    {
      category: "PROGRAM_TOOL",
      title: "JCM macro suite",
      note: "Use the LV4500 JCM simulator before running questionable casting/tap combinations.",
    },
    {
      category: "FIXTURING",
      title: "1.5 inch fixture limit",
      note: "Any simulated prep/thread depth near 1.5 inches needs attention before running.",
    },
  ],
};

export default function MachineDetail({
  machine,
  detailTab,
  setDetailTab,
  onBack,
}: {
  machine: Machine;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  onBack: () => void;
}) {
  const risks = getOperatorRisks(machine);
  const likelyIssue = getLikelyIssueSummary(machine);
  const checks = getSuggestedChecks(machine);
  const confidence = getSetupConfidence(machine);
  const history = machineHistory[machine.id] ?? [];
  const notes = quickNotes[machine.id] ?? [];

  return (
    <div style={pageStyle}>
      <button onClick={onBack} style={backButtonStyle}>
        ← Back
      </button>

      <div style={shellStyle}>
        <div style={heroCardStyle}>
          <h2 style={{ margin: 0 }}>{machine.name}</h2>
          <p style={{ color: "#64748b", marginBottom: 12 }}>
            {machine.department} · {machine.control} · {machine.suite}
          </p>

          <StatusBadge state={machine.state} />

          <div style={subTabBarStyle}>
            <SubTab active={detailTab === "overview"} onClick={() => setDetailTab("overview")}>
              Overview
            </SubTab>
            <SubTab active={detailTab === "setup"} onClick={() => setDetailTab("setup")}>
              Setup
            </SubTab>
            <SubTab active={detailTab === "history"} onClick={() => setDetailTab("history")}>
              History
            </SubTab>
            <SubTab active={detailTab === "notes"} onClick={() => setDetailTab("notes")}>
              Notes
            </SubTab>
          </div>

          {detailTab === "overview" && (
            <>
              <InfoGrid>
                <InfoTile label="Program" value={machine.program} />
                <InfoTile
                  label="Last Tool"
                  value={`${machine.lastTool.toolNumber} - ${machine.lastTool.description}`}
                />
                <InfoTile label="Last Known State" value={machine.lastKnownState} />
                <InfoTile label="Simulation" value={machine.simulationSummary} />
              </InfoGrid>

              <Panel title="Behavior Tags">
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {machine.behaviorTags.map((tag) => (
                    <span key={tag} style={{ ...tagStyle(tag) }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </Panel>

              {risks.length > 0 && (
                <Panel title="Operator Risk Panel" background="#fff7ed" border="#fdba74">
                  {risks.map((risk, index) => (
                    <p key={index} style={{ color: "#9a3412" }}>
                      • {risk}
                    </p>
                  ))}
                </Panel>
              )}

              <Panel title="Likely Issue Summary" background="#f8fafc" border="#cbd5e1">
                <p style={textStyle}>{likelyIssue}</p>
              </Panel>

              {checks.length > 0 && (
                <Panel title="Suggested Checks" background="#ecfeff" border="#67e8f9">
                  {checks.map((check, index) => (
                    <p key={index} style={textStyle}>
                      • {check}
                    </p>
                  ))}
                </Panel>
              )}

              {machine.recentSpindleLoad.length > 0 && (
                <Panel title="Recent Spindle Load" background="#fafaf9" border="#d6d3d1">
                  {machine.recentSpindleLoad.map((entry, index) => (
                    <LoadBar
                      key={index}
                      label={entry.label}
                      percent={entry.percent}
                      time={entry.time}
                    />
                  ))}
                </Panel>
              )}

              {machine.recentEvents.length > 0 && (
                <Panel title="Recent Events">
                  {machine.recentEvents.map((event, index) => (
                    <div key={index} style={eventRowStyle}>
                      <strong>{event.time}</strong>
                      <span>{event.type}</span>
                      <span>{event.text}</span>
                    </div>
                  ))}
                </Panel>
              )}

              {machine.sourcedNotes.length > 0 && (
                <Panel title="Equipment Notes" background="#eff6ff" border="#93c5fd">
                  {machine.sourcedNotes.map((note, index) => (
                    <p key={index} style={{ ...textStyle, color: "#1e3a8a" }}>
                      • {note}
                    </p>
                  ))}
                </Panel>
              )}
            </>
          )}

          {detailTab === "setup" && (
            <>
              <Panel title="Operator / Setup Confidence" background="#f8fafc" border="#cbd5e1">
                <div style={{ textAlign: "center" }}>
                  <span style={confidencePillStyle(confidence.score)}>
                    {confidence.label} Confidence
                  </span>
                  <div style={{ fontSize: 28, fontWeight: 900, marginTop: 10 }}>
                    {confidence.score}/100
                  </div>
                </div>

                <div style={meterTrackStyle}>
                  <div
                    style={{
                      height: "100%",
                      width: `${confidence.score}%`,
                      background:
                        confidence.score >= 75
                          ? "#16a34a"
                          : confidence.score >= 50
                          ? "#d97706"
                          : "#dc2626",
                    }}
                  />
                </div>

                {confidence.reasons.map((reason, index) => (
                  <p key={index} style={textStyle}>
                    • {reason}
                  </p>
                ))}
              </Panel>

              <Panel title="What this means" background="#ecfeff" border="#67e8f9">
                <p style={{ ...textStyle, color: "#164e63" }}>
                  This score is a simple readiness indicator. It does not control the machine.
                  It helps decide how much setup attention is needed before running or restarting.
                </p>
              </Panel>
            </>
          )}

          {detailTab === "history" && (
            <>
              <Panel title="Part / Setup History">
                {history.length === 0 ? (
                  <p style={textStyle}>No seeded history yet for this machine.</p>
                ) : (
                  history.map((entry, index) => (
                    <HistoryCard key={index} entry={entry} />
                  ))
                )}
              </Panel>
            </>
          )}

          {detailTab === "notes" && (
            <>
              <Panel title="Quick Notes">
                {notes.length === 0 ? (
                  <p style={textStyle}>No quick notes yet for this machine.</p>
                ) : (
                  notes.map((note, index) => <NoteCard key={index} note={note} />)
                )}
              </Panel>

              <Panel title="Future Use" background="#ecfeff" border="#67e8f9">
                <p style={{ ...textStyle, color: "#164e63" }}>
                  Later this can become editable shop memory: machine issues, fixture guidance,
                  program/tool changes, and maintenance notes.
                </p>
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getSetupConfidence(machine: Machine) {
  let score = 85;
  const reasons: string[] = [];

  if (machine.behaviorTags.includes("Setup-Sensitive")) {
    score -= 20;
    reasons.push("Machine is setup-sensitive.");
  }

  if (machine.behaviorTags.includes("Operator-Dependent")) {
    score -= 15;
    reasons.push("Operator handoff/setup discipline affects outcomes.");
  }

  if (machine.behaviorTags.includes("Tooling-Sensitive")) {
    score -= 10;
    reasons.push("Tooling condition and seating have above-normal impact.");
  }

  if (machine.lastTool.weight === "HEAVY") {
    score -= 10;
    reasons.push("Heavy tool increases setup/alignment risk.");
  }

  if (machine.recentEvents.some((e) => e.type === "TOOL_CHANGE")) {
    score -= 10;
    reasons.push("Recent tool change reduces confidence until stable cycle is confirmed.");
  }

  if (machine.state === "ALARM") {
    score -= 15;
    reasons.push("Alarm state lowers setup confidence.");
  }

  if (machine.state === "OFFLINE") {
    score -= 20;
    reasons.push("Offline state lowers trust in current machine context.");
  }

  score = Math.max(0, score);

  let label = "High";
  if (score < 75) label = "Moderate";
  if (score < 50) label = "Low";

  if (reasons.length === 0) reasons.push("No major setup risk factors are currently flagged.");

  return { score, label, reasons };
}

function SubTab({
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
        flex: 1,
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

function Panel({
  title,
  children,
  background = "white",
  border = "#e2e8f0",
}: {
  title: string;
  children: React.ReactNode;
  background?: string;
  border?: string;
}) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 16,
        border: `1px solid ${border}`,
        background,
      }}
    >
      <h3 style={{ marginTop: 0, textAlign: "center" }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10,
        marginTop: 16,
      }}
    >
      {children}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoTileStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value}</div>
    </div>
  );
}

function LoadBar({ label, percent, time }: { label: string; percent: number; time: string }) {
  const color = percent >= 90 ? "#dc2626" : percent >= 70 ? "#ea580c" : "#2563eb";

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <strong>{label}</strong>
        <span>{percent}% · {time}</span>
      </div>
      <div style={meterTrackStyle}>
        <div style={{ width: `${percent}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  return (
    <div style={miniCardStyle}>
      <strong>{entry.title}</strong>
      <div style={{ color: "#64748b", marginTop: 4 }}>
        {entry.date} · {entry.type}
      </div>
      <p style={textStyle}>{entry.note}</p>
    </div>
  );
}

function NoteCard({ note }: { note: QuickNote }) {
  return (
    <div style={miniCardStyle}>
      <strong>{note.title}</strong>
      <div style={{ color: "#64748b", marginTop: 4 }}>{note.category}</div>
      <p style={textStyle}>{note.note}</p>
    </div>
  );
}

function tagStyle(tag: string): React.CSSProperties {
  if (tag === "Stable Runner") return { background: "#dcfce7", color: "#166534", ...pillBase };
  if (tag === "Setup-Sensitive") return { background: "#fef3c7", color: "#92400e", ...pillBase };
  if (tag === "Operator-Dependent") return { background: "#dbeafe", color: "#1d4ed8", ...pillBase };
  if (tag === "Maintenance-Heavy") return { background: "#fee2e2", color: "#b91c1c", ...pillBase };
  if (tag === "Tooling-Sensitive") return { background: "#ffedd5", color: "#c2410c", ...pillBase };
  return { background: "#e5e7eb", color: "#374151", ...pillBase };
}

function confidencePillStyle(score: number): React.CSSProperties {
  if (score >= 75) return { background: "#dcfce7", color: "#166534", border: "1px solid #86efac", ...pillBase };
  if (score >= 50) return { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", ...pillBase };
  return { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", ...pillBase };
}

const pageStyle: React.CSSProperties = {
  padding: 20,
  fontFamily: "Arial, sans-serif",
  background: "#f8fafc",
  minHeight: "100vh",
};

const shellStyle: React.CSSProperties = {
  maxWidth: 950,
  margin: "0 auto",
};

const heroCardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 18,
  padding: 16,
  background: "white",
  textAlign: "center",
};

const subTabBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  width: "100%",
  marginTop: 16,
};

const backButtonStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const textStyle: React.CSSProperties = {
  color: "#334155",
  lineHeight: 1.5,
};

const eventRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "70px 110px 1fr",
  gap: 10,
  textAlign: "left",
  marginTop: 8,
  color: "#334155",
};

const meterTrackStyle: React.CSSProperties = {
  marginTop: 8,
  height: 10,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
};

const miniCardStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  background: "white",
};

const infoTileStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 10,
  background: "#f8fafc",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const infoValueStyle: React.CSSProperties = {
  marginTop: 5,
  fontWeight: 800,
  color: "#111827",
};

const pillBase: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};