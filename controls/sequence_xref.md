# Stoddert ES — Sequence Cross-Reference (point ↔ SOO clause)

**Governing logic source:** `M503` 08/M503 (central plant) · `M502` 05/M502 (WSHP) & 02/M502 (DOAS-2) · `M501` (BAS/metering).
**Status:** **SOO now in hand** — the sequence logic below is **resolved `[V]`** from the drawings, replacing the prior all-`[?]` map. Captured positions/setpoints (CAP 2025-11-21) are cross-referenced `[X]`. Items still needing a diagram detail or schedule are `[?]`.

> Tag reconciliation is **preserved, not merged** — SCADA tokens are primary (match enteliWEB); SOO/points-list aliases and FLAGS are carried inline and in §5.

---

## 1. Central plant — heat-pump chiller & loop (08/M503)

| Function | Points | Logic (resolved) | Conf |
|---|---|---|---|
| **Chiller staging** | `ST-ACCU`, `ST-ACCU-CMD`, `ST-ACCU-C1..C4`, `TS-4` | HP chiller in constant-flow primary injection loop; energizes on cooling/heating call; **holds `TS-4` = 70 °F cooling / 60 °F heating**; off within deadband (`<70 / >60`). | `[V]` |
| **Chiller leaving-water SP** | `SP-LWT`=44.0 | chiller internal leaving-water setpoint (loop control is at `TS-4`). | `[X]` |
| **Diverting valve** | `CV-5` (SOO `CV-4`), `TS-2`, `SP-CV5-TEMP`=75 | **`CV-5` modulates to keep entering chiller water `TS-2` ≤ 75 °F (adj)** — §7.1. *This resolves the long-standing "CV-5 convention" question: it is a chiller-entering-water diverting valve, not a building bypass.* | `[V]`/`[X]` |

## 2. Pumps (08/M503 §3.1–3.2)

| Function | Points | Logic (resolved) | Conf |
|---|---|---|---|
| **Primary VS pumps** | `PMP-P1/P2 .STS/.CMD/.SPD/.FAULT/.HAND` (`VFD-1/2`) | enabled whenever a coil calls; **lead pump holds DP setpoint = 12 PSI** at worst-case `DPS-1/DPS-2` (existing bldg + new addition); **monthly lead/lag swap**. | `[V]` |
| **Chiller pumps** | `PMP-P3/P4 .STS/.CMD/.SPD/.FAULT/.HAND` (`VFD-3/4`) | constant volume, **simultaneous**; cycle on/off with the chiller. | `[V]` |
| **Minimum-flow valve** | `CV-3` (list `CV-2`), `DPS-1/2` | modulates **open when `P-1`/`P-2` at minimum speed** to hold the DP setpoint. | `[V]` |
| **DP setpoint** | `SP-CHWDP`, `PDT-EXISTBLDG`, `PDT-NEWADD` | VFDs control to DP setpoint. **FLAG-1: SOO = 12 PSI, capture `CHWDP-SP` = 7.0 psi** — confirm design vs operating. | `[V]`/`[X]` |

## 3. Wellfield bypass & freeze protection (08/M503 §3.4, §4)

| Function | Points | Logic (resolved) | Conf |
|---|---|---|---|
| **Wellfield bypass** | `CV-1-1`/`CV-1-2` (SOO `CV-1A/1B`, list `CV-1`), `PT-1/2/3` | modulate to **bypass any flow > 500 GPM around the wellfield**; 0–500 GPM passes through; modulate off `PT-1/2/3`. **"GWS Bypass" = ground-loop bypass, NOT building-DP bypass.** **FLAG-2:** 500 (SOO) vs 700 (RFI-183) vs 780 (capture). | `[V]` |
| **Freeze protection** | `EQ-ACCU-1` valve + internal valves, `CV-5`/`CV-1`, `PMP-P1`+`PMP-P3`, `TT-OAT` | If chiller & `P-3/P-4` **off and OAT < 35 °F**: ACCU-1 control valve opens, internal valves open, **`CV-1` opens**, **lead `P-1` & `P-3` energize**, circulate wellfield water. **FLAG-B/3: identity of "ACCU-1 control valve" vs `CV-5`/`CV-4`/`CV-1` per 09/M503 [?].** | `[V]`/`[?]` |
| **Heat-trace** | `CS-1..CS-4`, `TT-OAT` | roof circuits energize **< 35 °F (adj)**; **BAS alarms on broken heat-trace circuit** via current sensor. **FLAG-C: `CS-1..4` ≠ SCADA "C1–C4".** | `[V]` |

