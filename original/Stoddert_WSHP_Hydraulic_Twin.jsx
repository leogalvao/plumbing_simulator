import React, { useState, useMemo, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { AlertTriangle, RotateCcw, Activity, Zap, Search, Gauge } from "lucide-react";

/* ================================================================== *
 *  Stoddert ES — WSHP / Geo-Exchange DESIGN-BASIS Hydraulic Twin       *
 *  Topology from the riser diagram. Velocity & head loss computed      *
 *  (0.4085 Q/d² ; Hazen-Williams + Darcy-Weisbach). Lengths, pump      *
 *  curves, Cv, elevations, equipment ΔP are ASSUMED/illustrative until *
 *  schedules + Cx/balancing reports are provided.                      *
 * ================================================================== */

const C = {
  bg: "#0a0e16", canvas: "#0c1320", panel: "#111a28", panel2: "#0d1320", box: "#0e1726",
  line: "#283751", soft: "rgba(120,140,175,0.13)", blue: "#4ea3e0", teal: "#23b6a4",
  amber: "#f5a623", red: "#ff5a5f", green: "#37d399", yellow: "#f5d23a",
  ink: "#f3f8fe", lab: "#aebcd0", unit: "#7f8da3", dim: "#6a7588", geo: "#b48ef0", txt2: "#9aa7bb",
};
const MONO = 'ui-monospace,"SF Mono",Menlo,Consolas,monospace';
const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const f1 = (v) => (v == null || isNaN(v) ? "—" : v.toFixed(1));
const f2 = (v) => (v == null || isNaN(v) ? "—" : v.toFixed(2));

/* -------------------- hydraulics -------------------- */
const vel = (gpm, d) => 0.4085 * gpm / (d * d);                       // ft/s
const hwPer100 = (gpm, d, Cf = 150) => 0.2083 * Math.pow(100 / Cf, 1.852) * Math.pow(gpm, 1.852) / Math.pow(d, 4.8655); // ft/100ft
function darcy(gpm, d, rough = 5e-6, tF = 60) {
  const v = vel(gpm, d), Dft = d / 12, nu = 1.21e-5;                  // ft²/s ~60°F
  const Re = v * Dft / nu;
  const f = Re < 2300 ? 64 / Math.max(Re, 1) : 0.25 / Math.pow(Math.log10(rough / (3.7 * Dft) + 5.74 / Math.pow(Re, 0.9)), 2);
  return { v, Re, f, hf100: f * (100 / Dft) * v * v / (2 * 32.2) };
}
const vColor = (v) => v == null ? C.dim : v < 2 ? C.blue : v <= 4 ? C.green : v <= 8 ? C.yellow : v <= 10 ? C.amber : C.red;
const vFlag = (v, d) => {
  if (v == null) return null;
  if (v > 10) return { s: "high", t: `${v.toFixed(1)} ft/s — severe (>10): erosion. Upsize pipe.` };
  if (v > 8) return { s: "warn", t: `${v.toFixed(1)} ft/s — high (>8): noise/erosion risk. Likely undersized.` };
  if (v < 2 && d >= 2) return { s: "info", t: `${v.toFixed(1)} ft/s — low (<2) on ${d}" : possibly oversized / fouling.` };
  return null;
};

/* -------------------- network (refined reads) -------------------- */
const WSHP_L2 = [
  { id: "2-1", ty: "D", gpm: 6.5, br: 1, rm: "CORR 2300" }, { id: "2-2", ty: "C", gpm: 4.4, br: 1, rm: "CORR 2300" },
  { id: "2-3", ty: "C", gpm: 4.4, br: 1, rm: "CORR 2300" }, { id: "2-4", ty: "C", gpm: 4.4, br: 1, rm: "CORR 2300" },
  { id: "2-5", ty: "C", gpm: 4.4, br: 1, rm: "CORR 2300" }, { id: "2-6", ty: "E", gpm: 10.5, br: 1.5, rm: "CORR 2300" },
  { id: "2-8", ty: "C", gpm: 3.3, br: 0.75, rm: "BOYS 2311" }, { id: "2-7", ty: "C", gpm: 4.4, br: 1, rm: "GIRLS 2312" },
];
const WSHP_L1 = [
  { id: "1-1", ty: "D", gpm: 6.5, br: 1, rm: "CORR 1300" }, { id: "1-2", ty: "C", gpm: 4.4, br: 1, rm: "CORR 1300" },
  { id: "1-8", ty: "C", gpm: 4.4, br: 1, rm: "CORR 1300" }, { id: "1-3", ty: "C", gpm: 4.4, br: 1, rm: "CORR 1300" },
  { id: "1-4", ty: "C", gpm: 4.4, br: 1, rm: "CORR 1300" }, { id: "1-5", ty: "C", gpm: 4.4, br: 1, rm: "CORR 1300" },
  { id: "1-7", ty: "C", gpm: 4.4, br: 1, rm: "BOYS 1300" }, { id: "1-6", ty: "A", gpm: 2.2, br: 0.75, rm: "GIRLS 1311" },
];
// header / main / geo segments: design reads from the riser (len = ASSUMED ft)
const TRUNKS = [
  { id: "H2a", grp: "L2 header", d: 1.25, gpm: 10.9, len: 30 }, { id: "H2b", grp: "L2 header", d: 2.5, gpm: 45, len: 30 },
  { id: "H2c", grp: "L2 header", d: 1.25, gpm: 8.8, len: 30 }, { id: "H2d", grp: "L2 header", d: 1.5, gpm: 19.7, len: 30 },
  { id: "H2e", grp: "L2 header", d: 2.5, gpm: 49.4, len: 30 }, { id: "H2f", grp: "L2 header", d: 2.5, gpm: 59.5, len: 30 },
  { id: "H2g", grp: "L2 header", d: 3, gpm: 79.6, len: 30 }, { id: "H2h", grp: "L2 header", d: 3, gpm: 89, len: 30 },
  { id: "H2i", grp: "L2 header", d: 1.25, gpm: 7.7, len: 30 },
  { id: "R1", grp: "inter-floor riser", d: 3, gpm: 89, len: 20 }, { id: "R2", grp: "inter-floor riser", d: 3, gpm: 87.3, len: 20 },
  { id: "R3", grp: "inter-floor riser", d: 3, gpm: 93.9, len: 20 }, // refined: was "8\"/93.9" (0.6 ft/s implausible)
  { id: "H1a", grp: "L1 header", d: 1.25, gpm: 10.9, len: 30 }, { id: "H1b", grp: "L1 header", d: 1.25, gpm: 8.8, len: 30 },
  { id: "H1c", grp: "L1 header", d: 1.5, gpm: 19.7, len: 30 }, { id: "H1d", grp: "L1 header", d: 2, gpm: 24.1, len: 30 },
  { id: "H1e", grp: "L1 header", d: 1.25, gpm: 6.6, len: 30 },
  { id: "GM1", grp: "geo main", d: 6, gpm: 724.1, len: 150 }, { id: "GM2", grp: "geo main", d: 6, gpm: 728.5, len: 150 },
  { id: "GM3", grp: "geo main", d: 8, gpm: 822.4, len: 150 }, { id: "GM4", grp: "geo main", d: 6, gpm: 733.4, len: 150 },
  { id: "WF", grp: "wellfield (RFI 183)", d: 8, gpm: 700, len: 200 }, { id: "ACCU", grp: "ACCU loop (RFI 181)", d: 3, gpm: 89, len: 60 },
];

const BASE = { demand: 1, addUnits: 0, vfdBldg: 100, vfdGeo: 100, Cf: 150, lenMul: 1, sel: null };
const BLDG_MAIN = 89, GEO_MAIN = 822.4;   // baseline trunk flows used for what-if propagation

function compute(S) {
  // baseline per-segment
  const segs = [];
  const mkBranch = (u, fl) => {
    const gpm = u.gpm * S.demand, d = u.br, hf = hwPer100(gpm, d, S.Cf) * (25 * S.lenMul) / 100;
    return { id: `WSHP-${u.id}`, grp: `${fl} branch`, d, gpm, len: 25 * S.lenMul, v: vel(gpm, d), hf, unit: u };
  };
  WSHP_L2.forEach((u) => segs.push(mkBranch(u, "L2")));
  WSHP_L1.forEach((u) => segs.push(mkBranch(u, "L1")));
  TRUNKS.forEach((t) => {
    let gpm = t.gpm;
    if (t.grp.startsWith("geo") || t.grp.startsWith("wellfield")) gpm *= S.vfdGeo / 100;
    else if (t.grp.includes("header") || t.grp.includes("riser")) gpm = gpm * S.demand * (S.vfdBldg / 100) + (t.id === "H2h" || t.id === "R1" ? S.addUnits * 4.4 : 0);
    const len = t.len * S.lenMul;
    segs.push({ id: t.id, grp: t.grp, d: t.d, gpm, len, v: vel(gpm, t.d), hf: hwPer100(gpm, t.d, S.Cf) * len / 100 });
  });
  segs.forEach((s) => (s.flag = vFlag(s.v, s.d)));

  const bldgGPM = BLDG_MAIN * S.demand * (S.vfdBldg / 100) + S.addUnits * 4.4;
  const geoGPM = GEO_MAIN * (S.vfdGeo / 100);
  // illustrative pump model (affinity) — no curves yet
  const pump = (vfd, Hn, gpm) => { const H = Hn * Math.pow(vfd / 100, 2); return { H, gpm: gpm, bhp: gpm * H / (3960 * 0.75) }; };
  const pBldg = pump(S.vfdBldg, 90, bldgGPM), pGeo = pump(S.vfdGeo, 120, geoGPM);

  const flags = segs.filter((s) => s.flag);
  const maxHf = segs.reduce((a, b) => (b.hf > a.hf ? b : a), segs[0]);
  const maxV = segs.reduce((a, b) => (b.v > a.v ? b : a), segs[0]);
  return { segs, bldgGPM, geoGPM, pBldg, pGeo, flags, maxHf, maxV };
}

/* -------------------- grounded query engine -------------------- */
function answer(q, R, S) {
  const t = q.toLowerCase();
  const find = (id) => R.segs.find((s) => s.id.toLowerCase().includes(id));
  if (/highest|max/.test(t) && /head|loss|pressure/.test(t))
    return `Highest head loss: ${R.maxHf.id} (${R.maxHf.d}" @ ${f1(R.maxHf.gpm)} GPM) ≈ ${f2(R.maxHf.hf)} ft over its ${R.maxHf.len.toFixed(0)} ft (assumed length). Velocity ${f1(R.maxHf.v)} ft/s.`;
  if (/highest|max|fastest/.test(t) && /velocit|speed/.test(t))
    return `Highest velocity: ${R.maxV.id} at ${f1(R.maxV.v)} ft/s (${R.maxV.d}" @ ${f1(R.maxV.gpm)} GPM).${R.maxV.v > 8 ? " ⚠ exceeds 8 ft/s." : ""}`;
  const red = t.match(/(\d+(?:\.\d+)?)\s*"?\s*(?:to|→|->)\s*(\d+(?:\.\d+)?)/); // "8 to 6"
  if (red) {
    const from = +red[1], to = +red[2];
    const seg = R.segs.find((s) => Math.abs(s.d - from) < 0.01) || R.segs.reduce((a, b) => (b.gpm > a.gpm ? b : a), R.segs[0]);
    const vNew = vel(seg.gpm, to);
    return `${seg.id}: ${from}" → ${to}" at ${f1(seg.gpm)} GPM raises velocity ${f1(seg.v)} → ${f1(vNew)} ft/s${vNew > 8 ? " ⚠ over 8 ft/s — undersized" : " — within range"}. Head loss scales ≈ (${from}/${to})^4.87 = ${f1(Math.pow(from / to, 4.8655))}×.`;
  }
  const add = t.match(/(\d+)\s*(?:additional|more|extra)?\s*(?:wshp|unit)/);
  if (add || /support|capacity|expand/.test(t)) {
    const n = add ? +add[1] : 10;
    const g = BLDG_MAIN * S.demand + n * 4.4, v3 = vel(g, 3);
    return `+${n} units (≈${(n * 4.4).toFixed(1)} GPM) → building 3" main ≈ ${f1(g)} GPM, ${f1(v3)} ft/s${v3 > 8 ? ` ⚠ over 8 ft/s — the 3" main becomes the bottleneck (upsize to 4").` : ` — main OK (<8 ft/s).`}`;
  }
  if (/pump|vfd|efficient/.test(t))
    return `Illustrative (no curves yet): building pump ${S.vfdBldg}% → ${f1(R.pBldg.gpm)} GPM @ ~${f0p(R.pBldg.H)} ft, ${f1(R.pBldg.bhp)} BHP; geo pump ${S.vfdGeo}% → ${f1(R.pGeo.gpm)} GPM, ${f1(R.pGeo.bhp)} BHP. Power ∝ speed³ — trim VFD to the lowest speed holding ≥ design ΔP. Provide P-1…P-4 curves to size the real operating point.`;
  const b = find("wshp-") || (t.match(/(\d-\d)/) && find(t.match(/(\d-\d)/)[1]));
  if (b && /why|under|low|branch/.test(t))
    return `${b.id}: ${b.d}" @ ${f1(b.gpm)} GPM = ${f1(b.v)} ft/s.${b.v < 2 ? " Low velocity — branch may be oversized or starved; check balancing valve & upstream ΔP." : " Velocity normal; if underperforming, suspect ΔP/balancing, not pipe size."}`;
  return `Try: "highest head loss", "highest velocity", "reduce 8 to 6", "support 10 more units", "why is 2-6 low", "most efficient pump". (Answers are computed from the model; pump/energy/NPSH illustrative pending curves & Cx data.)`;
}
const f0p = (v) => (v == null || isNaN(v) ? "—" : Math.round(v).toString());

/* -------------------- small UI -------------------- */
function Slider({ label, value, min, max, step = 1, unit, onChange, accent, note }) {
  return (<div style={{ marginBottom: 11 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: 12.5, color: C.lab }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 13, color: accent || C.ink }}>{value.toFixed(step < 1 ? 2 : 0)}<span style={{ color: C.unit, fontSize: 10.5 }}> {unit}</span></span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: "100%", accentColor: accent || C.blue }} />
    {note && <div style={{ fontSize: 10.5, color: C.txt2 }}>{note}</div>}
  </div>);
}

