# Stoddert ES — Control Points List

**Project:** DG-22-S002 · **Sources:** `Stoddert_ES_Controls_Source_Bundle.md` (SPEC §2 · CAP §4 · gaps §5)
**Capture:** enteliWEB 2025-11-21 13:57 · **Namespace:** `Stoddert_HVAC_Controls_Token_Map.md`
**Canonical data:** `io_matrix.json` (binds on `token`). This file is the human view.

> **Conventions** — `[?]` = unresolved, closed by the sheet named in `coverage_report.md`.
> `src`: CAP=observed value · SPEC=Division 23 basis · DWG=drawing/schedule (not in repo).
> `conf`: V=verified · A=assumed · ?=unresolved. **No Cv, capacity, curve, range, or sequence value is fabricated.**
>
> **Grouping note (flagged once):** the spec says "one table per element." Single-point field
> instruments (TT/PDT/AHT), the four VFD pumps, the four control valves, and the two homogeneous
> WSHP networks are grouped into family tables for readability; every row still carries its own
> `element`, and `io_matrix.json` remains strictly one-record-per-token.

---

## Totals (live I/O + values)

| Type | Count | | Type | Count |
|---|---|---|---|---|
| **AI** | 83 | | **AV** | 23 |
| **AO** | 8 | | **BV** | 19 |
| **BI** | 38 | | `[?]` placeholders (no type) | 22 |
| **BO** | 38 | | **TOTAL records** | **231** |

By source: **CAP 48 · SPEC 161 · DWG (gap) 22.**  By confidence: **V 209 · ? 22.**

---

## EQ-ACCU-1 — Rooftop heat-rejection / condenser unit (fans C1–C4)

| Token | BAS name | Type | Unit | Value | Accuracy | Src | Conf |
|---|---|---|---|---|---|---|---|
| `ST-ACCU` | ACCU Status | BI | — | On | — | CAP | V |
| `ST-ACCU-CMD` | ACCU Command | BO | — | On | — | CAP | V |
| `AL-ACCU` | ACCU Alarm | BI | — | normal | limit `[?]` | CAP | V |
| `ST-ACCU-RST` | Alarm Reset | BO | — | off | — | CAP | V |
| `ST-ACCU-C1` | C1 Status | AI | % | 100.0 | — | CAP | V |
| `ST-ACCU-C2` | C2 Status | AI | % | 100.0 | — | CAP | V |
| `ST-ACCU-C3` | C3 Status | AI | % | 100.0 | — | CAP | V |
| `ST-ACCU-C4` | C4 Status | AI | % | 100.0 | — | CAP | V |
| `SP-LWT` | ACCU-1-LWT-SP | AV | °F | 44.0 | — | CAP | V |
| `SP-ACCU-EN-DIFF` | ACCU-EN-DIFF | AV | °F | 5.0 | — | CAP | V |
| `SP-ACCU-LOW-EN` | ACCU-LOW-EN-SP | AV | °F | 60.0 | — | CAP | V |
| `SP-ACCU-HIGH-EN` | ACCU-HIGH-EN-SP | AV | °F | 70.0 | — | CAP | V |
| `SP-CV5-TEMP` | ACCU-CV5-TEMP-SP | AV | °F | 75.0 | — | CAP | V |

*Unit type (modular chiller/HP vs fluid cooler), staging logic, and fan-stage signal type are `[?]` — equipment schedule + SOO (§5). §2.6 confirms rooftop heat-rejection.*

---

## Equipment with no resolved points — `[?]` placeholders

| Element | Status | Closed by (§5) |
|---|---|---|
| `EQ-DOAS-2` | points unresolved | controls/points-list · equipment schedule · SOO |
| `EQ-BT-1` | points unresolved | controls/points-list · equipment schedule |
| `EQ-AS-1` | unresolved (may be mechanical-only) | controls/points-list |
| `EQ-AS-2` | unresolved (may be mechanical-only) | controls/points-list |
| `EQ-ET-5` | unresolved (may be mechanical-only) | controls/points-list |
| `EQ-CHEM-1` | unresolved (in scope per §2.7) | controls/points-list |

---

## EQ-WELLFIELD

| Token | BAS name | Type | Value | Src | Conf |
|---|---|---|---|---|---|
| `PRM-WELLFIELD-REPL` | WELLFIELD-REPLENISH | BV | Off | CAP | V |

*Wellfield 700 GPM confirmation, well-pump points, level → `[?]` (RFI 181/183, equipment schedule).*

---

## SYS — Plant-global control parameters

