import React, { useMemo, useState } from "react";
import { Gauge, Search, AlertTriangle, FileText } from "lucide-react";
import { C, MONO, SANS } from "../theme.js";
import { Panel, Stat } from "../components.jsx";
import cap from "../../westend/Stoddert_WestEnd_DesignBasis_Capture.json";

/* ---------------------------------------------------------------------------
 * West End Cafeteria — Design-Basis Controls dashboard.
 * Reads the synthesized design-basis capture (westend/…Capture.json) — the same
 * artifact produced by the extraction — and presents it as a browsable,
 * filterable controls snapshot. This is the in-app view of a DESIGN-BASIS /
 * SYNTHETIC snapshot; it is NOT observed field data. Every value carries a
 * provenance tag: V (verbatim drawing setpoint) · DERIVED (computed from the
 * SOO at the scenario) · ILLUS (illustrative live magnitude, non-authoritative).
 * ------------------------------------------------------------------------- */

const PROV = {
  V: { c: C.green, label: "V — verbatim setpoint" },
  DERIVED: { c: C.blue, label: "DERIVED — from SOO" },
  ILLUS: { c: C.amber, label: "ILLUS — illustrative" },
};

// Friendly names for the element/system tokens used in the capture.
const SYS = {
  "MTR-WE": "Metering (M-1…M-5, gas, water)",
  "GEO-LOOP": "Geo / condenser-water loop (existing tie)",
  WSHP: "Water-source heat pumps · WSHP-CA-01…04",
  "DOAS-CA-1": "DOAS-CA-1 (enthalpy wheel + WSHP/DX + reheat)",
  "VAV-CA": "VAV terminals (cafeteria, CO₂/DCV)",
  CAR: "Constant Air Flow Regulators (CAFR)",
  SCR1: "VAV box w/ electric heat (SCR)",
  BYPVAV: "Bypass VAV box",
  "ERAHU-1": "(E)ERAHU-1 retrofit (existing bldg)",
  VRF: "VRF — BAS monitor/alarm only (existing bldg)",
  WALKIN: "Walk-in cooler 1416-A / freezer 1416-B",
  EH1: "Electric unit heaters",
  KITCHEN: "Kitchen hood / MAU / grease exhaust",
};

// Carried discrepancy flags (from token_map.md §4.2) — surfaced for visibility.
const FLAGS = [
  ["W1", "WSHP mfrs = Daikin / Climate Master / Trane (§238146), not the brief's East-End list."],
  ["W2", "Instrument ranges: condenser-water RTD 0–120 °F (§230923.27); pressure −300…300 psig adj (§230923.23) — not 0–150 °F / 0–100 psi."],
  ["W3", "M501B detail numbering: 05 = SCR VAV, 06 = VRF, 07 = (E)ERAHU-1."],
  ["W4", "DOAS coil: §237343.16 specs hydronic; M502B shows WSHP/DX coil + hot-gas reheat (drawing governs)."],
  ["W5", "Kitchen VFD-1/2 swapped between 04/M503B diagram and points list."],
  ["W7", "GWS/GWR letters shared with East End — kept in separate scopes, never merged."],
  ["W8", "Electric submeters: M-1 HVAC / M-2 Lighting / M-3 Plug / M-4 Kitchen / M-5 DOAS."],
  ["W10", "VRF = existing-building renovation (no VRF on cafeteria sheets); WSHP/DOAS/geo = addition."],
  ["W11", "'CD' = condensate drain (no M121B legend); condenser water is GWS/GWR."],
  ["W13", "Two distinct BTU-1: DOAS coil energy vs loop 'Addition Condenser Water BTU Meter'."],
];

const chip = (bg, fg, text, key) => (
  <span key={key} style={{
    display: "inline-block", padding: "1px 7px", borderRadius: 999, fontSize: 10.5,
    fontFamily: MONO, fontWeight: 700, color: fg, background: `${bg}22`,
    border: `1px solid ${bg}66`, whiteSpace: "nowrap",
  }}>{text}</span>
);

