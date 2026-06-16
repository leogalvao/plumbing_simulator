import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from "recharts";
import { AlertTriangle, Power, RotateCcw, Zap, Droplets, Thermometer, Activity } from "lucide-react";

/* ================================================================== *
 *  Stoddert East Wing — CW / Geo-Exchange Plant · Interactive Twin     *
 *  Layout matched to the 2025-11-21 enteliWEB capture.                 *
 *  Reduced-order RELATIONAL model anchored to that operating point.    *
 *  CV-5 = % cooled flow delivered to the building system (vs bypass);  *
 *  the ACCU free-cools to ~ambient regardless of CV-5.                 *
 * ================================================================== */

const C = {
  bg: "#0a0e16", canvas: "#0c1320", panel: "#111a28", panel2: "#0d1320", box: "#0e1726",
  line: "#283751", soft: "rgba(120,140,175,0.13)",
  blue: "#4ea3e0", teal: "#23b6a4", amber: "#f5a623", red: "#ff5a5f", green: "#37d399",
  ink: "#f3f8fe", lab: "#aebcd0", unit: "#7f8da3", dim: "#6a7588", geo: "#b48ef0", txt2: "#9aa7bb",
};
const MONO = 'ui-monospace,"SF Mono",Menlo,Consolas,monospace';
const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const f1 = (v) => (v == null || isNaN(v) ? "—" : v.toFixed(1));
const f0 = (v) => (v == null || isNaN(v) ? "—" : Math.round(v).toString());

/* ----------------------------- physics ----------------------------- */
function muWater_cP(tF) { const T = ((tF - 32) * 5) / 9 + 273.15; return 2.414e-2 * Math.pow(10, 247.8 / (T - 140)); }
function frictionFactor(Re, rr) { if (Re < 2300) return 64 / Math.max(Re, 1); const x = rr / 3.7 + 5.74 / Math.pow(Re, 0.9); return 0.25 / Math.pow(Math.log10(x), 2); }
function segHyd(Q, D_in, L, rough, rho, tF) {
  const Qcfs = Q * 0.002228, Dft = D_in / 12, A = (Math.PI / 4) * Dft * Dft;
  const v = Qcfs / Math.max(A, 1e-6), mu = muWater_cP(tF) * 6.7197e-4;
  const Re = (rho * v * Dft) / Math.max(mu, 1e-9), f = frictionFactor(Re, rough / Dft);
  return { dP: (f * (L / Dft) * rho * v * v) / 2 / 144, v, Re };
}
const FLUIDS = { Water: { rho: 62.3, muMul: 1.0 }, "30% PG Glycol": { rho: 65.3, muMul: 1.85 } };

const BASE = {
  p1: 85.4, p2: 0, p3: 100, p4: 100, p1on: true, p2on: false, p3on: true, p4on: true,
  cv5: 0, cv3: 0, cv11: 100, cv12: 100,
  oat: 55.6, oah: 79.1, geoST: 73.7, bldgTons: 16.25,
  D: 8, L: 100, rough: 0.00015, fluid: "Water", accuOn: true,
  lwtSP: 44, chwdpSP: 7, cv5tempSP: 75,
};

