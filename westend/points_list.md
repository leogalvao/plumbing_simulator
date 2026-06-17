# Stoddert ES — WEST END CAFETERIA — Control Points List

**Project:** DCAM-22-CS-RFP-0009 · 4001 Calvert St NW · **Sources:** `Stoddert_WestEnd_SOO_Controls_Extracted.md` (DWG/SOO: M501B/M502B/M503B/M201B/M202B/M121B) · West End [WEST] Division 23/11 specs (SPEC)
**Namespace:** `token_map.md` · **Canonical data:** `io_matrix.json` (binds on `token`) · **Design-basis capture:** `Stoddert_WestEnd_DesignBasis_Capture.md/.json`

> **Conventions** — `src`: **DWG** = drawing/SOO · **SPEC** = West End Div 23/11 spec basis. **There is no `CAP`/observed source** — West End has no field capture; observed-style values exist only in the *design-basis synthetic* capture (`[V]/[DERIVED]/[ILLUS]`).
> `conf`: **V** verified (verbatim on a drawing or in a spec) · **A** spec-assumed Div-23 integration point (confirm on the unit points list) · **?** unresolved (closing sheet/schedule named in `coverage_report.md`).
> Tag aliases and **FLAG-W#** are carried inline (see `token_map.md` §4). **No Cv, capacity, pump curve, flow/GPM, range, or sequence value is fabricated.** Tags are reused across details on these sheets → all unit points are **namespaced `UNIT.point`**.

---

## Totals — 174 records

| Type | Count | | Type | Count |
|---|---|---|---|---|
| **AI** | 74 | | **AV** | 8 |
| **AO** | 29 | | **BV** | 4 |
| **BI** | 28 | | `[?]` placeholders (no type) | 13 |
| **BO** | 18 | | **TOTAL** | **174** |

**By source:** DWG **158** · SPEC **16** (`CAP` 0 — no field capture).
**By confidence:** V **144** · A **16** · ? **14**.
**By element:** MTR-WE 8 · GEO-LOOP 7 · WSHP (×4 units) 66 · DOAS-CA-1 36 · VAV-CA 2 · CAR 2 · SCR1 5 · BYPVAV 2 · (E)ERAHU-1 18 · VRF 8 · Walk-in 8 · Electric heater 4 · Kitchen 8.

---

## MTR-WE — submetering (01/03/04 M501B · §230923)

| Token | BAS name | Type | Unit | Src | Conf |
|---|---|---|---|---|---|
| `M-1` | HVAC electric submeter | AI | kW | DWG | V |
| `M-2` | Lighting electric submeter | AI | kW | DWG | V |
| `M-3` | Plug-loads electric submeter | AI | kW | DWG | V |
| `M-4` | Kitchen electric submeter | AI | kW | DWG | V |
| `M-5` | DOAS electric submeter | AI | kW | DWG | V |
| `M-GAS` | Natural gas meter (main gas line) | AI | CF | DWG | ? *(range/type per meter sched; §230923.16 = CO₂ only)* |
| `WM-1` / `WM-2` | Domestic water meters (turbine) | AI | gal | DWG | V / ? *(leg -1 vs -2)* |

19 BACnet electric meters configured into the 5 segregated usages; h/d/m/y → BAS + **Sustainability Dashboard, Main Lobby** (03/M501B). Energy metering per **DC2017 IECC §8.4.3** (M501B label). **FLAG-W8** (meter mapping vs brief).

---

## GEO / condenser-water loop (M121B · M201B · 03/M503B · §230593)

| Token | BAS name | Type | Unit | Src | Conf |
|---|---|---|---|---|---|
| `BTU-1` | Addition Condenser Water BTU Meter (3″ GWS) | AI | MBH | DWG | V |
| `WM-LOOP` | Water meter on new GWS/GWR line (KN-5) | AI | gal | DWG | V |
| `HTRC-1` | Heat-trace controller (KN-2) | — | — | DWG | V |
| `GEO-LOOP-SWT/RWT` | Loop supply/return temp (**existing** plant) | — | °F | DWG | ? |
| `GEO-LOOP-GPM` | Total loop flow (**existing** plant) | — | gpm | DWG | ? |
| `GEO-PUMPS` | Existing loop pumps / lead-lag / DP setpoint | — | — | DWG | ? |

> The addition **ties into the existing 6″ GWS/GWR loop** (M121B KN-4); **no new plant pumps/wellfield/separators** on the cafeteria sheets. Loop temps/flows/pumps are **existing**, closed by **§230593 TAB of the existing CW system** + existing drawings. Onicon ultrasonic BTU meter per §230923.14. Condenser-water RTD range **0–120 °F** (§230923.27, **FLAG-W2**).

---

## WSHP-CA-01…04 — water-source heat pumps (04-06/M502B · §238146) — 66 pts

