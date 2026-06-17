import React, { useState } from "react";
import { Power, HelpCircle } from "lucide-react";
import { C, MONO, SANS } from "./theme.js";

/* A labelled range slider with live value read-out and optional helper note. */
export function Slider({ label, value, min, max, step = 1, unit, onChange, accent, note, decimals }) {
  const dec = decimals != null ? decimals : step < 1 ? (step < 0.1 ? 2 : 1) : 0;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12.5, color: C.lab }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: accent || C.ink }}>
          {value.toFixed(dec)}<span style={{ color: C.unit, fontSize: 10.5 }}> {unit}</span>
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{
          width: "100%", accentColor: accent || C.blue, cursor: "pointer", height: 18,
          background: `linear-gradient(90deg, ${(accent || C.blue)}55 ${pct}%, transparent ${pct}%)`,
        }}
      />
      {note && <div style={{ fontSize: 10.5, color: C.txt2, marginTop: 1 }}>{note}</div>}
    </div>
  );
}

/* On/off pill button used for pumps and the ACCU. */
export function Toggle({ label, on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
      border: `1px solid ${on ? C.green : C.line}`, background: on ? "#10241c" : C.box,
      color: on ? C.green : C.txt2, borderRadius: 7, padding: "7px 13px",
      fontFamily: MONO, fontSize: 12.5, fontWeight: 600, transition: "all .15s ease",
    }}>
      <Power size={13} />{label} · {on ? "ON" : "OFF"}
    </button>
  );
}

/* Card container for a control / read-out group, with an icon + title header. */
export function Panel({ icon: Icon, title, right, children, style, span }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15,
      gridColumn: span ? "1 / -1" : undefined, ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
          {Icon && <Icon size={13} />} {title}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

/* Hover/tap info dot that reveals an explanatory tooltip — improves discoverability. */
export function InfoDot({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}>
      <HelpCircle size={13} color={C.dim} style={{ cursor: "help" }} />
      {open && (
        <span style={{
          position: "absolute", bottom: "140%", right: 0, width: 230, zIndex: 20,
          background: "#0a0e15", border: `1px solid ${C.line}`, borderRadius: 8,
          padding: "8px 10px", fontSize: 11.5, lineHeight: 1.5, color: C.lab,
          fontFamily: SANS, boxShadow: "0 8px 24px rgba(0,0,0,.5)",
        }}>{text}</span>
      )}
    </span>
  );
}

/* Compact metric chip for header KPI strips. */
export function Stat({ label, value, unit, color }) {
  return (
    <div style={{
      background: C.box, border: `1px solid ${C.line}`, borderRadius: 9,
      padding: "7px 12px", minWidth: 96,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 0.5, color: C.dim, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: color || C.ink }}>
        {value}<span style={{ fontSize: 10.5, color: C.unit }}> {unit}</span>
      </div>
    </div>
  );
}