| Token | BAS name | Type | Unit | Value | Src | Conf |
|---|---|---|---|---|---|---|
| `PRM-SYSTEM-EN` | SYSTEM-EN | BV | — | True | CAP | V |
| `PRM-SYS-RESET` | SYS-RESET | BV | — | Off | CAP | V |
| `PRM-PMPDOWN-TIME` | PMPDOWN-TIME | AV | s | 300.0 | CAP | V |
| `SP-CHWDP` | CHWDP-SP | AV | psi | 7.0 | CAP | V |

*Owning controller per points-list `[?]`. `SP-CHWDP` is the VFD DP-setpoint target (23 05 93 §2.5); binding to a specific DP transmitter is `[?]` (SOO).*

---

## PMP-P1…P4 — VFD pumps

| Token | BAS name | Type | Unit | Value | Src | Conf |
|---|---|---|---|---|---|---|
| `PMP-P1.STS` | P1 Status | BI | — | On | CAP | V |
| `PMP-P1.CMD` | P1 Command | BO | — | On | CAP | V |
| `PMP-P1.SPD` | P1 Speed | AO | % | 85.4 | CAP | V |
| `PMP-P2.STS` | P2 Status | BI | — | Off | CAP | V |
| `PMP-P2.CMD` | P2 Command | BO | — | Off | CAP | V |
| `PMP-P2.SPD` | P2 Speed | AO | % | 0.0 | CAP | V |
| `PMP-P3.STS` | P3 Status | BI | — | On | CAP | V |
| `PMP-P3.CMD` | P3 Command | BO | — | On | CAP | V |
| `PMP-P3.SPD` | P3 Speed | AO | % | 100.0 | CAP | V |
| `PMP-P4.STS` | P4 Status | BI | — | On | CAP | V |
| `PMP-P4.CMD` | P4 Command | BO | — | On | CAP | V |
| `PMP-P4.SPD` | P4 Speed | AO | % | 100.0 | CAP | V |

*Role/loop, head/TDH, HP, NPSH, design GPM, lead/lag → `[?]` (pump schedule + curves, SOO). Additional VFD points (fault, H-O-A, kW) not invented — confirm on points-list.*

---

## Control valves — CV-5 / CV-3 / CV-1-1 / CV-1-2

| Token | BAS name | Type | Unit | Value | Cv | Fail | Seq | Src | Conf |
|---|---|---|---|---|---|---|---|---|---|
| `CV-5` | ACCU (CV-5) | AO | % | 0.0 | `[?]` | `[?]` | `[?]` | CAP | V |
| `CV-3` | GWS Min Flow (CV-3) | AO | % | 0.0 | `[?]` | `[?]` | `[?]` | CAP | V |
| `CV-1-1` | GWS Bypass (CV-1-1) | AO | % | 100.0 | `[?]` | `[?]` | `[?]` | CAP | V |
| `CV-1-2` | GWS Bypass (CV-1-2) | AO | % | 100.0 | `[?]` | `[?]` | `[?]` | CAP | V |

*Position is observed (CAP). **Cv** (valve schedule), **fail position** (23 09 23.11 / SOO), and **modulation logic** (23 09 93.11) are all `[?]`. Per §2.2 every CV fails to a defined position on power loss — the **direction is not asserted here**. `CV-5` "% to-system vs % bypass" convention is explicitly deferred to the SOO.*

---

## FM-2 — Onicon ultrasonic BTU meter

| Token | BAS name | Type | Signal | Unit | Value | Accuracy | Src | Conf |
|---|---|---|---|---|---|---|---|---|
| `FM-2` | BTU Meter (FM-2) Flow | AI | 4-20mA/pulse | GPM | 113.1 | ±2% of design flow | CAP | V |
| `FM-2.SUP` | BTU Supply | AI | RTD | °F | 63.4 | ±0.5 °F | CAP | V |
| `FM-2.RET` | BTU Return | AI | RTD | °F | 70.7 | ±0.5 °F | CAP | V |
| `FM-2.BTU` | Thermal Energy | AI | 4-20mA/pulse | MBH `[?]` | — | ±1% of reading | SPEC | V |

*Which branch FM-2 meters (one cycle vs both) → `[?]` (controls/flow-meter plan). Energy-rate value not in capture; the Onicon device provides it (§2.3).*

---

## FM-GWS — Electromagnetic mains flowmeter

| Token | BAS name | Type | Signal | Unit | Value | Accuracy | Src | Conf |
|---|---|---|---|---|---|---|---|---|
| `FM-GWS` | GWS Flow | AI | 4-20mA | GPM | 780.0 | ±2% of design flow | CAP | V |

