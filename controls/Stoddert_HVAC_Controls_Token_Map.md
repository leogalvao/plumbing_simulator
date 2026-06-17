# Stoddert_HVAC_Controls_Token_Map.md

**Project:** Stoddert ES Modernization · DG-22-S002
**Role:** authoritative **token namespace** for the control-points map. Every row in `io_matrix.json`,
`points_list.md`, `sequence_xref.md`, `coverage_report.md` binds on a `token` defined here.
Seeded from the SOO drawings (M501/M502/M503), the Div 23 spec basis, and the 2025-11-21 capture.

> Tokens are stable identifiers, not BAS object names (`bas_name` holds the object name).
> **SCADA tokens are primary** (match enteliWEB). SOO/points-list aliases are carried in §4, **not merged**.

---

## 1. Prefix grammar

| Prefix | Meaning | Example |
|---|---|---|
| `EQ-` | Major equipment / packaged unit | `EQ-ACCU-1` |
| `PMP-` | Pump (VFD) | `PMP-P3` |
| `CV-` | Modulating control valve | `CV-5` |
| `BV-` | Balancing valve (TAB, meter-port) | `BV-WSHP-1-4` |
| `FM-` | Flow meter | `FM-2`, `FM-GWS` |
| `BTU-` | Energy (BTU) meter | `BTU-1` |
| `TS-`/`TT-` | Temperature sensor (RTD) | `TS-4`, `TT-LWT` |
| `PT-` | Pressure transducer (wellfield flow display) | `PT-1` |
| `PDT-` | Differential-pressure transmitter (`DPS`) | `PDT-NEWADD` |
| `AHT-` | Humidity transmitter | `AHT-OAH` |
| `CS-` | Current sensor (heat-trace) | `CS-1` |
| `VFD-` | Drive (aliased to its pump) | `VFD-1` → `PMP-P1` |
| `WSHP-` | Water-source heat pump (unit) | `WSHP-2-6` |
| `SP-` | Setpoint (analog value) | `SP-CHWDP` |
| `PRM-` | Control parameter / mode | `PRM-PMPDOWN-TIME` |
| `ST-`/`AL-` | Status-command / alarm (binary) | `ST-ACCU`, `AL-ACCU` |
| `M-E`/`M-W` | Electric / water submeter (M501) | `M-E7`, `M-W1` |
| `SYS` | Plant-global scope | `SYS` |
| `MTR` | Submetering group | `MTR` |
| `DOAS2.` / `WSHP.` | Unit-level namespacing (prevents tag collisions) | `DOAS2.CV-1`, `WSHP-1-3.CV-2` |

### 1.1 Sub-point suffixes

`.STS` status (BI) · `.CMD` start/stop (BO) · `.SPD` speed (AO) · `.FAULT` fault (BI) · `.HAND` running-in-hand (BI) · `.SUP`/`.RET` supply/return leg · `.BTU` energy · `.GPM` balanced flow (TAB, not live) · `.ECM-1.*` WSHP fan · `.CV-1`/`.CV-2` WSHP coil valves (3-way/2-way) · `.ACD-n`/`.D-1` dampers · `.SP-ADJ`/`.EWT`/`.OCC` Div23 WSHP BACnet · `.VFD-n.*` DOAS fans · `.WHEEL.SPD` energy wheel.

---

## 2. Element registry

| Element | Description | Resolved? |
|---|---|---|
| `EQ-ACCU-1` | Air-cooled HP chiller, fans C1–C4, M-7 submetered | **resolved** (SOO §3/§7; type & staging detail `[?]`) |
| `EQ-WELLFIELD` | Geo loop: `TS-1/3/5`, `PT-1/2/3`, `BTU-1`, geo temps | **resolved** (TS-1/3/5 function `[?]`) |
| `SYS` | Plant-global params, DP transmitters, heat-trace `CS-1..4` | **resolved** (DPS-1/2 assignment `[?]`) |
| `PMP-P1…P4` | VFD pumps (P1/P2 primary VS, P3/P4 chiller const-vol) | **resolved** (curves `[?]`) |
| `CV-1-1`,`CV-1-2` | Wellfield bypass `[SOO CV-1A/1B]` | **resolved** logic (Cv/fail `[?]`) |
| `CV-3` | Min-flow bypass `[list CV-2 — FLAG-A]` | **resolved** logic (Cv/fail `[?]`) |
| `CV-5` | Chiller diverting `[SOO CV-4 — FLAG-B]` | **resolved** logic (Cv/fail `[?]`) |
| `FM-2`,`FM-GWS` | BTU-metered branch flow; geo-loop flow `[=FM-1]` | **resolved** (metered branch `[?]`) |
| `TT-LWT/EWT/OAT`,`AHT-OAH` | Outdoor/loop sensors | **resolved** |
| `MTR` | Electric `M-E1..7` + water `M-W1/2` submeters | **resolved** |
| `WSHP-1-1…2-8` | WSHP units (M502 unit I/O) | **resolved** I/O (capacities/types `[?]`) |
| `BV-WSHP-*` | Per-unit balancing valve | `[?]` balanced GPM (TAB) |
| `EQ-DOAS-2` | DOAS unit, M-6 submetered | **resolved** startup (secondary clauses/suffixes `[?]`) |
| `EQ-BT-1`,`AS-1`,`AS-2`,`ET-5`,`CHEM-1` | Buffer/separators/expansion/chemical | `[?]` (points-list) |

---

## 3. Source + confidence legend

`src`: **CAP** observed (capture §4) · **SPEC** Div 23 basis · **DWG** drawing/SOO (M501/M502/M503).
`conf`: **V** verified (CAP value or DWG/SOO verbatim) · **A** spec-assumed (Div23 integration point, confirm on points-list) · **?** unresolved (sheet named in `coverage_report.md`).

> **No `PT1`/`PT2`** capture points were invented; `PT-1/2/3` here are the **wellfield pressure transducers** from the SOO points list (07/M503), absent from the 11/21 capture screen but real by design.

---

## 4. ⚠️ Tag reconciliation (points-list ↔ SOO ↔ enteliWEB) — carried, not merged

| Function | Points-list (07) | SOO (08) | enteliWEB | Token used | FLAG |
|---|---|---|---|---|---|
| Wellfield bypass | `CV-1` | `CV-1A`/`CV-1B` | `CV-1-1`/`CV-1-2` | **`CV-1-1`/`CV-1-2`** | — (corrects "GWS Bypass" = ground-loop, not building-DP) |
| Min-flow valve | `CV-2` | `CV-3` | `CV-3` | **`CV-3`** | **FLAG-A** |
| Chiller diverting | — | `CV-4` | `CV-5` | **`CV-5`** | **FLAG-B** |
| Geo loop flow | `FM-1` | `FM-1/2` | "GWS Flow" | **`FM-GWS`** (=FM-1) | — |
| Building DP | `DPS-1 & DPS-2` | `DPS-1/2` | "Existing/New Addition DP" | **`PDT-EXISTBLDG`/`PDT-NEWADD`** | -1 vs -2 `[?]` |
| Compressor stages | — | — | "C1–C4" | **`ST-ACCU-C1..4`** | **FLAG-C** (≠ `CS-1..4` heat-trace) |

**Value FLAGS:** **FLAG-1** DP SP 12 PSI (SOO) vs 7.0 (capture) · **FLAG-2** geo max flow 500 (SOO) / 700 (RFI-183) / 780 (capture).
