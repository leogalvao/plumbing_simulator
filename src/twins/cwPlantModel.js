/* ==========================================================================
 *  cwPlantModel.js — Stoddert ES CW / Geo-Exchange plant reduced-order model.
 *  PURE functions (no React) so the calibration is testable head-less
 *  (see cwPlantModel.test.mjs). The Cw Plant twin imports computeState/BASE
 *  from here for the SCADA view.
 *
 *  ── CALIBRATION ANCHOR (real enteliWEB capture, 2025-11-21) ──
 *    Inputs : OA-T 75.1°F · OA-H 73.2 %RH · Geo ST 80.6°F
 *             P1 On@100% · P2 Off · P3 On@65% · P4 On@100%
 *             CV-1-1 0% · CV-1-2 0% · CV-3 0% · CV-5 2.7%
 *    Plant  : GWS 670.9 GPM · BTU(FM-2) 98.8 GPM
 *             New-Add DP 34.5 psi · Existing-Bldg DP 5.4 psi
 *             LWT 59.5°F · EWT 74.5°F · GWS-T 78.8°F · GWR-T 81.3°F
 *             Geo RT 81.4°F · BTU 66.2 / 74.7°F
 *  Every CAPTURE value below is reproduced by computeState(BASE) within the
 *  acceptance tolerances; the tunable constants are FITTED to this point.
 *
 *  ── TOPOLOGY (physically correct, reduced-order) ──
 *    • GEO / ground loop  (GWS Flow) is circulated by the GEO/chiller-condenser
 *      pumps P3 + P4. GWS = f(P3+P4 speed, geo system curve, wellfield bypass).
 *      Throttling P3 (lead/lag) LOWERS GWS — that is how the plant holds ~671
 *      GPM with P4 at 100%. CV-1-1/CV-1-2 DIVERT flow around the wellfield
 *      (protecting it above ~500 GPM); opening them REDUCES measured GWS, it is
 *      not an additive path.
 *    • BUILDING loop (New-Add DP, Existing DP, BTU branch) is circulated by the
 *      primary VS pumps P1 + P2 (parallel, lead/standby). Building flow and DP
 *      scale with the running building-pump capacity; P2 Off ⇒ its branch is dead.
 *    • ACCU is the air-cooled HP chiller: condenser side = geo loop (GWS),
 *      evaporator side = building chilled water (LWT leaving / EWT entering).
 *
 *  ── FREE COOLING (LWT/EWT) ──
 *    LWT is driven off the ambient WET-BULB (so OA-H matters), not dry-bulb:
 *      LWT = wetbulb(OA-T,OA-H) + LWT_WB_OFFSET
 *    LWT_WB_OFFSET is FITTED to the capture (≈ −9.1°F). It is negative because
 *    the geo-exchange ground loop + the running heat-pump compressors hold the
 *    leaving water BELOW the ambient wet-bulb at the capture (a fluid cooler
 *    alone could not — this is a chiller, not a cooling tower). EWT follows from
 *    LWT plus the ACCU loop ΔT (duty / flow), capped by the CV-5 diverting
 *    setpoint (TS-2 ≤ ACCU-CV5-TEMP-SP).
 * ========================================================================== */

import { clamp } from "../theme.js";
import { props as glProps, freezePointF, burstPointF } from "../glycol.js";

/* ----------------------------- physics ----------------------------- */
export function muWater_cP(tF) { const T = ((tF - 32) * 5) / 9 + 273.15; return 2.414e-2 * Math.pow(10, 247.8 / (T - 140)); }
export function frictionFactor(Re, rr) { if (Re < 2300) return 64 / Math.max(Re, 1); const x = rr / 3.7 + 5.74 / Math.pow(Re, 0.9); return 0.25 / Math.pow(Math.log10(x), 2); }
export function segHyd(Q, D_in, L, rough, rho, tF) {
  const Qcfs = Q * 0.002228, Dft = D_in / 12, A = (Math.PI / 4) * Dft * Dft;
  const v = Qcfs / Math.max(A, 1e-6), mu = muWater_cP(tF) * 6.7197e-4;
  const Re = (rho * v * Dft) / Math.max(mu, 1e-9), f = frictionFactor(Re, rough / Dft);
  return { dP: (f * (L / Dft) * rho * v * v) / 2 / 144, v, Re };
}