function computeState(I) {
  const fl = FLUIDS[I.fluid] || FLUIDS.Water, rho = fl.rho;
  const bSpeed = (I.p1on ? I.p1 : 0) + (I.p2on ? I.p2 : 0);
  const bypassAvg = (I.cv11 + I.cv12) / 2;
  const bypassFactor = 1 + 0.15 * (100 - bypassAvg) / 100;
  const pipeFlowFactor = Math.pow(I.D / BASE.D, 2.5) * Math.pow(BASE.L / I.L, 0.5);
  const GWS = 780 * (bSpeed / 85.4) * bypassFactor * pipeFlowFactor;

  const geoSpeed = (I.p3on ? I.p3 : 0) + (I.p4on ? I.p4 : 0);
  const coolerFlow = 250 * (geoSpeed / 200) * Math.pow(I.D / BASE.D, 2);
  const gwsBypassFlow = GWS * (bypassAvg / 100) * 0.45;

  const loopT = 63;
  const baseDP = segHyd(780, BASE.D, BASE.L, BASE.rough, 62.3, loopT).dP;
  const hn = segHyd(GWS, I.D, I.L, I.rough, rho, loopT);
  const dpRatio = hn.dP / Math.max(baseDP, 1e-6);
  const NewDP = 42.8 * dpRatio * Math.pow(fl.muMul, 0.25);
  const ExistDP = 7.0 * dpRatio * Math.pow(fl.muMul, 0.25);
  const velocity = hn.v;

  const approach = 1.2;
  const LWT = I.accuOn ? I.oat + approach : I.geoST;
  const dTcoolerBase = 13.2, coolerLoad = 500 * 250 * dTcoolerBase;
  const dTcooler = coolerLoad / (500 * Math.max(coolerFlow, 1));
  const EWT = LWT + dTcooler;
  const accuTons = (500 * coolerFlow * (EWT - LWT)) / 12000;

  const sysFrac = I.accuOn ? I.cv5 / 100 : 0;
  const coolerToSystem = coolerFlow * sysFrac;
  const coolerBypass = coolerFlow * (1 - sysFrac);

  const geoBaseSupply = I.geoST - 1.7;
  const GWST = geoBaseSupply + sysFrac * (LWT - geoBaseSupply) * 0.85;
  const bldgBtu = I.bldgTons * 12000;
  const GWRT = GWST + bldgBtu / (500 * Math.max(GWS, 1));
  const geoRT = I.geoST - 1.1;

  const BTUflow = 113.1 * Math.sqrt(Math.max(NewDP, 0.1) / 42.8) * (1 + 0.2 * I.cv3 / 100);
  const BTUsup = 63.4 + 0.6 * (GWST - 72.0) + 0.4 * (LWT - 56.8) * sysFrac;
  const BTUret = BTUsup + (500 * 113.1 * 7.3) / (500 * Math.max(BTUflow, 1));

  function pump(s, on, Hn, Qsh) {
    if (!on || s <= 0) return { head: 0, hp: 0, q: 0 };
    const H = Hn * Math.pow(s / 100, 2), q = Qsh * (s / 100);
    return { head: H, hp: (q * H * (rho / 62.4)) / (3960 * 0.75), q };
  }
  const P1 = pump(I.p1, I.p1on, 120, GWS / Math.max(I.p1 / 100, 0.01));
  const P2 = pump(I.p2, I.p2on, 120, 900);
  const P3 = pump(I.p3, I.p3on, 95, coolerFlow / 2 / Math.max(I.p3 / 100, 0.01));
  const P4 = pump(I.p4, I.p4on, 95, coolerFlow / 2 / Math.max(I.p4 / 100, 0.01));

  const alerts = [];
  if (LWT > I.lwtSP + 2) alerts.push({ s: "info", t: `LWT ${LWT.toFixed(1)}°F can't reach the ${I.lwtSP}°F setpoint — free-cooling floor ≈ ambient (${I.oat.toFixed(0)}°F + ~1° approach).` });
  if (I.accuOn && I.cv5 < 2) alerts.push({ s: "info", t: `CV-5 at ${I.cv5.toFixed(0)}% — cooled ACCU water is recirculating (full bypass); building runs on ground-loop water. This is the captured test/commissioning condition.` });
  if (velocity > 8) alerts.push({ s: "high", t: `Pipe velocity ${velocity.toFixed(1)} ft/s exceeds ~8 ft/s — erosion/noise risk. Increase diameter or reduce flow.` });
  if (velocity < 2 && GWS > 50) alerts.push({ s: "warn", t: `Pipe velocity ${velocity.toFixed(1)} ft/s is low (<2 ft/s) — fouling risk.` });
  if (GWS > 1000) alerts.push({ s: "high", t: `GWS flow ${GWS.toFixed(0)} GPM is above the normal envelope (~400–950 GPM).` });
  if (NewDP > 60) alerts.push({ s: "high", t: `New Addition DP ${NewDP.toFixed(1)} psi is high vs the ${I.chwdpSP} psi setpoint.` });
  if (!I.accuOn) alerts.push({ s: "warn", t: `ACCU off — no free cooling; LWT rises toward Geo ST (${I.geoST.toFixed(1)}°F).` });
  if (!I.p1on && !I.p2on) alerts.push({ s: "high", t: `No building pump running — GWS flow = 0; no distribution to the building.` });

  return { GWS, coolerFlow, coolerToSystem, coolerBypass, gwsBypassFlow, NewDP, ExistDP, velocity,
    LWT, EWT, accuTons, GWST, GWRT, geoRT, BTUflow, BTUsup, BTUret, P1, P2, P3, P4, alerts, bSpeed };
}

/* ----------------------------- svg helpers ----------------------------- */
function Pipe({ pts, flow, color, dir = 1, minW = 3.5 }) {
  const w = clamp(minW + flow / 90, minW, 15);
  const d = "M " + pts.map((p) => p.join(" ")).join(" L ");
  const dur = clamp(800 / Math.max(flow, 6), 0.45, 6);
  return (
    <g>
      <path d={d} stroke={color} strokeWidth={w} fill="none" opacity={0.55} strokeLinecap="round" strokeLinejoin="round" />
      {flow > 4 && <path d={d} stroke="#eef8ff" strokeWidth={Math.max(w * 0.36, 1.6)} fill="none" strokeDasharray="2 16" strokeLinecap="round"
        style={{ animation: `flowdash ${dur}s linear infinite`, animationDirection: dir > 0 ? "normal" : "reverse" }} />}
    </g>
  );
}
function Arrow({ x, y, rot = 0, on = true, color = "#e3f0fc" }) {
  return <path d="M -8 -6.5 L 8 0 L -8 6.5 Z" transform={`translate(${x} ${y}) rotate(${rot})`} fill={on ? color : "#3a4762"} opacity={on ? 0.95 : 0.4} />;
}
function Reading({ x, y, label, value, unit, anchor = "middle", vsize = 17 }) {
  return (
    <g transform={`translate(${x} ${y})`} textAnchor={anchor}>
      <text y={-9} fontSize="13" fontWeight="600" fill={C.lab} fontFamily={SANS}>{label}</text>
      <text y={12} fontSize={vsize} fontWeight="700" fontFamily={MONO} fill={C.ink}>{value}<tspan fontSize="12" fill={C.unit}> {unit}</tspan></text>
    </g>
  );
}
function ValBox({ x, y, w = 66, h = 20, text, color }) {
  return (<g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} rx={3} fill="#0a111d" stroke={C.line} />
    <text x={w / 2} y={h / 2 + 4.5} textAnchor="middle" fontSize="12" fontFamily={MONO} fill={color || C.ink}>{text}</text>
  </g>);
}

