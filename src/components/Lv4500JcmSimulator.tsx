import { useState } from "react";
import { implementedCastings, tapCodeTable } from "../data/lv4500JcmSuite";
import { estimateLv4500CycleTime } from "../logic/lv4500JcmCycleTime";
import { runLv4500Geometry, runLv4500Logic } from "../logic/lv4500JcmSimulator";
import type { GeometryResult, LogicResult } from "../types/lv4500Jcm";

type LvTab = "setup" | "results" | "audit" | "geometry" | "docs";

export default function Lv4500JcmSimulator() {
  const [activeTab, setActiveTab] = useState<LvTab>("setup");
  const [castingNumber, setCastingNumber] = useState(implementedCastings[0].castingNumber);
  const [tapCode, setTapCode] = useState(tapCodeTable[0].code);
  const [batchTarget, setBatchTarget] = useState(50);

  const [logicResult, setLogicResult] = useState<LogicResult | null>(null);
  const [geometryResult, setGeometryResult] = useState<GeometryResult | null>(null);
  const [cycleTime, setCycleTime] = useState<ReturnType<typeof estimateLv4500CycleTime> | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const selectedCasting = implementedCastings.find((c) => c.castingNumber === castingNumber);
  const selectedTap = tapCodeTable.find((t) => t.code === tapCode);

  function runSimulation() {
    const logic = runLv4500Logic({
      castingNumber,
      tapCode,
      batchTarget,
      actualCount: 0,
      gaugeCount: 0,
      interruptFlag: false,
      warmupDone: true,
      proveOutMode: false,
      bossType: selectedCasting?.bossType ?? "large",
    });

    const geometry = runLv4500Geometry(castingNumber, tapCode);
    const time = estimateLv4500CycleTime(tapCode);

    setLogicResult(logic);
    setGeometryResult(geometry);
    setCycleTime(time);
    setHasRun(true);
    setActiveTab("results");
  }

  function clearResults() {
    setLogicResult(null);
    setGeometryResult(null);
    setCycleTime(null);
    setHasRun(false);
    setActiveTab("setup");
  }

  const auditRows = buildAuditRows();

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>LV4500 JCM Suite Simulator</h2>
        <p style={subTextStyle}>
          Read-only simulator based on the current macro suite. It validates logic and geometry only.
        </p>

        <div style={tabBarStyle}>
          <MiniTab active={activeTab === "setup"} onClick={() => setActiveTab("setup")}>Setup</MiniTab>
          <MiniTab active={activeTab === "results"} onClick={() => setActiveTab("results")}>Results</MiniTab>
          <MiniTab active={activeTab === "audit"} onClick={() => setActiveTab("audit")}>Audit</MiniTab>
          <MiniTab active={activeTab === "geometry"} onClick={() => setActiveTab("geometry")}>Geometry</MiniTab>
          <MiniTab active={activeTab === "docs"} onClick={() => setActiveTab("docs")}>Docs</MiniTab>
        </div>

        {activeTab === "setup" && (
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Job Setup</h3>

            <label style={labelStyle}>Casting</label>
            <select value={castingNumber} onChange={(e) => setCastingNumber(e.target.value)} style={inputStyle}>
              {implementedCastings.map((c) => (
                <option key={c.castingNumber} value={c.castingNumber}>
                  {c.lastThree} — {c.displayName} — {c.bossType}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Tap Code</label>
            <select value={tapCode} onChange={(e) => setTapCode(e.target.value)} style={inputStyle}>
              {tapCodeTable.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.code} — {t.label}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Batch Target</label>
            <input
              value={batchTarget}
              type="number"
              min={1}
              onChange={(e) => setBatchTarget(Number(e.target.value))}
              style={inputStyle}
            />

            <InfoGrid>
              <InfoTile label="Selected casting" value={selectedCasting?.lastThree ?? "Unknown"} />
              <InfoTile label="Boss type" value={selectedCasting?.bossType ?? "Unknown"} />
              <InfoTile label="Tap" value={selectedTap?.label ?? "Unknown"} />
            </InfoGrid>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <button onClick={runSimulation} style={runButtonStyle}>
                Run / Validate
              </button>

              <button onClick={clearResults} style={resetButtonStyle}>
                Clear Results
              </button>
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <>
            {!hasRun && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>No Results Yet</h3>
                <p style={subTextStyle}>Go to Setup, choose casting/tap/batch, then run validation.</p>
              </div>
            )}

            {logicResult && (
              <div style={{ ...cardStyle, ...statusTint(logicResult.status) }}>
                <h3 style={cardTitleStyle}>Logic Result</h3>
                <StatusPill status={logicResult.status} />

                <InfoGrid>
                  <InfoTile label="Result" value={logicResult.valid ? "Valid setup" : "Rejected setup"} />
                  <InfoTile label="Gauge required" value={logicResult.gaugeRequired ? "YES" : "NO"} />
                  <InfoTile label="Thread mode" value={threadModeLabel(logicResult.adaptiveThreadMode)} />
                  <InfoTile label="#3901 next" value={String(logicResult.nextActualCount)} />
                  <InfoTile label="#550 remaining" value={String(logicResult.remainingCount)} />
                </InfoGrid>

                <p style={{ textAlign: "center", color: "#334155" }}>
                  <strong>Next path:</strong> {logicResult.nextProgramPath}
                </p>

                <MessageList status={logicResult.status} messages={logicResult.messages} />
              </div>
            )}

            {geometryResult && (
              <div style={{ ...cardStyle, ...statusTint(geometryResult.status) }}>
                <h3 style={cardTitleStyle}>Geometry Result</h3>
                <StatusPill status={geometryResult.status} />

                <InfoGrid>
                  <InfoTile label="Max depth" value={`${geometryResult.maxDepth.toFixed(3)} in`} />
                  <InfoTile label="Fixture margin" value={`${geometryResult.fixtureMargin.toFixed(3)} in`} />
                  <InfoTile label="Drill" value={geometryResult.drillZ.toFixed(3)} />
                  <InfoTile label="Bore taper" value={geometryResult.boreTaperZ.toFixed(3)} />
                  <InfoTile label="Relief" value={geometryResult.reliefZ.toFixed(3)} />
                  <InfoTile label="Thread end" value={geometryResult.threadEndZ.toFixed(3)} />
                  <InfoTile label="G76 R" value={geometryResult.g76R.toFixed(4)} />
                </InfoGrid>

                <DepthBar label="Max depth vs 1.5 inch fixture limit" depth={geometryResult.maxDepth} />
                <MessageList status={geometryResult.status} messages={geometryResult.messages} />
              </div>
            )}

            {cycleTime && (
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>Estimated Cycle Time</h3>
                <InfoGrid>
                  <InfoTile label="Total" value={`~${cycleTime.totalMinutes.toFixed(1)} min`} />
                  <InfoTile label="Cutting" value={`${cycleTime.cuttingMinutes.toFixed(1)} min`} />
                  <InfoTile label="Rapid" value={`${cycleTime.rapidMinutes.toFixed(1)} min`} />
                  <InfoTile label="Overhead" value={`${cycleTime.overheadMinutes.toFixed(1)} min`} />
                  <InfoTile label="Confidence" value={cycleTime.confidence} />
                </InfoGrid>

                {cycleTime.notes.map((note, i) => (
                  <p key={i} style={{ color: "#475569", margin: "8px 0", lineHeight: 1.45 }}>
                    • {note}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "audit" && (
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Combination Audit</h3>
            <p style={subTextStyle}>
              Runs all implemented castings against tap codes 06–16 and flags rejects.
            </p>

            <InfoGrid>
              <InfoTile label="Total combos" value={String(auditRows.length)} />
              <InfoTile label="Pass" value={String(auditRows.filter((r) => r.status !== "FAIL").length)} />
              <InfoTile label="Fail" value={String(auditRows.filter((r) => r.status === "FAIL").length)} />
              <InfoTile
                label="Small boss rejects"
                value={String(auditRows.filter((r) => r.reason.includes("Small boss")).length)}
              />
            </InfoGrid>

            <div style={{ overflowX: "auto", marginTop: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <Th>Casting</Th>
                    <Th>Boss</Th>
                    <Th>Tap</Th>
                    <Th>Status</Th>
                    <Th>Max Depth</Th>
                    <Th>Margin</Th>
                    <Th>Reason</Th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.map((row, i) => (
                    <tr key={`${row.casting}-${row.tap}-${i}`}>
                      <Td>{row.casting}</Td>
                      <Td>{row.boss}</Td>
                      <Td>{row.tap}</Td>
                      <Td>
                        <span style={smallPill(row.status)}>{row.status}</span>
                      </Td>
                      <Td>{row.maxDepth.toFixed(3)}</Td>
                      <Td>{row.margin.toFixed(3)}</Td>
                      <Td>{row.reason}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "geometry" && (
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Geometry View</h3>

            {!geometryResult ? (
              <p style={subTextStyle}>Run validation first to generate the geometry view.</p>
            ) : (
              <>
                <StatusPill status={geometryResult.status} />

                <GeometryLine label="Drill" value={geometryResult.drillZ} />
                <GeometryLine label="Bore taper" value={geometryResult.boreTaperZ} />
                <GeometryLine label="Straight relief" value={geometryResult.reliefZ} />
                <GeometryLine label="Thread end" value={geometryResult.threadEndZ} />
                <GeometryLine label="Fixture danger" value={1.5} danger />

                <DepthBar label="Fixture clearance check" depth={geometryResult.maxDepth} />

                <p style={{ color: "#475569", textAlign: "center", lineHeight: 1.45 }}>
                  This is a simple depth-based visualization. It shows whether the simulated prep/thread depth approaches the 1.5 inch fixture danger zone.
                </p>
              </>
            )}
          </div>
        )}

        {activeTab === "docs" && (
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Docs / Variable Map</h3>

            <InfoGrid>
              <InfoTile label="#121" value="Quick Load casting" />
              <InfoTile label="#122" value="Quick Load tap code" />
              <InfoTile label="#123" value="Quick Load batch target" />
              <InfoTile label="#501" value="Active casting" />
              <InfoTile label="#502" value="Active tap code" />
              <InfoTile label="#503" value="Batch target" />
              <InfoTile label="#504" value="Batch count" />
              <InfoTile label="#505" value="Gauge count" />
              <InfoTile label="#506" value="Reset breadcrumb" />
              <InfoTile label="#507" value="Interrupt flag" />
              <InfoTile label="#509" value="Warm-up date" />
              <InfoTile label="#520/#521" value="Thread profile state" />
              <InfoTile label="#550" value="Remaining count" />
              <InfoTile label="#3901" value="iHMI actual count" />
              <InfoTile label="#3902" value="iHMI target count" />
            </InfoGrid>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "#fff7ed" }}>
              <strong>Important:</strong>
              <p style={{ marginBottom: 0 }}>
                Do not use #3903. The current macro uses #550 for remaining count.
              </p>
            </div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "#eff6ff" }}>
              <strong>Read-only rule:</strong>
              <p style={{ marginBottom: 0 }}>
                This app simulates and explains the macro logic. It must not write variables, start cycles, or control the CNC.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildAuditRows() {
  const rows: {
    casting: string;
    boss: string;
    tap: string;
    status: "PASS" | "CAUTION" | "FAIL";
    maxDepth: number;
    margin: number;
    reason: string;
  }[] = [];

  for (const casting of implementedCastings) {
    for (const tap of tapCodeTable) {
      const logic = runLv4500Logic({
        castingNumber: casting.castingNumber,
        tapCode: tap.code,
        batchTarget: 1,
        actualCount: 0,
        gaugeCount: 0,
        interruptFlag: false,
        warmupDone: true,
        proveOutMode: false,
        bossType: casting.bossType,
      });

      const geometry = runLv4500Geometry(casting.castingNumber, tap.code);

      const status = logic.status === "FAIL" || geometry.status === "FAIL"
        ? "FAIL"
        : logic.status === "CAUTION" || geometry.status === "CAUTION"
        ? "CAUTION"
        : "PASS";

      const reason =
        logic.messages.find((m) => m.includes("Small boss")) ||
        geometry.messages.find((m) => m.includes("CRITICAL")) ||
        geometry.messages.find((m) => m.includes("CAUTION")) ||
        logic.messages[0] ||
        geometry.messages[0] ||
        "OK";

      rows.push({
        casting: casting.lastThree,
        boss: casting.bossType,
        tap: `${tap.code} ${tap.label}`,
        status,
        maxDepth: geometry.maxDepth,
        margin: geometry.fixtureMargin,
        reason,
      });
    }
  }

  return rows;
}

function MiniTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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

function threadModeLabel(mode: 0 | 1 | 2) {
  if (mode === 1) return "1 — Guarded";
  if (mode === 2) return "2 — Finish lock";
  return "0 — Normal";
}

function statusTint(status: "PASS" | "CAUTION" | "FAIL") {
  if (status === "PASS") return { background: "#ecfdf5", border: "1px solid #86efac" };
  if (status === "CAUTION") return { background: "#fffbeb", border: "1px solid #fcd34d" };
  return { background: "#fff1f2", border: "1px solid #fca5a5" };
}

function StatusPill({ status }: { status: "PASS" | "CAUTION" | "FAIL" }) {
  const style =
    status === "PASS"
      ? { bg: "#dcfce7", color: "#166534", border: "#86efac" }
      : status === "CAUTION"
      ? { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" }
      : { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" };

  return (
    <div style={{ textAlign: "center", marginBottom: 12 }}>
      <span
        style={{
          display: "inline-block",
          padding: "7px 12px",
          borderRadius: 999,
          fontWeight: 900,
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
        }}
      >
        {status}
      </span>
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10, marginTop: 12 }}>
      {children}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 10, background: "rgba(255,255,255,0.7)", textAlign: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ marginTop: 5, fontWeight: 800, color: "#111827" }}>{value}</div>
    </div>
  );
}

function MessageList({ status, messages }: { status: "PASS" | "CAUTION" | "FAIL"; messages: string[] }) {
  const color = status === "FAIL" ? "#b91c1c" : status === "CAUTION" ? "#92400e" : "#166534";
  return (
    <div style={{ marginTop: 12 }}>
      {messages.map((m, i) => (
        <p key={i} style={{ color, margin: "8px 0", textAlign: "center", lineHeight: 1.45 }}>• {m}</p>
      ))}
    </div>
  );
}

function DepthBar({ label, depth }: { label: string; depth: number }) {
  const percent = Math.min((depth / 1.5) * 100, 100);
  const color = depth >= 1.5 ? "#dc2626" : depth >= 1.425 ? "#ea580c" : "#2563eb";

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, gap: 12 }}>
        <strong>{label}</strong>
        <span>{depth.toFixed(3)} in</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: "#e5e7eb", overflow: "hidden", marginTop: 6 }}>
        <div style={{ height: "100%", width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}

function GeometryLine({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  const percent = Math.min((value / 1.5) * 100, 100);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <strong>{label}</strong>
        <span>{value.toFixed(3)} in</span>
      </div>
      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginTop: 5 }}>
        <div style={{ width: `${percent}%`, height: "100%", background: danger ? "#dc2626" : "#2563eb" }} />
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #cbd5e1" }}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>{children}</td>;
}

function smallPill(status: "PASS" | "CAUTION" | "FAIL"): React.CSSProperties {
  if (status === "PASS") return { padding: "4px 8px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontWeight: 800 };
  if (status === "CAUTION") return { padding: "4px 8px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontWeight: 800 };
  return { padding: "4px 8px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c", fontWeight: 800 };
}

const pageStyle: React.CSSProperties = { padding: 20, fontFamily: "Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" };
const shellStyle: React.CSSProperties = { maxWidth: 950, margin: "0 auto" };
const subTextStyle: React.CSSProperties = { color: "#64748b", textAlign: "center", lineHeight: 1.45 };
const tabBarStyle: React.CSSProperties = { display: "flex", gap: 8, width: "100%", marginTop: 16, marginBottom: 16 };
const cardStyle: React.CSSProperties = { marginTop: 16, padding: 16, borderRadius: 16, border: "1px solid #ddd", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" };
const cardTitleStyle: React.CSSProperties = { textAlign: "center", marginTop: 0 };
const labelStyle: React.CSSProperties = { display: "block", fontWeight: 800, color: "#334155", marginTop: 12 };
const inputStyle: React.CSSProperties = { display: "block", width: "100%", marginTop: 6, marginBottom: 12, padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" };
const runButtonStyle: React.CSSProperties = { flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid #111827", background: "#111827", color: "white", fontWeight: 900, cursor: "pointer" };
const resetButtonStyle: React.CSSProperties = { flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "white", color: "#111827", fontWeight: 800, cursor: "pointer" };