/* Stull (2011) wet-bulb approximation. tF in °F, rh in %RH, returns °F.
 * Valid for the normal HVAC range; good to ~0.3°C vs psychrometric tables. */
export function wetBulbF(tF, rh) {
  const T = ((tF - 32) * 5) / 9;            // °C
  const R = clamp(rh, 1, 100);
  const tw =
    T * Math.atan(0.151977 * Math.sqrt(R + 8.313659)) +
    Math.atan(T + R) - Math.atan(R - 1.676331) +
    0.00391838 * Math.pow(R, 1.5) * Math.atan(0.023101 * R) - 4.686035;
  return (tw * 9) / 5 + 32;
}

/* --------------------------------------------------------------------------
 *  CV-5 CONVENTION — SINGLE SOURCE OF TRUTH.
 *  CV-5 (SOO CV-4, M503 §7.1) is the ACCU diverting valve that holds entering-
 *  chiller water (TS-2 = EWT) at ACCU-CV5-TEMP-SP (≈75°F). Its position is also
 *  read as the fraction of cooled flow that recirculates rather than reaching
 *  the building. The 2025-11-21 capture forces the "% bypass" reading:
 *      sysFracToBuilding = 1 − CV-5/100   (0% ⇒ full cold flow to building).
 *  Flip CV5_PCT_IS_BYPASS if the SOO valve schedule (09/M503, FLAG-B) defines
 *  CV-5 the other way; every downstream calc reads sysFracToBuilding().
 * ------------------------------------------------------------------------- */
export const CV5_PCT_IS_BYPASS = true;
export const sysFracToBuilding = (cv5) =>
  CV5_PCT_IS_BYPASS ? clamp(1 - cv5 / 100, 0, 1) : clamp(cv5 / 100, 0, 1);

/* --------------------------------------------------------------------------
 *  REAL enteliWEB capture (2025-11-21) — calibration target, and the inputs
 *  that reproduce it. BASE === the capture inputs ("Reset to capture" / the
 *  "Load 2025-11-21 capture" preset).
 * ------------------------------------------------------------------------- */
export const BASE = {
  p1: 100, p2: 0, p3: 65, p4: 100, p1on: true, p2on: false, p3on: true, p4on: true,
  cv5: 2.7, cv3: 0, cv11: 0, cv12: 0,
  oat: 75.1, oah: 73.2, geoST: 80.6, bldgTons: 70,
  D: 8, L: 100, rough: 0.00015, glycol: 0, glycolType: "PG", accuOn: true,
  lwtSP: 44, chwdpSP: 6.0, cv5tempSP: 75,
};

/* Real readings at the capture — used by the comparison table + the test. */
export const CAPTURE = {
  GWS: 670.9, BTUflow: 98.8, NewDP: 34.5, ExistDP: 5.4,
  LWT: 59.5, EWT: 74.5, GWST: 78.8, GWRT: 81.3, geoRT: 81.4,
  BTUsup: 66.2, BTUret: 74.7, p3Speed: 65.0,
};

/* --------------------------------------------------------------------------
 *  CALIBRATION CONSTANTS — fitted to the capture above. Where a value is a
 *  pure read-off of the capture it is derived from CAPTURE/BASE so the anchor
 *  stays exact if the capture is ever re-stated.
 * ------------------------------------------------------------------------- */
const HEAT_F = 500;            // ρ·cp heat-transport factor for water (BTU/h per GPM·°F)

/* GEO loop hydraulics (P3 + P4). Affinity-exact pump ∩ quadratic system curve:
 *   Q = (Σspeed/100) · √( H0 / (a + R) )  ⇒  GWS ∝ Σspeed and ∝ √(1/R). */