*Which main (building vs geo) → `[?]` (controls/flow-meter plan).*

---

## Field sensors — TT / PDT / AHT

| Token | BAS name | Type | Signal | Unit | Leg | Value | Accuracy | Src | Conf |
|---|---|---|---|---|---|---|---|---|---|
| `TT-LWT` | LWT | AI | RTD | °F | supply | 56.8 | ±0.5 °F | CAP | V |
| `TT-EWT` | EWT | AI | RTD | °F | return | 70.0 | ±0.5 °F | CAP | V |
| `TT-GWST` | GWS T | AI | RTD | °F | supply | 72.0 | ±0.5 °F | CAP | V |
| `TT-GWRT` | GWR T | AI | RTD | °F | return | 72.5 | ±0.5 °F | CAP | V |
| `TT-GEOST` | Geo ST | AI | RTD | °F | supply | 73.7 | ±0.5 °F | CAP | V |
| `TT-GEORT` | Geo RT | AI | RTD | °F | return | 72.6 | ±0.5 °F | CAP | V |
| `TT-OAT` | OA-T | AI | RTD | °F | — | 55.6 | ±1 °F | CAP | V |
| `AHT-OAH` | OA-H | AI | 4-20mA | %RH | — | 79.1 | ±2% RH | CAP | V |
| `PDT-NEWADD` | New Addition DP | AI | 4-20mA | psi | — | 42.8 | ±1% of inst. range | CAP | V |
| `PDT-EXISTBLDG` | Existing Building DP | AI | 4-20mA | psi | — | 7.0 | ±1% of inst. range | CAP | V |

*Instrument ranges/spans → `[?]` (DDC riser / instrument schedule). Accuracies applied per §2.1.*

---

## WSHP networks — WSHP-1-1…1-8 and WSHP-2-1…2-8

Every unit carries the identical BACnet point template (Div 23 WSHP, §2.4). Capacities/types are
**"See Plans"** → all unit-specific values are `[?]` (WSHP schedule). Branch flow is **not a live point** —
it is a TAB/design value at the balancing-valve meter ports (§2.4 / §2.5), tracked as `BV-WSHP-<id>.GPM`.

### Per-unit point template (×16)

| Suffix | BAS name | Type | Signal | Unit | Accuracy | Src | Conf |
|---|---|---|---|---|---|---|---|
| `.SP-ADJ` | Setpoint Adjustment | AV | BACnet | °F | — | SPEC | V |
| `.CMD` | Start/Stop Command | BO | BACnet | — | — | SPEC | V |
| `.STS` | Operating Status | BI | BACnet | — | — | SPEC | V |
| `.SAT` | Supply-Air Temp | AI | BACnet | °F | `[?]` (n/a §2.1) | SPEC | V |
| `.RAT` | Room-Air Temp | AI | BACnet | °F | `[?]` (n/a §2.1) | SPEC | V |
| `.RH` | Room-Air Humidity | AI | BACnet | %RH | `[?]` (n/a §2.1) | SPEC | V |
| `.EWT` | Entering-Water Temp | AI | BACnet | °F | ±0.5 °F | SPEC | V |
| `.OCC` | Occupied/Unoccupied | BV | BACnet | — | — | SPEC | V |
| `.FAULT` | Fault Relay | BI | BACnet | — | — | SPEC | V |
| `.SCHED` | Scheduled-Operation Relay | BO | BACnet | — | — | SPEC | V |

### Unit roster (balanced flow + capacity all `[?]` from WSHP schedule / TAB)

| Network 1 | Network 2 | Balanced GPM | Capacity / type |
|---|---|---|---|
| `WSHP-1-1` | `WSHP-2-1` | `[?]` | `[?]` |
| `WSHP-1-2` | `WSHP-2-2` | `[?]` | `[?]` |
| `WSHP-1-3` | `WSHP-2-3` | `[?]` | `[?]` |
| `WSHP-1-4` | `WSHP-2-4` | `[?]` | `[?]` (type esp. unresolved) |
| `WSHP-1-5` | `WSHP-2-5` | `[?]` | `[?]` (type esp. unresolved) |
| `WSHP-1-6` | `WSHP-2-6` | `[?]` | `[?]` |
| `WSHP-1-7` | `WSHP-2-7` | `[?]` | `[?]` |
| `WSHP-1-8` | `WSHP-2-8` | `[?]` | `[?]` |

*Whether supply-air humidity is also monitored (vs room-air only) is `[?]` — WSHP points-list / DDC riser. Allowable mfrs per §2.4: Daikin, Whalen, Cold Flow, Trane.*