## 4. Plant alarms (08/M503 §6) & metering

| Alarm / meter | Points | Trigger | Conf |
|---|---|---|---|
| Excessive BTU energy | `BTU-1` | recorded energy **>10 % above** daily/weekly/monthly historical avg | `[V]` |
| Pump fault | `PMP-Px.FAULT` | commanded ON but remains off (adj) | `[V]` |
| Pump running-in-hand | `PMP-Px.HAND` | commanded OFF but stays on (adj) | `[V]` |
| Hi/Lo geo temp | `TT-GEOST/GEORT`, `TT-GWST/GWRT` | ±5 °F (adj) beyond SP for >10 min | `[V]` |
| Hi/Lo DP | `PDT-EXISTBLDG/NEWADD` | DP exceeds SP by ±2 psi | `[V]` |
| Submetering | `M-E1..E7` (kW), `M-W1/W2` (gal) | electric/water submeters → sustainability dashboard (M501) | `[V]` |

## 5. WSHP units (05/M502) — applies to all `WSHP-1-1…2-8`

**Interlock (resolved):**
`call(room T) → WSHP coil valve (.CV-1/.CV-2) opens → .ECM-1 fan on (simultaneous) → [valve full-open + flow-proof + 4 s] → compressor on (min-on 180 s) → 2nd stage on add'l call → satisfy → compressor+fan off, ISO valve closes (min-off 360 s)`. **Safety/fire → unit off + `.CV-2` (2-way) closes.** `[V]`

| Function | Points | Logic | Conf |
|---|---|---|---|
| Occupancy | `WSHP-x.OCC` | M–F 08:30–15:15, Sat 09:00–13:00; else unoccupied + holidays/snow | `[V]` |
| Ventilation / CO₂ DCV | `WSHP-x.ACD-1`, `.D-1`, `.CO2-1` | CO₂ setpoint **1000 PPM (adj)** | `[V]` |
| Dehumidification | `WSHP-x.TH-1`, `.DP`, `.TS-1` | dewpoint/humidistat-driven dehum mode | `[V]`/`[?]` |
| Safeties | `WSHP-x.S-1` | condensate-overflow → unit off | `[V]` |

## 6. DOAS-2 (02/M502)

**Startup (resolved):** HOA Auto → **OA + exhaust dampers open (proven via `ES-1/ES-2`)** → **10 s delay** → supply fan (`VFD-1`) to min then SA-volume-control → exhaust fan (`VFD-2`) concurrent EA-volume-control → **energy wheel to design speed**. Discharge: summer 52/52 °F, winter 69 °F (adj). Shutdown via BAS/fire/safety. `[V]`
*Secondary clauses present on 02/M502 but summarized only (SAT control, economizer/enthalpy, gas-heat reheat, dehumidification, ERV control, CO₂ DCV, dirty-filter & running-in-hand alarms).* `[?]`

---

## 7. Still `[?]` after the SOO

| Item | Needs | FLAG |
|---|---|---|
| Valve **Cv** + **fail positions** | control-valve schedule / 09/M503 | — |
| **CV tag finalization** | 09/M503: CV-2↔CV-3, CV-4↔CV-5, ACCU-1/CV-1 freeze valve identity | A, B |
| **`TS-1/TS-3/TS-5`** function | diagram 09/M503 | — |
| **`DPS-1` vs `DPS-2`** = existing vs new addition | diagram 09/M503 | — |
| **DP setpoint** 12 vs 7.0 | confirm design vs operating | 1 |
| **Geo max flow** 500 vs 700 vs 780 | RFI-183 / TAB | 2 |
| Pump curves/TDH/NPSH · WSHP capacities · Cv · TAB balanced GPM | schedules + TAB report | — |

> The **SOO logic itself is now resolved**; what remains are schedule/diagram details and the carried FLAGS.
