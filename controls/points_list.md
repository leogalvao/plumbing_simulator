# Stoddert ES — Control Points List

**Project:** DG-22-S002 · **Sources:** `Stoddert_ES_SOO_Drawings_M501-M503.md` (DWG/SOO) · `Stoddert_ES_Controls_Source_Bundle.md` (SPEC §2 · CAP §4)
**Capture:** enteliWEB 2025-11-21 · **Namespace:** `Stoddert_HVAC_Controls_Token_Map.md` · **Canonical data:** `io_matrix.json` (binds on `token`)

> **Conventions** — `src`: CAP=observed · SPEC=Division 23 basis · DWG=drawing/SOO (M501/M502/M503). `conf`: V=verified · A=spec-assumed (confirm on points-list) · ?=unresolved (sheet named in `coverage_report.md`).
> Tag aliases `[SOO …/list …]` and **FLAGs** are carried inline — SCADA tokens are primary; nothing is silently merged. **No Cv, capacity, curve, range, or sequence value is fabricated.**

---

## Totals — 406 records

| Type | Count | | Type | Count |
|---|---|---|---|---|
| **AI** | 163 | | **AV** | 23 |
| **AO** | 95 | | **BV** | 19 |
| **BI** | 61 | | `[?]` placeholders (no type) | 21 |
| **BO** | 24 | | **TOTAL** | **406** |

By source: **CAP 48 · DWG 309 · SPEC 49.**  By confidence: **V 315 · A 48 · ? 43.**
**266 points are now DWG-resolved (`conf:V`) from the SOO** (was 0 before the drawings arrived).

---

## EQ-ACCU-1 — air-cooled HP chiller (M-7 submetered)

| Token | BAS name | Type | Unit | Value/SP | Sequence (08/M503) | Src |
|---|---|---|---|---|---|---|
| `ST-ACCU` | ACCU Status | BI | — | On | §3 staging to TS-4 70/60 | CAP |
| `ST-ACCU-CMD` | ACCU Command | BO | — | On | §3 enable on call | CAP |
| `AL-ACCU` | ACCU Alarm | BI | — | normal | — | CAP |
| `ST-ACCU-RST` | Alarm Reset | BO | — | off | — | CAP |
| `ST-ACCU-C1..C4` | C1–C4 Status | AI | % | 100.0 | §3 compressor staging · **FLAG-C ≠ CS-1..4** | CAP |
| `SP-LWT` | ACCU-1-LWT-SP | AV | °F | 44.0 | §3 chiller leaving-water SP | CAP |
| `SP-ACCU-EN-DIFF` | ACCU-EN-DIFF | AV | °F | 5.0 | §3 deadband | CAP |
| `SP-ACCU-LOW-EN` | ACCU-LOW-EN-SP | AV | °F | 60.0 | §3 heating band | CAP |
| `SP-ACCU-HIGH-EN` | ACCU-HIGH-EN-SP | AV | °F | 70.0 | §3 cooling band | CAP |
| `SP-CV5-TEMP` | ACCU-CV5-TEMP-SP | AV | °F | 75.0 | §7.1 CV-5 diverting target | CAP |
| `TS-2` | Entering chiller water | AI | °F | SP 75 | §7.1 CV-5 holds ≤75 °F | DWG |
| `TS-4` | Loop-temp control | AI | °F | 70/60 | §3 chiller control point | DWG |

*Unit type, staging thresholds, fan-stage signal `[?]` (equipment schedule / 09/M503).*

---

## EQ-WELLFIELD — geothermal loop

| Token | BAS name | Type | Unit | Value | Sequence | Src | Conf |
|---|---|---|---|---|---|---|---|
| `PRM-WELLFIELD-REPL` | WELLFIELD-REPLENISH | BV | — | Off | replenish (RFI 181/183) | CAP | V |
| `TS-1`/`TS-3`/`TS-5` | Geo/loop temp | AI | °F | — | function per 09/M503 | DWG | ? |
| `PT-1`/`PT-2`/`PT-3` | Wellfield flow (display GPM) | AI | GPM | — | §3.4 → CV-1A/B bypass >500 GPM | DWG | V |
| `BTU-1` | Geothermal BTU energy | AI | MBH `[?]` | — | §6.1 >10% alarm | DWG | V |
| `TT-GWST`/`TT-GWRT` | GWS T / GWR T | AI | °F | 72.0 / 72.5 | §6.4 ±5 °F/10 min alarm | CAP | V |
| `TT-GEOST`/`TT-GEORT` | Geo ST / Geo RT | AI | °F | 73.7 / 72.6 | §6.4 alarm | CAP | V |

