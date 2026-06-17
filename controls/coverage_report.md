# Stoddert ES — Coverage Report

**Project:** DG-22-S002 · **Sources in hand:** DWG/SOO (M501/M502/M503) · SPEC (Div 23) · CAP (enteliWEB 2025-11-21) · **Bind key:** `token` (`io_matrix.json`)

What is resolved versus still `[?]`, and the exact sheet that closes each gap. **No Cv, capacity, curve, range, or sequence value is fabricated.**

---

## 1. Headline — the SOO is now in hand

| Metric | Before SOO | **After SOO** |
|---|---|---|
| Total records | 231 | **406** |
| Verified `conf:V` | 209 | **315** |
| Spec-assumed `conf:A` (confirm on points-list) | 0 | **48** |
| Unresolved `conf:?` | 22 | **43** |
| DWG-resolved (`src:DWG, conf:V`) | 0 | **266** |

By source: **CAP 48 · DWG 309 · SPEC 49.** Point types: AI 163 · AO 95 · BI 61 · BO 24 · AV 23 · BV 19 · 21 `[?]` placeholders.

**Gap G2 (Sequence of Operations) is CLOSED.** All central-plant, WSHP, and DOAS-2 control logic, alarms, pump lead/lag, valve modulation, freeze protection, and submetering are now resolved from M501/M502/M503. The original **CV-5 / "both pipe cycles"** uncertainty is largely resolved: **CV-5 = chiller diverting valve (TS-2 ≤ 75 °F)**; FM-GWS (=FM-1) is geo-loop flow, FM-2 is the BTU-metered branch (exact branch per 09/M503).

---

## 2. The 43 remaining `[?]`

| Item | Count | Closed by |
|---|---|---|
| `TS-1` / `TS-3` / `TS-5` function | 3 | diagram 09/M503 |
| `WSHP-x.DP` floor-dewpoint sharing | 16 | controls/points-list (01/04 M502) |
| `BV-WSHP-x.GPM` balanced flow | 16 | WSHP schedule + TAB report |
| DOAS-2 exact suffixes (`DP-EADUCT`,`DP-SADUCT`,`TS-SW`) | 3 | 01/M502 |
| Empty equipment (`EQ-BT-1`,`AS-1`,`AS-2`,`ET-5`,`CHEM-1`) | 5 | controls/points-list + equipment schedule |

Plus **field-level `[?]`** on otherwise-resolved rows: all valve **Cv** & **fail positions**, instrument ranges/signal protocols, pump curves, WSHP capacities.

---

## 3. Gap register — what each remaining sheet unlocks

| # | Sheet | Unlocks | Status |
|---|---|---|---|
| **G2** | **Sequence of Operations (M503/M502/M501)** | all control logic, alarms, staging, lead/lag, freeze, metering | ✅ **CLOSED** |
| G1 | Control-valve schedule | `CV-1-1/1-2/CV-3/CV-5`, WSHP `.CV-1/.CV-2`, DOAS `.CV-1`: **Cv + fail position** | open |
| G3 | Pump schedule + curves | `PMP-P1..P4`: TDH, impeller, HP, NPSH, design GPM | open |
| G4 | WSHP schedule ("See Plans") | capacities/types (esp. `WSHP-2-4/2-5`), design EWT, supply-air-humidity inclusion | open |
| **G5** | **Controls diagram 09/M503** | `TS-1/3/5` functions; `DPS-1` vs `DPS-2`; **CV tag finalization (FLAG-A/B)**; ACCU-1 freeze-valve identity; FM-2 metered branch | open — **highest leverage** |
| G6 | Mechanical riser | `SEG-R3` size (3" vs 8") | open |
| G7 | Equipment schedule | `EQ-ACCU-1` type; `EQ-BT-1`/`EQ-CHEM-1` points | open |
| G8 | Controls/points-list (01/04 M502) | `WSHP-x.DP` sharing; DOAS exact suffixes; empty plant equipment | open |
| G9 | RFI 181 / RFI 183 | wellfield 700 GPM (FLAG-2); ACCU connection | open |
| G10 | TAB / balancing report | `BV-WSHP-*` balanced GPM; DP setpoint 12 vs 7.0 (FLAG-1); geo flow | open |
| G11 | DDC network riser | analog signal protocols (`[?]` signals), instrument ranges | open |

---

## 4. Carried discrepancy FLAGS (reconciled, not merged)

| FLAG | Conflict | Resolution path |
|---|---|---|
| **FLAG-1** | DP setpoint: SOO **12 PSI** vs capture **7.0 psi** | confirm design vs operating (G10) |
| **FLAG-2** | Geo max flow: SOO **500** vs RFI-183 **700** vs capture **780** GPM | RFI-183 / TAB (G9/G10) |
| **FLAG-A** | Min-flow valve: points-list **CV-2** vs SOO/SCADA **CV-3** | 09/M503 valve schedule (G5) |
| **FLAG-B** | Diverting valve: SOO **CV-4** vs SCADA **CV-5**; + ACCU-1 freeze-valve identity | 09/M503 (G5) |
| **FLAG-C** | SCADA **"C1–C4"** (ACCU compressors) ≠ **CS-1..4** (heat-trace) | kept distinct in matrix; confirm on 09/M503 |

---

## 5. Priority to close the rest

1. **G5 — diagram 09/M503** — resolves TS-1/3/5, DPS-1/2, all CV tag flags, ACCU freeze-valve identity, FM-2 branch. Most remaining `[?]` in one sheet.
2. **G1 — valve schedule** — Cv + fail positions for every CV.
3. **G4 + G10 — WSHP schedule + TAB** — capacities + the 16 balanced branch flows; settles FLAG-1/FLAG-2.
4. **G8 — points-list** — the 5 empty plant elements + WSHP DP + DOAS suffixes.
5. **G3 — pump schedule** — pump curves/TDH/NPSH.
