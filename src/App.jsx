import React, { useState } from "react";
import { Waves, GitBranch, Info, Gauge, Network } from "lucide-react";
import { C, MONO, SANS } from "./theme.js";
import CwPlantTwin from "./twins/CwPlantTwin.jsx";
import WshpHydraulicTwin from "./twins/WshpHydraulicTwin.jsx";
import WestEndControlsTwin from "./twins/WestEndControlsTwin.jsx";
import WestEndCwLoopTwin from "./twins/WestEndCwLoopTwin";

const TABS = [
  { id: "plant", label: "CW / Geo-Exchange Plant", short: "Plant", icon: Waves,
    sub: "Interactive plant twin — pumps, valves, ACCU free-cooling, temperatures & flows" },
  { id: "wshp", label: "WSHP Distribution Network", short: "Hydraulic", icon: GitBranch,
    sub: "Design-basis hydraulic twin — pipe sizing, velocity & head-loss across the riser" },
  { id: "westend", label: "West End · Cafeteria Controls", short: "West End", icon: Gauge,
    sub: "Design-basis controls snapshot — WSHP/DOAS/VRF points, setpoints & provenance (DCAM-22-CS-RFP-0009)" },
  { id: "cwloop", label: "West End · CW Loop Twin", short: "CW Loop", icon: Network,
    sub: "Interactive cafeteria condenser-water digital twin — piping map, glycol, flow/heat/pressure, per-unit HP & refrigeration" },
];

export default function App() {
  const [tab, setTab] = useState("plant");
  const active = TABS.find((t) => t.id === tab);

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: SANS, minHeight: "100%" }}>
      {/* Top navigation bar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30, background: "rgba(10,14,22,0.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}`,
      }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#1b3a52,#0e1f2e)",
              border: `1px solid ${C.line}`, display: "grid", placeItems: "center",
            }}>
              <Waves size={18} color={C.blue} />
            </div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.1 }}>Stoddert ES · Geo-Exchange Twins</div>
              <div style={{ fontSize: 10.5, color: C.dim, fontFamily: MONO, letterSpacing: 1 }}>DG-22-S002 (East) · DCAM-22-CS-RFP-0009 (West)</div>
            </div>
          </div>

          {/* Tab switcher */}
          <nav role="tablist" aria-label="Digital twin selector" style={{ display: "flex", gap: 6, marginLeft: "auto", background: C.box, border: `1px solid ${C.line}`, borderRadius: 10, padding: 4 }}>
            {TABS.map((t) => {
              const on = t.id === tab;
              const Icon = t.icon;
              return (
                <button key={t.id} type="button" role="tab" aria-selected={on} aria-label={t.label} onClick={() => setTab(t.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
                  border: "none", borderRadius: 7, padding: "8px 13px", fontSize: 12.5, fontWeight: 600,
                  fontFamily: SANS, transition: "all .15s ease",
                  background: on ? "#16243a" : "transparent", color: on ? C.ink : C.txt2,
                  boxShadow: on ? `inset 0 0 0 1px ${C.blue}66` : "none",
                }} title={t.sub}>
                  <Icon size={14} color={on ? C.blue : C.dim} />
                  <span className="tab-full">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 16px 9px", display: "flex", gap: 7, alignItems: "center", color: C.txt2, fontSize: 11.5 }}>
          <Info size={12} color={C.dim} /> {active.sub}
        </div>
      </header>

      <main style={{ maxWidth: 1380, margin: "0 auto" }}>
        <section hidden={tab !== "plant"}><CwPlantTwin /></section>
        <section hidden={tab !== "wshp"}><WshpHydraulicTwin /></section>
        <section hidden={tab !== "westend"}><WestEndControlsTwin /></section>
        <section hidden={tab !== "cwloop"}><WestEndCwLoopTwin /></section>
      </main>

      <style>{`
        @media (max-width: 720px) { .tab-full { display: none; } }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.blue}; outline-offset: 1px; }
      `}</style>
    </div>
  );
}
