# Glycol Concentration Control — Condenser-Water / Geo-Exchange Loop

Engineering basis for the interactive **Glycol Concentration (%)** control added to the CW / Geo-Exchange Plant
twin (`src/twins/CwPlantTwin.jsx`, model in `src/glycol.js`). The slider (0–50 %, 0.5 % steps) recalculates the
freeze/burst protection, the fluid properties, and the whole-loop system impacts in real time. **At 0 % every
property ratio = 1.0, so the loop reduces exactly to the water-calibrated baseline** ("Reset to capture").

---

## 1. Engineering calculation — concentration for 32 °F → 26 °F

The water freeze point is **32 °F**. Reading the industry freeze-depression curve (volume %):

- **Propylene glycol (PG):** 10 % → 26.1 °F  ⇒ inverse-interpolating to **26 °F → ≈ 10.1 % PG**
- **Ethylene glycol (EG):** 10 % → 25.9 °F  ⇒ **26 °F → ≈ 9.8 % EG**

> **A glycol concentration of ≈ 10 % (by volume) lowers the freeze point from 32 °F to ≈ 26 °F.**

This matches the project's stated *current* condition (“glycol < 30 %, freeze ≈ 26 °F”): the current operating
point is ≈ **10 % glycol**. The simulator's **Current** comparison column is pinned to 10 %.

**Burst protection** at 10 % ≈ **21 °F** (PG). Burst protection extends below the freeze point because the fluid
forms a pumpable slush before it can build burst pressure (see §3, with the stated approximation).

---

## 2. Glycol concentration vs. freeze point

| Glycol % (vol) | Supplied target | **PG** (model) | **EG** (model) |
|---:|---:|---:|---:|
| 0  | 32 | 32.0 | 32.0 |
| 10 | 26 | 26.1 | 25.9 |
| 20 | 18 | 18.9 | 17.9 |
| 25 | 13 | 14.2 | 12.2 |
| 30 | 8  | 9.0  | 7.3 |
| 40 | —  | −5.5 | −10.3 |
| 50 | —  | −27.6 | −33.8 |

The **EG** column reproduces the supplied target table (10→26, 20→18, 25→13, 30→8). **PG runs a few °F warmer**
at the same concentration and is the **non-toxic** fluid normally specified for a school geo loop — the existing
twin's prior fluid option was literally "30 % PG". The control therefore **defaults to PG** with a one-click
**EG** toggle (EG matches the supplied table exactly).

Burst-protection temperature (model, PG): 10 % → 21 °F · 20 % → 6 °F · 25 % → 0 °F · 30 % → −9 °F.

---

## 3. Mathematical model

### 3.1 Freeze / burst points
Piecewise-linear interpolation of the ASHRAE/Dow anchor points above (`freezePointF(type, %)`).
Burst protection is modeled as the freeze depression scaled by ~1.8×:

```
burst_°F = 32 − 1.8 · (32 − freeze_°F)        [approximation — confirm with supplier burst curve]
```

### 3.2 Fluid properties (ratios to water at the ~63 °F loop temperature)
With volume fraction `x = %/100` and per-fluid coefficients (calibrated so 30 % PG ≈ ρ 1.025·, cp 0.94·,
k 0.83·, μ 3.3×; 30 % EG ≈ ρ 1.04·, cp 0.92·, k 0.85·, μ 2.5×):

```
ρ_ratio  = 1 + c_ρ · x            cp_ratio = 1 − c_cp · x
k_ratio  = 1 − c_k · x            μ_ratio  = exp(c_μ · x) · (mild cold-temperature factor)
            PG: c_ρ=0.083  c_cp=0.21  c_k=0.57  c_μ=4.0
            EG: c_ρ=0.137  c_cp=0.27  c_k=0.50  c_μ=3.0
```
Absolute values use water at 63 °F: ρ 62.3 lb/ft³, cp 1.00 BTU/lb·°F, μ 1.08 cP, k 0.34 BTU/h·ft·°F.

### 3.3 System impacts
Derived from the property ratios and wired into the twin's existing hydraulic + thermal solver:

