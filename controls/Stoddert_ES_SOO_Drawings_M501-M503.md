# Stoddert ES — Sequence of Operations & Controls (extracted from drawings)
**Project:** Stoddert ES East End Addition · 4501 Calvert St NW · Project DG-22-S002
**Source sheets:** M501 Rev 4 + M502 Rev 4 (06/29/2024) · M503 Rev 9 (10/01/2025)
**Read method:** sheets are raster (no text layer); rasterized at 200 DPI and read by region. SOO/points text below is transcribed verbatim from the sheets; noise (title blocks, borders, trend/graphic "X" columns) removed.
**Confidence tags:** `[V]` verbatim on drawing · `[X]` cross-referenced to enteliWEB 2025-11-21 capture · `[?]` needs confirmation (diagram detail or schedule).
**Token namespace:** `EQ-` equipment · `PMP-` pump · `CV-` control valve · `FM-` flow meter · `BTU-` energy meter · `TT-`/`TS-` temp · `PDT-`/`DPS-` diff-press · `PT-` press transducer · `CS-` current sensor · `VFD-` drive · `SP-` setpoint · `PRM-` parameter · `AL-` alarm · `M-` utility meter. Unit-level points are namespaced (`WSHP.`, `DOAS2.`) to prevent tag collisions with plant tags.
> ⚠️ **The drawing carries internal tag inconsistencies between its own points list (07/M503) and its SOO text (08/M503), and both differ from the enteliWEB graphic tags.** These are reconciled in §4.3 and flagged — not silently merged.
---
# 1. Abbreviations (M501 legend) — controls-relevant
`ACD` automatic control damper (NC/NO) · `ADJ` adjustable · `AI/AO` analog in/out · `DI/DO` digital in/out · `AFMS` airflow measuring station · `BAS` building automation system · `BTU` British thermal units · `CO2` carbon dioxide · `CS` current sensor · `CV` control valve · `DPS` differential pressure sensor · `EA` exhaust air · `ES` end switch · `ERU` energy recovery unit · `FM` flow meter · `FZ` freezestat · `HOA` hand/off/auto · `ISO` isolation · `OA` outside air · `RA` return air · `SA` supply air · `RH` relative humidity · `SD` smoke damper/detector · `SP` static pressure (`SPH`/`SPL` high/low) · `TS` temperature sensor · `VFD` variable freq drive · `WG` water gauge.
---
# 2. BAS architecture & metering (M501)
- **Network:** BACnet IP. New global BAS controller + field panels → routed to **DC enteliWEB** central monitoring. Contractor interfaces **all new HVAC equipment** with the existing BAS and the DC enteliWEB system. `[V]`
- **Electric submeters (02/M501)** — power consumption, kW: `M-1` HVAC · `M-2` lighting · `M-3` plug loads · `M-4` process loads · `M-5` misc loads · `M-6` DOAS-2 · `M-7` ACCU-1. `[V]`
- **Water meters (03/M501):** `M-1` addition water · `M-2` main building water (gallons). `[V]`
- **Sustainability dashboard (04/M501):** displays water-use and energy (per current/previous day-month-year), CO₂ forecast and annual CO₂ from gas+power. `[V]`
---
# 3. Equipment register (controls scope)
| Token | Equipment | Notes |
|---|---|---|
| `EQ-ACCU-1` | Air-cooled heat-pump chiller (1) | rooftop; constant-flow primary injection loop; submetered `M-7` `[V]` |
| `EQ-WELLFIELD` | Geothermal wellfield | max geo flow per SOO = 500 GPM (see FLAG-2) `[V]` |
| `EQ-DOAS-2` | Dedicated outdoor-air unit | energy-recovery wheel, dual VFD fans, gas heat; submetered `M-6` `[V]` |
| `EQ-WSHP-××` | Water-source heat pumps | per-unit controllers; see §5 `[V]` |
| `PMP-P1`,`PMP-P2` | Building-loop primary pumps | variable speed, lead/lag monthly `[V]` |
| `PMP-P3`,`PMP-P4` | Chiller pumps | constant volume, follow `EQ-ACCU-1` `[V]` |
> Existing-to-remain (NOT in new scope): `EOP-3 & EOP-4` and their associated existing VFDs. All other equipment/valves/sensors/VFDs/meters are **new, contractor-furnished**. `[V]` (note 07/M503)
---
# 4. CENTRAL PLANT — geothermal / condenser-water (M503)
## 4.1 Points list — verbatim (07/M503)
| Drawing tag | Description | Token |
|---|---|---|
| `BTU-1` | BTU energy metering – geothermal | `BTU-1` |
| `CS-1 THRU CS-4` | Heat-trace current sensor (×4) | `CS-1…CS-4` |
| `CV-1` | **Geothermal loop bypass valve** | see §4.3 → wellfield bypass |
| `CV-2` | **Minimum flow bypass valve** | see §4.3 → min-flow |
| `DPS-1 & DPS-2` | Differential pressure sensors – building loop | `PDT-EXISTBLDG`,`PDT-NEWADD` |
| `FM-1 THRU 2` | Flow meter (×2) | `FM-1`,`FM-2` |
| `PT-1 THRU 3` | Pressure transducers (display GPM) | `PT-1…PT-3` |
| `TS-1 THRU TS-5` | Temperature sensors (×5) | `TS-1…TS-5` |
| `VFD-1 THRU 4` | Pump start/stop | `VFD-1…VFD-4` (DO) |
| `VFD-1 THRU 4` | Pump status, fault, running-in-hand | `VFD-1…VFD-4` (DI ×3) |
| `VFD-1 THRU 4` | Pump speed | `VFD-1…VFD-4` (AO) |
## 4.2 Sequence of Operations — verbatim, cleaned (08/M503)
**1. GENERAL** — All plant controllers provided by the BAS provider and communicate with the BAS. Plant operated through the BAS and may be overridden. Provide BAS + graphics showing control points and alarms per the I/O summary. `[V]`
**2. DESIGN CONDITIONS** — Summer outdoor `95/78 °F DB/WB`; Winter outdoor `10/9 °F DB/WB`; **Summer loop temp 70 °F**; **Winter loop temp 60 °F**. `[V]`
**3. HEAT-PUMP-CHILLER OPERATION** — One independent air-cooled HP chiller, BAS-controlled, in a **constant-flow primary injection loop**; stages on/off to hold loop-temp setpoint.
- *Cooling:* chiller + its pumps energize on a cooling call, run to maintain **70 °F at `TS-4`**; within deadband (`<70 / >60 °F`) chillers off.
- *Heating:* chiller + its pumps energize on a heating call, run to maintain **60 °F at `TS-4`**; same deadband. `[V]`
**3. PUMPS** *(drawing re-uses heading "3")*
- **3.1 `P-1` & `P-2`** — primary variable-speed pumps; **enabled whenever a coil calls**, off otherwise. On a cooling/heating call the **lead pump holds the DP setpoint (`12 PSI`)** at the worst-case DP sensors at the **existing building** and the **new addition**. **Lead/lag swap at the start of each month.** `[V]` → FLAG-1
- **3.2 `P-3` & `P-4`** — air-cooled HP-chiller pumps; operate **simultaneously at constant volume**; on/off as the chiller comes on/off. `[V]`
- **3.3 MINIMUM-FLOW VALVE `CV-3`** — modulates open when main pump `P-1`/`P-2` is at **minimum speed**, to hold the DP setpoint at `DPS-1`/`DPS-2`. `[V]`
- **3.4 GEOTHERMAL WELLFIELD VALVES `CV-1A` & `CV-1B`** — modulate to **bypass any flow > 500 GPM around the wellfield** (500 GPM = max geo flow). Flow `0–500 GPM` passes through the wellfield. Modulate off pressure transducers `PT-1`,`PT-2`,`PT-3`. `[V]` → FLAG-2
**4. FREEZE PROTECTION**
- **4.1** If chillers and `P-3`/`P-4` are **off and OAT < 35 °F**: the **`ACCU-1` control valve opens**, ACCU-1 internal valves open, **valve `CV-1` opens**; **lead pumps `P-1` and `P-3` energize** and circulate wellfield water through the loop. `[V]` → FLAG-3
- **4.2** Roof hydronic piping insulated + **heat-traced**; circuits energize **below OAT 35 °F (adj)**; BAS **alarms on a broken heat-trace circuit** via the current sensor. `[V]`
**6. ALARMS** *(drawing skips a "5")*
- **6.1 Excessive BTU energy** — alarm when recorded BTU energy is **>10 % above** the daily/weekly/monthly historical average.
- **6.2 Pump fault** — commanded ON but **remains off** (adj).
- **6.3 Pump running-in-hand** — commanded OFF but **stays on** (adj).
- **6.4 Hi/Lo geothermal supply & return temp** — `±5 °F (adj)` beyond setpoint for **>10 min**.
- **6.5 Hi/Lo differential pressure** — DP exceeds setpoint by **±2 psi**. `[V]`
**7. CHILLER DIVERTING VALVE `CV-4`**
- **7.1** Modulates to maintain **entering chiller water temp at `TS-2` below 75 °F (adj)**. `[V]` → FLAG-3
### Tokenized point→logic map (central plant)
| Token | Type | Role in SOO | Setpoint / trigger | Conf |
|---|---|---|---|---|
| `TT-TS4` | AI | loop-temp control | 70 °F cool / 60 °F heat | `[V]` |
| `TT-TS2` | AI | entering chiller water (CV-4 target) | ≤75 °F (adj) | `[V]` |
| `TT-TS1/TS3/TS5` | AI | geo/loop supply-return temps | (functions per diagram 09) | `[?]` |
| `PDT-EXISTBLDG` (`DPS-1/2`) | AI | worst-case DP (existing bldg) | 12 PSI | `[V]`/`[X]` |
| `PDT-NEWADD` (`DPS-1/2`) | AI | worst-case DP (new addition) | 12 PSI | `[V]`/`[X]` |
| `PT-1…PT-3` | AI | wellfield flow (display GPM) → CV-1A/B | 500 GPM bypass threshold | `[V]` |
| `BTU-1` | AI | geo energy metering | >10% vs historical → AL | `[V]` |
| `FM-1`,`FM-2` | AI | loop flow meter(s) | — | `[V]` |
| `PMP-P1`,`PMP-P2` (`VFD-1/2`) | AO+DI | primary VS pumps, lead holds DP | min-speed → CV-3 opens | `[V]` |
| `PMP-P3`,`PMP-P4` (`VFD-3/4`) | AO+DI | chiller pumps, constant vol | follow chiller | `[V]` |
| `CV-3` (min-flow) | AO | open at min pump speed → hold DP | DPS-1/DPS-2 | `[V]` |
| `CV-1A`,`CV-1B` (wellfield bypass) | AO | bypass >500 GPM around wellfield | PT-1/2/3 | `[V]` |
| `CV-4` (chiller diverting) | AO | hold TS-2 ≤75 °F | TS-2 | `[V]` |
| `EQ-ACCU-1` valve + internal valves | AO/BO | freeze-protect open <35 °F | OAT | `[V]` |
| `CS-1…CS-4` | DI | heat-trace broken-circuit alarm | OAT<35 energize | `[V]` |
| `VFD-1…4` running-in-hand | DI | hand-mode alarm (6.3) | cmd-off but on | `[V]` |
## 4.3 ⚠️ Tag cross-map (points-list ↔ SOO ↔ enteliWEB) + FLAGS
| Function | Points list (07) | SOO text (08) | enteliWEB capture | Reconciliation |
|---|---|---|---|---|
| **Wellfield bypass** | `CV-1` "geothermal loop bypass" | `CV-1A` & `CV-1B` | `CV-1-1` / `CV-1-2` "GWS Bypass" | **Same device pair.** Bypasses flow >500 GPM around the wellfield. **"GWS Bypass" = geothermal/ground-loop bypass, NOT a building-loop DP bypass** (corrects the earlier token-map assumption). |
| **Minimum-flow valve** | `CV-2` "min flow bypass" | `CV-3` "minimum flow valve" | `CV-3` "GWS Min Flow" | **FLAG-A:** points list tags it **CV-2**; SOO + SCADA tag it **CV-3**. Function agreed (opens at min pump speed to hold DP). Use `CV-3`; note the CV-2 label on 07/M503. |
| **Chiller diverting** | *(not in list)* | `CV-4` (TS-2 ≤75 °F) | `CV-5` "ACCU" + `ACCU-CV5-TEMP-SP 75` | **FLAG-B:** SOO calls it **CV-4**, SCADA calls it **CV-5**; both target 75 °F entering chiller water — almost certainly the same valve under two tags. |
| **ACCU-1 freeze valve** | *(not in list)* | "ACCU-1 control valve" + "`CV-1` shall open" | `CV-5` "ACCU" | **FLAG-B:** freeze step 4.1 names both the *ACCU-1 control valve* and "*CV-1*"; reconcile against CV-4/CV-5 on diagram 09/M503. |
| **Primary pumps** | `VFD-1…4` | `P-1` & `P-2` | `P1`,`P2` | building-loop primary VS pumps. |
| **Chiller pumps** | `VFD-1…4` | `P-3` & `P-4` | `P3`,`P4` | ACCU pumps, constant vol (resolves earlier "geo/cooler" assumption to **[V]**). |
| **Building-loop DP** | `DPS-1 & DPS-2` | `DPS-1`/`DPS-2` (existing / new addition) | "Existing Building DP" / "New Addition DP" | map existing↔one, new-addition↔other; **confirm which is -1 vs -2 on diagram** `[?]`. |
| **Geo energy / flow** | `BTU-1` + `FM-1/2` | BTU alarm 6.1 | "BTU Meter (FM-2)", "GWS Flow 780" | `BTU-1` = energy; `FM-1/FM-2` = flow elements; "GWS Flow" is the **geothermal loop** flow. |
| **Wellfield flow PT** | `PT-1…3` | `PT-1/2/3` | *(absent in 11/21 capture)* | PT-1/2/3 exist by design (wellfield flow / CV-1A-B control); just not on that capture screen. |
| **Heat-trace current** | `CS-1…CS-4` | "current sensor" | "C1–C4" (100%) | **FLAG-C:** SCADA "C1–C4" are likely **ACCU compressor circuits**, distinct from heat-trace `CS-1…CS-4`. Do not conflate. |
**Consolidated discrepancy flags**
- **FLAG-1 — DP setpoint:** SOO = **12 PSI**; enteliWEB `CHWDP-SP` = **7.0 psi**. Confirm operating vs design value.
- **FLAG-2 — Geo max flow:** SOO = **500 GPM max** (CV-1A/B bypass the excess); riser/RFI-183 = **700 GPM**; capture `GWS Flow` = **780**. Reconcile (RFI-183 may supersede the 500, or 780 is total-loop vs 500 through-wellfield).
- **FLAG-A — CV-2 vs CV-3** (min-flow) and **FLAG-B — CV-4 vs CV-5** (chiller diverting): tag mismatches across layers; verify final tags on the controls diagram 09/M503 / valve schedule.
- **FLAG-C — "C1–C4" ≠ `CS-1…CS-4`.**
- **Numbering:** SOO jumps section 4 → 6 (no "5") on the sheet — preserved as drawn.
- **TS assignments:** only `TS-2` (entering chiller) and `TS-4` (loop control) are defined in the SOO; `TS-1/TS-3/TS-5` functions to be read off diagram 09/M503 `[?]`.
---
# 5. WATER-SOURCE HEAT PUMP — unit sequence (M502)
> **Tag-collision note:** WSHP-unit `CV-1`/`CV-2` are **3-way and 2-way coil valves at the unit** — *not* the plant `CV-1`/`CV-2`. Always namespace as `WSHP.CV-1` / `WSHP.CV-2`.
## 5.1 Points list — verbatim (04/M502)
| Drawing tag | Description | Token | Type |
|---|---|---|---|
| `ACD-1` | Ventilation automatic control damper | `WSHP.ACD-1` | AO/DO |
| `CO2-1` | Room CO₂ concentration | `WSHP.CO2-1` | AI |
| `CV-1` | 3-way control valve (command only) | `WSHP.CV-1` | AO |
| `CV-2` | 2-way control valve (command only) | `WSHP.CV-2` | AO |
| `D-1` | Primary air damper (command only) | `WSHP.D-1` | AO |
| `DP-1&2` | Floor dewpoint sensor – 2 per floor | `WSHP.DP-1/2` | AI |
| `ECM-1` | Fan – start/stop · status · speed (cmd only) | `WSHP.ECM-1` | DO/DI/AO |
| `S-1` | Condensate-pan overflow switch | `WSHP.S-1` | DI |
| `T/H-1` | Combination temperature/humidistat | `WSHP.TH-1` | AI |
| `TS-1` | Discharge air temperature | `WSHP.TS-1` | AI |
| `TS-2` | Leaving water temperature | `WSHP.TS-2` | AI |
| `VP-1` | Velocity pressure (CFM) | `WSHP.VP-1` | AI |
## 5.2 Sequence — verbatim, cleaned (05/M502)
**1. GENERAL** — design conditions: summer `95/78`, winter `10/9`; **CO₂ setpoint 1000 PPM (adj)**.
**Schedule:** Occupied **M–F 8:30 AM–3:15 PM, Sat 9:00 AM–1:00 PM**; Unoccupied = all other hours + holidays/snow days. `[V]`
**2. RUN CONDITIONS** — *Startup:* via BAS with **HOA in Auto**, then controlled per the sequences below. *Shutdown:* via BAS / unit controller / **fire-alarm** / any safety → unit commanded off and the **2-way control valve (`WSHP.CV-2`) closes**. `[V]`
**3. COOLING** — On a cooling call from room-temp setpoint: **motorized valve opens** (water through the heat exchanger), **ECM fan starts simultaneously**; the **compressor stages on after a ~4-sec delay after the valve is fully open, upon proof of water flow at the unit flow switch**; **compressor min-on 180 s**. Fan CFM follows the unit's mode (**Stage-1 Cool / Stage-2 Cool / Dehumidification**); 2-stage units energize the **2nd stage on an additional call**. On satisfy: **compressor + fan off, isolation valve closes, compressor min-off 360 s**. `[V]`
**4. HEATING** — Mirror of cooling (**Stage-1 Heat / Stage-2 Heat**); compressor stages after the 4-sec/valve-open/proof-of-flow interlock; **min-on 180 s**, 2nd stage on additional call; on satisfy off; **min-off 360 s**. `[V]`
### Tokenized unit interlocks
`call(room T) → WSHP.CV-* open → ECM-1 on (simultaneous) → [valve full-open + flow-proof + 4 s] → compressor on (min-on 180 s) → stage-2 on add'l call → satisfy → compressor+fan off, ISO valve close (min-off 360 s)`. Safeties/fire → off + CV-2 close. `[V]`
---
# 6. DOAS-2 — unit sequence (M502)
## 6.1 Points list (01/M502) — summary `[V]` tags / `[?]` exact suffixes to confirm
Dampers `ACD-1` OA / `ACD-2` exhaust / `ACD-3` relief; airflow stations `AFMS-1` OA / `AFMS-2` exhaust; coil control valve `CV-1`; DP sensors across **OA filter / energy wheel / EA filter / EA duct / SA duct**; isolation end switches `ES-1` (OA) / `ES-2` (EA); flow meter `FM-1`; heat-trace current sensor `CS-1`; RH at **global OA / discharge / building exhaust**; smoke detectors `SD-1` supply / `SD-2` exhaust; temperature sensors at **global OA / supply water / discharge / etc.**; two fans `VFD-1`,`VFD-2` (start/stop, status-fault-**running-in-hand**, speed). `[?]` confirm exact suffixes against 01/M502.
## 6.2 Sequence — verbatim where read, else clause-level (02/M502)
**1. GENERAL / DESIGN** — operated through BAS, overridable at unit controller. **Summer discharge 52 °F/52 °F DB/WB (adj); Winter discharge 69 °F (adj).** Schedule same as WSHP (occupied M–F 8:30–3:15, Sat 9–1; else off). `[V]`
**2. RUN — Startup** `[V]`:
1. HOA in Auto.
2. **OA + exhaust dampers commanded open, proven via "open" end switch.**
3. **After a 10-sec delay**, supply fan enabled/started by VFD to **min speed**, then released → **"supply air volume control"**.
4. Exhaust fan enabled **concurrently** → min speed → **"exhaust air volume control"**.
5. **Energy wheel** enabled concurrently, started by VFD, modulated to **design speed**.
**Shutdown** — via BAS, HOA Auto (and via fire-alarm/safeties). `[V]`
**Remaining clauses present on sheet** (supply-air temperature control, economizer / enthalpy comparison, gas-heat reheat, dehumidification, energy-recovery control, CO₂ demand-control ventilation, alarms incl. dirty-filter DP and fan running-in-hand) — **summarized, not transcribed line-by-line**; pull from 02/M502 if a verbatim controls narrative is needed for any one. `[?]`
---
# 7. Consolidated open items / to resolve
1. **Valve tags** — confirm final CV numbering on diagram **09/M503** + valve schedule: CV-2↔CV-3 (min-flow), CV-4↔CV-5 (chiller diverting), and the ACCU-1/CV-1 freeze valve identity. (FLAG-A, FLAG-B)
2. **DP setpoint** 12 PSI (SOO) vs 7.0 (capture). (FLAG-1)
3. **Geo max flow** 500 (SOO) vs 700 (RFI-183) vs 780 observed. (FLAG-2)
4. **TS-1/TS-3/TS-5** functional assignment from diagram 09/M503.
5. **DPS-1 vs DPS-2** = which is existing-building vs new-addition.
6. **"C1–C4"** (SCADA) confirmed as ACCU compressor stages, distinct from heat-trace CS-1…CS-4. (FLAG-C)
7. **Schedules still outside these sheets:** control-valve Cv, pump curves/TDH/NPSH, WSHP capacities ("See Plans"), TAB report. (SOO logic itself is now resolved.)