---

## SYS — plant-global, DP & heat-trace

| Token | BAS name | Type | Unit | Value/SP | Sequence | Src |
|---|---|---|---|---|---|---|
| `PRM-SYSTEM-EN` | SYSTEM-EN | BV | — | True | §1 plant enable | CAP |
| `PRM-SYS-RESET` | SYS-RESET | BV | — | Off | — | CAP |
| `PRM-PMPDOWN-TIME` | PMPDOWN-TIME | AV | s | 300.0 | — | CAP |
| `SP-CHWDP` | CHWDP-SP | AV | psi | 7.0 *(SOO 12 — FLAG-1)* | §3.1 DP setpoint | CAP |
| `PDT-EXISTBLDG` | Existing Building DP `[DPS-1/-2 ?]` | AI | psi | 42.8 (SP 12) | §3.1/§3.3 hold 12 PSI; ±2 psi alarm | CAP |
| `PDT-NEWADD` | New Addition DP `[DPS-1/-2 ?]` | AI | psi | 7.0 (SP 12) | §3.1/§3.3 | CAP |
| `CS-1..CS-4` | Roof heat-trace current `[≠ C1–C4]` | BI | — | — | §4.2 <35 °F; broken-circuit alarm | DWG |

---

## PMP-P1…P4 — VFD pumps (P1/P2 primary VS · P3/P4 chiller const-vol)

Each pump: `.STS` (BI), `.CMD` (BO), `.SPD` (AO) — **CAP**; `.FAULT` (BI), `.HAND` running-in-hand (BI) — **DWG**.

| Pump | VFD | STS/CMD/SPD (CAP) | Role (08/M503) |
|---|---|---|---|
| `PMP-P1` | VFD-1 | On / On / 85.4 % | §3.1 primary VS, lead holds DP 12 PSI, monthly lead/lag, freeze-lead §4.1 |
| `PMP-P2` | VFD-2 | Off / Off / 0.0 % | §3.1 primary VS, lead/lag with P1 |
| `PMP-P3` | VFD-3 | On / On / 100.0 % | §3.2 chiller pump const-vol, freeze-lead §4.1 |
| `PMP-P4` | VFD-4 | On / On / 100.0 % | §3.2 chiller pump const-vol |

*Curves/TDH/HP/NPSH/design GPM `[?]` (pump schedule).*

---

## Control valves — SCADA token primary, aliases carried

| Token | BAS name (alias) | Type | Value | Cv | Fail | Sequence | Src |
|---|---|---|---|---|---|---|---|
| `CV-1-1` | GWS Bypass `[SOO CV-1A / list CV-1]` | AO | 100.0 % | `[?]` | `[?]` | §3.4 wellfield bypass >500 GPM (PT-1/2/3) | CAP |
| `CV-1-2` | GWS Bypass `[SOO CV-1B]` | AO | 100.0 % | `[?]` | `[?]` | §3.4 wellfield bypass | CAP |
| `CV-3` | GWS Min Flow `[list CV-2 — FLAG-A]` | AO | 0.0 % | `[?]` | `[?]` | §3.3 opens at pump min speed → hold DP | CAP |
| `CV-5` | ACCU diverting `[SOO CV-4 — FLAG-B]` | AO | 0.0 % | `[?]` | `[?]` | §7.1 hold entering chiller water TS-2 ≤75 °F | CAP |

*Per 23 09 23.11 each CV fails to a defined position on power loss — **direction `[?]`** (valve schedule / 09/M503). Cv `[?]` (valve schedule).*

---

## Flow / energy meters

| Token | BAS name | Type | Unit | Value | Note | Src |
|---|---|---|---|---|---|---|
| `FM-GWS` | GWS Flow `[drawing FM-1]` | AI | GPM | 780.0 | geo loop flow · FLAG-2 vs 500 | CAP |
| `FM-2` | BTU Meter (FM-2) Flow | AI | GPM | 113.1 | metered branch per 09/M503 `[?]` | CAP |
| `FM-2.SUP` / `.RET` | BTU Supply / Return | AI | °F | 63.4 / 70.7 | — | CAP |
| `FM-2.BTU` | FM-2 thermal energy | AI | MBH `[?]` | — | assoc. BTU-1 | SPEC |

