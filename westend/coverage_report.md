# Stoddert ES — WEST END CAFETERIA — Coverage Report

**Project:** DCAM-22-CS-RFP-0009 · 4001 Calvert St NW · **Sources in hand:** DWG/SOO (M501B/M502B/M503B/M201B/M202B/M121B, 100% CD 2025-06-06) · SPEC (West End [WEST] Div 23/11) · **Bind key:** `token` (`io_matrix.json`)

What is resolved vs. still `[?]`, and the exact sheet/schedule that closes each gap. **No Cv, capacity, pump curve, flow/GPM, range, or sequence value is fabricated.** There is **no field capture** for West End — observed-style values live only in the design-basis synthetic capture.

---

## 1. Headline — all six source sheets were read

| Metric | Value |
|---|---|
| Total records | **174** |
| Verified `conf:V` | **144** |
| Spec-assumed `conf:A` (confirm on unit points list) | **16** |
| Unresolved `conf:?` | **14** |
| DWG-resolved (`src:DWG, conf:V`) | **128** |
| SPEC (`src:SPEC`) | **16** |

Point types: AI 74 · AO 29 · BI 28 · BO 18 · AV 8 · BV 4 · 13 `[?]` placeholders.

**The Sequence of Operations is fully in hand** for every West End system: M501B read from its text layer; M502B/M503B/M201B/M202B rendered at 200 DPI and read by region; M121B read from the project Drive copy. WSHP unit logic, DOAS (14-clause) logic, (E)ERAHU-1 retrofit, VRF BAS interface, walk-in monitoring, electric heaters, kitchen hood/MAU/EF, metering, and the condenser-water-loop tie are all resolved from the drawings + the [WEST] specs.

**Key scope finding:** the cafeteria addition is a **branch load on the EXISTING geothermal/condenser-water loop** — there is **no new central plant** (no pumps/wellfield/separators) on the cafeteria sheets. That reframes the "water-source loop" subsystem: the only new loop controls are `BTU-1` metering (03/M503B), per-unit source valves, heat-trace, and the new-to-existing 6″ tie with BTU + water meters (M121B KN-4/5).

---

## 2. The 14 remaining `[?]` (+ field-level gaps)

| Item | Count | Closed by |
|---|---|---|
| Existing geo/condenser-water plant: loop temps, total GPM, pumps/lead-lag/DP setpoint | 4 (`GEO-LOOP-SWT/RWT/GPM/GEO-PUMPS`) | **§230593 TAB of existing CW system** + existing base-building drawings |
| `(E)ERAHU-1` existing VAV terminals `VAV-1-8…-13` controls | 6 | Base-building drawings (retained legacy points) |
| `WSHP.DEW-1/2` floor-dewpoint sharing | 2 | Unit points list (04/M502B) / WSHP schedule |
| `M-GAS` range/type · `WM-2` leg assignment | 2 | Meter details (§230923.16 covers only CO₂) |

Plus **field-level `[?]`** on otherwise-resolved rows: all valve **Cv** (fail positions known from §230923.11); WSHP **capacities/types** ("See Plans"); DOAS-CA-1 **confirmed capacity/coil/wheel** data; balanced branch GPM (TAB); VRF **unit counts/tags** (§238129); kitchen-fan **CFM/HP**; per-panel `M-1…M-5` breakdown.

---

## 3. Gap register — what each remaining sheet/schedule unlocks