| Quantity | Relation | Mechanism |
|---|---|---|
| Friction head @ equal flow | `F = ρ_r^0.8 · μ_r^0.2` | Darcy–Weisbach, turbulent (`f ∝ Re^−0.2`) |
| Flow & pump power | pump curve `H=n²H₀−aQ²` ∩ system curve `R·Q²` (R scaled by μ_r^0.5) | higher resistance → lower flow; `P ∝ ρ·Q·H` |
| Differential pressure | `∝ Q² · lossMul · μ_r^0.25` | same resistance model |
| Coil/HX heat-transfer coeff. | `h_r = ρ_r^0.8 · μ_r^−0.4 · k_r^0.6 · cp_r^0.4` | Dittus–Boelter `Nu=0.023 Re^0.8 Pr^0.4` |
| Loop heat transport | `q_r = ρ_r · cp_r · (Q/Q_water)` | `q = ṁ·cp·ΔT`; the `500` (=60·8.33·1.0) water constant becomes `500·ρ_r·cp_r` |
| Chiller/condenser effect | lower flow + lower `h` → higher approach | shown via reduced heat transport & coil HTC |

Representative results (PG, vs water, same controls): **10 %** → flow ≈ −3 %, pump power ≈ +6 %, coil HTC ≈ −18 %,
heat transport ≈ −4 %. **25 %** → friction ≈ +24 %, coil HTC ≈ −39 %. **30 %** → friction ≈ +30 %, μ ≈ 3.3×,
coil HTC ≈ −45 %.

---

## 4. Assumptions
- Properties evaluated at the loop operating temperature (~63 °F); viscosity is strongly temperature-dependent —
  a mild cold-temperature thickening factor is included, but for cold-start design use the supplier's μ(T) data.
- Concentration is **% by volume**; freeze/property anchors are ASHRAE/Dow generic curves, not a specific brand.
- Friction/`h` correlations assume turbulent flow (valid at the loop's design velocities); at very low flow the
  laminar penalty for glycol is larger than shown.
- **Burst-protection** temperature is an approximation (§3.1) — confirm against the glycol manufacturer's burst curve.
- The twin's hydraulic/thermal calibration is anchored to the 2025-11-21 capture **with water**; the glycol model
  applies multiplicatively on top, so 0 % is exact and higher concentrations are first-order-correct deviations.
- The ACCU is **air-cooled** (heat rejection to ambient), so glycol affects the **waterside** (pump energy + coil
  heat transfer + loop heat transport), not the air-side condenser capacity directly.

---

## 5. Recommendation
For a school geo/condenser-water loop with some exposed/roof-traced piping, balance freeze + burst protection
against the pump-energy and heat-transfer penalty:

- **Recommended ≈ 25 % PG** — freeze ≈ 14 °F, burst ≈ 0 °F (covers a 10 °F winter design with margin via burst
  protection), at a ~+24 % friction / ~−39 % coil-HTC penalty. The simulator pins this as the **Recommended** column.
- Use **only as much glycol as the lowest fluid temperature requires** — every extra point raises pump power and
  cuts coil capacity. Select against the minimum fluid temperature the loop can actually see (per the plant
  freeze-protection sequence), burst-protecting below that minimum and freeze-protecting with margin.

---

## 6. Interactive implementation
- **Control:** `src/twins/CwPlantTwin.jsx` → "Glycol Concentration (%)" panel (slider 0–50 % / 0.5 %, PG⇄EG toggle,
  Water/Current/Recommended presets).
- **Readouts:** current %, freeze °F, burst °F; live fluid-property cards (density, specific heat, viscosity,
  thermal conductivity) and system-impact cards (flow, pump power, ΔP, velocity, coil HTC, heat transport), each
  highlighted with its Δ vs water.
- **Real-time loop:** the slider feeds the SCADA solver, so pipe flows, DPs, velocity, temperatures and pump power
  on the diagram (and the "What changed & why" panel) update live.
- **Comparison + sensitivity:** a comparison table (water / current 10 % / recommended 25 % / now) and a
  freeze-point-&-pump-power-vs-concentration trend chart with a current-position marker.
- **Model:** `src/glycol.js` (pure functions; unit-checkable).
