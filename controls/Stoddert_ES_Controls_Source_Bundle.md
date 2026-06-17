# Stoddert ES — Controls Mapping SOURCE BUNDLE (for Claude Code intake)

**Project:** Stoddert Elementary Modernization · DG-22-S002 / DCAM-22-CS-RFP-0009
**Purpose:** Governing sources for the control-points map. This file supplies the three sources that exist —
**(A) token schema, (B) Division 23 specification content, (C) enteliWEB capture values** — plus a manifest of the
**drawing schedules that do NOT exist yet** and exactly what each unlocks.

### How Claude Code must use this file
1. **Populate every `src:SPEC` and `src:CAP` field now** from §2 and §4 — these are sourced, not fabricated.
2. **Leave every `src:DWG` field as `conf:"?"`** with the citing sheet from §5. **Do not invent** Cv, pump curves, WSHP capacities, meter locations, or SOO logic.
3. Produce the four deliverables (`points_list.md`, `io_matrix.json`, `sequence_xref.md`, `coverage_report.md`).
4. Apply the §2 accuracy table to every analog input. Treat WSHP branch GPM as a **balanced/design value**, not a live point.

---

## 0. In-scope element list (seed the registry from this)

```
EQ-ACCU-1  EQ-DOAS-2  EQ-WELLFIELD  EQ-BT-1  EQ-AS-1  EQ-AS-2  EQ-ET-5  EQ-CHEM-1
PMP-P1  PMP-P2  PMP-P3  PMP-P4
CV-5  CV-3  CV-1-1  CV-1-2   BV-WSHP-<id> (per unit)
FM-2 (BTU)  FM-GWS
TT-LWT  TT-EWT  TT-GWST  TT-GWRT  TT-GEOST  TT-GEORT  TT-OAT  AHT-OAH
PDT-NEWADD  PDT-EXISTBLDG
WSHP-1-1..1-8   WSHP-2-1..2-8
```

---

## 1. Governing specification sections (verified present in Division 23)

| Section | Title | Governs |
|---|---|---|
| `23 09 23` | Direct Digital Control (DDC) System for HVAC | controllers, I/O, BACnet, displayed-accuracy, fail-on-power-loss |
| `23 09 23.11` | Control Valves | CV-*: **Cv**, actuator, **fail-safe position on power loss** |
| `23 09 93.11` | Sequence of Operations for HVAC DDC | **all point logic** (ACCU staging, CV-5 modulation, pump lead/lag, DP control) |
| `23 05 93` | Testing, Adjusting & Balancing | branch/main/terminal flow balance, system DP setpoint, diversity |
| Div 23 — HVAC Instrumentation & Control Devices *(confirm §no.)* | meters/sensors | Onicon ultrasonic BTU meter; electromagnetic flowmeters; transmitters |
| Div 23 — Water-Source Unitary Heat Pumps *(confirm §no.)* | WSHP | mfrs; BACnet points; balancing valves w/ meter ports; **Capacities: See Plans** |
| `23 07 19` | HVAC Piping Insulation | geothermal/condenser-water piping incl. roof heat-traced run |
| Div 23 — HVAC Water Pumps (VFD) *(confirm §no.)* | P-1…P-4 | VFD, lead/lag, DP-setpoint control |

---

## 2. SPEC BASIS — verified content (use to fill `src:SPEC` fields)

### 2.1 DDC displayed-accuracy (`23 09 23`) — apply per analog point
| Quantity | Accuracy |
|---|---|
| Thermal energy | ±1% of reading |
| Water flow | ±2% of design flow |
| Water temperature (chilled / condenser) | ±0.5 °F |
| Water pressure | ±1% of instrument range |
| Outdoor temperature | ±1 °F |
| Outdoor RH | ±2% RH |

### 2.2 Control valves (`23 09 23.11`)
- Characterized by **Cv** (design valve coefficient) — *value from valve schedule `[DWG]`*.
- Actuator; **each control valve and actuator goes to failed position on loss of power** (fail position per SOO `[DWG]`).
- Modulation logic per `23 09 93.11`.

