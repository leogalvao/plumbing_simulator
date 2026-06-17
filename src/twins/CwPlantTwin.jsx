import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
} from "recharts";
import { AlertTriangle, RotateCcw, Zap, Droplets, Thermometer, Activity, Beaker } from "lucide-react";
import { C, MONO, SANS, clamp, f1, f0 } from "../theme.js";
import { Slider, Toggle, Panel, Stat, InfoDot } from "../components.jsx";
import { freezePointF, burstPointF, concForFreeze, props as glProps, impacts as glImpacts, CURRENT_PCT, RECOMMENDED_PCT } from "../glycol.js";

/* ========================================================================== *
 *  Stoddert ES — CW / Geo-Exchange Plant · Interactive Digital Twin           *
 *  Reduced-order RELATIONAL model, CALIBRATED to a real enteliWEB capture.    *
 *  Layout matched to the 2025-11-21 enteliWEB graphic.                        *
 *                                                                            *
 *  ── CALIBRATION ANCHOR (real enteliWEB capture, 2025-11-21) ──             *
 *    Controls : P1=100%  P2=off  P3=65%  P4=100%  CV-5=25.3%                  *
 *               CV-1-1=0%  CV-1-2=0%  CHWDP-SP=6.0 psi  OA-T=84.5°F           *
 *    Plant    : GWS 661 GPM · GWS-T 81.7°F · GWR-T 84.7°F                     *
 *               LWT 60.8°F · EWT 75.0°F · Geo ST 83.4 / Geo RT 84.9°F         *
 *               New-Addition DP 31.7 psi · Existing-Bldg DP 5.2 psi           *
 *               BTU 66.8°F / 100.8 GPM / 74.6°F                               *
 *    These values are reproduced by `BASE` ("Reset to capture") within        *
 *    ~10% on flow/DP and ~2°F on temperatures.                                *
 *                                                                            *
 *  ── METHOD / ASSUMPTIONS ──                                                 *
 *   1. HYDRAULICS — the pump curve  H(n,Q) = n²·H0 − a·Q²  is intersected     *
 *      with a quadratic system curve  H(Q) = R·Q².  H0, a and R are anchored  *
 *      so that at full speed, design geometry and the wellfield bypass shut,  *
 *      P1=100% lands the duty point at Q_DESIGN = 661 GPM.  Pump affinity is  *
 *      preserved EXACTLY (Q∝N, H∝N², P∝N³): with R·Q² as the system curve the *
 *      intersection gives Q = N·√(H0/(a+R)), i.e. flow is linear in speed.    *
 *      Pipe D/L/roughness/fluid scale the effective resistance R (so ΔP and   *
 *      flow track geometry); opening the wellfield bypass (CV-1-1/CV-1-2)     *
 *      adds a parallel path that LOWERS R.  Differential pressures are        *
 *      anchored to the capture and scale with Q² and the same resistance.     *
 *   2. ACCU THERMAL — EQ-ACCU-1 is an AIR-COOLED HEAT-PUMP CHILLER (fans/     *
 *      compressors C1–C4).  Free cooling (LWT ≈ ambient + approach) is ONLY   *
 *      the floor when the compressors are off.  When mechanical cooling runs  *
 *      it pulls LWT *below ambient* toward ACCU-1-LWT-SP, limited by chiller  *
 *      capacity (derates as OA-T rises) and ACCU flow (P3/P4).  CV-5 holds    *
 *      the entering-chiller temp (TS-2 = EWT) at ACCU-CV5-TEMP-SP (≈75°F).    *
 *   3. CV-5 CONVENTION — see CV5_PCT_IS_BYPASS below (single source of truth).*
 *   4. OA-H (outdoor humidity) is DISPLAY-ONLY.  An air-cooled plant's water  *
 *      temperatures are a dry-bulb (OA-T) phenomenon, so OA-H does not feed   *
 *      any calc; it is shown for context only (see the parameters panel).     *
 * ========================================================================== */

/* ----------------------------- physics ----------------------------- */
function muWater_cP(tF) { const T = ((tF - 32) * 5) / 9 + 273.15; return 2.414e-2 * Math.pow(10, 247.8 / (T - 140)); }
function frictionFactor(Re, rr) { if (Re < 2300) return 64 / Math.max(Re, 1); const x = rr / 3.7 + 5.74 / Math.pow(Re, 0.9); return 0.25 / Math.pow(Math.log10(x), 2); }
function segHyd(Q, D_in, L, rough, rho, tF) {
  const Qcfs = Q * 0.002228, Dft = D_in / 12, A = (Math.PI / 4) * Dft * Dft;
  const v = Qcfs / Math.max(A, 1e-6), mu = muWater_cP(tF) * 6.7197e-4;
  const Re = (rho * v * Dft) / Math.max(mu, 1e-9), f = frictionFactor(Re, rough / Dft);
  return { dP: (f * (L / Dft) * rho * v * v) / 2 / 144, v, Re };
}
/* Fluid properties now come from ../glycol.js (continuous glycol model; 0% = water). */