Per-unit template (×4: `-01` Dining 1400 TYPE-C 18 GPM · `-02` Dry Food 1415 TYPE-A 1.5 · `-03` Kitchen 1410 TYPE-B 6.5 · `-04` Chair Storage 1407 TYPE-A 1.5):

| Suffix | BAS name | Type | Src | Conf |
|---|---|---|---|---|
| `.ECM-1.CMD/.STS/.SPD` | Fan start-stop / status / speed | BO/BI/AO | DWG | V |
| `.CV-1` | Source 2-way control valve (cmd) — **fail = Last position** (§230923.11) | BO | DWG | V |
| `.D-1` / `.VP-1` | Primary air damper / velocity (CFM) | AO / AI | DWG | V |
| `.ACD-1` | Ventilation control damper | AO | DWG | V |
| `.CO2-1` | Room CO₂ (SP **1000 ppm** adj) | AI | DWG | V |
| `.TH-1` | Combo temp/humidistat (73 °F/50%RH cool, 69 °F heat, setback 80/60) | AI | DWG | V |
| `.TS-1` / `.TS-2` | Discharge-air / **leaving-water** temp | AI | DWG | V |
| `.S-1` | Condensate-pan overflow → unit off + CV-1 close | BI | DWG | V |
| `.EWT` / `.SP-ADJ` / `.OCC` / `.FAULT` | Div-23 BACnet: entering-water / setpoint-adj / occ-sched / fault relay | AI/AV/BV/BI | SPEC | A |

Floor-level (shared, not ×4): `WSHP.DEW-1`, `WSHP.DEW-2` floor dewpoint (2/floor) — DWG `?` (sharing). Cooling/heating/dehum = **manufacturer's sequence** (factory); capacities/types **"See Plans"** (§238146) `[?]`. Mfrs **Daikin/Climate Master/Trane** (**FLAG-W1**).

---

## DOAS-CA-1 — packaged DOAS (01-03/M502B · §237343.16) — 36 pts

Dampers `.ACD-1` OA / `.ACD-2` EA (**fail = Open**, §230923.11) / `.ACD-3-5` relief (1/floor, AO) · airflow `.AFMS-1/2` (AI) · `.CV-1` geothermal-coil valve (AO, **fail = Open**) · DP `.DPS-1` OA-filt / `.DPS-2` wheel / `.DPS-3` EA-filt / `.DPS-4` EA-duct / `.DPS-5` OA-duct (AI) · end-switch `.ES-1/2` (BI) · `.FM-1` (AI, Onicon) · `.BTU-1` (AI, **≠ loop BTU-1**, FLAG-W13) · `.CS-1` heat-trace current (BI) · RH `.RH-0/1/2` (AI) · smoke `.SD-1/2` (BI) · `.SP-1-3` floor pressure (AI, +0.05″WG) · temp `.TS-0` OA / `.TS-1` ret-water / `.TS-2` sup-water / `.TS-3` coil-disch / `.TS-4` sup-disch (55 °F) / `.TS-5` bldg-return (AI) · fans `.VFD-1` supply & `.VFD-2` exhaust (`.CMD`/`.STS`/`.SPD`) · `.VFD-3` energy-recovery wheel (AO) · `.VP-1` (AI). All DWG/V.
Discharge **55 °F** control (design 52/52 summer, 69 winter); freeze TS-3<40 °F → CV-1 open + heat trace; wheel/filter ΔP 0.25″/0.80″WG. **FLAG-W4** (drawing WSHP/DX + hot-gas reheat vs spec hydronic coil).

---

## VAV-CA + CAR (CAFR) — DOAS distribution (M201B/M202B · 05/M502B §6)

| Token | BAS name | Type | Value | Src | Conf |
|---|---|---|---|---|---|
| `VAV-CA-01` | DOAS VAV box 2020 CFM (CO₂/DCV) | AO | modulate to room CO₂ | DWG | V |
| `VAV-CA-02` | DOAS VAV box 1715 CFM (CO₂/DCV) | AO | modulate to room CO₂ | DWG | V |
| `CAR-A` / `CAR-B` | Constant Air Flow Regulator 95 / 400 CFM | — | fixed CFM | DWG | V |

---

## SCR1 — VAV box w/ electric heat (05/M501B) · BYPVAV — bypass VAV (02/M501B)

| Token | BAS name | Type | Value/SP | Src | Conf |
|---|---|---|---|---|---|
| `SCR1.D-1` | Primary air damper (cmd) | AO | min(0 CFM w/combo)→max for room temp | DWG | V |
| `SCR1.SCR-1` | Electric heating coil (SCR, cmd) | AO | modulate at min damper for room temp | DWG | V |
| `SCR1.THC-1` | Combo stat (T/RH/CO₂) | AI | room temp; high-temp alarm ±5 °F/10 min | DWG | V |
| `SCR1.CO2-1` | Room CO₂ (where shown) | AI | **900 ppm** | DWG | V |
| `SCR1.VP-1` | Velocity pressure (CFM) | AI | — | DWG | V |
| `BYPVAV.D-1` | Bypass VAV damper (= VAV-1-10) | AO | duct static **1.0″WG** | DWG | V |
| `BYPVAV.VP-1` | Velocity pressure | AI | — | DWG | V |