const GEO_SPEED_REF = 65 + 100;                 // P3 65% + P4 100% at the capture
const H0_P34 = 95;                              // ft  — P3/P4 shut-off head @100%
const H_DUTY_GEO = 47.5;                        // ft  — geo system head at the per-100% design flow
const Q_GEO_1 = CAPTURE.GWS / (GEO_SPEED_REF / 100);     // GPM at 100% combined geo speed (≈406.6)
const A_GEO = (H0_P34 - H_DUTY_GEO) / (Q_GEO_1 * Q_GEO_1); // geo pump-curve droop coeff
const R0_GEO = H_DUTY_GEO / (Q_GEO_1 * Q_GEO_1);          // geo base system resistance
const BYPASS_R_DROP = 0.12;                     // wellfield bypass lowers geo loop resistance
const BYPASS_DIVERT = 0.55;                     // fraction of geo flow diverted at full bypass

/* BUILDING loop (P1 + P2). */
const H0_P1 = 120;                              // ft  — P1/P2 shut-off head @100%
const BLDG_SPEED_REF = 100;                     // P1 100% + P2 0% at the capture
const BTU_FLOW_REF = CAPTURE.BTUflow;           // GPM — building branch flow at the capture
const NEWDP_REF = CAPTURE.NewDP;                // psi — New-Addition DP at the capture
const EXISTDP_REF = CAPTURE.ExistDP;            // psi — Existing-Building DP at the capture

/* Thermal anchors. */
const GWS_SUPPLY_OFFSET = BASE.geoST - CAPTURE.GWST;     // °F — GWS-T below Geo ST (=1.8)
const GEO_RT_OFFSET = CAPTURE.geoRT - CAPTURE.GWRT;      // °F — Geo RT vs GWR-T (=0.1)
const ACCU_LOOP_DT = CAPTURE.EWT - CAPTURE.LWT;          // °F — ACCU evaporator ΔT (=15.0)
const ACCU_EVAP_REF = 90;                       // GPM — illustrative ACCU evaporator flow @ bSpeed ref (duty KPI only)
const CV5_WARM_SPAN = 12;                        // °F — building-supply warm-up across CV-5 travel
/* Free-cooling: LWT = wetbulb + offset, offset fitted so LWT = CAPTURE.LWT. */
const LWT_WB_OFFSET = CAPTURE.LWT - wetBulbF(BASE.oat, BASE.oah);   // ≈ −9.1°F
/* Building-supply delivery offset above LWT (mixing + distribution), fitted. */
const BTU_SUP_OFFSET = CAPTURE.BTUsup - CAPTURE.LWT - (BASE.cv5 / 100) * CV5_WARM_SPAN;
const BTU_DT_REF = CAPTURE.BTUret - CAPTURE.BTUsup;       // °F — building branch ΔT (=8.5)

const ENV_GWS_LOW = 400;       // GPM — normal-envelope floor
const ENV_GWS_HIGH = 950;      // GPM — normal-envelope ceiling

export const CONSTANTS = {
  HEAT_F, GEO_SPEED_REF, H0_P34, H_DUTY_GEO, Q_GEO_1, A_GEO, R0_GEO,
  BYPASS_R_DROP, BYPASS_DIVERT, H0_P1, BLDG_SPEED_REF, BTU_FLOW_REF,
  NEWDP_REF, EXISTDP_REF, GWS_SUPPLY_OFFSET, GEO_RT_OFFSET, ACCU_LOOP_DT,
  ACCU_EVAP_REF, CV5_WARM_SPAN, LWT_WB_OFFSET, BTU_SUP_OFFSET, BTU_DT_REF,
};

/* ========================================================================== *
 *  computeState — relational reduced-order solve at one operating point.      *
 * ========================================================================== */