export default function WestEndControlsTwin() {
  const points = cap.points || [];
  const [q, setQ] = useState("");
  const [prov, setProv] = useState("ALL");
  const [sys, setSys] = useState("ALL");

  const counts = useMemo(() => {
    const c = { V: 0, DERIVED: 0, ILLUS: 0 };
    points.forEach((p) => { c[p.provenance] = (c[p.provenance] || 0) + 1; });
    return c;
  }, [points]);

  const systems = useMemo(() => {
    const m = new Map();
    points.forEach((p) => m.set(p.element, (m.get(p.element) || 0) + 1));
    return [...m.entries()];
  }, [points]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return points.filter((p) => {
      if (prov !== "ALL" && p.provenance !== prov) return false;
      if (sys !== "ALL" && p.element !== sys) return false;
      if (needle) {
        const hay = `${p.token} ${p.bas_name} ${p.element} ${p.sequence_ref || ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [points, q, prov, sys]);

  const btn = (active, onClick, children, color) => (
    <button onClick={onClick} style={{
      cursor: "pointer", border: `1px solid ${active ? (color || C.blue) : C.line}`,
      background: active ? `${color || C.blue}1f` : C.box, color: active ? C.ink : C.txt2,
      borderRadius: 7, padding: "5px 10px", fontFamily: MONO, fontSize: 11.5, fontWeight: 600,
    }}>{children}</button>
  );

  return (
    <div style={{ padding: "16px", color: C.ink, fontFamily: SANS }}>
      {/* DESIGN-BASIS banner — must never read as observed field data */}
      <div style={{
        background: "rgba(245,166,35,0.10)", border: `1px solid ${C.amber}66`,
        borderRadius: 10, padding: "10px 13px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <AlertTriangle size={16} color={C.amber} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12, lineHeight: 1.5, color: C.lab }}>
          <b style={{ color: C.amber }}>DESIGN-BASIS / SYNTHETIC SNAPSHOT — DERIVED FROM DRAWINGS, NOT OBSERVED FIELD DATA.</b>{" "}
          No West End enteliWEB field capture exists. Every value is tagged{" "}
          {chip(C.green, C.green, "V")} {chip(C.blue, C.blue, "DERIVED")} {chip(C.amber, C.amber, "ILLUS")}.{" "}
          <span style={{ color: C.txt2 }}>Scenario: {cap.scenario}</span>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
        <Stat label="Points" value={points.length} />
        <Stat label="[V] verbatim" value={counts.V} color={C.green} />
        <Stat label="[DERIVED]" value={counts.DERIVED} color={C.blue} />
        <Stat label="[ILLUS]" value={counts.ILLUS} color={C.amber} />
        <Stat label="Systems" value={systems.length} />
        <Stat label="VRF BAS pts" value={(systems.find((s) => s[0] === "VRF") || [, 0])[1]} color={C.geo} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 300px) 1fr", gap: 14, alignItems: "start" }}>
        {/* Left rail: systems + flags */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel icon={Gauge} title="Systems (click to filter)">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <button onClick={() => setSys("ALL")} style={{
                textAlign: "left", cursor: "pointer", borderRadius: 7, padding: "6px 9px",
                border: `1px solid ${sys === "ALL" ? C.blue : C.line}`,
                background: sys === "ALL" ? `${C.blue}1f` : C.box, color: C.ink, fontSize: 12,
              }}>All systems <span style={{ color: C.unit, fontFamily: MONO }}>· {points.length}</span></button>
              {systems.map(([el, n]) => (
                <button key={el} onClick={() => setSys(el)} title={SYS[el] || el} style={{
                  textAlign: "left", cursor: "pointer", borderRadius: 7, padding: "6px 9px",
                  border: `1px solid ${sys === el ? C.blue : C.line}`,
                  background: sys === el ? `${C.blue}1f` : C.box, color: sys === el ? C.ink : C.lab, fontSize: 11.5,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{SYS[el] || el}</span>
                    <span style={{ color: C.unit, fontFamily: MONO }}>{n}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel icon={AlertTriangle} title="Carried flags (token_map §4.2)">
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {FLAGS.map(([id, txt]) => (
                <div key={id} style={{ fontSize: 11, lineHeight: 1.45, color: C.lab }}>
                  <span style={{ fontFamily: MONO, color: C.amber, fontWeight: 700 }}>FLAG-{id}</span> · {txt}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right: filters + points table */}
        <Panel icon={FileText} title={`Points — ${rows.length} shown`} right={
          <span style={{ fontSize: 10.5, color: C.dim, fontFamily: MONO }}>{cap.status}</span>
        }>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
            <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
              <Search size={13} color={C.dim} style={{ position: "absolute", left: 9, top: 9 }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search token / name / sequence…"
                style={{
                  width: "100%", background: C.box, border: `1px solid ${C.line}`, borderRadius: 7,
                  padding: "7px 9px 7px 28px", color: C.ink, fontFamily: MONO, fontSize: 12,
                }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {btn(prov === "ALL", () => setProv("ALL"), "ALL")}
              {btn(prov === "V", () => setProv("V"), "V", C.green)}
              {btn(prov === "DERIVED", () => setProv("DERIVED"), "DERIVED", C.blue)}
              {btn(prov === "ILLUS", () => setProv("ILLUS"), "ILLUS", C.amber)}
            </div>
          </div>

          <div style={{ overflow: "auto", maxHeight: 560, border: `1px solid ${C.line}`, borderRadius: 9 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, background: C.panel2, zIndex: 1 }}>
                  {["Token", "Description", "Type", "Cmd", "Status", "Value", "Setpoint", "Prov"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 9px", color: C.dim, fontSize: 10,
                      letterSpacing: 0.5, textTransform: "uppercase", borderBottom: `1px solid ${C.line}`, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => {
                  const pr = PROV[p.provenance] || { c: C.dim };
                  return (
                    <tr key={p.token + i} title={p.basis ? `${p.basis}${p.sequence_ref ? "\n\n" + p.sequence_ref : ""}` : p.sequence_ref || ""}
                      style={{ borderBottom: `1px solid ${C.soft}`, background: i % 2 ? "transparent" : "rgba(120,140,175,0.03)" }}>
                      <td style={{ padding: "6px 9px", fontFamily: MONO, color: C.teal, whiteSpace: "nowrap" }}>{p.token}</td>
                      <td style={{ padding: "6px 9px", color: C.lab, minWidth: 180 }}>{p.bas_name}</td>
                      <td style={{ padding: "6px 9px", fontFamily: MONO, color: C.txt2 }}>{p.point_type || "—"}</td>
                      <td style={{ padding: "6px 9px", fontFamily: MONO, color: C.txt2, whiteSpace: "nowrap" }}>{p.command || "—"}</td>
                      <td style={{ padding: "6px 9px", fontFamily: MONO, color: C.txt2, whiteSpace: "nowrap" }}>{p.status || "—"}</td>
                      <td style={{ padding: "6px 9px", fontFamily: MONO, color: C.ink, whiteSpace: "nowrap" }}>{p.value ?? "—"}</td>
                      <td style={{ padding: "6px 9px", fontFamily: MONO, color: C.yellow, whiteSpace: "nowrap" }}>{p.setpoint || "—"}</td>
                      <td style={{ padding: "6px 9px", whiteSpace: "nowrap" }}>{chip(pr.c, pr.c, p.provenance)}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 18, textAlign: "center", color: C.dim }}>No points match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 8, fontSize: 10.5, color: C.txt2, lineHeight: 1.5 }}>
            Hover a row for its derivation basis + sequence reference. Full extraction (SOO, points list, io_matrix, coverage,
            tag cross-map) lives in <span style={{ fontFamily: MONO, color: C.lab }}>westend/</span> in the repo. VRF rows are the
            BAS-visible monitor/alarm points only — all compressor/refrigerant/defrost logic is factory-controlled (iTouch), not in BAS.
          </div>
        </Panel>
      </div>
    </div>
  );
}