export default function App() {
  const [S, setS] = useState({ ...BASE });
  const [sel, setSel] = useState(null);
  const [last, setLast] = useState(null);
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const set = (k, lbl) => (v) => { setS((p) => ({ ...p, [k]: v })); if (lbl) setLast(lbl); };
  const R = useMemo(() => compute(S), [S]);
  const selSeg = sel ? R.segs.find((s) => s.id === sel) : null;

  const prev = useRef(R);
  const [sens, setSens] = useState([]);
  useEffect(() => {
    const p = prev.current;
    const rows = [["Building main GPM", "bldgGPM", "GPM"], ["Geo main GPM", "geoGPM", "GPM"]]
      .map(([lab, k, u]) => ({ lab, u, from: p[k], to: R[k], d: R[k] - p[k] })).filter((x) => Math.abs(x.d) > 1e-3);
    if (selSeg) { const pp = p.segs.find((s) => s.id === selSeg.id); if (pp) { if (Math.abs(pp.v - selSeg.v) > 1e-3) rows.push({ lab: `${selSeg.id} velocity`, u: "ft/s", from: pp.v, to: selSeg.v, d: selSeg.v - pp.v }); if (Math.abs(pp.hf - selSeg.hf) > 1e-3) rows.push({ lab: `${selSeg.id} head loss`, u: "ft", from: pp.hf, to: selSeg.hf, d: selSeg.hf - pp.hf }); } }
    if (Math.abs(R.pBldg.bhp - p.pBldg.bhp) > 0.02) rows.push({ lab: "Building pump BHP", u: "HP", from: p.pBldg.bhp, to: R.pBldg.bhp, d: R.pBldg.bhp - p.pBldg.bhp });
    setSens(rows.slice(0, 6)); prev.current = R;
  }, [R, selSeg]);

  const sweep = useMemo(() => {
    if (!selSeg) return [];
    const a = []; for (let g = 0; g <= selSeg.gpm * 2 + 5; g += Math.max((selSeg.gpm * 2) / 20, 1)) a.push({ g: +g.toFixed(0), v: +vel(g, selSeg.d).toFixed(2) });
    return a;
  }, [selSeg]);

  const reset = () => { setS({ ...BASE }); setSel(null); setLast("Reset"); setAns(""); };
  const runQ = (text) => { const r = answer(text, R, S); setAns(r); };

  // layout helpers
  const ux2 = (i) => 300 + i * 138, uxy2 = 300;   // L2 unit x slots
  const uy1 = 690;
  const WSHPbox = (u, x, y, fl) => {
    const seg = R.segs.find((s) => s.id === `WSHP-${u.id}`);
    const on = sel === seg.id;
    return (
      <g key={u.id} transform={`translate(${x} ${y})`} style={{ cursor: "pointer" }} onClick={() => setSel(seg.id)}>
        <line x1={0} y1={fl === "L2" ? -52 : 52} x2={0} y2={0} stroke={vColor(seg.v)} strokeWidth={clamp(1.5 + seg.gpm / 4, 1.5, 6)} />
        <rect x={-56} y={-20} width={112} height={40} rx={6} fill={on ? "#16243a" : C.box} stroke={on ? C.blue : C.line} strokeWidth={on ? 2 : 1.2} />
        <text x={0} y={-5} textAnchor="middle" fontSize="12.5" fontFamily={MONO} fontWeight="700" fill={C.ink}>WSHP-{u.id}</text>
        <text x={0} y={11} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={C.lab}>{u.ty} · {u.gpm} GPM · {u.br}"</text>
        <text x={0} y={28} textAnchor="middle" fontSize="9.5" fontFamily={SANS} fill={C.dim}>{u.rm}</text>
      </g>
    );
  };

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: SANS, minHeight: "100%", padding: "18px 16px 36px" }}>
      <style>{`@keyframes flow{to{stroke-dashoffset:-18}}`}</style>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: 2, color: C.dim, textTransform: "uppercase" }}>Stoddert ES · DG-22-S002 · design-basis hydraulic twin</div>
            <h1 style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 700 }}>WSHP / Geo-Exchange Distribution Network</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {last && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>last · {last}</span>}
            <button onClick={reset} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", background: C.box, border: `1px solid ${C.line}`, color: C.txt2, borderRadius: 7, padding: "6px 11px", fontSize: 12.5 }}><RotateCcw size={13} /> Reset</button>
          </div>
        </div>

        <div style={{ marginTop: 12, background: "#1a1510", border: `1px solid ${C.amber}55`, borderRadius: 9, padding: "9px 13px", fontSize: 12, color: "#f0d6a6", display: "flex", gap: 8 }}>
          <AlertTriangle size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
          <span><b>Design-basis</b>: topology + sizes + design GPM are from the riser; velocity & head loss are computed. <b>Lengths assumed</b> (branch 25 ft / header 30 ft / main 150 ft, scalable). Pump operating points, NPSH, and energy are <b>illustrative</b> — provide P-1…P-4 curves, valve Cv, lengths/materials, elevations, equipment ΔP, and balancing/Cx reports for calibrated grade. Refined read: "8&quot;/93.9" → <b>3"/93.9</b> (riser).</span>
        </div>

        {/* riser schematic */}
        <div style={{ background: C.canvas, border: `1px solid ${C.line}`, borderRadius: 12, padding: 8, marginTop: 12 }}>
          <svg viewBox="0 0 1480 820" style={{ width: "100%", height: "auto", display: "block" }}>
            {/* ACCU + wellfield */}
            <g onClick={() => setSel("ACCU")} style={{ cursor: "pointer" }}>
              <rect x={36} y={120} width={150} height={150} rx={8} fill={sel === "ACCU" ? "#16243a" : C.box} stroke={sel === "ACCU" ? C.blue : C.line} />
              {[0, 1, 2].map((i) => <circle key={i} cx={70 + i * 40} cy={150} r={14} fill="none" stroke={C.blue} strokeWidth={2} />)}
              <text x={111} y={250} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>ACCU-1</text>
            </g>
            <text x={210} y={118} fontSize="11" fill={C.red} fontFamily={MONO}>RFI 181</text>
            <g onClick={() => setSel("WF")} style={{ cursor: "pointer" }}>
              <ellipse cx={110} cy={560} rx={74} ry={36} fill={sel === "WF" ? "#16243a" : C.box} stroke={sel === "WF" ? C.blue : C.line} />
              <text x={110} y={556} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink}>Wellfield</text>
              <text x={110} y={572} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={C.lab}>{f0p(R.geoGPM)} GPM</text>
            </g>
            <text x={196} y={520} fontSize="11" fill={C.red} fontFamily={MONO}>RFI 183</text>

            {/* L2 + L1 header rails */}
            {[{ y: 230, lab: "GWS / GWR — Level 2", v: vel(R.segs.find(s=>s.id==="H2h").gpm,3) }, { y: 620, lab: "GWS / GWR — Level 1", v: vel(R.bldgGPM,3) }].map((h, i) => (
              <g key={i}>
                <line x1={200} y1={h.y} x2={1180} y2={h.y} stroke={vColor(h.v)} strokeWidth={5} opacity={0.6} />
                <line x1={200} y1={h.y} x2={1180} y2={h.y} stroke="#eef8ff" strokeWidth={1.6} strokeDasharray="2 16" style={{ animation: "flow 1.6s linear infinite" }} />
                <text x={205} y={h.y - 10} fontSize="11.5" fontFamily={SANS} fontWeight="700" fill={C.lab}>{h.lab}</text>
              </g>
            ))}
            {/* geo main */}
            <line x1={184} y1={560} x2={1180} y2={560} stroke={vColor(vel(R.geoGPM, 8))} strokeWidth={9} opacity={0.55} />
            <text x={640} y={552} fontSize="11.5" fontFamily={MONO} fill={C.lab}>Geo main 6"–8" · {f0p(R.geoGPM)} GPM · {f1(vel(R.geoGPM, 8))} ft/s (8")</text>

            {/* WSHP units */}
            {WSHP_L2.map((u, i) => WSHPbox(u, ux2(i), uxy2, "L2"))}
            {WSHP_L1.map((u, i) => WSHPbox(u, ux2(i), uy1, "L1"))}

            {/* mech room */}
            <rect x={1210} y={120} width={230} height={560} rx={10} fill="none" stroke={C.line} strokeDasharray="5 4" />
            <text x={1325} y={140} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.lab}>Mechanical Room</text>
            {[["P-1", 1, "vfdBldg"], ["P-2", 2, "vfdBldg"], ["P-3", 3, "vfdGeo"], ["P-4", 4, "vfdGeo"]].map(([p, n, key], i) => {
              const on = sel === p; const x = 1250 + (i % 2) * 100, y = 200 + Math.floor(i / 2) * 90;
              return (<g key={p} transform={`translate(${x} ${y})`} style={{ cursor: "pointer" }} onClick={() => setSel(p)}>
                <rect x={-38} y={-30} width={76} height={60} rx={8} fill={on ? "#16243a" : C.box} stroke={on ? C.blue : C.line} strokeWidth={on ? 2 : 1.2} />
                <circle r={13} fill="none" stroke={C.green} strokeWidth={2.2} /><circle r={3} fill={C.green} />
                <text y={-16} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily={MONO} fill={C.ink}>{p}</text>
                <text y={26} textAnchor="middle" fontSize="10" fontFamily={MONO} fill={C.lab}>VFD {S[key]}%</text>
              </g>);
            })}
            {[["BT-1", 380], ["AS-1 / AS-2", 440], ["ET-5", 500], ["CHEM-1", 560], ["DOAS-2", 620]].map(([t, y], i) => (
              <g key={i}><rect x={1250} y={y} width={150} height={40} rx={6} fill={C.box} stroke={C.line} /><text x={1325} y={y + 25} textAnchor="middle" fontSize="11.5" fontFamily={MONO} fill={C.lab}>{t}</text></g>
            ))}
            {/* connectors */}
            <line x1={186} y1={195} x2={186} y2={230} stroke={C.blue} strokeWidth={3} />
            <line x1={1180} y1={230} x2={1210} y2={230} stroke={C.blue} strokeWidth={3} />
            <line x1={1180} y1={620} x2={1210} y2={620} stroke={C.blue} strokeWidth={3} />
            <line x1={1180} y1={560} x2={1210} y2={560} stroke={vColor(vel(R.geoGPM, 8))} strokeWidth={6} />
            <text x={740} y={806} fontSize="11.5" fontFamily={MONO} fill={C.dim}>branch/header width ∝ flow · color = velocity (green ≤4 · yellow ≤8 · amber ≤10 · red &gt;10 ft/s) · click any element to inspect/resize</text>
          </svg>
        </div>

        {/* controls */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 12, marginTop: 12 }}>
          {/* selected element */}
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Gauge size={13} /> {selSeg ? `Inspect · ${selSeg.id}` : sel && /P-/.test(sel) ? `Pump · ${sel}` : "Select an element"}</div>
            {selSeg ? (<div>
              <Slider label="Pipe diameter" value={selSeg.d} min={0.75} max={12} step={0.25} unit="in" accent={C.blue}
                onChange={(v) => { setLast(`${selSeg.id} → ${v}"`); const isU = selSeg.id.startsWith("WSHP-"); const uid = selSeg.id.replace("WSHP-", ""); if (isU) { const arr = uid.startsWith("2") ? WSHP_L2 : WSHP_L1; const u = arr.find((x) => x.id === uid); if (u) u.br = v; } else { const tk = TRUNKS.find((x) => x.id === selSeg.id); if (tk) tk.d = v; } setS((s) => ({ ...s })); }} note="ΔP ∝ 1/d⁴·⁸⁷ · velocity ∝ 1/d²" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontFamily: MONO, fontSize: 12.5, marginTop: 4 }}>
                <span style={{ color: C.txt2 }}>flow <b style={{ color: C.ink }}>{f1(selSeg.gpm)}</b> GPM</span>
                <span style={{ color: C.txt2 }}>velocity <b style={{ color: vColor(selSeg.v) }}>{f1(selSeg.v)}</b> ft/s</span>
                <span style={{ color: C.txt2 }}>HW loss <b style={{ color: C.ink }}>{f2(selSeg.hf)}</b> ft</span>
                <span style={{ color: C.txt2 }}>DW loss <b style={{ color: C.ink }}>{f2(darcy(selSeg.gpm, selSeg.d).hf100 * selSeg.len / 100)}</b> ft</span>
                <span style={{ color: C.txt2 }}>len(assumed) <b style={{ color: C.ink }}>{selSeg.len.toFixed(0)}</b> ft</span>
                <span style={{ color: C.txt2 }}>Re <b style={{ color: C.ink }}>{f0p(darcy(selSeg.gpm, selSeg.d).Re)}</b></span>
              </div>
              {selSeg.flag && <div style={{ marginTop: 8, fontSize: 12, color: selSeg.flag.s === "high" ? C.red : selSeg.flag.s === "warn" ? C.amber : C.blue }}>⚠ {selSeg.flag.t}</div>}
              <div style={{ height: 90, marginTop: 8 }}>
                <ResponsiveContainer>
                  <LineChart data={sweep} margin={{ top: 4, right: 6, left: -22, bottom: -8 }}>
                    <CartesianGrid stroke={C.soft} vertical={false} /><XAxis dataKey="g" stroke={C.txt2} fontSize={9.5} tickLine={false} /><YAxis stroke={C.txt2} fontSize={9.5} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0a0e15", border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 11 }} labelFormatter={(v) => `${v} GPM`} />
                    <Line dataKey="v" name="ft/s" stroke={C.blue} strokeWidth={2} dot={false} />
                    <ReferenceDot x={Math.round(selSeg.gpm)} y={+selSeg.v.toFixed(2)} r={4} fill={C.amber} stroke="#fff" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 10, color: C.dim, fontFamily: MONO }}>velocity vs flow @ {selSeg.d}" · dot = current</div>
            </div>) : sel && /P-/.test(sel) ? (
              <div style={{ fontSize: 12.5, color: C.lab }}>{sel} is a {/P-[12]/.test(sel) ? "building-loop" : "geo/wellfield"} pump (assumed). Use the VFD sliders under What-if. Illustrative head/BHP shown there — provide the pump curve for the real operating point & NPSH.</div>
            ) : <div style={{ fontSize: 12.5, color: C.lab }}>Click a WSHP unit, header, main, the ACCU, wellfield, or a pump on the diagram.</div>}
          </div>

          {/* what-if */}
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Activity size={13} /> What-if</div>
            <Slider label="Building demand" value={S.demand} min={0.2} max={2} step={0.05} unit="×" accent={C.teal} onChange={set("demand", "Demand")} note="scales all WSHP branch flows" />
            <Slider label="Add WSHP units (×4.4 GPM)" value={S.addUnits} min={0} max={20} unit="units" accent={C.teal} onChange={set("addUnits", "Add units")} note="adds to the building main" />
            <Slider label="Building pump VFD (P-1/2)" value={S.vfdBldg} min={20} max={110} unit="%" accent={C.amber} onChange={set("vfdBldg", "Bldg VFD")} />
            <Slider label="Geo pump VFD (P-3/4)" value={S.vfdGeo} min={20} max={110} unit="%" accent={C.amber} onChange={set("vfdGeo", "Geo VFD")} />
            <Slider label="Length assumption" value={S.lenMul} min={0.5} max={3} step={0.1} unit="×" onChange={set("lenMul", "Length ×")} />
            <Slider label="Hazen-Williams C" value={S.Cf} min={100} max={150} unit="" onChange={set("Cf", "HW C")} note="150 PVC · ~130 steel/aged" />
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.txt2, marginTop: 4 }}>bldg main <b style={{ color: vColor(vel(R.bldgGPM, 3)) }}>{f1(R.bldgGPM)}</b> GPM @ {f1(vel(R.bldgGPM, 3))} ft/s (3") · geo <b style={{ color: C.ink }}>{f0p(R.geoGPM)}</b> GPM</div>
          </div>

          {/* validation */}
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={13} /> Validation ({R.flags.length})</div>
            {R.flags.length === 0 ? <div style={{ fontSize: 12.5, color: C.green }}>✓ All segments within 2–8 ft/s.</div> :
              <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 220, overflowY: "auto" }}>
                {R.flags.map((s) => { const col = s.flag.s === "high" ? C.red : s.flag.s === "warn" ? C.amber : C.blue; return (
                  <div key={s.id} onClick={() => setSel(s.id)} style={{ cursor: "pointer", fontSize: 11.5, color: C.lab, borderLeft: `3px solid ${col}`, paddingLeft: 8 }}><b style={{ color: C.ink, fontFamily: MONO }}>{s.id}</b> · {s.flag.t}</div>); })}
              </div>}
          </div>

          {/* sensitivity */}
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Activity size={13} /> What changed & why</div>
            {sens.length === 0 ? <div style={{ fontSize: 12.5, color: C.txt2 }}>Adjust a control to see the ripple.</div> :
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 12.5 }}><tbody>
                {sens.map((s, i) => { const up = s.d > 0; return (<tr key={i} style={{ borderTop: i ? `1px solid ${C.soft}` : "none" }}>
                  <td style={{ padding: "6px 0", color: C.lab, fontFamily: SANS }}>{s.lab}</td>
                  <td style={{ padding: "6px 6px", textAlign: "right", color: C.txt2 }}>{f1(s.from)}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center", color: up ? C.red : C.green }}>{up ? "▲" : "▼"}</td>
                  <td style={{ padding: "6px 0", textAlign: "right", color: C.ink, fontWeight: 600 }}>{f1(s.to)}<span style={{ color: C.unit, fontSize: 10 }}> {s.u}</span></td>
                </tr>); })}
              </tbody></table>}
          </div>

          {/* query */}
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 15, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Search size={13} /> Engineering query (computed from the model)</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 9 }}>
              {["Highest head loss", "Highest velocity", "Reduce 8 to 6", "Support 10 more units", "Most efficient pump"].map((b) => (
                <button key={b} onClick={() => { setQ(b); runQ(b); }} style={{ cursor: "pointer", borderRadius: 7, padding: "5px 10px", fontSize: 11.5, border: `1px solid ${C.line}`, background: C.box, color: C.lab }}>{b}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runQ(q)} placeholder='e.g. "why is 2-6 low" or "reduce 8 to 6"' style={{ flex: 1, background: C.box, border: `1px solid ${C.line}`, borderRadius: 7, color: C.ink, padding: "8px 10px", fontSize: 12.5, fontFamily: SANS }} />
              <button onClick={() => runQ(q)} style={{ cursor: "pointer", borderRadius: 7, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, border: `1px solid ${C.blue}`, background: "#10202c", color: C.blue }}>Ask</button>
            </div>
            {ans && <div style={{ marginTop: 10, fontSize: 12.5, color: C.lab, lineHeight: 1.6, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 12px" }}>{ans}</div>}
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 10.5, color: C.dim, fontFamily: MONO }}>
          Design-basis hydraulic twin · velocity & head loss computed · pump points / NPSH / energy illustrative pending P-1…P-4 curves, Cv, lengths, elevations, equipment ΔP, balancing/Cx reports
        </div>
      </div>
    </div>
  );
}