export function computeState(I) {
  const loopT = 63;
  const gp = glProps(I.glycolType, I.glycol, loopT);   // glycol props (ratios vs water; 0% = water)
  const rho = gp.rho, muMul = gp.muRatio;
  const heatF = HEAT_F * gp.rhoRatio * gp.cpRatio;     // ρ·cp heat-transport factor
  const freezeF = freezePointF(I.glycolType, I.glycol);
  const burstF = burstPointF(I.glycolType, I.glycol);

  /* ---- geometry / fluid resistance (shared by both loops) ---- */
  const segDesign = segHyd(CAPTURE.GWS, BASE.D, BASE.L, BASE.rough, 62.3, loopT);
  const segGeom = segHyd(CAPTURE.GWS, I.D, I.L, I.rough, rho, loopT);
  const geomMul = (segGeom.dP / Math.max(segDesign.dP, 1e-9)) * Math.pow(muMul, 0.5);

  /* ---- 1a. GEO LOOP — GWS Flow driven by P3 + P4 (geo/condenser pumps) ---- */
  const geoSpeed = (I.p3on ? I.p3 : 0) + (I.p4on ? I.p4 : 0);   // combined geo-pump speed %
  const bypassAvg = (I.cv11 + I.cv12) / 2;                      // wellfield bypass valve avg position
  const lossMulGeo = geomMul * (1 - BYPASS_R_DROP * bypassAvg / 100);  // open bypass → lower R
  const Rgeo = R0_GEO * Math.max(lossMulGeo, 1e-3);
  const geoPumpFlow = (geoSpeed / 100) * Math.sqrt(H0_P34 / (A_GEO + Rgeo)); // total geo pump flow
  const divertFrac = BYPASS_DIVERT * bypassAvg / 100;          // CV-1 diverts flow AROUND the wellfield
  const GWS = geoPumpFlow * (1 - divertFrac);                  // measured wellfield (GWS) flow
  const gwsBypassFlow = geoPumpFlow * divertFrac;              // flow routed through the bypass

  /* ---- 1b. BUILDING LOOP — flow / DP driven by P1 + P2 (primary VS pumps) ---- */
  const bSpeed = (I.p1on ? I.p1 : 0) + (I.p2on ? I.p2 : 0);    // combined building-pump speed %
  const bFlowIdx = (bSpeed / BLDG_SPEED_REF) / Math.sqrt(Math.max(geomMul, 1e-3)); // ∝ speed, ∝√(1/R)
  const bldgFlow = BTU_FLOW_REF * bFlowIdx;                    // building distribution flow
  const BTUflow = bldgFlow * (1 + 0.2 * I.cv3 / 100);          // metered branch (CV-3 recirc adds a little)
  // Building DP follows pump-head affinity (∝ N²) with a mild geometry term.
  const dpScaleBldg = Math.pow(bSpeed / BLDG_SPEED_REF, 2) * Math.max(geomMul, 1e-3);
  const NewDP = NEWDP_REF * dpScaleBldg;
  const ExistDP = EXISTDP_REF * dpScaleBldg;
  const velocity = segHyd(GWS, I.D, I.L, I.rough, rho, loopT).v;  // main/geo-loop velocity

  /* ---- 2. LOOP / GEOTHERMAL TEMPERATURES ---- */
  const GWST = I.geoST - GWS_SUPPLY_OFFSET;                    // GWS supply temp
  const bldgBtu = I.bldgTons * 12000;
  const GWRT = GWST + bldgBtu / (heatF * Math.max(GWS, 1));    // return rises with load / falls with flow
  const geoRT = GWRT + GEO_RT_OFFSET;                          // ground return ≈ geo water return

  /* ---- 3. ACCU THERMAL — wet-bulb free cooling + ACCU loop ΔT ---- */
  const twb = wetBulbF(I.oat, I.oah);
  // LWT off the ambient wet-bulb (responds to OA-T AND OA-H), bounded by the
  // chiller setpoint below and the ground temp above; ACCU off ⇒ drifts to ground.
  let LWT;
  if (!I.accuOn) LWT = I.geoST;
  else LWT = clamp(twb + LWT_WB_OFFSET, I.lwtSP, I.geoST);
  // EWT = LWT + ACCU loop ΔT (duty/flow), capped by the CV-5 diverting setpoint.
  const dtAccu = ACCU_LOOP_DT * (I.bldgTons / BASE.bldgTons) * (BTU_FLOW_REF / Math.max(bldgFlow, 1));
  const EWT = I.accuOn ? Math.min(LWT + dtAccu, I.cv5tempSP) : GWRT;
  const accuEvapFlow = ACCU_EVAP_REF * bFlowIdx;
  const accuTons = (heatF * accuEvapFlow * Math.max(EWT - LWT, 0)) / 12000;

  /* ---- 4. CV-5 SPLIT + BUILDING / BTU-BRANCH TEMPERATURES ---- */
  const sysFrac = I.accuOn ? sysFracToBuilding(I.cv5) : 0;     // cold flow fraction reaching building
  const coolerToSystem = bldgFlow * sysFrac;
  const coolerBypass = bldgFlow * (1 - sysFrac);
  // Building supply = chiller-leaving water (LWT) + delivery/mixing offset, warmed as CV-5 bypasses.
  const BTUsup = I.accuOn
    ? LWT + BTU_SUP_OFFSET + (I.cv5 / 100) * CV5_WARM_SPAN
    : GWRT;
  // Building return = supply + branch ΔT (load / branch flow).
  const bldgBranchDT = BTU_DT_REF * (I.bldgTons / BASE.bldgTons) * (BTU_FLOW_REF / Math.max(BTUflow, 1));
  const BTUret = BTUsup + bldgBranchDT;

  /* ---- 5. PUMPS — affinity display (H ∝ N², P ∝ N³), flow shared by running pumps ---- */
  function pump(s, on, Hn, q) {
    if (!on || s <= 0 || q <= 0) return { head: 0, hp: 0, q: 0 };
    const H = Hn * Math.pow(s / 100, 2);
    return { head: H, hp: (q * H * (rho / 62.4)) / (3960 * 0.75), q };
  }
  const share = (s, on, total) => (on && total > 0 ? s / total : 0);
  const P1 = pump(I.p1, I.p1on, H0_P1, bldgFlow * share(I.p1, I.p1on, bSpeed));
  const P2 = pump(I.p2, I.p2on, H0_P1, bldgFlow * share(I.p2, I.p2on, bSpeed));
  const P3 = pump(I.p3, I.p3on, H0_P34, GWS * share(I.p3, I.p3on, geoSpeed));
  const P4 = pump(I.p4, I.p4on, H0_P34, GWS * share(I.p4, I.p4on, geoSpeed));

  /* ---- 6. ENVELOPE ALERTS ---- */
  const alerts = [];
  if (I.accuOn) {
    if (twb + LWT_WB_OFFSET <= I.lwtSP)
      alerts.push({ s: "info", t: `Free-cooling/chiller floor — LWT held at the ${I.lwtSP}°F setpoint (ambient wet-bulb ${twb.toFixed(1)}°F is cold enough).` });
    else
      alerts.push({ s: "info", t: `LWT ${LWT.toFixed(1)}°F tracks ambient wet-bulb ${twb.toFixed(1)}°F (OA-T ${I.oat.toFixed(1)}°F / OA-H ${I.oah.toFixed(0)}%RH) + the fitted ${LWT_WB_OFFSET.toFixed(1)}°F geo/mechanical offset.` });
    if (LWT + dtAccu > I.cv5tempSP + 0.1)
      alerts.push({ s: "warn", t: `CV-5 capping entering-chiller water (TS-2) at ${I.cv5tempSP.toFixed(0)}°F — building load exceeds what the ACCU loop can absorb at this flow.` });
  }
  if (I.accuOn && sysFrac < 0.02)
    alerts.push({ s: "info", t: `CV-5 ${I.cv5.toFixed(0)}% — cooled water is fully bypassing the building (recirculating).` });
  if (velocity > 8) alerts.push({ s: "high", t: `Pipe velocity ${velocity.toFixed(1)} ft/s exceeds ~8 ft/s — erosion/noise risk. Increase diameter or reduce flow.` });
  if (velocity < 2 && GWS > 50) alerts.push({ s: "warn", t: `Pipe velocity ${velocity.toFixed(1)} ft/s is low (<2 ft/s) — fouling risk.` });
  if (GWS > ENV_GWS_HIGH) alerts.push({ s: "high", t: `GWS flow ${GWS.toFixed(0)} GPM is above the normal envelope (~${ENV_GWS_LOW}–${ENV_GWS_HIGH} GPM).` });
  if (GWS > 50 && GWS < ENV_GWS_LOW) alerts.push({ s: "warn", t: `GWS flow ${GWS.toFixed(0)} GPM is below the normal envelope (~${ENV_GWS_LOW}–${ENV_GWS_HIGH} GPM).` });
  if (bypassAvg > 1) alerts.push({ s: "info", t: `Wellfield bypass ${bypassAvg.toFixed(0)}% open — diverting ${gwsBypassFlow.toFixed(0)} GPM around the wellfield (GWS reads the wellfield flow only).` });
  if (NewDP > 60) alerts.push({ s: "high", t: `New Addition DP ${NewDP.toFixed(1)} psi is high vs the ${I.chwdpSP} psi setpoint.` });
  if (!I.accuOn) alerts.push({ s: "warn", t: `ACCU off — no cooling; LWT rises toward Geo ST (${I.geoST.toFixed(1)}°F).` });
  if (!I.p1on && !I.p2on) alerts.push({ s: "high", t: `No building pump running — building flow = 0; no distribution to the building.` });
  if (!I.p3on && !I.p4on) alerts.push({ s: "high", t: `No geo pump running — GWS flow = 0; no ground-loop circulation.` });
  if (I.glycol > 0 && I.oat <= burstF) alerts.push({ s: "high", t: `Burst risk — OA-T ${I.oat.toFixed(0)}°F ≤ burst-protection temp ${burstF.toFixed(0)}°F for ${I.glycol.toFixed(1)}% ${I.glycolType}. Increase glycol.` });
  else if (I.oat <= freezeF) alerts.push({ s: "high", t: `Freeze risk — OA-T ${I.oat.toFixed(0)}°F ≤ freeze point ${freezeF.toFixed(0)}°F for ${I.glycol.toFixed(1)}% ${I.glycolType}. Increase glycol for freeze/burst protection.` });
  if (I.glycol >= 35) alerts.push({ s: "warn", t: `High glycol (${I.glycol.toFixed(1)}% ${I.glycolType}) — viscosity ${gp.muRatio.toFixed(1)}× water raises pump head/power and lowers coil heat transfer.` });

  return {
    GWS, geoPumpFlow, coolerFlow: GWS, coolerToSystem, coolerBypass, gwsBypassFlow,
    bldgFlow, NewDP, ExistDP, velocity, twb,
    LWT, EWT, accuTons, GWST, GWRT, geoRT, BTUflow, BTUsup, BTUret,
    P1, P2, P3, P4, alerts, bSpeed, geoSpeed, sysFrac, dtAccu,
    heatF, freezeF, burstF, gp,
  };
}