### 2.3 Meters / instrumentation (Div 23)
- **BTU meter (`FM-2`): Onicon (or approved equal) ultrasonic BTU/liquid flow meter** — no moving parts; integral transmitter; wet-calibrated, NIST-traceable; flow + supply/return temp → thermal energy. 4–20 mA + programmable pulse outputs.
- **Mains flow (`FM-GWS`):** in-line electromagnetic flowmeter (Onicon / Badger / Rosemount), integral transmitter, NIST-traceable; 3 dia. upstream / 2 dia. downstream.
- Temperature: RTD in thermowell (socket ≥2" into fluid, vertical tee). Pressure/DP: transmitters.

### 2.4 WSHP (Div 23)
- Allowable mfrs: **Daikin, Whalen, Cold Flow, Trane.** R-410A scroll; waterside economizer included.
- **BACnet points to central DDC:** (1) setpoint adjustment; (2) start/stop + operating status; (3) data inquiry — supply-air & room-air temp/humidity and **entering-water temperature**; (4) occupied/unoccupied schedules. Plus fault relay + scheduled-operation relay.
- **Balancing valves with meter ports** in the return; isolation ball valves on supply/return; Y-strainer. **Branch flow is read by DP gage at the meter ports during TAB**, then fixed by memory stop — *not a live BAS AI.*
- **Capacities and characteristics: See Plans.**

### 2.5 TAB (`23 05 93`)
- Measure total flow by **main flow meter**; balance **main and branch valves to design flow**; balance **each terminal**.
- **Determine the system differential-pressure set point**; VFD then controls to that DP setpoint (discharge valve 100% open).
- Diversity: simulate by closing control valves as approved; record pump TDH/curve.

### 2.6 Piping insulation (`23 07 19`)
- Geothermal/Condenser-Water piping inside building: 1" fiberglass (k 0.20–0.26).
- **Heat-traced Geothermal Condenser-Water piping above roof: 2" fiberglass** — confirms `EQ-ACCU-1` is a rooftop condenser/heat-rejection unit.

### 2.7 GMP scope confirmation (Section 2 GMP)
Primary loop & plant piping; **pumps w/ VFD**; modular AC heat pump/chiller; chemical treatment; control system; air & water balance; building automation system. (R&R Mechanical is the mechanical sub.)

---

## 3. (reserved)

---

## 4. CAPTURE VALUES — enteliWEB `2025-11-21 13:57` (use to fill `src:CAP`; observed only)

| Token | BAS name | Value |
|---|---|---|
| `TT-LWT` | LWT | 56.8 °F |
| `TT-EWT` | EWT | 70.0 °F |
| `FM-2` | BTU Meter (FM-2) Flow | 113.1 GPM |
| `FM-2.SUP` | BTU Supply | 63.4 °F |
| `FM-2.RET` | BTU Return | 70.7 °F |
| `FM-GWS` | GWS Flow | 780.0 GPM |
| `TT-GWST` | GWS T | 72.0 °F |
| `TT-GWRT` | GWR T | 72.5 °F |
| `TT-GEOST` | Geo ST | 73.7 °F |
| `TT-GEORT` | Geo RT | 72.6 °F |
| `PDT-NEWADD` | New Addition DP | 42.8 psi |
| `PDT-EXISTBLDG` | Existing Building DP | 7.0 psi |
| `TT-OAT` | OA-T | 55.6 °F |
| `AHT-OAH` | OA-H | 79.1 %RH |
| `PMP-P1` | P1 Sts/Cmd/Speed | On / On / 85.4% |
| `PMP-P2` | P2 Sts/Cmd/Speed | Off / Off / 0.0% |
| `PMP-P3` | P3 Sts/Cmd/Speed | On / On / 100.0% |
| `PMP-P4` | P4 Sts/Cmd/Speed | On / On / 100.0% |
| `CV-5` | ACCU (CV-5) | 0.0% |
| `CV-3` | GWS Min Flow (CV-3) | 0.0% |
| `CV-1-1` | GWS Bypass (CV-1-1) | 100.0% |
| `CV-1-2` | GWS Bypass (CV-1-2) | 100.0% |
| `ST-ACCU` | ACCU Status | On |
| `ST-ACCU-CMD` | ACCU Command | On |
| `AL-ACCU` | ACCU Alarm | normal |
| `ST-ACCU-RST` | Alarm Reset | off |
| `ST-ACCU-C1..C4` | C1–C4 Status | 100.0% each |
| `SP-LWT` | ACCU-1-LWT-SP | 44.0 °F |
| `SP-CHWDP` | CHWDP-SP | 7.0 psi |
| `SP-ACCU-EN-DIFF` | ACCU-EN-DIFF | 5.0 °F |
| `SP-ACCU-LOW-EN` | ACCU-LOW-EN-SP | 60.0 °F |
| `SP-ACCU-HIGH-EN` | ACCU-HIGH-EN-SP | 70.0 °F |
| `SP-CV5-TEMP` | ACCU-CV5-TEMP-SP | 75.0 °F |
| `PRM-SYSTEM-EN` | SYSTEM-EN | True |
| `PRM-SYS-RESET` | SYS-RESET | Off |
| `PRM-WELLFIELD-REPL` | WELLFIELD-REPLENISH | Off |
| `PRM-PMPDOWN-TIME` | PMPDOWN-TIME | 300.0 s |

> No `PT1`/`PT2` in this capture — do not create those points for this state.

---

## 5. MISSING SOURCES MANIFEST — what is NOT in the repo and what each unlocks

| Missing sheet (request from R&R / design team) | Unlocks (leave `[?]` until provided) |
|---|---|
| **Control-valve schedule** | `CV-5/CV-3/CV-1-1/CV-1-2` **Cv** values, line size, actuator, fail position |
| **Sequence of Operations `23 09 93.11`** (+ control diagrams) | `CV-5` % to-system vs % bypass direction; valve fail positions; ACCU staging logic; pump **lead/lag**; **DP-setpoint** control; WSHP occ/unocc |
| **Pump schedule + curves** | `PMP-P1..P4` role/loop, head/TDH, impeller, motor HP, NPSH, design GPM |
| **WSHP schedule** ("Capacities: See Plans") | WSHP design/balanced GPM, exact types (esp. `WSHP-2-4`, `WSHP-2-5`), entering-water temp, electrical |
| **Controls / flow-meter plan** | `FM-2` metered branch; `FM-GWS` which main (building vs geo) |
| **Mechanical riser detail** | `SEG-R3` size (3" vs 8"); confirm header/branch sizes |
| **Equipment schedule** | `EQ-ACCU-1` unit type (modular chiller/HP vs fluid cooler) |
| **RFI 181 / RFI 183 responses** | ACCU connection detail; wellfield 700 GPM confirmation |
| **TAB / balancing report** (when available) | balanced branch GPM (closes WSHP `[A]` to `[V]`) |

---

## 6. Token & I/O schema (for `io_matrix.json`)

```json
{
  "token": "string (e.g. CV-5, TT-LWT, WSHP-2-6)",
  "bas_name": "string (as on graphic/points list)",
  "element": "owning element token",
  "leg": "supply|return|null",
  "point_type": "AI|AO|BI|BO|AV|BV",
  "signal": "RTD|4-20mA|pulse|contact|BACnet|null",
  "unit": "string",
  "range": "string|null (DWG)",
  "spec_accuracy": "from §2.1|null",
  "value": "from §4 CAP|null",
  "setpoint": "from §4|null",
  "alarm_limit": "DWG|null",
  "cv": "DWG schedule|null",
  "fail_pos": "DWG/SOO|null",
  "sequence_ref": "23 09 93.11 clause|null",
  "src": "SPEC|DWG|CAP",
  "conf": "V|A|?"
}
```

**Rule:** a row may be emitted only if at least one of `src:SPEC` (device/standard/logic) or `src:CAP` (observed value) is satisfied from this bundle, **or** it is a known in-scope element emitted as a `conf:"?"` placeholder whose `src:DWG` fields cite the §5 sheet. No row may carry a fabricated Cv, capacity, curve, range, or sequence value.
