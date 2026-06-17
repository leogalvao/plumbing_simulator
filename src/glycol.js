/* ==========================================================================
 *  glycol.js — Glycol fluid model for the condenser-water / geo-exchange loop.
 *  Pure functions (no React). Used by the CW Plant twin's glycol control.
 *
 *  Freeze / burst points and fluid-property ratios (density, specific heat,
 *  viscosity, thermal conductivity) are calibrated to published ASHRAE / Dow
 *  glycol curves for PROPYLENE GLYCOL (PG — non-toxic, the correct fluid for a
 *  school geo loop) and ETHYLENE GLYCOL (EG). All ratios are relative to water
 *  at the loop operating temperature, so at 0 % concentration every ratio = 1.0
 *  and the loop reduces EXACTLY to the calibrated water baseline.
 *
 *  See docs/Glycol_CW_Loop_Engineering.md for the derivation, assumptions, and
 *  the freeze-point table (incl. the user-supplied target table).
 * ========================================================================== */

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* Freeze point (°F) vs concentration (% by volume) — ASHRAE/Dow anchor points.
 * EG reproduces the project's supplied target table (10→26, 20→18, 25→13, 30→8);
 * PG runs a few °F warmer at the same % and is the school/non-toxic choice. */
export const FREEZE = {
  PG: [[0, 32], [10, 26.1], [20, 18.9], [25, 14.2], [30, 9.0], [40, -5.5], [50, -27.6]],
  EG: [[0, 32], [10, 25.9], [20, 17.9], [25, 12.2], [30, 7.3], [40, -10.3], [50, -33.8]],
};

function interp(tbl, x) {
  if (x <= tbl[0][0]) return tbl[0][1];
  for (let i = 1; i < tbl.length; i++) {
    if (x <= tbl[i][0]) {
      const [x0, y0] = tbl[i - 1], [x1, y1] = tbl[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return tbl[tbl.length - 1][1];
}

export function freezePointF(type, pct) {
  return interp(FREEZE[type] || FREEZE.PG, clamp(pct, 0, 50));
}

/* Burst-protection temperature (°F). Burst protection extends well below the
 * freeze point because the fluid forms a pumpable slush before it can generate
 * burst pressure. Modeled as the freeze depression scaled by ~1.8× (typical of
 * manufacturer burst curves). APPROXIMATE — use the supplier's burst data for
 * final design. */
export function burstPointF(type, pct) {
  const fp = freezePointF(type, pct);
  return 32 - 1.8 * (32 - fp);
}

/* Inverse: concentration (% by vol) needed to depress the freeze point to targetF. */
export function concForFreeze(type, targetF) {
  const tbl = FREEZE[type] || FREEZE.PG;
  if (targetF >= 32) return 0;
  for (let i = 1; i < tbl.length; i++) {
    const [x0, y0] = tbl[i - 1], [x1, y1] = tbl[i];
    if (targetF <= y0 && targetF >= y1) return x0 + ((x1 - x0) * (targetF - y0)) / (y1 - y0);
  }
  return 50;
}

/* Property-ratio coefficients (per unit volume fraction), calibrated so that at
 * 30 %:  PG ρ≈1.025, cp≈0.937, k≈0.829, μ≈3.3×;  EG ρ≈1.041, cp≈0.919, k≈0.85, μ≈2.5×. */
const COEF = {
  PG: { rho: 0.083, cp: 0.21, k: 0.57, muA: 4.0 },
  EG: { rho: 0.137, cp: 0.27, k: 0.50, muA: 3.0 },
};
/* Water reference at ~63 °F loop temperature. */
export const WATER = { rho: 62.3, cp: 1.0, mu_cP: 1.08, k: 0.34 };

/* Fluid properties at concentration `pct` (vol %). Ratios are vs water; absolute
 * values use the WATER reference. `tF` adds a mild cold-temperature viscosity
 * thickening relative to the 63 °F reference (viscosity is strongly T-dependent). */
export function props(type, pct, tF = 63) {
  const x = clamp(pct, 0, 50) / 100;
  const c = COEF[type] || COEF.PG;
  const rhoRatio = 1 + c.rho * x;
  const cpRatio = 1 - c.cp * x;
  const kRatio = 1 - c.k * x;
  // base viscosity ratio at the 63 °F reference; mild Arrhenius-style cold bump
  const tFactor = x > 0 ? Math.exp((c.muA * 0.45 * x) * (63 - tF) / 100) : 1;
  const muRatio = Math.exp(c.muA * x) * clamp(tFactor, 1, 4);
  return {
    rhoRatio, cpRatio, kRatio, muRatio,
    rho: WATER.rho * rhoRatio,
    cp: WATER.cp * cpRatio,
    k: WATER.k * kRatio,
    mu_cP: WATER.mu_cP * muRatio,
  };
}

/* System-impact ratios derived from the property ratios (constant-velocity ref):
 *   frictionMult  ΔP at equal flow         — Darcy turbulent: ρ^0.8 · μ^0.2
 *   coilHTCRatio  convective h at the coil  — Dittus-Boelter: ρ^0.8 μ^-0.4 k^0.6 cp^0.4
 *   heatCapRatio  volumetric ρ·cp          — heat carried per unit volume flow      */
export function impacts(type, pct, tF = 63) {
  const p = props(type, pct, tF);
  const frictionMult = Math.pow(p.rhoRatio, 0.8) * Math.pow(p.muRatio, 0.2);
  const coilHTCRatio =
    Math.pow(p.rhoRatio, 0.8) * Math.pow(p.muRatio, -0.4) *
    Math.pow(p.kRatio, 0.6) * Math.pow(p.cpRatio, 0.4);
  const heatCapRatio = p.rhoRatio * p.cpRatio;
  return { ...p, frictionMult, coilHTCRatio, heatCapRatio };
}

/* Reference concentrations used by the comparison view. */
export const CURRENT_PCT = 10;     // documented current condition (~26 °F freeze)
export const RECOMMENDED_PCT = 25; // balanced freeze/burst vs pump & heat-transfer penalty (PG, school)