**FLAG-W6** physical SCR-box application per VAV schedule/plans `[?]`.

---

## (E)ERAHU-1 — existing AHU retrofit (07/M501B · M201B) — 18 pts

`ERAHU1.SF-VFD.CMD/.SPD` supply fan (duct static SP per TAB; continuous occ; stage unocc to setback 80/60) · `.EF-VFD.CMD/.SPD` exhaust fan (bldg pressure 0.05″WG) · `.BLDG-P` building pressure · `.DAT` discharge air temp (**55 °F**) · `.HW-CV` (**fail Close**) + `.CHW-CV` (**fail Close**; CHW locked out in heating & vice-versa) · `.DPS-1` duct static (⅔ downstream) · `.SPH`/`.SPL` high/low static · `.D-1` primary air damper. DWG/V. **FLAG-W12** (TAB const-vol vs VFD-to-static).
Existing terminals (controls per base-building dwgs `[?]`): `VAV-1-10` (return-air bypass 2000 CFM), `VAV-1-11` (435), `VAV-1-8` (250), `VAV-1-13` (500), `VAV-1-9` (275), `VAV-1-12` (500).

---

## VRF — BAS-visible monitor/alarm only (06/M501B · §238129) — 8 pts

| Token | BAS name | Type | Src | Conf |
|---|---|---|---|---|
| `VRF.IDU-ONOFF` | Indoor unit on/off status | BI | DWG | V |
| `VRF.IDU-FAIL` | Indoor unit failure / malfunction code | BI | DWG | V |
| `VRF.IDU-ROOMT` | Room temperature | AI | DWG | V |
| `VRF.IDU-FILTER` | Dirty filter indicator | BI | DWG | V |
| `VRF.IDU-CO2-AC1` | Indoor room CO₂ (**AC-1 system only**) | AI | DWG | V |
| `VRF.ODU-COMP` | Outdoor unit compressor status | BI | DWG | V |
| `VRF.ERV-ONOFF` | Energy-recovery-ventilator on/off status | BI | DWG | V |
| `VRF.ROOM-SP-SCH` | Room setpoint and schedule | AV | DWG | V |

> **Everything else (compressor/refrigerant/EEV/defrost/indoor-fan logic) is factory-controlled via iTouch — NOT in the BAS.** Indoor design 75 °F/50%RH summer, 70 °F winter. Unit counts/tags per §238129 / VRF schedule `[?]`. **FLAG-W10** (VRF = existing-building renovation).

---

## Walk-in cooler/freezer · Electric heaters · Kitchen hood/MAU/EF

| Token | BAS name | Type | Value/SP | Src | Conf |
|---|---|---|---|---|---|
| `WIF.CS-1.STS/.CMD` | Freezer current switch status / on-off | BI/BO | factory KE2 control | DWG | V |
| `WIF.TS-1` / `.TS-1.SP` | Freezer room temp / setpoint | AI/AV | **−10 °F** | DWG | V |
| `WIC.CS-2.STS/.CMD` | Cooler current switch status / on-off | BI/BO | factory KE2 control | DWG | V |
| `WIC.TS-2` / `.TS-2.SP` | Cooler room temp / setpoint | AI/AV | **+35 °F** | DWG | V |
| `EH1.CS-1.STS/.CMD` | Electric heater status / on-off | BI/BO | factory tstat | DWG | V |
| `EH1.T-1` / `.T-1.SP` | Heater space temp (monitor only) / setpoint | AI/AV | — | DWG | V |
| `KMAU-1.ACD-1` | MAU isolation damper | BO | open on start | DWG | V |
| `HOOD1.S-1` | Hood on/off override switch | BI | — | DWG | V |
| `KMAU-1.TS-1` | MAU discharge temperature | AI | — | DWG | V |
| `HOOD1.TS-2` | Hood temp (VFD thermostat, 0-10 VDC) | AI | modulates EF+MAU by cooking | DWG | V |
| `KMAU-1.VFD.CMD/.SPD` | Makeup-air fan start-stop / speed | BO/AO | per hood VFD-tstat | DWG | V |
| `KEF-1.VFD.CMD/.SPD` | Grease exhaust fan start-stop / speed | BO/AO | per hood VFD-tstat | DWG | V |

Walk-ins: water-cooled ColdZone units on GWS/GWR (WIC 4.0 GPM, WIF 5.5 GPM); BAS = monitor/alarm + on/off + setpoint; refrigeration control factory (KE2 demand defrost); Cat5 temp to kitchen manager office (§114000). Kitchen: **FLAG-W5** (`VFD-1/2` diagram-vs-list swap); CFM/HP per fan schedule `[?]`.
