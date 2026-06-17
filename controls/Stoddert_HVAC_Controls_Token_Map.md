# Stoddert_HVAC_Controls_Token_Map.md

**Project:** Stoddert ES Modernization · DG-22-S002 / DCAM-22-CS-RFP-0009
**Role of this file:** authoritative **token namespace** for the control-points map. Every row in
`io_matrix.json`, `points_list.md`, `sequence_xref.md`, and `coverage_report.md` binds on a `token`
defined here. Seeded from the in-scope element list (`Source_Bundle.md` §0) and the capture (§4).

> Tokens are stable identifiers, not BAS object names. The BAS object name lives in `bas_name`.
> Nothing here asserts a Cv, capacity, range, or sequence value — those come from the drawings (§5).

---

## 1. Prefix grammar

| Prefix | Meaning | Example |
|---|---|---|
| `EQ-` | Major equipment / packaged unit | `EQ-ACCU-1` |
| `PMP-` | Pump (VFD) | `PMP-P3` |
| `CV-` | Modulating control valve | `CV-5` |
| `BV-` | Balancing valve (TAB, meter-port) | `BV-WSHP-1-4` |
| `FM-` | Flow / energy meter | `FM-2`, `FM-GWS` |
| `TT-` | Temperature transmitter (RTD) | `TT-LWT` |
| `PDT-` | Pressure / differential-pressure transmitter | `PDT-NEWADD` |
| `AHT-` | Humidity transmitter | `AHT-OAH` |
| `WSHP-` | Water-source heat pump (unit) | `WSHP-2-6` |
| `SP-` | Setpoint (analog value) | `SP-LWT` |
| `PRM-` | Control parameter / mode (binary or analog value) | `PRM-PMPDOWN-TIME` |
| `ST-` | Status / command (binary) | `ST-ACCU` |
| `AL-` | Alarm point | `AL-ACCU` |
| `SYS` | Plant-global controller scope (no single equipment owner) | `SYS` |

### 1.1 Sub-point suffixes (dot notation)

| Suffix | Meaning | Applies to |
|---|---|---|
| `.STS` | Operating status (BI) | pumps, WSHP |
| `.CMD` | Start/stop command (BO) | pumps, WSHP |
| `.SPD` | VFD speed command (AO) | pumps |
| `.POS` | Valve position command (AO) | CV-* |
| `.SUP` / `.RET` | Supply / return leg reading | FM-2, sensors |
| `.BTU` | Thermal-energy output | FM-2 |
| `.GPM` | Balanced/design branch flow (TAB, not a live AI) | BV-WSHP-* |
| `.SP-ADJ` | Setpoint adjustment (AV) | WSHP |
| `.SAT` `.RAT` `.RH` `.EWT` | Supply-air / room-air temp, humidity, entering-water temp | WSHP |
| `.OCC` | Occupied/unoccupied schedule (BV) | WSHP |
| `.FAULT` | Fault relay (BI) | WSHP |
| `.SCHED` | Scheduled-operation relay (BO) | WSHP |
| `.C1`…`.C4` | ACCU condenser-fan stages | EQ-ACCU-1 |

---

## 2. Element registry (from `Source_Bundle.md` §0)

| Element token | Description | Source basis | Resolved points? |
|---|---|---|---|
| `EQ-ACCU-1` | Rooftop heat-rejection / condenser unit; fans C1–C4 (free-cooling) | §2.6 type, §4 status & setpoints | **partial** (CAP status/SP; staging logic & type `[?]`) |
| `EQ-DOAS-2` | Dedicated outdoor-air system | §0 only | **`[?]`** (points-list, equip schedule, SOO) |
| `EQ-WELLFIELD` | Geo wellfield + replenish | §4 replenish flag; §2.6 geo piping | **partial** (CAP flag; capacity `[?]`) |
| `EQ-BT-1` | Buffer tank | §0 only | **`[?]`** (points-list, equip schedule) |
| `EQ-AS-1` / `EQ-AS-2` | Air separators | §0 only | **`[?]`** (points-list — may be mechanical-only) |
| `EQ-ET-5` | Expansion tank | §0 only | **`[?]`** (points-list — may be mechanical-only) |
| `EQ-CHEM-1` | Chemical treatment | §2.7 scope | **`[?]`** (points-list) |
| `PMP-P1`…`PMP-P4` | VFD pumps | §4 sts/cmd/spd; §2.5 DP control | **partial** (CAP I/O; curves/role/lead-lag `[?]`) |
| `CV-5` | ACCU valve | §4 position; §2.2 device | **partial** (CAP pos; Cv/fail/logic `[?]`) |
| `CV-3` | GWS min-flow valve | §4 position; §2.2 device | **partial** (CAP pos; Cv/fail/logic `[?]`) |
| `CV-1-1` / `CV-1-2` | GWS bypass valves | §4 position; §2.2 device | **partial** (CAP pos; Cv/fail/logic `[?]`) |
| `BV-WSHP-<id>` | Per-unit balancing valve, meter port | §2.4 device | **`[?]`** (balanced GPM from WSHP schedule / TAB) |
| `FM-2` | Onicon ultrasonic BTU meter | §2.3 device; §4 flow/sup/ret | **partial** (CAP flow/temps; metered branch `[?]`) |
| `FM-GWS` | Electromagnetic mains flowmeter | §2.3 device; §4 flow | **partial** (CAP flow; which main `[?]`) |
| `TT-LWT` `TT-EWT` `TT-GWST` `TT-GWRT` `TT-GEOST` `TT-GEORT` `TT-OAT` | RTD temperature transmitters | §2.3 device; §2.1 accuracy; §4 value | **resolved** (CAP value + SPEC accuracy) |
| `AHT-OAH` | OA humidity transmitter | §2.3 device; §2.1 accuracy; §4 value | **resolved** |
| `PDT-NEWADD` `PDT-EXISTBLDG` | DP transmitters | §2.3 device; §2.1 accuracy; §4 value | **resolved** (range `[?]`) |
| `WSHP-1-1`…`WSHP-1-8` | WSHP network 1 | §2.4 BACnet template | **partial** (SPEC points; capacities/EWT `[?]`) |
| `WSHP-2-1`…`WSHP-2-8` | WSHP network 2 | §2.4 BACnet template | **partial** (esp. `WSHP-2-4/2-5` types `[?]`) |
| `SYS` | Plant-global control parameters | §4 SYSTEM-EN/RESET/PMPDOWN; §2.5 DP setpoint | **partial** (owning controller per points-list `[?]`) |

---

## 3. Confidence + source legend

| Code | `src` | meaning |
|---|---|---|
| `CAP` | enteliWEB capture 2025-11-21 (§4) — observed value only |
| `SPEC` | Division 23 spec content (§2) — device/standard/accuracy/logic basis |
| `DWG` | drawing/schedule (§5) — **not in repo**; emitted as `conf:"?"` placeholder |

| `conf` | meaning |
|---|---|
| `V` | verified from a definitive source (CAP value, or SPEC-enumerated point/characteristic) |
| `A` | assumed from spec convention (e.g., transmitter signal protocol) — confirm on DDC riser |
| `?` | unresolved — closed only by the §5 sheet named in `coverage_report.md` |

> **No `PT1` / `PT2`** — absent from the capture; not created (per `Source_Bundle.md` §4 note).