/* --------------------------------------------------------------------------
 *  Comparison helper — Real (capture) vs Sim vs Variance for the calibration
 *  points. Pass the inputs to evaluate at (defaults to the capture/BASE).
 * ------------------------------------------------------------------------- */
export const COMPARE_POINTS = [
  { key: "GWS", label: "GWS Flow", unit: "GPM", tol: 0.05, rel: true },
  { key: "BTUflow", label: "BTU Flow (FM-2)", unit: "GPM", tol: 0.08, rel: true },
  { key: "NewDP", label: "New Addition DP", unit: "psi", tol: 0.10, rel: true },
  { key: "ExistDP", label: "Existing Bldg DP", unit: "psi", tol: 0.15, rel: true },
  { key: "LWT", label: "LWT", unit: "°F", tol: 1.5, rel: false },
  { key: "EWT", label: "EWT", unit: "°F", tol: 1.5, rel: false },
  { key: "GWST", label: "GWS T", unit: "°F", tol: 1.6, rel: false },
  { key: "GWRT", label: "GWR T", unit: "°F", tol: 1.6, rel: false },
  { key: "geoRT", label: "Geo RT", unit: "°F", tol: 1.6, rel: false },
  { key: "BTUsup", label: "BTU Supply", unit: "°F", tol: 1.6, rel: false },
  { key: "BTUret", label: "BTU Return", unit: "°F", tol: 1.6, rel: false },
];

export function buildComparison(inputs = BASE) {
  const sim = computeState(inputs);
  return COMPARE_POINTS.map((p) => {
    const real = CAPTURE[p.key];
    const got = sim[p.key];
    const variance = got - real;
    const limit = p.rel ? Math.abs(real) * p.tol : p.tol;
    return {
      ...p, real, sim: got, variance,
      tolText: p.rel ? `±${(p.tol * 100).toFixed(0)}%` : `±${p.tol}`,
      pass: Math.abs(variance) <= limit + 1e-9,
    };
  });
}