/* --------------------------------------------------------------------------
 *  CV-5 CONVENTION — SINGLE SOURCE OF TRUTH.
 *  CV-5 (a.k.a. CV-4 in the M503 SOO §7.1) is the ACCU/chiller DIVERTING valve
 *  that holds entering-chiller-water temp (TS-2 = EWT) at ACCU-CV5-TEMP-SP
 *  (≈75°F).  Two readings of its position were in conflict (see the in-app
 *  banner note and SOO FLAG-B / coverage_report "CV-5 / both pipe cycles"):
 *      (a) "% cooled flow to building"   → sysFrac = CV-5 / 100
 *      (b) "% bypass" / "0% = full bypass"→ sysFrac = 1 − CV-5 / 100
 *  The 2025-11-21 capture FORCES (b): at CV-5 = 25.3% the building supply is
 *  66.8°F, i.e. mostly COLD ACCU water (LWT 60.8°F) blended with warm return
 *  (GWR-T 84.7°F).  That requires ~75% of the cooled flow to reach the
 *  building, so the 25.3% reading is the BYPASS port — convention (b).
 *
 *  >>> THIS MUST MATCH THE PLANT SEQUENCE OF OPERATIONS (M503 diagram 09 /
 *      valve schedule, still open as FLAG-B). If the SOO defines CV-5 the
 *      other way, flip the single flag below — every downstream calc (BTU
 *      supply temp, building-DP coupling, LWT/EWT coupling, ACCU to-system vs
 *      bypass split, and the CV-5 alert) reads `sysFracToBuilding()` and will
 *      follow automatically. NOTE: (b) intentionally contradicts the raw
 *      on-screen SCADA label "0% Full By-Pass"; the real data wins until the
 *      SOO confirms otherwise.
 * ------------------------------------------------------------------------- */
const CV5_PCT_IS_BYPASS = true; // ← flip to false if the SOO defines CV-5 as "% to system"
const sysFracToBuilding = (cv5) => CV5_PCT_IS_BYPASS ? clamp(1 - cv5 / 100, 0, 1) : clamp(cv5 / 100, 0, 1);

/* --------------------------------------------------------------------------
 *  CALIBRATION CONSTANTS — all anchored to the 2025-11-21 duty point above.
 * ------------------------------------------------------------------------- */
const Q_DESIGN = 661;          // GPM at P1=100%, design geometry, wellfield bypass shut
const H0_P1 = 120;             // ft  — P1/P2 shut-off head at 100% speed
const H_DUTY = 60;             // ft  — head where pump & system curves cross at design duty
const A_PUMP = (H0_P1 - H_DUTY) / (Q_DESIGN * Q_DESIGN); // pump-curve droop coeff (ft/GPM²)
const R0_SYS = H_DUTY / (Q_DESIGN * Q_DESIGN);           // base system resistance (ft/GPM²)
const H0_P34 = 95;             // ft  — P3/P4 shut-off head at 100% speed
const NEWDP_REF = 31.7;        // psi — New-Addition DP at the duty point
const EXISTDP_REF = 5.2;       // psi — Existing-Building DP at the duty point
const GWS_SUPPLY_OFFSET = 1.7; // °F  — GWS-T below Geo ST
const ACCU_APPROACH = 1.2;     // °F  — free-cooling approach to ambient (compressors off)
const ACCU_CAP_REF = 59.17;    // ton — mechanical cooling available at the 84.5°F anchor
const ACCU_DERATE = 0.006;     // /°F — air-cooled capacity derate as OA-T rises above anchor
const ACCU_FLOW_REF = 100;     // GPM — ACCU (P3/P4) flow at the anchor speed
const ACCU_SPEED_REF = 165;    // %   — P3+P4 combined speed at the anchor (65 + 100)
const BTU_FLOW_REF = 100.8;    // GPM — metered building-branch flow at the duty point
const BTU_DT_REF = 7.8;        // °F  — BTU return − supply at the duty point
const ENV_GWS_LOW = 400;       // GPM — normal-envelope floor
const ENV_GWS_HIGH = 950;      // GPM — normal-envelope ceiling

const BASE = {
  // "Reset to capture" → the 2025-11-21 enteliWEB reference operating point.
  p1: 100, p2: 0, p3: 65, p4: 100, p1on: true, p2on: false, p3on: true, p4on: true,
  cv5: 25.3, cv3: 0, cv11: 0, cv12: 0,
  oat: 84.5, oah: 53.0 /* display-only */, geoST: 83.4, bldgTons: 82.6,
  D: 8, L: 100, rough: 0.00015, glycol: 0, glycolType: "PG", accuOn: true,
  lwtSP: 44, chwdpSP: 6.0, cv5tempSP: 75,
};