/* ----------------------------- controls ----------------------------- */
function Slider({ label, value, min, max, step = 1, unit, onChange, accent, note }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12.5, color: C.lab }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: accent || C.ink }}>{value.toFixed(step < 1 ? 1 : 0)}<span style={{ color: C.unit, fontSize: 10.5 }}> {unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: "100%", accentColor: accent || C.blue }} />
      {note && <div style={{ fontSize: 10.5, color: C.txt2 }}>{note}</div>}
    </div>
  );
}
function Toggle({ label, on, onChange }) {
  return (<button onClick={() => onChange(!on)} style={{
    display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", border: `1px solid ${on ? C.green : C.line}`,
    background: on ? "#10241c" : C.box, color: on ? C.green : C.txt2, borderRadius: 7, padding: "7px 13px", fontFamily: MONO, fontSize: 12.5, fontWeight: 600,
  }}><Power size={13} />{label} · {on ? "ON" : "OFF"}</button>);
}

/* =============================== APP =============================== */
export default function App() {
  const [I, setI] = useState({ ...BASE });
  const [selected, setSelected] = useState(null);
  const [lastChange, setLastChange] = useState(null);
  const set = (k, label) => (v) => { setI((p) => ({ ...p, [k]: v })); if (label) setLastChange(label); };
  const D = useMemo(() => computeState(I), [I]);

  const prev = useRef(D);
  const [sens, setSens] = useState([]);
  useEffect(() => {
    const p = prev.current;
    const fields = [["GWS Flow", "GWS", "GPM"], ["LWT", "LWT", "°F"], ["EWT", "EWT", "°F"], ["New Add. DP", "NewDP", "psi"],
    ["ACCU duty", "accuTons", "ton"], ["Pipe velocity", "velocity", "ft/s"], ["GWS supply T", "GWST", "°F"], ["BTU flow", "BTUflow", "GPM"]];
    const list = fields.map(([lab, k, u]) => ({ lab, u, from: p[k], to: D[k], d: D[k] - p[k] }))
      .filter((x) => Math.abs(x.d) > 1e-3).sort((a, b) => Math.abs(b.d / (Math.abs(b.from) || 1)) - Math.abs(a.d / (Math.abs(a.from) || 1)));
    if (Math.abs(D.P1.hp - p.P1.hp) > 0.05) list.push({ lab: "P1 power", u: "HP", from: p.P1.hp, to: D.P1.hp, d: D.P1.hp - p.P1.hp });
    setSens(list.slice(0, 6)); prev.current = D;
  }, [D]);

  const sweep = useMemo(() => {
    const a = [];
    for (let s = 0; s <= 100; s += 5) { const st = computeState({ ...I, p1: s, p1on: true }); a.push({ s, flow: +st.GWS.toFixed(0), hp: +st.P1.hp.toFixed(1) }); }
    return a;
  }, [I]);
  const reset = () => { setI({ ...BASE }); setSelected(null); setLastChange("Reset to capture"); };

  /* ---- glyphs ---- */
  const PumpGlyph = ({ x, y, id, label, speed, on }) => {
    const sel = selected?.id === id;
    return (
      <g transform={`translate(${x} ${y})`} onClick={() => setSelected({ type: "pump", id, label })} style={{ cursor: "pointer" }}>
        <title>{`${label} — ${on ? speed.toFixed(1) + "%" : "OFF"}`}</title>
        <rect x={-27} y={-25} width={54} height={50} rx={9} fill={sel ? "#16243a" : C.box} stroke={sel ? C.blue : C.line} strokeWidth={sel ? 2.2 : 1.3} />
        <circle r={15} fill="none" stroke={on ? C.green : C.dim} strokeWidth={2.6} />
        <circle r={3.6} fill={on ? C.green : C.dim} />
        {on && speed > 0 && [0, 120, 240].map((a) => (<line key={a} x1={0} y1={0} x2={11 * Math.cos(a * Math.PI / 180)} y2={11 * Math.sin(a * Math.PI / 180)} stroke={C.green} strokeWidth={2.4} style={{ animation: "spin 2.4s linear infinite", transformOrigin: "0px 0px" }} />))}
        <text y={-32} textAnchor="middle" fontSize="15" fontFamily={MONO} fontWeight="700" fill={C.ink}>{label}</text>
      </g>
    );
  };
  const PumpStatus = ({ x, y, prefix, on, speed }) => (
    <g transform={`translate(${x} ${y})`} fontFamily={MONO}>
      <text x={-8} y={5} textAnchor="end" fontSize="12.5" fill={on ? C.green : C.dim} fontWeight="700">{on ? "On" : "Off"}</text>
      <text x={74} y={5} fontSize="12.5" fill={C.lab}>{prefix} Sts</text>
      <ValBox x={-74} y={17} w={66} text={on ? "On" : "Off"} color={on ? C.green : C.dim} />
      <text x={74} y={32} fontSize="12.5" fill={C.lab}>{prefix} Cmd</text>
      <ValBox x={-74} y={44} w={66} text={`${speed.toFixed(1)} %`} color={on ? C.ink : C.dim} />
      <text x={74} y={59} fontSize="12.5" fill={C.lab}>{prefix} Speed</text>
    </g>
  );
  const ValveGlyph = ({ x, y, id, label, pos }) => {
    const sel = selected?.id === id, open = pos > 1;
    return (
      <g transform={`translate(${x} ${y})`} onClick={() => setSelected({ type: "valve", id, label })} style={{ cursor: "pointer" }}>
        <title>{`${label} — ${pos.toFixed(1)}% open`}</title>
        <rect x={-21} y={-18} width={42} height={36} rx={7} fill={sel ? "#16243a" : C.box} stroke={sel ? C.blue : C.line} strokeWidth={sel ? 2.2 : 1.3} />
        <g transform={`rotate(${(1 - pos / 100) * 90})`}><rect x={-11} y={-2.8} width={22} height={5.6} rx={1.8} fill={open ? C.blue : C.dim} /></g>
        <circle r={12} fill="none" stroke={open ? C.blue : C.dim} strokeWidth={1.9} />
      </g>
    );
  };
  const P = (pts, flow, color, dir) => <Pipe pts={pts} flow={flow} color={color} dir={dir} />;
  const Lbl = ({ x, y, children, size = 13, anchor = "middle" }) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontFamily={SANS} fontWeight="700" fill={C.ink}>{children}</text>
  );

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: SANS, minHeight: "100%", padding: "18px 16px 36px" }}>
      <style>{`@keyframes flowdash{to{stroke-dashoffset:-18}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: 2, color: C.dim, textTransform: "uppercase" }}>Stoddert ES · DG-22-S002 · interactive twin · matched to 2025-11-21 capture</div>
            <h1 style={{ margin: "3px 0 0", fontSize: 23, fontWeight: 700 }}>East Wing — CW / Geo-Exchange Plant</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {lastChange && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>last change · {lastChange}</span>}
            <button onClick={reset} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", background: C.box, border: `1px solid ${C.line}`, color: C.txt2, borderRadius: 7, padding: "6px 11px", fontSize: 12.5, fontFamily: SANS }}><RotateCcw size={13} /> Reset</button>
          </div>
        </div>

        <div style={{ marginTop: 12, background: "#1a1510", border: `1px solid ${C.amber}55`, borderRadius: 9, padding: "9px 13px", fontSize: 12, color: "#f0d6a6", display: "flex", gap: 8 }}>
          <AlertTriangle size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Reduced-order relational model anchored to the capture — physical forms & directions correct, absolute values off-baseline illustrative. <b>CV-5 = % cooled flow to the building system</b> (reads 0.0% = full bypass); the ACCU free-cools to ~ambient regardless. Confirm CV-5 convention against the sequence of operations.</span>
        </div>

        {D.alerts.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {D.alerts.map((a, i) => {
              const col = a.s === "high" ? C.red : a.s === "warn" ? C.amber : C.blue;
              return (<div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: C.lab, background: C.panel2, border: `1px solid ${col}44`, borderLeft: `3px solid ${col}`, borderRadius: 7, padding: "7px 11px" }}><AlertTriangle size={14} color={col} style={{ flexShrink: 0 }} />{a.t}</div>);
            })}
          </div>
        )}

        {/* ---------------- SCADA canvas ---------------- */}
        <div style={{ background: C.canvas, border: `1px solid ${C.line}`, borderRadius: 12, padding: 8, marginTop: 12 }}>
          <svg viewBox="0 0 1480 772" style={{ width: "100%", height: "auto", display: "block" }}>
            {/* toolbar */}
            {[["Plant Trends", 210, 140], ["Show All Plant Points", 370, 320], ["Show ACCU Points", 940, 320]].map(([t, x, w], i) => (
              <g key={i}><rect x={x} y={14} width={w} height={30} rx={4} fill="#0e1726" stroke={C.line} /><text x={x + w / 2} y={34} textAnchor="middle" fontSize="14.5" fontStyle="italic" fontFamily={SANS} fill={C.lab}>{t}</text></g>
            ))}

            {/* ---------- PIPES: blue = cooler/supply loop ---------- */}
            {P([[1110, 96], [690, 96], [690, 200]], D.coolerFlow, C.blue, -1)}
            {P([[690, 264], [690, 566]], D.coolerFlow, C.blue, 1)}
            {P([[945, 150], [1110, 150]], D.coolerFlow, C.blue, 1)}
            {P([[945, 150], [945, 300]], D.coolerFlow, C.blue, -1)}
            {P([[800, 300], [1140, 300]], D.coolerFlow, C.blue, -1)}
            {P([[800, 300], [800, 470]], D.coolerFlow, C.blue, -1)}
            {P([[1140, 300], [1140, 470]], D.coolerFlow, C.blue, -1)}
            {P([[800, 470], [1140, 470]], D.coolerFlow, C.blue, 1)}
            {P([[945, 470], [945, 566]], D.coolerFlow, C.blue, -1)}
            {P([[96, 566], [1412, 566]], D.GWS, C.blue, -1)}
            {/* teal = building return */}
            {P([[96, 750], [1412, 750]], D.GWS, C.teal, 1)}
            {P([[764, 566], [764, 750]], D.GWS, C.teal, 1)}
            {P([[764, 655], [900, 655]], D.GWS, C.teal, 1)}
            {P([[764, 728], [900, 728]], D.GWS, C.teal, 1)}
            {P([[900, 655], [900, 728]], D.GWS, C.teal, 1)}
            {P([[520, 566], [520, 750]], D.GWS * I.cv3 / 100, C.teal, 1)}
            {P([[1140, 566], [1140, 750]], D.gwsBypassFlow, C.teal, 1)}
            {P([[1240, 566], [1240, 750]], D.gwsBypassFlow, C.teal, 1)}

            {/* arrows */}
            <Arrow x={900} y={96} rot={180} on={I.accuOn} color={C.blue} />
            <Arrow x={1035} y={150} rot={0} on={I.accuOn} color={C.blue} />
            <Arrow x={1000} y={300} rot={180} on={I.accuOn} color={C.blue} />
            <Arrow x={430} y={566} rot={180} color={C.blue} /><Arrow x={1010} y={566} rot={180} color={C.blue} />
            <Arrow x={430} y={750} rot={0} color={C.teal} /><Arrow x={1180} y={750} rot={0} color={C.teal} />

            {/* ---------- ACCU unit ---------- */}
            <g onClick={() => setSelected({ type: "accu", id: "accu", label: "ACCU" })} style={{ cursor: "pointer" }}>
              <rect x={1110} y={60} width={168} height={86} rx={8} fill={C.box} stroke={I.accuOn ? C.blue : C.line} strokeWidth={I.accuOn ? 1.9 : 1.3} />
              {[0, 1, 2].map((i) => (<circle key={i} cx={1140 + i * 52} cy={92} r={16} fill="none" stroke={I.accuOn ? C.blue : C.dim} strokeWidth={2.4} style={I.accuOn ? { animation: "spin 1.6s linear infinite", transformOrigin: `${1140 + i * 52}px 92px` } : {}} />))}
            </g>
            <Reading x={1070} y={92} label="LWT" value={f1(D.LWT)} unit="°F" anchor="end" />
            <Reading x={1070} y={170} label="EWT" value={f1(D.EWT)} unit="°F" anchor="end" />

            {/* ACCU status panel */}
            <g onClick={() => setSelected({ type: "accu", id: "accu", label: "ACCU" })} style={{ cursor: "pointer" }}>
              <rect x={1098} y={188} width={306} height={112} rx={9} fill={selected?.id === "accu" ? "#16243a" : C.panel2} stroke={selected?.id === "accu" ? C.blue : C.line} />
              <text x={1251} y={210} textAnchor="middle" fontSize="14.5" fontWeight="700" fill={C.ink} fontFamily={SANS}>ACCU</text>
              {[["Status", I.accuOn ? "On" : "Off", I.accuOn ? C.green : C.dim, "C1 Status", "100.0 %"],
              ["Command", I.accuOn ? "On" : "Off", I.accuOn ? C.green : C.dim, "C2 Status", "100.0 %"],
              ["Alarm Status", "normal", C.green, "C3 Status", "100.0 %"],
              ["Alarm Reset", "off", C.lab, "C4 Status", "100.0 %"]].map((r, i) => (
                <g key={i} fontFamily={MONO} fontSize="12.5">
                  <text x={1114} y={234 + i * 18} fill={C.lab}>{r[0]}</text>
                  <text x={1252} y={234 + i * 18} textAnchor="end" fill={r[2]}>{r[1]}</text>
                  <text x={1276} y={234 + i * 18} fill={C.lab}>{r[3]}</text>
                  <text x={1396} y={234 + i * 18} textAnchor="end" fill={I.accuOn ? C.ink : C.dim}>{r[4]}</text>
                </g>
              ))}
            </g>

            {/* BTU meter */}
            <g onClick={() => setSelected({ type: "btu", id: "btu", label: "BTU Meter (FM-2)" })} style={{ cursor: "pointer" }}>
              <rect x={648} y={200} width={266} height={64} rx={4} fill={selected?.id === "btu" ? "#16243a" : C.panel2} stroke={selected?.id === "btu" ? C.blue : C.line} strokeDasharray="4 3" />
              <Lbl x={781} y={192} size={13.5}>BTU Meter (FM-2)</Lbl>
              <Reading x={694} y={240} label="Supply" value={f1(D.BTUsup)} unit="°F" vsize={15.5} />
              <Reading x={781} y={240} label="Flow" value={f1(D.BTUflow)} unit="GPM" vsize={15.5} />
              <Reading x={872} y={240} label="Return" value={f1(D.BTUret)} unit="°F" vsize={15.5} />
            </g>

            {/* Setpoints panel */}
            <g onClick={() => setSelected({ type: "setpoints", id: "sp", label: "Setpoints" })} style={{ cursor: "pointer" }}>
              <rect x={196} y={250} width={206} height={160} rx={9} fill={selected?.id === "sp" ? "#16243a" : C.panel2} stroke={selected?.id === "sp" ? C.blue : C.line} />
              <Lbl x={212} y={273} size={13.5} anchor="start">System Setpoints</Lbl>
              {[["ACCU-1-LWT-SP", I.lwtSP.toFixed(1) + " °F"], ["CHWDP-SP", I.chwdpSP.toFixed(1) + " psi"], ["ACCU-EN-DIFF", "5.0 °F"], ["ACCU-LOW-EN-SP", "60.0 °F"], ["ACCU-HIGH-EN-SP", "70.0 °F"], ["ACCU-CV5-TEMP-S", I.cv5tempSP.toFixed(1) + " °F"]].map((r, i) => (
                <text key={i} x={212} y={298 + i * 18} fontSize="12.5" fontFamily={MONO} fill={C.lab}>{r[0]}<tspan x={386} textAnchor="end" fill={C.ink}>{r[1]}</tspan></text>
              ))}
            </g>
            {/* Parameters panel */}
            <g>
              <rect x={414} y={250} width={214} height={160} rx={9} fill={C.panel2} stroke={C.line} />
              <Lbl x={430} y={273} size={13.5} anchor="start">System Parameters</Lbl>
              {[["SYSTEM-EN", "True"], ["SYS-RESET", "Off"], ["WELLFIELD-REPL", "Off"], ["PMPDOWN-TIME", "300.0 s"], ["OA-T", I.oat.toFixed(1) + " °F"], ["OA-H", I.oah.toFixed(1) + " %RH"]].map((r, i) => (
                <text key={i} x={430} y={298 + i * 18} fontSize="12.5" fontFamily={MONO} fill={C.lab}>{r[0]}<tspan x={612} textAnchor="end" fill={C.ink}>{r[1]}</tspan></text>
              ))}
            </g>

            {/* CV-5 */}
            <ValveGlyph x={690} y={495} id="cv5" label="ACCU (CV-5)" pos={I.cv5} />
            <Lbl x={596} y={486} size={13}>ACCU (CV-5)</Lbl>
            <ValBox x={563} y={500} w={66} text={`${I.cv5.toFixed(1)} %`} color={C.amber} />
            <text x={596} y={536} textAnchor="middle" fontSize="11" fontFamily={SANS} fill={C.lab}>100% Full By-Pass</text>
            <text x={596} y={550} textAnchor="middle" fontSize="11" fontFamily={SANS} fill={C.lab}>0% Full System Flow</text>

            {/* pumps + status */}
            <PumpGlyph x={800} y={400} id="p4" label="P4" speed={I.p4} on={I.p4on} />
            <PumpStatus x={900} y={386} prefix="P4" on={I.p4on} speed={I.p4} />
            <PumpGlyph x={1140} y={400} id="p3" label="P3" speed={I.p3} on={I.p3on} />
            <PumpStatus x={1240} y={386} prefix="P3" on={I.p3on} speed={I.p3} />
            <PumpGlyph x={830} y={655} id="p1" label="P1" speed={I.p1} on={I.p1on} />
            <PumpStatus x={935} y={609} prefix="P1" on={I.p1on} speed={I.p1} />
            <PumpGlyph x={830} y={728} id="p2" label="P2" speed={I.p2} on={I.p2on} />
            <PumpStatus x={935} y={705} prefix="P2" on={I.p2on} speed={I.p2} />

            {/* lower valves */}
            <ValveGlyph x={520} y={658} id="cv3" label="GWS Min Flow (CV-3)" pos={I.cv3} />
            <Lbl x={636} y={636} size={12.5}>GWS Min Flow (CV-3)</Lbl>
            <ValBox x={603} y={650} w={66} text={`${I.cv3.toFixed(1)} %`} color={I.cv3 > 1 ? C.blue : C.dim} />
            <ValveGlyph x={1140} y={658} id="cv11" label="GWS Bypass (CV-1-1)" pos={I.cv11} />
            <Lbl x={1070} y={636} size={12}>GWS Bypass (CV-1-1)</Lbl>
            <ValBox x={1037} y={684} w={66} text={`${I.cv11.toFixed(1)} %`} color={I.cv11 > 1 ? C.blue : C.dim} />
            <ValveGlyph x={1245} y={658} id="cv12" label="GWS Bypass (CV-1-2)" pos={I.cv12} />
            <Lbl x={1290} y={636} size={12}>GWS Bypass (CV-1-2)</Lbl>
            <ValBox x={1247} y={684} w={66} text={`${I.cv12.toFixed(1)} %`} color={I.cv12 > 1 ? C.blue : C.dim} />

            {/* endpoints */}
            <Lbl x={64} y={560} size={13}>To</Lbl><Lbl x={64} y={576} size={13}>Building</Lbl>
            <Lbl x={64} y={744} size={13}>From</Lbl><Lbl x={64} y={760} size={13}>Building</Lbl>
            <Lbl x={1462} y={560} size={12.5} anchor="end">From</Lbl><Lbl x={1462} y={576} size={12.5} anchor="end">Geo Vault</Lbl>
            <Lbl x={1462} y={744} size={12.5} anchor="end">To</Lbl><Lbl x={1462} y={760} size={12.5} anchor="end">Geo Vault</Lbl>

            {/* sensor readings */}
            <Reading x={300} y={508} label="GWS Flow" value={f1(D.GWS)} unit="GPM" anchor="start" />
            <Reading x={300} y={548} label="GWS T" value={f1(D.GWST)} unit="°F" anchor="start" />
            <Reading x={300} y={690} label="GWR T" value={f1(D.GWRT)} unit="°F" anchor="start" />
            <Reading x={150} y={624} label="New Addition DP" value={f1(D.NewDP)} unit="psi" anchor="start" />
            <Reading x={150} y={672} label="Existing Bldg DP" value={f1(D.ExistDP)} unit="psi" anchor="start" />
            <Reading x={1404} y={510} label="Geo ST" value={f1(I.geoST)} unit="°F" anchor="end" />
            <Reading x={1404} y={690} label="Geo RT" value={f1(D.geoRT)} unit="°F" anchor="end" />

            <text x={740} y={766} fontSize="11.5" fontFamily={MONO} fill={C.dim}>pipe width ∝ flow · blue = condenser/supply loop · teal = building return · dashes animate with flow · click any pump / valve / panel to edit</text>
          </svg>
        </div>

        {/* ---------------- controls ---------------- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 12, marginTop: 12 }}>

          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10 }}>{selected ? `Editing · ${selected.label}` : "Parameter editor"}</div>
            {selected?.type === "pump" && (() => {
              const k = selected.id, onK = k + "on", p = D[k.toUpperCase()];
              return (<div>
                <div style={{ marginBottom: 10 }}><Toggle label={selected.label} on={I[onK]} onChange={(v) => { setI((s) => ({ ...s, [onK]: v })); setLastChange(`${selected.label} ${v ? "ON" : "OFF"}`); }} /></div>
                <Slider label="Speed (affinity)" value={I[k]} min={0} max={100} unit="%" accent={C.amber} onChange={set(k, `${selected.label} speed`)} note="Q ∝ N · H ∝ N² · P ∝ N³" />
                <div style={{ display: "flex", gap: 14, fontFamily: MONO, fontSize: 12.5, marginTop: 6 }}>
                  <span style={{ color: C.txt2 }}>head <b style={{ color: C.ink }}>{f0(p.head)}</b> ft</span>
                  <span style={{ color: C.txt2 }}>flow <b style={{ color: C.ink }}>{f0(p.q)}</b> GPM</span>
                  <span style={{ color: C.txt2 }}>power <b style={{ color: C.amber }}>{f1(p.hp)}</b> HP</span>
                </div>
              </div>);
            })()}
            {selected?.type === "valve" && (
              <Slider label="Position" value={I[selected.id]} min={0} max={100} unit="% open" accent={C.blue} onChange={set(selected.id, `${selected.label}`)}
                note={selected.id === "cv5" ? "% cooled flow delivered to building (↑ = colder building supply)" : selected.id === "cv3" ? "GWS minimum-flow recirculation" : "GWS bypass — supply→return shortcut"} />
            )}
            {selected?.type === "accu" && (<div>
              <Toggle label="ACCU" on={I.accuOn} onChange={(v) => { setI((s) => ({ ...s, accuOn: v })); setLastChange(`ACCU ${v ? "ON" : "OFF"}`); }} />
              <div style={{ height: 8 }} />
              <Slider label="CV-5 (% to system)" value={I.cv5} min={0} max={100} unit="%" accent={C.amber} onChange={set("cv5", "CV-5 position")} note="0% = full bypass (cooled water recirculates)" />
              <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.txt2, marginTop: 4 }}>LWT <b style={{ color: C.ink }}>{f1(D.LWT)}</b>°F · to system <b style={{ color: C.ink }}>{f0(D.coolerToSystem)}</b> GPM · bypass <b style={{ color: C.ink }}>{f0(D.coolerBypass)}</b> GPM</div>
            </div>)}
            {selected?.type === "setpoints" && (<div>
              <Slider label="ACCU-1-LWT-SP" value={I.lwtSP} min={40} max={75} unit="°F" onChange={set("lwtSP", "LWT setpoint")} note="Free cooling can't beat ambient — see alert" />
              <Slider label="CHWDP-SP" value={I.chwdpSP} min={4} max={15} unit="psi" onChange={set("chwdpSP", "CHWDP-SP")} />
              <Slider label="ACCU-CV5-TEMP-SP" value={I.cv5tempSP} min={50} max={90} unit="°F" onChange={set("cv5tempSP", "CV5-TEMP-SP")} />
            </div>)}
            {selected?.type === "btu" && (<div style={{ fontSize: 12.5, color: C.lab, lineHeight: 1.7 }}>Read-only meter. Supply <b style={{ color: C.ink }}>{f1(D.BTUsup)}</b>°F · Return <b style={{ color: C.ink }}>{f1(D.BTUret)}</b>°F · Flow <b style={{ color: C.ink }}>{f1(D.BTUflow)}</b> GPM · duty <b style={{ color: C.ink }}>{f1(500 * D.BTUflow * (D.BTUret - D.BTUsup) / 12000)}</b> ton.</div>)}
            {!selected && <div style={{ fontSize: 12.5, color: C.lab, lineHeight: 1.6 }}>Click a pump, valve, the ACCU, or the setpoints panel on the diagram to edit it. Environment, pipe, and fluid controls are always available here.</div>}
          </div>

          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Thermometer size={13} /> Environment & loads</div>
            <Slider label="Outdoor air temp" value={I.oat} min={20} max={100} unit="°F" accent={C.geo} onChange={set("oat", "OA-T")} note="Sets the free-cooling floor for LWT" />
            <Slider label="Geo supply temp" value={I.geoST} min={50} max={85} unit="°F" accent={C.geo} onChange={set("geoST", "Geo ST")} />
            <Slider label="Building load" value={I.bldgTons} min={0} max={120} unit="ton" accent={C.teal} onChange={set("bldgTons", "Building load")} />
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", margin: "10px 0", display: "flex", alignItems: "center", gap: 6 }}><Droplets size={13} /> Pipe & fluid</div>
            <Slider label="Pipe diameter" value={I.D} min={3} max={14} step={0.5} unit="in" onChange={set("D", "Pipe diameter")} note="ΔP ∝ 1/D⁵ · velocity ∝ 1/D²" />
            <Slider label="Pipe length" value={I.L} min={20} max={400} unit="ft" onChange={set("L", "Pipe length")} />
            <Slider label="Roughness" value={I.rough * 1000} min={0.05} max={2} step={0.05} unit="×10⁻³ ft" onChange={(v) => set("rough", "Pipe roughness")(v / 1000)} />
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {Object.keys(FLUIDS).map((fk) => (<button key={fk} onClick={() => { setI((s) => ({ ...s, fluid: fk })); setLastChange(`Fluid → ${fk}`); }} style={{ flex: 1, cursor: "pointer", borderRadius: 7, padding: "6px 4px", fontSize: 11.5, fontFamily: MONO, border: `1px solid ${I.fluid === fk ? C.blue : C.line}`, background: I.fluid === fk ? "#10202c" : C.box, color: I.fluid === fk ? C.blue : C.txt2 }}>{fk}</button>))}
            </div>
          </div>

          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Activity size={13} /> What changed & why</div>
            {sens.length === 0 ? <div style={{ fontSize: 12.5, color: C.txt2 }}>Adjust a control to see the cause-and-effect chain.</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 12.5 }}><tbody>
                {sens.map((s, i) => { const up = s.d > 0; return (
                  <tr key={i} style={{ borderTop: i ? `1px solid ${C.soft}` : "none" }}>
                    <td style={{ padding: "6px 0", color: C.lab, fontFamily: SANS, fontSize: 12.5 }}>{s.lab}</td>
                    <td style={{ padding: "6px 6px", textAlign: "right", color: C.txt2 }}>{f1(s.from)}</td>
                    <td style={{ padding: "6px 4px", textAlign: "center", color: up ? C.red : C.green }}>{up ? "▲" : "▼"}</td>
                    <td style={{ padding: "6px 0", textAlign: "right", color: C.ink, fontWeight: 600 }}>{f1(s.to)}<span style={{ color: C.unit, fontSize: 10.5 }}> {s.u}</span></td>
                  </tr>); })}
              </tbody></table>
            )}
          </div>

          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Zap size={13} /> P1 response curve</div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer>
                <LineChart data={sweep} margin={{ top: 4, right: 6, left: -18, bottom: -6 }}>
                  <CartesianGrid stroke={C.soft} vertical={false} />
                  <XAxis dataKey="s" stroke={C.txt2} fontSize={10.5} fontFamily={MONO} tickLine={false} />
                  <YAxis stroke={C.txt2} fontSize={10.5} fontFamily={MONO} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0a0e15", border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: MONO, fontSize: 11.5 }} labelFormatter={(v) => `P1 ${v}%`} />
                  <Line dataKey="flow" name="GWS GPM" stroke={C.blue} strokeWidth={2} dot={false} />
                  <Line dataKey="hp" name="P1 HP" stroke={C.amber} strokeWidth={2} dot={false} />
                  {I.p1on && <ReferenceDot x={Math.round(I.p1 / 5) * 5} y={+D.GWS.toFixed(0)} r={4} fill={C.blue} stroke="#fff" />}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.txt2 }}>blue = GWS flow · amber = P1 power (∝ speed³) · dot = current</div>
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 10.5, color: C.dim, fontFamily: MONO }}>
          Layout matched to the 2025-11-21 enteliWEB capture · relational twin · not a calibrated P&ID hydraulic solution
        </div>
      </div>
    </div>
  );
}