---

## Outdoor / loop sensors

| Token | BAS name | Type | Unit | Value | Accuracy | Src |
|---|---|---|---|---|---|---|
| `TT-LWT` / `TT-EWT` | LWT / EWT | AI | °F | 56.8 / 70.0 | ±0.5 °F | CAP |
| `TT-OAT` | OA-T | AI | °F | 55.6 | ±1 °F | CAP |
| `AHT-OAH` | OA-H | AI | %RH | 79.1 | ±2% RH | CAP |

---

## MTR — submetering (M501)

| Tokens | Drawing | Type | Unit | Src |
|---|---|---|---|---|
| `M-E1…M-E7` | M-1…M-7 electric (HVAC, lighting, plug, process, misc, DOAS-2, ACCU-1) | AI | kW | DWG (02/M501) |
| `M-W1`,`M-W2` | M-1/M-2 water (addition, main) | AI | gal | DWG (03/M501) |

---

## WSHP networks — WSHP-1-1…1-8 and WSHP-2-1…2-8 (M502 unit I/O)

Per-unit template re-derived from the **M502 unit points list (04/M502)** — supersedes the prior generic Div23 template. 13 DWG points/unit + 3 Div23 integration points (`conf:A`) + 1 balancing-valve flow (`[?]`).

| Suffix | BAS name | Type | Src | Conf |
|---|---|---|---|---|
| `.ACD-1` | Ventilation control damper | AO | DWG | V |
| `.CO2-1` | Room CO₂ (SP 1000 ppm) | AI | DWG | V |
| `.CV-1` / `.CV-2` | 3-way / 2-way coil valve | AO | DWG | V |
| `.D-1` | Primary air damper | AO | DWG | V |
| `.ECM-1.CMD/.STS/.SPD` | Fan start-stop / status / speed | BO/BI/AO | DWG | V |
| `.S-1` | Condensate-pan overflow | BI | DWG | V |
| `.TH-1` | Temp/humidistat | AI | DWG | V |
| `.TS-1` / `.TS-2` | Discharge air / leaving water temp | AI | DWG | V |
| `.VP-1` | Velocity (CFM) | AI | DWG | V |
| `.DP` | Floor dewpoint (2/floor — shared?) | AI | DWG | ? |
| `.SP-ADJ` / `.EWT` / `.OCC` | Div23 BACnet: setpoint-adj / entering-water / occ schedule | AV/AI/BV | SPEC | A |
| `BV-<unit>.GPM` | Balanced branch flow (TAB, not a live AI) | — | DWG | ? |

**Capacities/types ("See Plans"), design EWT, balanced GPM, and supply-air-humidity inclusion all `[?]`** (WSHP schedule / TAB). Esp. `WSHP-2-4`/`WSHP-2-5` types unresolved.

---

## EQ-DOAS-2 — dedicated outdoor-air unit (M-6 submetered, M502)

Dampers `.ACD-1/2/3` (OA/EA/relief, AO) · airflow `.AFMS-1/2` (AI) · `.CV-1` coil (AO) · DP `.DP-OAFILT/.DP-WHEEL/.DP-EAFILT/.DP-EADUCT/.DP-SADUCT` (AI) · end-switch `.ES-1/2` (BI) · `.FM-1` (AI) · `.CS-1` heat-trace (BI) · RH `.RH-OA/.RH-DISCH/.RH-EXH` (AI) · smoke `.SD-1/2` (BI) · temp `.TS-OA/.TS-SW/.TS-DISCH` (AI) · fans `.VFD-1/.VFD-2 .CMD/.STS/.FAULT/.HAND/.SPD` · `.WHEEL.SPD` (AO).

*Startup sequence resolved (02/M502 §2); secondary clauses summarized `[?]`. Exact point suffixes/locations to confirm against 01/M502 where marked `?`.*

---

## Unresolved equipment — `[?]` placeholders

`EQ-BT-1` (buffer tank) · `EQ-AS-1`/`EQ-AS-2` (air separators — may be mechanical-only) · `EQ-ET-5` (expansion tank) · `EQ-CHEM-1` (chemical treatment). Closed by controls/points-list + equipment schedule.
