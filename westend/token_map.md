# token_map.md — Stoddert ES **WEST END CAFETERIA** controls token namespace

**Project:** Stoddert ES West End Cafeteria · **4001 Calvert St NW**, Washington DC 20007 · Contract **DCAM-22-CS-RFP-0009**
**Architect:** Shinberg.Levinas · **MEP+FP:** Global Engineering Solutions of Washington DC (GES) / Salas O'Brien · **100% CD set 2025/06/06**
**Role:** authoritative **token namespace** for the West End control-points map. Every row in `io_matrix.json`, `points_list.md`,
`sequence_xref.md`, `coverage_report.md`, and the design-basis capture binds on a `token` defined here.

> ⚠️ **Separate scope from East End.** East End = *4501 Calvert / Project DG-22-S002* (its artifacts live in `/controls/`).
> West End = *4001 Calvert / DCAM-22-CS-RFP-0009* (this directory). The two suites are kept apart on purpose; tokens here are
> **namespaced `…-CA-…`/unit-level** so they never collide with East End tokens. **Both projects use the service letters `GWS`/`GWR`**
> for condenser/ground water — see FLAG-W7. Nothing is silently merged across the two projects.

**Read method / provenance:** the six source sheets were read directly — **M501B Rev.5** from its embedded text layer; **M502B Rev.5,
M503B Rev.6, M201B Rev.5, M202B Rev.4** rendered from vector PDF at 200 DPI and read by region (vision); **M121B** read from the
project Drive copy at high DPI. Spec facts are from the actual West End **[WEST] Division 23/11 specification PDFs** (100% CD, 2025/06/06).
Every fact is cited by **sheet + detail-bubble** (`NN/M50xB`) or **spec section** (`§230923 …`). Tokens are stable identifiers, not BAS object
names (`bas_name` holds the object name). **SCADA/observed tokens do not exist for West End — there is no field capture** (see the design-basis
capture deliverable); drawing tags are therefore primary here.

---

## 1. Prefix grammar (West End)