| # | Sheet / schedule | Unlocks | Status |
|---|---|---|---|
| **G-SOO** | **M501B/M502B/M503B/M201B/M202B/M121B** | all control logic, alarms, setpoints, metering, distribution topology | ✅ **CLOSED** (read) |
| G1 | Existing-building mechanical/controls drawings + **§230593 TAB report (existing CW)** | loop supply/return temps, total loop GPM, existing pump lead-lag & DP setpoint, wellfield | open — **highest leverage** |
| G2 | WSHP schedule ("Capacities: See Plans", §238146) | WSHP types A/B/C capacities, electrical, design EWT, balanced GPM | open |
| G3 | DOAS / Outdoor-Energy-Recovery-Unit schedule | DOAS-CA-1 capacity (≈2115 CFM), coil/compressor & hot-gas-reheat data, wheel effectiveness — resolves **FLAG-W4** | open |
| G4 | Control-valve schedule | Cv for `WSHP-CA-0x.CV-1`, `DOAS1.CV-1`, ERAHU HW/CHW valves (fail positions from §230923.11) | open |
| G5 | VAV schedule / floor plans | which boxes carry SCR electric reheat (**FLAG-W6**); `VAV-CA`/`VAV-1` control assignment | open |
| G6 | VRF schedule / **§238129** product data | ODU/IDU/ERV counts & tags; which IDU is `AC-1`; existing-building zoning (**FLAG-W10**) | open |
| G7 | Kitchen fan schedule + kitchen-exhaust sheet | `KMAU-1`/`KEF-1` CFM/HP; resolve **FLAG-W5** VFD swap; locate exhaust riser (not on M202B, **FLAG-W9**) | open |
| G8 | Meter details | per-panel `M-1…M-5` (19 meters), `WM-1`/`WM-2` leg, gas-meter range/type | open |
| G9 | Symbols sheet (M001/M002-type) | confirm `CD` = condensate drain (no legend on M121B, **FLAG-W11**) | open |
| G10 | DDC network riser | analog signal protocols / instrument ranges beyond §230923.x | open |

---

## 4. Carried discrepancy FLAGS (reconciled, not merged — full text in `token_map.md` §4.2)

| FLAG | Conflict | Resolution path |
|---|---|---|
| **FLAG-W1** | WSHP mfrs: brief *Daikin/Whalen/Cold Flow/Trane* (East-End) | §238146 = **Daikin/Climate Master/Trane** |
| **FLAG-W2** | Instrument ranges: brief 0–150 °F / 0–100 psi (East-End) | §230923.27 condenser-water **0–120 °F**; §230923.23 liquid gage **−300…300 psig** adj |
| **FLAG-W3** | M501B detail numbering | **05** SCR, **06** VRF, **07** ERAHU (01 BAS, 02 bypass VAV, 03/04 meters) |
| **FLAG-W4** | DOAS coil: §237343.16 hydronic vs **02/03 M502B** WSHP/DX + hot-gas reheat | DOAS schedule (G3); drawing governs sequence |
| **FLAG-W5** | Kitchen `VFD-1/2` diagram-vs-points-list swap (04/M503B) | fan schedule (G7); use points-list assignment |
| **FLAG-W6** | SCR-box physical application | VAV schedule/plans (G5) |
| **FLAG-W7** | `GWS/GWR` shared with East End | separate scopes; never merged |
| **FLAG-W8** | Electric-meter mapping | M-1 HVAC/M-2 Lighting/M-3 Plug/M-4 Kitchen/M-5 DOAS (03/M501B) |
| **FLAG-W9** | M202B has no MAU/KEF/22,115 CFM | kitchen SOO on 04/M503B; locate exhaust riser (G7) |
| **FLAG-W10** | VRF vs WSHP/geo boundary | confirmed: VRF = existing-bldg; cafeteria = WSHP/DOAS/geo |
| **FLAG-W11** | `CD` = condensate drain (no M121B legend) | symbols sheet (G9) |
| **FLAG-W12** | ERAHU-1 const-vol (TAB) vs VFD-to-static (07/M501B) | base-building drawings |
| **FLAG-W13** | Two distinct `BTU-1` (DOAS coil vs loop) | kept separate |

---

## 5. Priority to close the rest
1. **G1 — existing-plant drawings + §230593 TAB report** — the single biggest gap: existing geo/condenser-water loop temps, total GPM, pump lead-lag/DP. Everything cafeteria-side ties to it.
2. **G2 + G3 — WSHP & DOAS schedules** — capacities/types and the DOAS coil/wheel data (settles FLAG-W4).
3. **G4 — control-valve schedule** — Cv values (fail positions already from §230923.11).
4. **G6 + G7 — VRF & kitchen schedules** — unit counts/tags; kitchen-fan CFM/HP + the missing exhaust riser (FLAG-W5/W9).
5. **G5/G8/G9 — VAV schedule, meter details, symbols sheet** — SCR-box mapping, per-panel meters, CD legend.