function computeState(I) {
  const loopT = 63;
  const gp = glProps(I.glycolType, I.glycol, loopT);   // glycol fluid props (ratios vs water; 0% = water)
  const rho = gp.rho, muMul = gp.muRatio;
  const heatF = 500 * gp.rhoRatio * gp.cpRatio;        // ρ·cp heat-transport factor (500 = water baseline)
  const freezeF = freezePointF(I.glycolType, I.glycol);
  const burstF = burstPointF(I.glycolType, I.glycol);

  /* ---- 1. HYDRAULICS — pump curve ∩ quadratic system curve (affinity-exact) ---- */
  const bSpeed = (I.p1on ? I.p1 : 0) + (I.p2on ? I.p2 : 0);          // combined building-pump speed %
  const bypassAvg = (I.cv11 + I.cv12) / 2;                          // wellfield bypass valve avg position
  // Effective system resistance R = R0 · (geometry / fluid / bypass factors). At design
  // geometry (D=8, L=100, water) with the wellfield bypass shut, the factor is 1.0.
  const segDesign = segHyd(Q_DESIGN, BASE.D, BASE.L, BASE.rough, 62.3, loopT);
  const segGeom = segHyd(Q_DESIGN, I.D, I.L, I.rough, rho, loopT);
  let lossMul = (segGeom.dP / Math.max(segDesign.dP, 1e-9)) * Math.pow(muMul, 0.5);
  lossMul *= 1 - 0.12 * (bypassAvg / 100);                          // opening bypass lowers resistance
  const Rsys = R0_SYS * Math.max(lossMul, 1e-3);
  // Pump ∩ system: n²·H0 − a·Q² = Rsys·Q²  ⇒  Q = N · √(H0/(a+Rsys))  (Q ∝ N, exactly).
  const GWS = (bSpeed / 100) * Math.sqrt(H0_P1 / (A_PUMP + Rsys));

  const geoSpeed = (I.p3on ? I.p3 : 0) + (I.p4on ? I.p4 : 0);        // combined ACCU-pump speed %
  const coolerFlow = ACCU_FLOW_REF * (geoSpeed / ACCU_SPEED_REF) * Math.pow(I.D / BASE.D, 2);
  const gwsBypassFlow = GWS * (bypassAvg / 100) * 0.45;             // flow routed through the wellfield bypass

  // Differential pressures: anchored to the capture, scaling with flow² and resistance.
  const velocity = segHyd(GWS, I.D, I.L, I.rough, rho, loopT).v;
  const dpScale = Math.pow(GWS / Q_DESIGN, 2) * Math.max(lossMul, 1e-3) * Math.pow(muMul, 0.25);
  const NewDP = NEWDP_REF * dpScale;
  const ExistDP = EXISTDP_REF * dpScale;

  /* ---- 2. LOOP / GEOTHERMAL TEMPERATURES ---- */
  const GWST = I.geoST - GWS_SUPPLY_OFFSET;                          // GWS supply temp (geothermal loop)
  const bldgBtu = I.bldgTons * 12000;
  const GWRT = GWST + bldgBtu / (heatF * Math.max(GWS, 1));          // loop return rises with load / falls with flow (ρ·cp)
  const geoRT = I.geoST + (GWRT - GWST) / 2;                         // ground return warmer than supply (cooling)

  /* ---- 3. ACCU THERMAL — free-cooling floor + mechanical (compressor) cooling ---- */
  // CV-5 (chiller diverting valve) holds entering-chiller temp at its setpoint, capped by
  // the loop return (can't be warmer than what returns) and floored above LWT-SP.
  const EWT = I.accuOn ? clamp(I.cv5tempSP, I.lwtSP + 1, GWRT) : GWRT;
  const freeCoolFloor = I.oat + ACCU_APPROACH;                      // best LWT from free cooling alone
  const accuCapTons = I.accuOn ? ACCU_CAP_REF * (1 - ACCU_DERATE * (I.oat - 84.5)) : 0;
  const dTmech = (accuCapTons * 12000) / (heatF * Math.max(coolerFlow, 1)); // ΔT the chiller can pull (ρ·cp)
  // Compressors engage when free cooling can't reach the LWT setpoint (warm ambient);
  // otherwise free cooling alone holds the floor near ambient.
  const mechRunning = I.accuOn && freeCoolFloor > I.lwtSP + 1;
  let LWT;
  if (!I.accuOn) LWT = I.geoST;                                     // ACCU off → drifts toward ground temp
  else if (mechRunning) LWT = Math.min(freeCoolFloor, Math.max(I.lwtSP, EWT - dTmech)); // sub-ambient OK
  else LWT = Math.max(I.lwtSP, freeCoolFloor);                      // free cooling sufficient
  const accuTons = (heatF * coolerFlow * Math.max(EWT - LWT, 0)) / 12000;

  /* ---- 4. CV-5 SPLIT + BUILDING / BTU-BRANCH TEMPERATURES (per CV-5 convention) ---- */
  const sysFrac = I.accuOn ? sysFracToBuilding(I.cv5) : 0;          // cold ACCU flow fraction to building
  const coolerToSystem = coolerFlow * sysFrac;
  const coolerBypass = coolerFlow * (1 - sysFrac);

  const BTUflow = GWS * (BTU_FLOW_REF / Q_DESIGN) * (1 + 0.2 * I.cv3 / 100);
  // Building supply = warm loop return blended with cold ACCU water, weighted by CV-5 split.
  const BTUsup = GWRT - sysFrac * (GWRT - LWT);
  const BTUret = BTUsup + BTU_DT_REF * (I.bldgTons / BASE.bldgTons) * (BTU_FLOW_REF / Math.max(BTUflow, 1));

  /* ---- 5. PUMPS — affinity display (H ∝ N², P ∝ N³) ---- */
  function pump(s, on, Hn, q) {
    if (!on || s <= 0 || q <= 0) return { head: 0, hp: 0, q: 0 };
    const H = Hn * Math.pow(s / 100, 2);
    return { head: H, hp: (q * H * (rho / 62.4)) / (3960 * 0.75), q };
  }
  // Allocate total loop flow across only the running parallel pumps (by speed share),
  // so a single running pump carries the full flow instead of a hard-coded 50/50 split.
  const share = (s, on, total) => (on && total > 0 ? s / total : 0);
  const P1 = pump(I.p1, I.p1on, H0_P1, GWS * share(I.p1, I.p1on, bSpeed));
  const P2 = pump(I.p2, I.p2on, H0_P1, GWS * share(I.p2, I.p2on, bSpeed));
  const P3 = pump(I.p3, I.p3on, H0_P34, coolerFlow * share(I.p3, I.p3on, geoSpeed));
  const P4 = pump(I.p4, I.p4on, H0_P34, coolerFlow * share(I.p4, I.p4on, geoSpeed));

  /* ---- 6. ENVELOPE ALERTS ---- */
  const alerts = [];
  if (I.accuOn && mechRunning && LWT > I.lwtSP + 2)
    alerts.push({ s: "info", t: `ACCU mechanical cooling at capacity — LWT ${LWT.toFixed(1)}°F can't reach the ${I.lwtSP}°F setpoint (chiller capacity/flow limited at OA-T ${I.oat.toFixed(0)}°F). Raise ACCU flow (P3/P4) or shed load to pull LWT down.` });
  if (I.accuOn && !mechRunning)
    alerts.push({ s: "info", t: `Free-cooling mode — OA-T ${I.oat.toFixed(0)}°F is cold enough that LWT (${LWT.toFixed(1)}°F) holds without compressors.` });
  if (I.accuOn && sysFrac < 0.02)
    alerts.push({ s: "info", t: `CV-5 ${I.cv5.toFixed(0)}% — cooled ACCU water is fully bypassing the building (recirculating); building runs on ground-loop water.` });
  if (velocity > 8) alerts.push({ s: "high", t: `Pipe velocity ${velocity.toFixed(1)} ft/s exceeds ~8 ft/s — erosion/noise risk. Increase diameter or reduce flow.` });
  if (velocity < 2 && GWS > 50) alerts.push({ s: "warn", t: `Pipe velocity ${velocity.toFixed(1)} ft/s is low (<2 ft/s) — fouling risk.` });
  if (GWS > ENV_GWS_HIGH) alerts.push({ s: "high", t: `GWS flow ${GWS.toFixed(0)} GPM is above the normal envelope (~${ENV_GWS_LOW}–${ENV_GWS_HIGH} GPM).` });
  if (GWS > 50 && GWS < ENV_GWS_LOW) alerts.push({ s: "warn", t: `GWS flow ${GWS.toFixed(0)} GPM is below the normal envelope (~${ENV_GWS_LOW}–${ENV_GWS_HIGH} GPM).` });
  if (NewDP > 60) alerts.push({ s: "high", t: `New Addition DP ${NewDP.toFixed(1)} psi is high vs the ${I.chwdpSP} psi setpoint.` });
  if (!I.accuOn) alerts.push({ s: "warn", t: `ACCU off — no cooling; LWT rises toward Geo ST (${I.geoST.toFixed(1)}°F).` });
  if (!I.p1on && !I.p2on) alerts.push({ s: "high", t: `No building pump running — GWS flow = 0; no distribution to the building.` });
  if (I.glycol > 0 && I.oat <= burstF) alerts.push({ s: "high", t: `Burst risk — OA-T ${I.oat.toFixed(0)}°F ≤ burst-protection temp ${burstF.toFixed(0)}°F for ${I.glycol.toFixed(1)}% ${I.glycolType}. Increase glycol.` });
  else if (I.oat <= freezeF) alerts.push({ s: "high", t: `Freeze risk — OA-T ${I.oat.toFixed(0)}°F ≤ freeze point ${freezeF.toFixed(0)}°F for ${I.glycol.toFixed(1)}% ${I.glycolType}. Increase glycol for freeze/burst protection.` });
  if (I.glycol >= 35) alerts.push({ s: "warn", t: `High glycol (${I.glycol.toFixed(1)}% ${I.glycolType}) — viscosity ${gp.muRatio.toFixed(1)}× water raises pump head/power and lowers coil heat transfer; use only what the lowest fluid temperature needs.` });

  return { GWS, coolerFlow, coolerToSystem, coolerBypass, gwsBypassFlow, NewDP, ExistDP, velocity,
    LWT, EWT, accuTons, GWST, GWRT, geoRT, BTUflow, BTUsup, BTUret, P1, P2, P3, P4, alerts, bSpeed, mechRunning, sysFrac,
    heatF, freezeF, burstF, gp };
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

/* =============================== COMPONENT =============================== */
export default function CwPlantTwin() {
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
  const glNow = useMemo(() => glImpacts(I.glycolType, I.glycol), [I.glycolType, I.glycol]);
  const glCompare = useMemo(() => {
    const mk = (pct) => { const st = computeState({ ...I, glycol: pct }); const im = glImpacts(I.glycolType, pct);
      return { pct, freeze: freezePointF(I.glycolType, pct), burst: burstPointF(I.glycolType, pct),
        flow: st.GWS, hp: st.P1.hp + st.P2.hp, dp: st.NewDP, vel: st.velocity, ...im }; };
    return { water: mk(0), current: mk(CURRENT_PCT), rec: mk(RECOMMENDED_PCT), now: mk(I.glycol) };
  }, [I]);
  const glSweep = useMemo(() => { const a = [];
    for (let pp = 0; pp <= 50; pp += 2.5) { const st = computeState({ ...I, glycol: pp });
      a.push({ p: pp, freeze: +freezePointF(I.glycolType, pp).toFixed(1), hp: +(st.P1.hp + st.P2.hp).toFixed(1), flow: +st.GWS.toFixed(0) }); }
    return a; }, [I]);
  const reset = () => { setI({ ...BASE }); setSelected(null); setLastChange("Reset to capture"); };

  /* ---- glyphs ---- */
  const PumpGlyph = ({ x, y, id, label, speed, on }) => {
    const sel = selected?.id === id;
    return (
      <g transform={`translate(${x} ${y})`} onClick={() => setSelected({ type: "pump", id, label })} style={{ cursor: "pointer" }}>
        <title>{`${label} — ${on ? speed.toFixed(1) + "%" : "OFF"} · click to edit`}</title>
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
        <title>{`${label} — ${pos.toFixed(1)}% open · click to edit`}</title>
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

  const velColor = D.velocity > 8 ? C.red : D.velocity < 2 ? C.amber : C.green;

  return (
    <div style={{ padding: "14px 16px 36px" }}>
      <style>{`@keyframes flowdash{to{stroke-dashoffset:-18}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* KPI strip + toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Stat label="GWS Flow" value={f0(D.GWS)} unit="GPM" color={C.blue} />
          <Stat label="LWT" value={f1(D.LWT)} unit="°F" />
          <Stat label="EWT" value={f1(D.EWT)} unit="°F" />
          <Stat label="ACCU Duty" value={f1(D.accuTons)} unit="ton" color={C.teal} />
          <Stat label="Velocity" value={f1(D.velocity)} unit="ft/s" color={velColor} />
          <Stat label="Glycol" value={f1(I.glycol)} unit={`% ${I.glycolType}`} color={C.geo} />
          <Stat label="Freeze" value={f0(D.freezeF)} unit="°F" color={D.freezeF > I.oat ? C.red : C.blue} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lastChange && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>last · {lastChange}</span>}
          <button onClick={reset} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", background: C.box, border: `1px solid ${C.line}`, color: C.txt2, borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontFamily: SANS }}><RotateCcw size={13} /> Reset to capture</button>
        </div>
      </div>

      <div style={{ marginTop: 12, background: "#1a1510", border: `1px solid ${C.amber}55`, borderRadius: 9, padding: "9px 13px", fontSize: 12, color: "#f0d6a6", display: "flex", gap: 8 }}>
        <AlertTriangle size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Reduced-order relational model <b>calibrated</b> to the 2025-11-21 enteliWEB capture (reproduced by “Reset to capture” within ~10% on flow/DP, ~2°F on temps). <b>CV-5 is read as % bypass</b> (sysFrac to building = 1 − CV-5/100), the convention the real data requires — this contradicts the raw SCADA “0% Full By-Pass” label and must be verified against the sequence of operations (M503 ⑨, FLAG-B). The ACCU does mechanical cooling (sub-ambient LWT), not just free-cooling. OA-H is display-only.</span>
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
            <title>ACCU — air-cooled heat-pump chiller (free + mechanical cooling) · click to edit</title>
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
            {[["SYSTEM-EN", "True"], ["SYS-RESET", "Off"], ["WELLFIELD-REPL", "Off"], ["PMPDOWN-TIME", "300.0 s"], ["OA-T", I.oat.toFixed(1) + " °F"], ["OA-H †", I.oah.toFixed(1) + " %RH"]].map((r, i) => (
              <text key={i} x={430} y={298 + i * 18} fontSize="12.5" fontFamily={MONO} fill={C.lab}>{r[0]}<tspan x={612} textAnchor="end" fill={r[0] === "OA-H †" ? C.dim : C.ink}>{r[1]}</tspan></text>
            ))}
            <text x={430} y={404} fontSize="10" fontFamily={SANS} fill={C.dim}>† display-only — air-cooled plant (dry-bulb)</text>
          </g>

          {/* CV-5 */}
          <ValveGlyph x={690} y={495} id="cv5" label="ACCU (CV-5)" pos={I.cv5} />
          <Lbl x={596} y={486} size={13}>ACCU (CV-5)</Lbl>
          <ValBox x={563} y={500} w={66} text={`${I.cv5.toFixed(1)} %`} color={C.amber} />
          <text x={596} y={536} textAnchor="middle" fontSize="11" fontFamily={SANS} fill={C.lab}>0% Full System Flow</text>
          <text x={596} y={550} textAnchor="middle" fontSize="11" fontFamily={SANS} fill={C.lab}>100% Full By-Pass</text>

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

        {/* ---------- Glycol concentration control — fluid properties & system impacts ---------- */}
        <Panel icon={Beaker} title="Glycol Concentration (%) — fluid properties & loop impact" span right={
          <span style={{ display: "flex", gap: 6 }}>
            {["PG", "EG"].map((g) => (
              <button key={g} onClick={() => { setI((s) => ({ ...s, glycolType: g })); setLastChange(`Glycol type → ${g}`); }}
                style={{ cursor: "pointer", borderRadius: 6, padding: "4px 9px", fontSize: 11, fontFamily: MONO, fontWeight: 700,
                  border: `1px solid ${I.glycolType === g ? C.blue : C.line}`, background: I.glycolType === g ? "#10202c" : C.box, color: I.glycolType === g ? C.blue : C.txt2 }}>
                {g === "PG" ? "Propylene" : "Ethylene"}
              </button>
            ))}
          </span>
        }>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16, alignItems: "start" }}>
            <div>
              <Slider label="Glycol Concentration (%)" value={I.glycol} min={0} max={50} step={0.5} unit={`% ${I.glycolType}`} accent={C.geo}
                onChange={set("glycol", "Glycol concentration")} note={I.glycolType === "PG" ? "Propylene — non-toxic (school standard)" : "Ethylene — matches the supplied freeze table"} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {[["Freeze protection", f1(D.freezeF), D.freezeF > I.oat ? C.red : C.blue],
                  ["Burst protection", f1(D.burstF), C.geo]].map((r, i) => (
                  <div key={i} style={{ flex: 1, background: C.box, border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 10px" }}>
                    <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 0.5 }}>{r[0]}</div>
                    <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: r[2] }}>{r[1]}<span style={{ fontSize: 10.5, color: C.unit }}> °F</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {[["Water 0%", 0], [`Current ${CURRENT_PCT}%`, CURRENT_PCT], [`Recommended ${RECOMMENDED_PCT}%`, RECOMMENDED_PCT]].map(([lab, v]) => (
                  <button key={lab} onClick={() => { setI((s) => ({ ...s, glycol: v })); setLastChange(`Glycol → ${v}%`); }}
                    style={{ flex: 1, cursor: "pointer", borderRadius: 7, padding: "6px 4px", fontSize: 10.5, fontFamily: MONO,
                      border: `1px solid ${Math.abs(I.glycol - v) < 0.01 ? C.geo : C.line}`, background: Math.abs(I.glycol - v) < 0.01 ? "#1a1530" : C.box, color: Math.abs(I.glycol - v) < 0.01 ? C.geo : C.txt2 }}>{lab}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.txt2, marginTop: 10, lineHeight: 1.5 }}>
                Lowering the freeze point from 32°F (water) to ~26°F needs <b style={{ color: C.geo }}>≈ {concForFreeze(I.glycolType, 26).toFixed(1)}% {I.glycolType}</b> (industry curve). 0% reduces the entire loop to the calibrated water baseline.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>Fluid properties @ ~63°F (Δ vs water)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px,1fr))", gap: 8 }}>
                {[["Density", glNow.rho, "lb/ft³", glNow.rhoRatio, 1],
                  ["Specific heat", glNow.cp, "BTU/lb·°F", glNow.cpRatio, 3],
                  ["Viscosity", glNow.mu_cP, "cP", glNow.muRatio, 2],
                  ["Therm. cond.", glNow.k, "BTU/h·ft·°F", glNow.kRatio, 3]].map((r, i) => {
                  const pctd = (r[3] - 1) * 100; const big = Math.abs(pctd) > 0.05;
                  return (
                    <div key={i} style={{ background: C.box, border: `1px solid ${big ? C.geo + "66" : C.line}`, borderRadius: 9, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: C.dim }}>{r[0]}</div>
                      <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.ink }}>{r[1].toFixed(r[4])}<span style={{ fontSize: 9, color: C.unit }}> {r[2]}</span></div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: big ? (pctd > 0 ? C.amber : C.teal) : C.dim }}>{big ? `${pctd > 0 ? "▲" : "▼"} ${Math.abs(pctd).toFixed(0)}%` : "—"}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 1, color: C.dim, textTransform: "uppercase", margin: "12px 0 6px" }}>System impact (Δ vs water @ same controls)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px,1fr))", gap: 8 }}>
                {(() => { const w = glCompare.water, n = glCompare.now;
                  const rows = [["GWS flow", n.flow, "GPM", n.flow / w.flow, false],
                    ["Pump power", n.hp, "HP", w.hp > 0 ? n.hp / w.hp : 1, true],
                    ["New-Add DP", n.dp, "psi", w.dp > 0 ? n.dp / w.dp : 1, true],
                    ["Velocity", n.vel, "ft/s", w.vel > 0 ? n.vel / w.vel : 1, false],
                    ["Coil HTC", n.coilHTCRatio * 100, "% of water", n.coilHTCRatio, false],
                    ["Heat transport", n.heatCapRatio * (n.flow / w.flow) * 100, "% of water", n.heatCapRatio * (n.flow / w.flow), false]];
                  return rows.map((r, i) => { const pctd = (r[3] - 1) * 100; const big = Math.abs(pctd) > 0.05;
                    const bad = r[4] ? pctd > 0 : pctd < 0; const col = big ? (bad ? C.red : C.teal) : C.dim;
                    return (
                      <div key={i} style={{ background: C.box, border: `1px solid ${big ? col + "66" : C.line}`, borderRadius: 9, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: C.dim }}>{r[0]}</div>
                        <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.ink }}>{r[1].toFixed(1)}<span style={{ fontSize: 9, color: C.unit }}> {r[2]}</span></div>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: col }}>{big ? `${pctd > 0 ? "▲" : "▼"} ${Math.abs(pctd).toFixed(0)}%` : "—"}</div>
                      </div>
                    ); });
                })()}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>Comparison — water · current · recommended · now</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 11.5 }}>
                <thead><tr>
                  {["", "Water", `Cur ${CURRENT_PCT}%`, `Rec ${RECOMMENDED_PCT}%`, "Now"].map((h, i) => (
                    <th key={i} style={{ textAlign: i ? "right" : "left", padding: "4px 6px", color: i === 4 ? C.geo : C.dim, borderBottom: `1px solid ${C.line}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(() => { const { water: w, current: c, rec: rc, now: n } = glCompare;
                    const rows = [["Freeze °F", w.freeze, c.freeze, rc.freeze, n.freeze, 1],
                      ["Burst °F", w.burst, c.burst, rc.burst, n.burst, 0],
                      ["Density ×", w.rhoRatio, c.rhoRatio, rc.rhoRatio, n.rhoRatio, 3],
                      ["Sp.heat ×", w.cpRatio, c.cpRatio, rc.cpRatio, n.cpRatio, 3],
                      ["Viscosity ×", w.muRatio, c.muRatio, rc.muRatio, n.muRatio, 2],
                      ["Cond. ×", w.kRatio, c.kRatio, rc.kRatio, n.kRatio, 3],
                      ["GWS GPM", w.flow, c.flow, rc.flow, n.flow, 0],
                      ["Pump HP", w.hp, c.hp, rc.hp, n.hp, 1],
                      ["New DP psi", w.dp, c.dp, rc.dp, n.dp, 1],
                      ["Coil HTC ×", w.coilHTCRatio, c.coilHTCRatio, rc.coilHTCRatio, n.coilHTCRatio, 2]];
                    return rows.map((r, i) => (
                      <tr key={i} style={{ borderTop: i ? `1px solid ${C.soft}` : "none" }}>
                        <td style={{ padding: "4px 6px", color: C.lab, fontFamily: SANS }}>{r[0]}</td>
                        {[1, 2, 3, 4].map((j) => (
                          <td key={j} style={{ padding: "4px 6px", textAlign: "right", color: j === 4 ? C.geo : C.ink, fontWeight: j === 4 ? 700 : 400 }}>{r[j].toFixed(r[5])}</td>
                        ))}
                      </tr>
                    )); })()}
                </tbody>
              </table>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 1, color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>Sensitivity — freeze point & pump power vs glycol %</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={glSweep} margin={{ top: 4, right: 6, left: -20, bottom: -6 }}>
                    <CartesianGrid stroke={C.soft} vertical={false} />
                    <XAxis dataKey="p" stroke={C.txt2} fontSize={10.5} fontFamily={MONO} tickLine={false} unit="%" />
                    <YAxis yAxisId="L" stroke={C.blue} fontSize={10.5} fontFamily={MONO} tickLine={false} />
                    <YAxis yAxisId="R" orientation="right" stroke={C.amber} fontSize={10.5} fontFamily={MONO} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0a0e15", border: `1px solid ${C.line}`, borderRadius: 8, fontFamily: MONO, fontSize: 11.5 }} labelFormatter={(v) => `${v}% ${I.glycolType}`} />
                    <Line yAxisId="L" dataKey="freeze" name="Freeze °F" stroke={C.blue} strokeWidth={2} dot={false} />
                    <Line yAxisId="R" dataKey="hp" name="Pump HP" stroke={C.amber} strokeWidth={2} dot={false} />
                    <ReferenceDot yAxisId="L" x={Math.round(I.glycol / 2.5) * 2.5} y={+D.freezeF.toFixed(1)} r={4} fill={C.blue} stroke="#fff" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: C.txt2 }}>blue = freeze point (left, °F) · amber = pump power (right, HP) · dot = current</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.dim, marginTop: 8, lineHeight: 1.5 }}>
            Model: freeze/burst from ASHRAE/Dow {I.glycolType} curves · properties as ratios to water at the loop temp · friction ∝ ρ⁰·⁸·μ⁰·² · coil h ∝ ρ⁰·⁸·μ⁻⁰·⁴·k⁰·⁶·cp⁰·⁴ (Dittus-Boelter) · heat transport ∝ ρ·cp·flow. Details + assumptions in docs/Glycol_CW_Loop_Engineering.md. Burst temp is approximate — confirm with the glycol supplier's data.
          </div>
        </Panel>

        <Panel title={selected ? `Editing · ${selected.label}` : "Parameter editor"}>
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
              note={selected.id === "cv5" ? "% bypass (↑ = warmer building supply; 0% = full cold flow to building)" : selected.id === "cv3" ? "GWS minimum-flow recirculation" : "wellfield bypass — opens to route >500 GPM around the wellfield"} />
          )}
          {selected?.type === "accu" && (<div>
            <Toggle label="ACCU" on={I.accuOn} onChange={(v) => { setI((s) => ({ ...s, accuOn: v })); setLastChange(`ACCU ${v ? "ON" : "OFF"}`); }} />
            <div style={{ height: 8 }} />
            <Slider label="CV-5 (% bypass)" value={I.cv5} min={0} max={100} unit="%" accent={C.amber} onChange={set("cv5", "CV-5 position")} note="diverting valve · 100% = full bypass (recirculates), 0% = full cold flow to building" />
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.txt2, marginTop: 4 }}>LWT <b style={{ color: C.ink }}>{f1(D.LWT)}</b>°F · to system <b style={{ color: C.ink }}>{f0(D.coolerToSystem)}</b> GPM · bypass <b style={{ color: C.ink }}>{f0(D.coolerBypass)}</b> GPM</div>
          </div>)}
          {selected?.type === "setpoints" && (<div>
            <Slider label="ACCU-1-LWT-SP" value={I.lwtSP} min={40} max={75} unit="°F" onChange={set("lwtSP", "LWT setpoint")} note="mechanical cooling pulls LWT sub-ambient toward this SP (capacity-limited)" />
            <Slider label="CHWDP-SP" value={I.chwdpSP} min={4} max={15} unit="psi" onChange={set("chwdpSP", "CHWDP-SP")} />
            <Slider label="ACCU-CV5-TEMP-SP" value={I.cv5tempSP} min={50} max={90} unit="°F" onChange={set("cv5tempSP", "CV5-TEMP-SP")} />
          </div>)}
          {selected?.type === "btu" && (<div style={{ fontSize: 12.5, color: C.lab, lineHeight: 1.7 }}>Read-only meter. Supply <b style={{ color: C.ink }}>{f1(D.BTUsup)}</b>°F · Return <b style={{ color: C.ink }}>{f1(D.BTUret)}</b>°F · Flow <b style={{ color: C.ink }}>{f1(D.BTUflow)}</b> GPM · duty <b style={{ color: C.ink }}>{f1(500 * D.BTUflow * (D.BTUret - D.BTUsup) / 12000)}</b> ton.</div>)}
          {!selected && <div style={{ fontSize: 12.5, color: C.lab, lineHeight: 1.6 }}>Click a pump, valve, the ACCU, or the setpoints panel on the diagram to edit it. Environment, pipe, and fluid controls are always available here.</div>}
        </Panel>

        <Panel icon={Thermometer} title="Environment & loads">
          <Slider label="Outdoor air temp" value={I.oat} min={20} max={100} unit="°F" accent={C.geo} onChange={set("oat", "OA-T")} note="free-cooling floor + air-cooled chiller capacity derate" />
          <Slider label="Geo supply temp" value={I.geoST} min={50} max={85} unit="°F" accent={C.geo} onChange={set("geoST", "Geo ST")} />
          <Slider label="Building load" value={I.bldgTons} min={0} max={120} unit="ton" accent={C.teal} onChange={set("bldgTons", "Building load")} note="geothermal-loop cooling load → drives GWR-T & BTU return" />
          <div style={{ fontSize: 11, letterSpacing: 1, color: C.dim, textTransform: "uppercase", margin: "10px 0", display: "flex", alignItems: "center", gap: 6 }}><Droplets size={13} /> Pipe</div>
          <Slider label="Pipe diameter" value={I.D} min={3} max={14} step={0.5} unit="in" onChange={set("D", "Pipe diameter")} note="ΔP ∝ 1/D⁵ · velocity ∝ 1/D²" />
          <Slider label="Pipe length" value={I.L} min={20} max={400} unit="ft" onChange={set("L", "Pipe length")} />
          <Slider label="Roughness" value={I.rough * 1000} min={0.05} max={2} step={0.05} unit="×10⁻³ ft" onChange={(v) => set("rough", "Pipe roughness")(v / 1000)} />
          <div style={{ fontSize: 11, color: C.txt2, marginTop: 6 }}>Fluid: <b style={{ color: C.geo }}>{I.glycol > 0 ? `${f1(I.glycol)}% ${I.glycolType} glycol` : "water"}</b> — set concentration in the Glycol panel below.</div>
        </Panel>

        <Panel icon={Activity} title="What changed & why">
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
        </Panel>

        <Panel icon={Zap} title="P1 response curve">
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
        </Panel>
      </div>

      <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 10.5, color: C.dim, fontFamily: MONO }}>
        Layout matched to the 2025-11-21 enteliWEB capture · relational twin calibrated to that duty point · not a full P&ID hydraulic network solution
      </div>
    </div>
  );
}