| Prefix | Meaning | Example |
|---|---|---|
| `WSHP-CA-` | Water-source heat pump, cafeteria addition (keep `-CA-` verbatim; do **not** renumber to East-End `WSHP-1-x`) | `WSHP-CA-01` |
| `DOAS-CA-` | Dedicated outdoor-air unit, cafeteria addition | `DOAS-CA-1` |
| `VAV-CA-` | VAV terminal, cafeteria addition (DOAS ventilation, CO₂-controlled) | `VAV-CA-01` |
| `VAV-1-` | Existing 2nd-floor VAV terminal on `(E)ERAHU-1` (as-drawn tag) | `VAV-1-10` |
| `CAR-` | Constant Air Flow Regulator (the spec's "Constant Air Flow Regulator" / CAFR; sheet tag is `CAR-`) | `CAR-A` |
| `ERAHU-1` | Existing energy-recovery air-handling unit being retrofit | `ERAHU-1` |
| `SCR-` | SCR-controlled electric heating coil | `SCR-1` |
| `EH-` | Electric (unit) heater | `EH-1` |
| `VRF-ODU-` / `VRF-IDU-` | VRF outdoor / indoor units (existing-building renovation; factory/iTouch, not BAS-interlocked) | `VRF-IDU-AC-1` |
| `ERV-` | Energy-recovery ventilator (VRF system) | `ERV-1` |
| `CP-` | Condensate pump (at each WSHP) | `CP-1` |
| `KMAU-` / `KEF-` / `HOOD-` | Kitchen makeup-air unit / kitchen grease exhaust fan / exhaust hood control | `KMAU-1` |
| `WIC` / `WIF` | Walk-in cooler / walk-in freezer (water-cooled remote condensing unit) | `WIC`, `WIF` |
| `CV-` | Modulating / 2-way control valve | `DOAS1.CV-1` |
| `ACD-` | Automatic control damper (NC/NO) | `DOAS1.ACD-1` |
| `D-` | Primary air damper (VAV/AHU) | `SCR1.D-1` |
| `VP-` | Velocity-pressure transducer (CFM) | `SCR1.VP-1` |
| `TS-`/`T-`/`T/H-` | Temperature sensor / thermostat / combo temp-humidistat | `DOAS1.TS-4` |
| `DPS-` | Differential-pressure sensor | `DOAS1.DPS-2` |
| `SP-`/`SPH`/`SPL` | Static-pressure sensor (high/low) | `ERAHU1.SPH` |
| `RH-` | Relative-humidity sensor | `DOAS1.RH-1` |
| `AFMS-` | Airflow measuring station | `DOAS1.AFMS-1` |
| `ES-` | End switch (damper open/close proof) | `DOAS1.ES-1` |
| `CS-` | Current sensor / current switch | `DOAS1.CS-1` |
| `CO2-` | Carbon-dioxide sensor | `WSHP-CA-01.CO2-1` |
| `DEW-` | Floor dewpoint sensor | `WSHP-CA-01.DEW-1` |
| `S-` | Safety switch (condensate-pan overflow / override) | `WSHP-CA-01.S-1` |
| `ECM-`/`VFD-` | Fan (ECM, or VFD-driven) — start/stop, status, speed | `DOAS1.VFD-1` |
| `FM-` | Flow meter | `DOAS1.FM-1` |
| `BTU-` | Thermal-energy (BTU) meter | `BTU-1` (loop) · `DOAS1.BTU-1` (unit) |
| `WM-` | Water meter (turbine, gallons) | `WM-1` |
| `M-` | Electric / gas / domestic-water utility submeter (01/03/04 M501B) | `M-1`…`M-5`, `M-GAS` |
| `SYS-WE` | West End plant-global / BAS scope | `SYS-WE` |
| `MTR-WE` | West End submetering group | `MTR-WE` |

### 1.1 Unit-level namespacing (required — West End reuses bare tags across details)
The West End sheets reuse the same bare tags (`CV-1`, `TS-1`, `TS-2`, `CS-1`, `ACD-1`, `D-1`, `VP-1`, `VFD-1/2`, `BTU-1`, `S-1`, `T-1`)
in **different details for different devices**. All unit-level points are therefore namespaced `UNIT.point`:
`DOAS1.` · `WSHP-CA-01.`…`WSHP-CA-04.` · `ERAHU1.` · `SCR1.` (the VAV-box-with-electric-heat detail 05/M501B) · `BYPVAV.` (bypass VAV box,
02/M501B) · `WIC.`/`WIF.` (walk-in cooler/freezer, 01/M503B) · `EH1.` (electric heater, 02/M503B) · `HOOD1.`/`KMAU-1`/`KEF-1` (kitchen, 04/M503B).
Sub-point suffixes: `.CMD` start/stop (DO) · `.STS` status (DI) · `.SPD` speed (AO) · `.FAULT`/`.HAND` fault / running-in-hand (DI) ·
`.SUP`/`.RET` supply/return leg.

---

## 2. Element registry

| Element | Description | Source (detail/§) | Resolved? |
|---|---|---|---|
| `SYS-WE` | BAS architecture (BACnet IP → DC enteliWEB; existing JCI Metasys) | 01/M501B · §230923 | **resolved** |
| `MTR-WE` | Submeters: electric `M-1…M-5`, gas `M-GAS`, domestic water `WM-1/WM-2`, loop `BTU-1` | 03/04 M501B · 03/M503B · §230923.14 | **resolved** (per-panel M# breakdown, water M-1/2 leg `[?]`) |
| `WSHP-CA-01`…`-04` | Water-source heat pumps (Dining/Dry-Food/Kitchen/Chair-Storage) | 04-06/M502B · M121B · M201B · §238146 | **resolved** I/O + BAS seq (cooling/heating/dehum = factory; capacities = "See Plans") |
| `CP-1` | Condensate pumps (one per WSHP, TYP) | M121B KN-3 | **resolved** (no BAS point; overflow via `WSHP.S-1`) |
| `DOAS-CA-1` | Packaged outdoor DOAS: enthalpy wheel + WSHP/DX coil + hot-gas reheat; dual VFD fans | 01-03/M502B · M201B/M202B · §237343.16 | **resolved** seq (coil type spec-vs-drawing FLAG-W4) |
| `VAV-CA-01/02` | DOAS ventilation VAV boxes (CO₂-controlled) | M201B/M202B · 05/02 M501B · 05/M502B §6.2 | **resolved** role (which detail governs each box `[?]`) |
| `CAR-A/CAR-B` | Constant Air Flow Regulators (fixed ventilation, non-CO₂ rooms) | M201B/M202B · 05/M502B §6.1 · §230593 | **resolved** role (CFM 95 / 400) |
| `SCR1` (VAV+electric heat) | VAV box w/ SCR electric reheat: `D-1`,`SCR-1`,`T-1`/`THC-1`,`VP-1` | 05/M501B | **resolved** seq (physical box assignment `[?]` FLAG-W6) |
| `BYPVAV` (bypass VAV) | Bypass VAV box holding duct static 1.0″WG (= `VAV-1-10` return-air bypass) | 02/M501B · M201B | **resolved** |
| `ERAHU-1` | Existing AAON ERU; controller→AAON WattMaster; single-zone-VAV→traditional-VAV | 07/M501B · M201B · §230923 1.2.A.4 | **resolved** modified seq (base-bldg points retained off-sheet `[?]`) |
| `VAV-1-8…-13` | Existing 2nd-floor VAV terminals on `(E)ERAHU-1` | M201B riser | **resolved** tags/CFM (controls per base-bldg dwgs `[?]`) |
| `VRF-*` | VRF system (existing-bldg renovation): ODU/IDU/ERV; iTouch; **BAS monitor/alarm only** | 06/M501B · §238129 | **resolved** BAS-visible points (factory internals not in BAS; unit counts `[?]`) |
| `WIC` / `WIF` | Walk-in cooler 1416-A / freezer 1416-B (water-cooled ColdZone units on GWS/GWR) | 01/M503B · M121B KN-6 · M201B · §114000 | **resolved** BAS monitor/cmd (refrig control = factory KE2) |
| `EH1` (electric heaters) | Electric wall/ceiling unit heaters, factory tstat, BAS-monitored | 02/M503B · M501B legend | **resolved** (qty/locations `[?]`) |
| `HOOD1`/`KMAU-1`/`KEF-1` | Kitchen exhaust hood + grease exhaust fan + makeup-air unit (VFD-thermostat) | 04/M503B · §233423 · §230548.13 | **resolved** seq (VFD-1/2 tag swap FLAG-W5) |
| GEO/condenser-water loop | New GWS/GWR ties to **existing 6″** loop; `BTU-1`+`WM`; **no new plant pumps** | M121B KN-4/5/6 · M201B · 03/M503B · §230593 | **resolved** topology (loop temps/flows/pumps = existing `[?]`) |

---

## 3. Source + confidence legend

`src`: **DWG** = drawing/SOO (M501B/M502B/M503B/M201B/M202B/M121B) · **SPEC** = West End Division 23/11 spec section.
*(There is **no `CAP`/observed source** for West End — no field capture exists; the design-basis capture is synthesized and tagged separately
`[V]`/`[DERIVED]`/`[ILLUS]`.)*
`conf`: **V** = verbatim on a drawing or in a spec · **A** = spec-assumed integration point (confirm on points list) · **?** = unresolved (closing sheet/schedule named in `coverage_report.md`).

**Discipline:** a row is emitted only if backed by `src:DWG` or `src:SPEC`, **or** as a `conf:"?"` placeholder citing the sheet/schedule that
closes it. No Cv, capacity, pump curve, flow/GPM, range, or sequence value is fabricated in the extraction.

---

## 4. ⚠️ Tag reconciliation & FLAGS (carried, not merged)

### 4.1 Within-West-End reused/namespaced tags
| Bare tag | Appears as (namespaced) | Where |
|---|---|---|
| `CV-1` | `DOAS1.CV-1` (geothermal coil valve) · `WSHP-CA-0x.CV-1` (source 2-way valve) | 01/03 M502B · 04/06 M502B |
| `TS-1` | `DOAS1.TS-1` (return water) · `WSHP-CA-0x.TS-1` (discharge air) · `WIF.TS-1` (freezer room) · `EH1.T-1` · `KMAU-1.TS-1` (MAU discharge) | M502B/M503B |
| `TS-2` | `DOAS1.TS-2` (supply water) · `WSHP-CA-0x.TS-2` (leaving water) · `WIC.TS-2` (cooler room) · `HOOD1.TS-2` (hood VFD-tstat) | M502B/M503B |
| `CS-1` | `DOAS1.CS-1` (heat-trace current) · `EH1.CS-1` (heater current) · `WIF.CS-1` (freezer current switch) | M502B/M503B |
| `BTU-1` | `DOAS1.BTU-1` (DOAS coil energy) · **`BTU-1`** (loop "Addition Condenser Water BTU Meter", 03/M503B) | 01/M502B vs 03/M503B |
| `VFD-1/VFD-2` | `DOAS1.VFD-1/2` (supply/exhaust fans) · `KMAU-1`/`KEF-1` (kitchen) — **swap FLAG-W5** | 01/M502B vs 04/M503B |
| `ACD-1` | `DOAS1.ACD-1` (OA damper) · `WSHP-CA-0x.ACD-1` (ventilation damper) · `KMAU-1.ACD-1` (isolation damper) | M502B/M503B |
| `D-1`,`VP-1` | `SCR1.`/`BYPVAV.`/`ERAHU1.`/`DOAS1.`(VAV) | M501B/M502B |

### 4.2 Drawing-vs-brief / spec-vs-drawing FLAGS
| FLAG | Conflict | Resolution / citation |
|---|---|---|
| **FLAG-W1** | WSHP allowable mfrs: task brief said *Daikin/Whalen/Cold Flow/Trane* (the **East-End** list) | Actual West End **§238146 2.1 = Daikin / Climate Master / Trane**. Use spec. |
| **FLAG-W2** | Instrument ranges: brief said *thermometer 0–150 °F, pressure 0–100 psi* (East-End values) | Actual **§230923.27**: condenser-water RTD span **0–120 °F**, CHW 0–100, HHW 32–212, OA/mixed −40–140; **§230923.23** liquid gage **−300…300 psig** (adj span, 3 psig min). Use spec. |
| **FLAG-W3** | Detail-bubble numbering on M501B: brief put **SCR/electric-heat** at *07/M501B* | Actual: **05/M501B = VAV box w/ electric heat (SCR)**, **06 = VRF**, **07 = (E)ERAHU-1**; 01=BAS arch, 02=bypass VAV, 03=building electric meter, 04=gas & water meters. |
| **FLAG-W4** | DOAS coil type: **§237343.16** specs hydronic CHW+HW coils | **02/03 M502B** shows an integral **water-source-heat-pump (DX) coil on the geothermal loop + hot-gas reheat** (compressors modulate, §5.1/§10.1). Drawing governs; flag the spec mismatch. |
| **FLAG-W5** | Kitchen fan tags: **04/M503B diagram** = MAU fan `VFD-2`, grease EF `VFD-1`; **points list** = `VFD-1` MAU, `VFD-2` EF (reversed) | Internal drawing inconsistency on 04/M503B. Use points-list assignment; note the diagram swap. |
| **FLAG-W6** | Which physical VAV boxes carry SCR electric reheat (05/M501B)? ERAHU `VAV-1-x` read cooling-only on M201B; `VAV-CA-x` are DOAS ventilation | 05/M501B is a generic VAV-w/-electric-heat control detail; per-box application is on the floor plans/VAV schedule `[?]`. |
| **FLAG-W7** | **`GWS`/`GWR` shared by East **and** West** projects | Kept in separate subsystem scopes (East `/controls/`, West here). Same letters, different loops; never merged. |
| **FLAG-W8** | Electric submeter mapping: brief said *M-1 HVAC / M-3 lighting / M-4 plug / M-5 kitchen / DOAS* | Actual **03/M501B = M-1 HVAC, M-2 Lighting, M-3 Plug, M-4 Kitchen, M-5 DOAS** (19 BACnet meters total). |
| **FLAG-W9** | Brief expected M202B exhaust riser to show MAU/KEF + ~22,115 CFM dining exhaust | **M202B Rev.4** shows only **DOAS-CA-1 (2115 CFM)** → `VAV-CA-02`(1715)+`CAR-B`(400) to Serving 1413. Kitchen MAU/KEF SOO is on **04/M503B**, not on M202B. |
| **FLAG-W10** | Brief flagged "VRF vs WSHP/geo boundary — confirm, don't assume" | **Confirmed by drawings:** no VRF on M121B/M201B/M202B (cafeteria addition = WSHP/DOAS/geo). **VRF = existing-building renovation**; ERAHU-1 retrofit also existing-building. |
| **FLAG-W11** | "CD" service abbreviation (brief read Note 6 as "condenser water (CD)") | **M121B has no legend**; on the plan **CD = condensate drain** (KN-1 ties CD→storm; KN-3 condensate pumps); **condenser water = GWS/GWR**. Actual KN-6 reads "PIPE **CONDENSER WATER** TO WALK IN …", not "CD". |
| **FLAG-W12** | (E)ERAHU-1 air-system class: **§230593 1.2.A.1.a.3** lists it under **constant-volume** | **07/M501B** drives its supply fan **VFD to a duct-static setpoint** (VAV behavior) and is a single-zone-VAV→traditional-VAV retrofit. Note the classification mismatch. |
| **FLAG-W13** | Two distinct `BTU-1` meters | `DOAS1.BTU-1` (DOAS coil energy, 01/M502B) **≠** loop `BTU-1` "Addition Condenser Water BTU Meter" (03/M503B). Keep separate. |

> **No field-capture values were invented.** West End has no observed enteliWEB capture; all observed-style values appear only in the
> design-basis **synthetic** capture, tagged `[V]`/`[DERIVED]`/`[ILLUS]`.
