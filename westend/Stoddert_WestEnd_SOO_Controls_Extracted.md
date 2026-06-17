# Stoddert ES — WEST END CAFETERIA — Sequence of Operations & Controls (extracted from drawings)

**Project:** Stoddert ES **West End Cafeteria / Cafeteria Addition** · **4001 Calvert St NW**, Washington DC 20007 · Contract **DCAM-22-CS-RFP-0009**
**Architect:** Shinberg.Levinas · **MEP+FP:** Global Engineering Solutions of Washington DC (GES) / Salas O'Brien · **100% CD set — 2025/06/06**
**Source sheets:** **M501B** Controls Rev.5 · **M502B** Controls Rev.5 · **M503B** Controls Rev.6 · **M201B** Riser Diagrams Rev.5 · **M202B** Riser Diagrams Rev.4 · **M121B** First-Floor Piping Plan – Cafeteria Addition
**Governing specs (West End [WEST] set, 2025/06/06):** §230923 DDC · §230923.11 Control Valves · §230923.14 Flow · §230923.16 Gas · §230923.23 Pressure · §230923.27 Temperature · §230593 TAB · §238146 Water-Source Unitary Heat Pumps · §237343.16 Outdoor Energy Recovery Units · §233423 HVAC Fans · §230719 Piping Insulation · §230548.13 Vibration · §232113 Hydronic Piping · §114000 Foodservice (Div 11)

**Read method:** M501B read from its embedded PDF **text layer** (verbatim). M502B/M503B/M201B/M202B are **vector E-size (42″×30″) sheets with no text layer** — rendered at **200 DPI** and read by region (vision); detail-bubble titles, SOO clauses, and points-list tables transcribed verbatim. M121B read from the project Drive copy at high DPI. Spec text from the actual [WEST] section PDFs. **Every fact is cited by sheet + detail bubble (`NN/M50xB`, `M121B KN-#`) or spec section.**

**Confidence:** `[V]` verbatim on a drawing / in a spec · `[?]` needs a schedule or off-sheet drawing (named at each occurrence and in `coverage_report.md`).
**Discipline:** nothing is fabricated. Where the drawings fix neither a value nor logic (live flows/GPM/CFM, loop temps of the *existing* plant, capacities "See Plans"), the row is left `[?]` with its closing sheet. **There is no West End field capture**; all observed-style values live only in the separate *design-basis synthetic* capture, tagged `[V]/[DERIVED]/[ILLUS]`.

> ⚠️ This sheet set carries internal tag re-use across details (e.g., `CV-1`, `TS-1/2`, `CS-1`, `BTU-1`, `VFD-1/2`) and a spec-vs-drawing coil conflict — reconciled in **§13** and flagged, never silently merged. East End (4501 Calvert / DG-22-S002) is a **separate** project; both use `GWS/GWR` — kept in separate scopes (**FLAG-W7**).

---

# 1. Abbreviations (M501B legend) — controls-relevant

`ACD` automatic control damper (normally closed or normally open) · `ADJ` adjustable · `AFMS` airflow measuring station · `AI/AO` analog in/out · `BAS` building automation system · `BTU` British thermal units · `C`/`CO2` carbon dioxide · `CS` current sensor · `CV` control valve · `DI/DO` digital in/out · `DPS` differential pressure sensor · `DX` direct expansion (DX cooling coil) · `EA` exhaust air · `ELEC` electric heating coil · `ERU` energy recovery unit · `ES` end switch · `FM` flow meter · `FZ` freezestat · `HOA` hand/off/auto · `HP` (water-source) heat pump · `ISO` isolation · `MTD` mounted · `OA` outside air · `PRESS` pressure · `RA` return air · `RH` relative humidity · `SA` supply air · `SD` smoke detector/damper · `SP` static pressure (`SPH`/`SPL` high/low) · `TS` temperature sensor · `VFD` variable speed/frequency drive · `WG` water gauge · `°F` degrees Fahrenheit. Equipment families on the legend: water source heat pumps, VAV terminal units, (E)ERAHU-1, kitchen fans, makeup air, duct heater, electric heaters, **split systems**, DOAS, energy recovery unit, water meters, and electric panels (mechanical / lighting / plug / kitchen). `[V]` (M501B legend)

**General notes (M501B):** (1) 24 V sources + low-voltage transformers for BAS devices by the ATC contractor; dedicated 120 V to the ATC by the Div-26 electrical contractor. (2) all exposed controllers/actuators in enclosures. (3) exposed controls/elec. wiring in field-painted conduit. (4) plenum-rated wiring above open-plenum ceilings. (5) reference architectural for final device locations. (6) all sensors **48″ AFF** for ADA unless noted. `[V]`

---

# 2. BAS architecture & metering (M501B + §230923)

## 2.1 BAS network architecture (01/M501B · §230923)
- **Protocol:** BACnet IP. **Global BAS Controller (BACnet IP)** → **BACnet field panels** → router/controller → sensors & actuators; building network / Network-1 / Wi-Fi devices / web browser; **BACnet IP → DC ENTELLIWEB**. `[V]` (01/M501B)
- **Front end:** DC **enteliWEB** central monitoring. DDC system manufacturer **Alerton** (or approved equal) per §230923 2.1; native protocol **ASHRAE 135 (BACnet)**, *"sole and native protocol… no gateways"* (§230923 2.7.B). `[V]`
- **Existing-system interface (key note, 01/M501B):** *"Contractor shall be responsible for interfacing all new HVAC equipment with **both the existing building BAS (JCI Metasys)** and with **DC enteliWEB** central system. Contractor shall cover all enteliWEB programming costs to incorporate graphics, points, and sequences from these controls plans into the DC enteliWEB central monitoring system."* `[V]` — corroborated by §230923 1.2.A.1 (*"Connecting new Equipment and Systems to Stoddert's Existing Johnson Controls Metasys System"*) and 1.2.A.3 (*"…all new equipment graphics, sequences of operations and points list into DC Entelliweb"*). §230923 1.2.A.4: *"Replace (E)ERAHU-1 control panel to VAV application."*
- **Displayed accuracy (§230923 2.4.G, end-to-end):** thermal energy & electric power **±1% of reading**; water flow **±2% of design flow** (air 2%, terminal air 5%); CO₂ **±50 ppm**; RH **±2% RH**; water pressure **±1% of instrument range** (space 0.5%); water temperature (chilled/condenser/HHW) **±0.5 °F**; outdoor temp **±1 °F**. `[V]`
- **Fail-on-power-loss:** *"Each control damper and actuator goes to failed position on loss of power"* (§230923 3.22.D.15) and *"Each control valve and actuator goes to failed position on loss of power"* (§230923 3.22.D.17). Per-service valve fail positions per **§230923.11** (see §3 tables). `[V]`

## 2.2 Metering (03/04 M501B · 03/M503B · §230923.14/.16)
- **Electric submeters (BACnet, kW)** — **M-1 HVAC · M-2 Lighting · M-3 Plug Loads · M-4 Kitchen · M-5 DOAS**; *"the 19 electric meters shall be BACnet compatible"*, configured into the segregated usages above; consumption recorded/logged/reported **hourly/daily/monthly/annual**; data → BAS and the **Sustainability Dashboard at the Main Lobby**. `[V]` (03/M501B) — **FLAG-W8** (corrects the brief's M-1/M-3/M-4/M-5 mapping).
- **Gas meter (BACnet)** — *"a natural gas meter shall be provided to monitor gas usage and shall communicate with the BAS… Locate at main gas line"*; reported hourly/daily/monthly/annual; data → BAS + monitor at the main circulation area. `[V]` (04/M501B §2). *(Note: §230923.16 "Gas Instruments" covers only **CO₂** sensors — no fuel-gas meter — so the gas meter is a drawing requirement, range/type per the meter schedule `[?]`.)* `[?]`
- **Domestic water meters (BAS turbine, by controls contractor)** — locate at the **main building domestic cold-water line**, the **cold-water line to the addition**, and the **cold-water line to plumbing fixtures**; gallons; reported hourly/daily/monthly/annual → BAS + monitor at main circulation area. Tags **WM-1 / WM-2** (which leg is which `[?]`). `[V]` (04/M501B §1) — *"BAS meter at main cold water line to addition."*
- **Condenser-water BTU meter** — **`BTU-1`** *"New condenser water BTU meter shall interface with existing school BAS and report condenser water energy, on hourly, daily, monthly and yearly basis,"* installed on the **3″ GWS** line (3″ GWR adjacent). `[V]` (03/M503B). Onicon ultrasonic per §230923.14. Plus a **water meter on the new GWS/GWR line** per M121B KN-5. `[V]`
- **Energy metering basis:** label *"ENERGY METERING PER DC2017 IECC SECTION 8.4.3"* + *"LEED METERING"* appear on M501B. `[V]` *(Note: the [WEST] §018113 Sustainable spec does not itself cite DC2017 IECC — the IECC §8.4.3 basis is stated on the drawing; LEED Gold v4 BD+C Schools per §018113.)*

---

# 3. Equipment register (controls scope)

| Token | Equipment | Location / data | Source |
|---|---|---|---|
| `WSHP-CA-01` | Water-source heat pump, TYPE-C, 18 GPM, 2″ branch | Student Dining 1400 | M201B · M121B · 04-06/M502B `[V]` |
| `WSHP-CA-02` | Water-source heat pump, TYPE-A, 1.5 GPM, ¾″ | Dry Food Storage 1415 | M201B · M121B `[V]` |
| `WSHP-CA-03` | Water-source heat pump, TYPE-B, 6.5 GPM, 1¼″ | Kitchen 1410 | M201B · M121B `[V]` |
| `WSHP-CA-04` | Water-source heat pump, TYPE-A, 1.5 GPM, ¾″ | Chair Storage 1407 | M201B · M121B `[V]` |
| `CP-1` | Condensate pump (one per WSHP, TYP) — drain pan + overflow switch | at each WSHP | M121B KN-3 `[V]` |
| `DOAS-CA-1` | Packaged DOAS, ≈**2115 CFM**: enthalpy wheel + WSHP/DX coil + hot-gas reheat; dual VFD fans | Rear low roof | 01-03/M502B · M201B/M202B `[V]` (capacity verify on schedule `[?]`) |
| `VAV-CA-01` | DOAS supply VAV box, 2020 CFM (CO₂-controlled) | Serving 1413 / Food Svc Office 1414 | M201B `[V]` |
| `VAV-CA-02` | DOAS VAV box, 1715 CFM | Serving 1413 | M202B `[V]` |
| `CAR-A` / `CAR-B` | Constant Air Flow Regulators, 95 / 400 CFM | Serving 1413 / Office 1414 | M201B/M202B `[V]` |
| `ERAHU-1` | Existing AAON energy-recovery AHU (controller → AAON WattMaster) | MECH 2273 (existing 2nd flr) | 07/M501B · M201B `[V]` |
| `VAV-1-8…-13` | Existing 2nd-floor VAV terminals on `(E)ERAHU-1` (incl. `VAV-1-10` return-air bypass 2000 CFM) | Discovery Commons 1270-A / Admin 1273-B/C | M201B `[V]` |
| `SCR-1` | SCR-controlled electric heating coil (VAV box w/ electric heat) | per plans | 05/M501B `[V]` |
| `EH1` | Electric wall/ceiling unit heater(s), factory tstat | per plans | 02/M503B · M501B legend `[V]` (qty `[?]`) |
| `VRF-ODU-*` / `VRF-IDU-*` / `ERV-*` | VRF system (existing-bldg renovation); iTouch; `AC-1` indoor has CO₂ | existing building | 06/M501B · §238129 `[V]` (unit counts `[?]`) |
| `WIC` / `WIF` | Walk-in **cooler 1416-A** / **freezer 1416-B** — water-cooled ColdZone condensing units on GWS/GWR (4.0 / 5.5 GPM, 1″) | Kitchen area | 01/M503B · M121B KN-6 · M201B · §114000 `[V]` |
| `KMAU-1` / `KEF-1` / `HOOD1` | Kitchen makeup-air unit / grease exhaust fan / exhaust hood (VFD-thermostat package) | Kitchen 1410 | 04/M503B · §233423 `[V]` |
| `BTU-1` / `WM-1` | Loop condenser-water BTU meter / water meter on new 3″ GWS/GWR | at existing-bldg tie | 03/M503B · M121B KN-5 `[V]` |
| GEO/CW loop | New GWS/GWR (¾″→3″, 61 GPM) ties to **existing 6″**; **no new plant pumps** | addition → existing | M121B KN-4 · M201B · §230593 `[V]` |

> **No new central plant on the cafeteria sheets** — no pumps, wellfield, air/dirt separator, expansion tank, buffer tank, or chiller are drawn for the addition. The addition is a **branch load on the EXISTING building's condenser-water/geothermal loop**; §230593 1.2.A.2.a.1 requires TAB of *"the existing building's entire condenser water piping system due to reconfiguration of existing pumping systems,"* and 1.2.A.3.c lists the (existing) **Geothermal Wellfield** in TAB scope. Loop supply/return temps, total loop GPM, and pump data are **existing / off these sheets** `[?]`.

---

# 4. WATER-SOURCE HEAT PUMPS — `WSHP-CA-01…04` (04-06/M502B · §238146)

## 4.1 Points list — verbatim (04/M502B)
| Tag | Description | Token | Type |
|---|---|---|---|
| `ACD-1` | Ventilation automatic control damper | `WSHP-CA-0x.ACD-1` | AI* |
| `CO2-1` | Room carbon-dioxide concentration | `WSHP-CA-0x.CO2-1` | AI |
| `CV-1` | 2-way control valve (command only) | `WSHP-CA-0x.CV-1` | DO |
| `D-1` | Primary air damper (command only) | `WSHP-CA-0x.D-1` | AO |
| `DEW-1&2` | Floor dewpoint sensor – 2 per floor | `WSHP-CA-0x.DEW-1/2` | AI |
| `ECM-1` | Fan – start/stop · status · speed (command only) | `WSHP-CA-0x.ECM-1.CMD/.STS/.SPD` | DO/DI/AO |
| `S-1` | Condensate-pan overflow switch | `WSHP-CA-0x.S-1` | DI* |
| `T/H-1` | Combination temperature/humidistat | `WSHP-CA-0x.TH-1` | AI |
| `TS-1` | Discharge air temperature | `WSHP-CA-0x.TS-1` | AI |
| `TS-2` | Leaving water temperature | `WSHP-CA-0x.TS-2` | AI |
| `VP-1` | Velocity pressure (CFM) | `WSHP-CA-0x.VP-1` | AI |

*As-drawn column marks: `ACD-1` reads in the AI column and `S-1` in a DO/DI column on 04/M502B (ambiguous mark); functionally `ACD-1` is a damper command (AO/DO) and `S-1` a binary safety input (DI). Reported as drawn; confirm on the I/O summary `[?]`.

## 4.2 Sequence — verbatim, cleaned (05/M502B)
**1. GENERAL** — WSHP controller communicates with the BAS; operated through the BAS, overridable at the unit controller; provide BAS graphics per the I/O summary. `[V]`
**1.2 DESIGN CONDITIONS** — Occupied cooling **73 °F DB / 50% RH (adj)**; occupied heating **69 °F (adj)**; unoccupied cooling **80 °F DB**; unoccupied heating **60 °F (adj)**; summer OA **95/78 °F DB/WB**; winter OA **10/9 °F DB/WB**; **CO₂ setpoint 1000 PPM (adj)**. `[V]`
**1.3 SCHEDULE** — Occupied **M–F 8:30 AM–3:15 PM, Sat 9:00 AM–1:00 PM**; Unoccupied = all other hours + holidays/snow closures. `[V]`
**2. RUN — Startup/Shutdown** — Start via BAS, HOA in Auto, then per sequences. Shutdown via BAS / unit controller / **fire alarm** / any safety → unit off and the **2-way control valve (`CV-1`) closes**. `[V]`
**3. COOLING** / **4. HEATING** / **5. DEHUMIDIFICATION** — *"Manufacturer's cooling / heating / dehumidification sequence."* Heating staging (as printed): Stage-1 Heat / Stage-2 Heat; on an additional call, 2-stage units energize the 2nd stage; on satisfy the compressor + fan shut off, the **isolation valve closes**, and a **360-second minimum-off timer** starts. `[V]` (detailed cooling/heating refrigerant logic is **factory** — not on the sheet `[?]`)
**6. VENTILATION** — **6.1 Fixed/constant ventilation:** rooms **without** CO₂ sensors are direct-ducted and controlled by a **constant-volume regulator** (`CAR-*`) in the duct branch. **6.2 Demand-controlled ventilation:** rooms **with** CO₂ sensors are direct-ducted and controlled by a **VAV box** (`VAV-CA-*`) that modulates to maintain the room CO₂ setpoint, per VAV schedules. `[V]`
**7. UNOCCUPIED MODE** — maintain setback temperatures (80/60 °F). `[V]`
**9. CONDENSATE DRAIN SAFETY SHUTOFF** *(numbered "9" before "8" on the sheet)* — WSHP shuts off on water detection in the drain pan and the control valve closes. `[V]`
**8. ALARMS** — high room temp **±2 °F (adj) >10 min**; high humidity (max dewpoint exceeded); high CO₂ (max CO₂ exceeded); WSHP fault (commanded ON, remains off); WSHP running-in-hand (commanded OFF, stays on). `[V]`

**§238146 device basis:** allowable mfrs **Daikin / Climate Master / Trane** (**FLAG-W1**); R-410A scroll; **reversing valve four-way, fail-safe in HEATING**; **source-side + load-side coaxial** refrigerant-to-water heat exchangers (450 psig refrig / 400 psig water leak test); dual-port TXV for **entering-water 25–125 °F**; factory freezestat stops compressor if loop water **< 35 °F**; **24 Vdc output cycles the motorized water valve with the compressor contactor**; balancing valves with meter ports (branch flow set during TAB, memory stop); **"Capacities & characteristics: See Plans."** `[V]`

## 4.3 Point → logic (WSHP)
| Token | Type | Role | Setpoint / trigger | Conf |
|---|---|---|---|---|
| `WSHP-CA-0x.ECM-1.CMD/.STS/.SPD` | DO/DI/AO | unit fan enable/status/speed | per occupancy + call | `[V]` |
| `WSHP-CA-0x.CV-1` | DO | source-side 2-way water valve | closes on shutdown/safety; **fail = "Last position"** (§230923.11 Condenser Water) | `[V]` |
| `WSHP-CA-0x.TS-1` / `.TS-2` | AI | discharge-air / **leaving-water** temp | high-temp alarm flag | `[V]` |
| `WSHP-CA-0x.TH-1` | AI | combo temp/humidistat (room) | room SP 73 °F/50%RH cool · 69 °F heat; high-humidity alarm | `[V]` |
| `WSHP-CA-0x.CO2-1` | AI | room CO₂ | **1000 PPM (adj)** → DCV via `VAV-CA-*` (§6.2) | `[V]` |
| `WSHP-CA-0x.D-1` / `.VP-1` | AO/AI | primary air damper / velocity (CFM) | DCV modulation | `[V]` |
| `WSHP-CA-0x.DEW-1/2` | AI | floor dewpoint (2/floor) | high-humidity / dehum reference | `[V]` (sharing `[?]`) |
| `WSHP-CA-0x.S-1` | DI | condensate-pan overflow | water detected → unit off + `CV-1` close (§9) | `[V]` |
| `WSHP-CA-0x.ACD-1` | AO/AI | ventilation control damper | per §6 (fixed/DCV) | `[V]` |

*Cooling/heating/dehum staging thresholds, compressor minimum on/off (other than the 360 s min-off printed for heating), and capacities are **factory/See-Plans** `[?]`.*

---

# 5. DOAS-CA-1 — packaged DOAS (01-03/M502B · §237343.16)

## 5.1 Points list — verbatim (01/M502B)
Dampers `ACD-1` OA / `ACD-2` EA / `ACD-3-5` relief (1/floor) — **AO**; airflow `AFMS-1` OA / `AFMS-2` EA — **AI**; `BTU-1` energy meter & `CS-1` heat-trace current — **DI**; `CV-1` **geothermal-coil** valve — **AO**; `DPS-1` OA-filter / `DPS-2` energy-wheel / `DPS-3` EA-filter (HIGH/LOW alarms) / `DPS-4` EA-duct / `DPS-5` OA-duct — **AI**; `ES-1` OA-iso / `ES-2` EA-iso end switches — **DI**; `FM-1` flow meter — **AI**; `RH-0` global OA / `RH-1` discharge / `RH-2` building exhaust — **AI**; `SD-1` OA / `SD-2` EA smoke detectors — **DI**; `SP-1-3` floor pressure (3 total, 1/floor) — **AI**; `TS-0` global OA / `TS-1` **return water** / `TS-2` **supply water** / `TS-3` coil discharge air / `TS-4` supply discharge air / `TS-5` building return air — **AI**; `VFD-1` supply fan & `VFD-2` exhaust fan (`.CMD` start/stop DO, `.STS/.FAULT/.HAND` DI, `.SPD` AI) ; **`VFD-3` energy-recovery wheel** (diagram 03); `VP-1` velocity pressure. All points GRAPHIC + TREND. Tokens namespaced `DOAS1.*`. `[V]`

## 5.2 Sequence — verbatim, cleaned (02/M502B)
**1.2 DESIGN** — summer discharge **52 °F/52 °F DB/WB (adj)**; winter discharge **69 °F (adj)**; summer OA **95/78**; winter OA **10/9**; **floor pressure +0.05″WG (adj)**; RH **50%**. **1.3 SCHEDULE** — occupied M–F 8:30–3:15, Sat 9–1; else off + holidays/snow. `[V]`
**2.1 STARTUP** — HOA Auto; OA + EA dampers commanded open, **proven via "open" end switch**; after **10 s** the supply fan VFD ramps to min then releases to **"supply air volume control"**; exhaust fan concurrently to min then **"exhaust air volume control"**; **energy wheel** concurrently to design speed. **2.2 SHUTDOWN** — via BAS/unit controller/fire/safety → fans + wheel off, **`CV-1` closes**; after 10 s the OA/EA **isolation dampers close, proven via "closed" end switch**; while stopped, if temp **< 40 °F (adj) at `TS-3`** at the WSHP coil → `CV-1` fully opens and the **piping heat trace energizes**. `[V]`
**3. SUPPLY-AIR VOLUME CONTROL** — supply fan VFD modulates to the **duct-static-pressure setpoint determined by TAB**. **4. EXHAUST-AIR FAN CONTROL** — exhaust fan VFD modulates to its TAB duct-static setpoint. `[V]`
**5. DISCHARGE-AIR TEMPERATURE CONTROL** — when discharge temp is **±1 °F of the discharge setpoint (55 °F)**, the **WSHP coil compressors modulate** to hold discharge temperature. **6. SAT RESET** — when **OA < 55 °F (adj)** the supply-air temperature resets to the **winter discharge setpoint**. `[V]`
**7. FREEZE PROTECTION** — (7.1) unit OFF + OA **< 40 °F (adj)** at the WSHP coil **or freezestat trips** → `CV-1` full open + heat trace energizes; (7.2) unit ON + **energy-wheel ΔP > 0.25″ (adj)** → wheel VFD to minimum until ΔP drops. `[V]`
**8. FILTERS** — BAS measures ΔP across the energy wheel, OA filter, EA filter; **ΔP > 0.80″WG (adj)** → "filter change required." **9. ECONOMIZER** — during economizer the energy wheel reduces to minimum speed. **10. DEHUMIDIFICATION** — in cooling, if discharge-air enthalpy rises above **26.4 BTU/lb** (room-RH equivalent), compressors energize to hold **52 °F at the coil** while the **hot-gas reheat coil modulates** to the discharge setpoint. `[V]`
**11. AFMS** — provide air-velocity signals; BAS calculates/displays OA and EA CFM. **12. RELIEF AIR** — each general-exhaust duct/floor has a motorized damper that modulates to hold the **floor pressure sensor at +0.05″WG**. `[V]`
**13. SAFETIES** — (13.1) smoke detector → unit off (normal shutdown) + alarm; **hardwired to both fan VFDs** for redundant trip; (13.2) **unit will not run unless all isolation end switches prove the dampers open**. `[V]`
**14. ALARMS** — high/low **building return-air temp ±5 °F (adj) >10 min**; **building space pressure ±0.1″WC (adj) >10 min**; supply-air discharge **RH ±10% >10 min**; building return **RH ±10% >10 min**; dirty OA/EA filter **ΔP > 0.25″WG**; dirty energy wheel **ΔP > 0.80″WG**; supply-fan fault; exhaust-fan fault. *(several alarm lines printed "REMOVED" as-drawn).* `[V]`

**Diagram (03/M502B):** total-enthalpy recovery wheel (`VFD-3`) between OA and EA; OA/EA dampers (`ACD-1/2`, NC/M); **WSHP coil** (`TS-3` coil temp) + **hot-gas reheat coil**; geothermal water connections **GS/GR**, `FM-1` flow, `DOAS1.BTU-1` energy, `CS-1` heat-trace current, `CV-1` coil valve; global OA `TS-0`/`RH-0`; unit-mounted controller; VAV-box sub-detail with floor-pressure sensors (1/floor, 3 total) `SP-1`. `[V]`

## 5.3 Point → logic (DOAS) — selected
| Token | Type | Role | Setpoint / trigger | Conf |
|---|---|---|---|---|
| `DOAS1.VFD-1`/`VFD-2` | DO/DI/AI | supply / exhaust fan | duct-static SP per TAB; running-in-hand alarm | `[V]` |
| `DOAS1.VFD-3` | AO | energy-recovery wheel | design speed; econ→min; ΔP>0.25″→min | `[V]` |
| `DOAS1.CV-1` | AO | **geothermal-coil** valve | freeze (TS-3<40 °F / FZ)→full open; closes on shutdown; **fail = Open** (§230923.11 DOAS) | `[V]` |
| `DOAS1.TS-4` (disch) / `TS-3` (coil) | AI | discharge-air / coil temp | disch **55 °F** ±1 °F → WSHP-coil compressors modulate | `[V]` |
| `DOAS1.TS-1`/`TS-2` | AI | return / supply **water** | loop entering/leaving (existing-loop temps `[?]`) | `[V]` |
| `DOAS1.SP-1-3` + `ACD-3-5` | AI/AO | floor pressure / relief dampers | **+0.05″WG**; space-press alarm ±0.1″WC | `[V]` |
| `DOAS1.DPS-1/2/3` | AI | OA-filter / wheel / EA-filter ΔP | dirty **0.25″ / 0.80″ / 0.25″** | `[V]` |
| `DOAS1.AFMS-1/2` | AI | OA / EA airflow | BAS computes OA/EA CFM | `[V]` |
| `DOAS1.CS-1` | DI | heat-trace piping current | broken-circuit alarm; energizes w/ freeze | `[V]` |
| `DOAS1.BTU-1`/`FM-1` | DI/AI | DOAS coil thermal energy / flow | metering (≠ loop `BTU-1`, **FLAG-W13**) | `[V]` |
| `DOAS1.SD-1/2`, `ES-1/2` | DI | smoke / isolation end switch | smoke→off (HW to VFDs); ES not-proven→no-run | `[V]` |

**§237343.16 basis:** mfrs **Addison / Trane / AAON**; total-enthalpy **wheel** (AHRI 1060); ECM/VFD fans. **FLAG-W4** — the spec specifies **hydronic** CHW+HW coils, but the **drawing** (02/03 M502B) shows an integral **WSHP/DX coil on the geothermal loop + hot-gas reheat**; the drawing governs the sequence.

---

# 6. VAV terminals & Constant Air Flow Regulators (05/02 M501B · M201B/M202B · 05/M502B §6)

- **DOAS distribution:** `DOAS-CA-1` → **`VAV-CA-01`** (2020 CFM, Serving 1413 / Office 1414) + **`CAR-A`** (95 CFM); exhaust-side **`VAV-CA-02`** (1715 CFM) + **`CAR-B`** (400 CFM). `[V]` (M201B/M202B). VAV-CA boxes are the **demand-controlled (CO₂)** terminals (WSHP §6.2); CAR-A/B are the **constant-air-flow regulators** for non-CO₂ rooms (§6.1; §230593 calibrates CAFRs to design CFM at 100% DOAS supply). `[V]`

## 6.1 VAV box with electric heat — `SCR-1` (05/M501B)
**Points:** `D-1` primary air damper (cmd) · `SCR-1` electric heating coil control (cmd) · `T-1` thermostat (combo `THC-1` = T/RH/CO₂ where shown) · `VP-1` velocity pressure (CFM). `[V]`
**SOO:** **1. GENERAL** — unit controller ↔ BAS, overridable, graphics per I/O. **2. COOLING** — the damper modulates between **minimum (0 CFM when served by a combo Tstat)** and maximum to maintain room temperature. **3. HEATING** — at minimum damper, the **SCR coil modulates** to maintain room temperature. **4. VENTILATION** — for boxes with CO₂ sensors, the CO₂ sensor drives the damper open to maintain **900 PPM** in the space. **5. ALARMS** — high room temperature: BAS alarms when room temp is **±5 °F (adj) beyond setpoint > 10 min**. `[V]`
> **FLAG-W6** — physical application of the SCR/electric-heat box vs. the cooling-only ERAHU `VAV-1-x` terminals is per the floor plans/VAV schedule `[?]`. Note CO₂ target here is **900 PPM** (vs. **1000 PPM** for the WSHP DCV, §4.2) — two different ventilation setpoints, as drawn.

## 6.2 Bypass VAV box — `BYPVAV` (02/M501B)
**Points:** `VP-1`, `D-1`. **SOO:** **1. GENERAL** (as above). **1.2** — the VAV damper modulates to maintain the **duct static pressure at 1.0″WG (adj)**. `[V]` — this is the **`VAV-1-10` "Return Air Bypass" (2000 CFM)** on `(E)ERAHU-1` (M201B). `[V]`

---

# 7. (E)ERAHU-1 — existing AHU retrofit (07/M501B · M201B)

**SOO (07/M501B):** **1. GENERAL** — the existing `(E)ERAHU-1` controller is **replaced with an AAON WattMaster** to reprogram the existing AAON unit from **single-zone VAV** to **traditional VAV**; all previous points/sequences/graphics remain per the base-building drawings; modify the following:
**1. SUPPLY-AIR VOLUME CONTROL** — the existing supply-air-fan **VFD** is reprogrammed to modulate between minimum and maximum to maintain the **duct-static-pressure setpoint determined by TAB**; the fan **runs continuously occupied** and **stages on/off unoccupied to meet setback (80 °F/60 °F)**.
**2. EXHAUST-AIR FAN CONTROL** — the existing exhaust-fan VFD maintains **building pressure 0.05″WG (adj)** at the building pressure sensor.
**3. DISCHARGE-AIR TEMPERATURE** — maintain **55 °F discharge** by modulating the existing **hot-water and chilled-water coil valves**; the **CHW valve is locked out during heating and vice-versa**.
**4. VENTILATION** — fixed to **minimum outside air per ventilation calculations**. `[V]`
**Points (07/M501B):** `D-1` primary air damper · `DPS-1` duct static pressure (mounted **⅔ downstream**) · `SPH`/`SPL` high/low static pressure. `[V]`
**Riser (M201B):** `ERAHU-1` in **MECH 2273**; OA (E)48×24 + (E)20×20 *"to (E)AHU-3"*; RA (E)72×12 / (E)50×16 through (E)SD + (E)FD; SA (E)26×22 / (E)30×16 (main 30×16 with DPS); serves **`VAV-1-10`** (return-air bypass, 16″, 2000 CFM, Discovery Commons 1270-A), **`VAV-1-11`** (10″, 435 CFM, Admin 1273-B), **`VAV-1-8`** (8″, 250 CFM, Admin 1273-C), **`VAV-1-13`** (10″, 500 CFM, 1270-A), **`VAV-1-9`** (10″, 275 CFM, 1273-C), **`VAV-1-12`** (10″, 500 CFM, 1270-A). VAV branches read cooling/return-bypass (no electric heat on the riser). `[V]`
> **FLAG-W12** — §230593 1.2.A.1.a.3 lists `(E)ERAHU-1` under **constant-volume** systems, but the sequence drives the supply fan **VFD to a duct-static SP** (VAV) and the retrofit is single-zone-VAV→traditional-VAV. Detailed base-building points/HW-CHW valve tags are off these sheets `[?]`.

---

# 8. VRF system (06/M501B · §238129) — standalone, BAS monitor/alarm only

**SOO (06/M501B):** **1. GENERAL** — the VRF system **runs on its own factory internal programming and controls logic**; it is interfaced with the **iTouch central control panel** which provides all monitoring/alarm/control capabilities; the VRF system is **standalone and is NOT interlocked to the BAS**. **2. INDOOR DESIGN** — summer indoor **75 °F/50%RH (adj)**, summer OA 95/78; winter indoor **70 °F (adj)**, winter OA 0 °F. **2.6 MINIMUM CONTROL CAPABILITIES** — *Indoor units:* on/off status; indoor-unit failure (alarm + malfunction code); room temperature; dirty-filter indicator; **indoor room CO₂ (AC-1 system only)**. *Outdoor unit:* outdoor-unit compressor status. `[V]`
**BAS-visible points (06/M501B points matrix) — monitor/alarm only:** indoor-unit on/off; indoor-unit failure; room temperature; dirty-filter indicator; indoor room CO₂ (AC-1 only); outdoor-unit compressor status; **energy-recovery-ventilator on/off status**; **room setpoint and schedule**. `[V]`
> All compressor/refrigerant/EEV/defrost/indoor-fan logic is **factory-controlled via iTouch — not in the BAS** (capture the boundary explicitly). VRF unit counts and exact ODU/IDU/ERV tags are per **§238129** product data / VRF schedule `[?]`. **FLAG-W10** — VRF = **existing-building renovation** (no VRF appears on M121B/M201B/M202B cafeteria sheets).

---

# 9. WATER-SOURCE / CONDENSER-WATER LOOP subsystem

## 9.1 Loop equipment register
| Token | Element | Data | Source |
|---|---|---|---|
| `WSHP-CA-01…04` | WSHP source-side loads | 18 / 1.5 / 6.5 / 1.5 GPM (TYPE C/A/B/A) | M201B · M121B `[V]` |
| `WIC` / `WIF` | Walk-in cooler / freezer water-cooled condensers | 4.0 / 5.5 GPM, 1″; ColdZone, water-regulating valve, +35/−10 °F, KE2 defrost | M201B · 01/M503B · §114000 `[V]` |
| `DOAS-CA-1` coil | DOAS WSHP/DX coil on loop | taps trunk at 2″ / 24 GPM; `CV-1`, `FM-1`, `DOAS1.BTU-1`, `TS-1/2` | M201B · 01-03/M502B `[V]` |
| `CP-1` | Condensate pumps (per WSHP) | drain pan + overflow switch (KN-3); condensate → CD → storm w/ backwater valve (KN-1) | M121B `[V]` |
| `BTU-1` | Loop condenser-water BTU meter | on 3″ GWS; reports CW energy h/d/m/y to existing BAS | 03/M503B `[V]` |
| `WM-1` | Loop water meter on new GWS/GWR | per KN-5 | M121B `[V]` |
| Heat-trace controller | Roof/loop heat trace | "locate heat-trace controller" (KN-2); current via `DOAS1.CS-1` | M121B KN-2 · 01/M502B `[V]` |
| **existing** pumps/wellfield | Central plant | **existing**; not on cafeteria sheets; TAB'd per §230593 | §230593 `[?]` |

## 9.2 Pipe-segment table — GWS/GWR from M121B + M201B (Condenser-Water Riser)
Service **GWS** (ground/condenser-water supply) and **GWR** (return); flows are the design GPM lettered on the M201B riser; sizes are `src:DWG [V]`, flows `src:DWG [V]` from the riser callouts.

| Seg | Service | Size | Design flow | From → To (grid/room) | Source |
|---|---|---|---|---|---|
| WSHP-CA-01 branch | GWS/GWR | 2″ | 18 GPM | main → WSHP-CA-01 (Student Dining 1400) | M201B/M121B `[V]` |
| WSHP-CA-02 branch | GWS/GWR | ¾″ | 1.5 GPM | main → WSHP-CA-02 (Dry Food 1415) | `[V]` |
| WSHP-CA-03 branch | GWS/GWR | 1¼″ | 6.5 GPM | main → WSHP-CA-03 (Kitchen 1410) | `[V]` |
| WSHP-CA-04 branch | GWS/GWR | ¾″ | 1.5 GPM | main → WSHP-CA-04 (Chair Storage 1407) | `[V]` |
| WIC branch | GWS/GWR | 1″ | 4.0 GPM | main → Walk-in Cooler 1416-A condenser coil | M201B/M121B KN-6 `[V]` |
| WIF branch | GWS/GWR | 1″ | 5.5 GPM | main → Walk-in Freezer 1416-B condenser coil | `[V]` |
| DOAS-CA-1 branch | GWS/GWR | 2″ | 24 GPM (trunk callout) | main → DOAS-CA-1 coil (rear low roof) | M201B `[V]` |
| Main A | GWS/GWR | 1¼″ | 11 GPM | (progressive main) | M201B `[V]` |
| Main B | GWS/GWR | 1½″ | 12.5 GPM | (progressive main) | M201B `[V]` |
| Main C | GWS/GWR | 2″ | 19.0 GPM | (progressive main) | M201B `[V]` |
| Main D | GWS/GWR | 2″ | 24 GPM | (progressive main) | M201B `[V]` |
| Main E | GWS/GWR | 2½″ | 43 GPM | (progressive main) | M201B `[V]` |
| Main (tie) | GWS/GWR | **3″** | **61.0 GPM** | addition main → **"CONNECT TO EXISTING 6″ PIPES"** at existing building | M201B · M121B KN-4 `[V]` |
| CD (condensate) | CD | ¾″–2″ | — | each WSHP/CP-1 → storm w/ backwater valve | M121B KN-1/3 `[V]` |

*Materials (§232113): condenser water ≤2½″ Type-L copper, ≥3″ Sch-40 steel; geothermal outside = HDPE 4710; CW rated 150 psig @ 73 °F. Insulation (§230719): GWS/GWR indoor 1″ fiberglass. Total **existing-loop** GPM, pump head/curves, and loop supply/return temperature setpoints are **off these sheets / existing** `[?]` (§230593 TAB of existing CW system).*

## 9.3 Loop point → logic (supportable from controls sheets)
| Token | Type | Role | Trigger/SP | Conf |
|---|---|---|---|---|
| `BTU-1` | AI | loop condenser-water energy | report h/d/m/y to existing BAS | `[V]` (03/M503B) |
| `WM-1` | AI | loop water meter | gallons; KN-5 | `[V]` |
| `WSHP-CA-0x.CV-1` | DO | per-WSHP source 2-way valve | cycles w/ compressor (24 Vdc, §238146); closes on shutdown | `[V]` |
| `DOAS1.CV-1` | AO | DOAS coil valve | freeze→open; closes on shutdown | `[V]` |
| `DOAS1.CS-1` | DI | heat-trace current | broken-circuit alarm; KN-2 controller | `[V]` |
| `WSHP-CA-0x.S-1` / `CP-1` | DI | condensate overflow / pump | water in pan → unit off + valve close | `[V]` |
| `WIC.CS-2`/`TS-2`, `WIF.CS-1`/`TS-1` | DI/AI | walk-in current switch + room temp | cycle to room SP (factory KE2); BAS monitor/alarm + cmd | `[V]` (01/M503B) |

---

# 10. Walk-in cooler / freezer (01/M503B · §114000 · M121B KN-6)
**SOO (01/M503B):** **1. GENERAL** — the walk-in freezer and cooler equipment communicate with the BAS; **temperature monitoring and alarm only by BAS; unit operation and control by factory-installed controls**. **2. DESIGN** — indoor conditions by the kitchen consultant. **3. RUN** — the walk-in cooler/freezer **water-source heat pumps cycle on/off to meet room-temperature setpoints (adj)**. `[V]`
**Points:** `WIF.CS-1` / `WIC.CS-2` current switch (command on/off, monitor status) — DI/DO · `WIF.TS-1` / `WIC.TS-2` room temperature (monitor + command setpoint, HIGH/LOW alarm) — AI/AO. `[V]`
**§114000 / Div 11:** water-cooled remote condensing units (ColdZone — cooler R-448A medium-temp CWO130E4SEANT, freezer R-448A low-temp CWO400L4SEANT); **box temps cooler +35 °F, freezer −10 °F**; **KE2 demand-defrost** controller; **Cat5 temperature monitoring to the kitchen manager's office**; field water-regulating valve; condenser water piped to coils by the mechanical contractor (KN-6), refrigerant lines by the kitchen equipment contractor. `[V]`

---

# 11. Electric (unit) heaters — `EH1` (02/M503B)
**SOO (02/M503B):** **1.1** factory-provided unit-heater thermostats control the units. **1.2** a single remote temperature sensor in the ceiling plenum provides **space-temperature monitoring by the BAS (monitoring only)**, connected to the BAS for trending and display. `[V]`
**Points:** `EH1.CS-1` on/off and status (current sensor) · `EH1.T-1` room temperature + room-temperature setpoint. `[V]`

---

# 12. Kitchen exhaust hood / grease exhaust fan / makeup-air unit (04/M503B · §233423)
**SOO (04/M503B):** **1.1** the **condensate exhaust hood** has factory controls communicating with the **kitchen grease exhaust fan** and the **HVAC makeup-air unit**; controls are tied into the BAS for remote monitoring and control. **2. EXHAUST HOOD** — switched on at the hood control panel, overridable via BAS; the hood's **"VFD thermostat" sends 0–10 VDC** to modulate the exhaust fan and the makeup-air fan **based on cooking intensity**. **3. EXHAUST FAN** — energizes on signal from the hood panel/override and modulates speed per the VFD thermostat; stops on command from the hood panel or BAS; **air-balanced with the MAU for the appropriate CFM difference at all speeds**. **4. MAKEUP-AIR UNIT** — on a start signal, the **MAU motorized damper opens** and the fan energizes, modulating speed per the hood VFD thermostat; on stop, the fan turns off and the **OA damper closes**; UL-listed dampers by the hood vendor. `[V]`
**Points:** `KMAU-1.ACD-1` isolation damper (DO) · `HOOD1.S-1` on/off override switch (DI) · `KMAU-1.TS-1` MAU discharge temp (AI) · `HOOD1.TS-2` hood temperature (AI) · `KMAU-1.VFD` MAU fan start/stop+speed · `KEF-1.VFD` exhaust fan start/stop+speed. `[V]`
> **FLAG-W5** — the 04/M503B **diagram** tags MAU fan = `VFD-2`, grease EF = `VFD-1`; the **points list** reverses them (`VFD-1` MAU, `VFD-2` EF). Use the points-list assignment; note the diagram swap. §233423: MAU = inline belt-drive centrifugal fan (Greenheck/Cook/Twin City), KEF = roof upblast belt fan; §230548.13 confirms an inline kitchen makeup-air fan + a roof-mounted kitchen condensate exhaust fan. Kitchen-fan **CFM/HP** per the fan schedule `[?]`; this exhaust system is **not** on the M202B riser (**FLAG-W9**).

---

# 13. ⚠️ Tag cross-map (points-list ↔ SOO-text ↔ riser/plan) + FLAGS

| Function | Points-list / SOO tag | Riser / plan tag | Token used | Note / FLAG |
|---|---|---|---|---|
| WSHP units | `WSHP-CA-0x` (M502B) | `WSHP-CA-01…04` w/ types A/B/C + GPM (M201B/M121B) | `WSHP-CA-01…04` | brief had only `-02`/`-04`; actually four units |
| WSHP source valve | `CV-1` "2-way control valve" (04/M502B) | (riser GWS/GWR branch) | `WSHP-CA-0x.CV-1` | fail = **Last position** (§230923.11) |
| DOAS coil valve | `CV-1` "control valve – geothermal coil" (01/M502B) | DOAS coil branch 2″/24 GPM (M201B) | `DOAS1.CV-1` | fail = **Open** (§230923.11 DOAS) — distinct from WSHP `CV-1` |
| Loop energy meter | `BTU-1` "addition condenser water BTU meter" (03/M503B) | on 3″ GWS (M121B KN-5) | `BTU-1` | **≠** `DOAS1.BTU-1` (DOAS coil energy) — **FLAG-W13** |
| Heat-trace current | `CS-1` "current sensor – heat trace piping" (01/M502B) | heat-trace controller (M121B KN-2) | `DOAS1.CS-1` | **≠** `EH1.CS-1` / `WIF.CS-1` (different devices) |
| DOAS fans | `VFD-1` supply / `VFD-2` exhaust (01/M502B) | DOAS-CA-1 (M201B/M202B) | `DOAS1.VFD-1/2` | wheel = `VFD-3` |
| Kitchen fans | list `VFD-1` MAU / `VFD-2` EF; diagram reversed (04/M503B) | (not on M202B) | `KMAU-1`/`KEF-1` | **FLAG-W5** tag swap; **FLAG-W9** not on riser |
| Bypass VAV | `BYPVAV` duct static 1.0″WG (02/M501B) | `VAV-1-10` "Return Air Bypass" 2000 CFM (M201B) | `BYPVAV` = `VAV-1-10` | same device |
| DCV VAV / CAFR | `VAV-CA-*` (DCV) / `CAR-*` (fixed) (05/M502B §6) | `VAV-CA-01/02`, `CAR-A/B` (M201B/M202B) | as drawn | CO₂ 1000 PPM (WSHP) vs 900 PPM (SCR box) |
| Water meters | `WM` "BAS meter at main cold water line to addition" (04/M501B) | (plan) | `WM-1`/`WM-2` | which leg is -1 vs -2 `[?]` |
| Electric meters | `M-1…M-5` (03/M501B) | — | `M-1…M-5` | HVAC/Lighting/Plug/Kitchen/DOAS — **FLAG-W8** |

**Consolidated discrepancy flags** (full list with citations in `token_map.md` §4.2): **FLAG-W1** WSHP mfrs (Daikin/Climate Master/Trane). **FLAG-W2** instrument ranges (condenser-water 0–120 °F; pressure −300…300 psig adj) ≠ brief's 0–150 °F/0–100 psi. **FLAG-W3** M501B detail numbering (SCR=05, VRF=06, ERAHU=07). **FLAG-W4** DOAS coil hydronic (spec) vs WSHP/DX+hot-gas-reheat (drawing). **FLAG-W5** kitchen `VFD-1/2` swap. **FLAG-W6** SCR-box physical application. **FLAG-W7** shared `GWS/GWR` with East End. **FLAG-W8** electric-meter mapping. **FLAG-W9** M202B has no MAU/KEF/22,115 CFM. **FLAG-W10** VRF = existing-building (no VRF on cafeteria sheets). **FLAG-W11** `CD` = condensate drain (no M121B legend; condenser water = GWS/GWR). **FLAG-W12** ERAHU-1 const-vol (TAB) vs VFD-to-static (sequence). **FLAG-W13** two distinct `BTU-1`.

---

# 14. Consolidated open items (each names the sheet/schedule that closes it)

1. **Existing condenser-water/geothermal plant** — loop supply/return temp setpoints, total loop GPM, pump head/curves/lead-lag, wellfield bypass: **existing system + §230593 TAB report of the existing CW system** (reconfigured pumping). `[?]`
2. **WSHP schedule** — capacities/types A/B/C ("See Plans" §238146), electrical, balanced branch GPM (TAB), entering-water design: **WSHP schedule + TAB**. `[?]`
3. **DOAS-CA-1 schedule** — confirmed capacity (≈2115 CFM), coil/compressor data, wheel effectiveness, hot-gas-reheat: **DOAS/ERU schedule** (resolves **FLAG-W4** coil-type). `[?]`
4. **Control-valve schedule** — Cv for `WSHP-CA-0x.CV-1`, `DOAS1.CV-1`, ERAHU HW/CHW valves (fail positions known from §230923.11). `[?]`
5. **Kitchen fan schedule** — `KMAU-1`/`KEF-1` CFM/HP; resolve **FLAG-W5** VFD tag swap; locate the kitchen-exhaust riser (not on M202B, **FLAG-W9**). `[?]`
6. **VRF schedule / §238129 product data** — ODU/IDU/ERV counts & tags; which indoor unit is `AC-1` (CO₂); confirm existing-building zoning (**FLAG-W10**). `[?]`
7. **VAV schedule / floor plans** — which boxes carry SCR electric reheat (**FLAG-W6**); `VAV-CA`/`VAV-1` controls per base-building drawings. `[?]`
8. **Metering details** — per-panel `M-1…M-5` breakdown (19 meters); `WM-1` vs `WM-2` leg; gas-meter range/type (not in §230923.16). `[?]`
9. **(E)ERAHU-1 base-building drawings** — retained legacy points/graphics; HW/CHW valve tags. `[?]`
10. **M121B "CD" legend** — no legend on M121B; confirm `CD` = condensate drain on the symbols sheet (**FLAG-W11**). `[?]`
11. **DDC network riser** — analog signal protocols / instrument ranges beyond §230923.x. `[?]`

---

# 15. JSON index
```json
{
  "project": "Stoddert ES West End Cafeteria",
  "address": "4001 Calvert St NW, Washington DC 20007",
  "contract": "DCAM-22-CS-RFP-0009",
  "cd_set": "100% CD 2025-06-06",
  "scope_note": "Cafeteria addition (WSHP + DOAS + walk-ins on EXISTING geothermal/condenser-water loop) + existing-building renovation (VRF, (E)ERAHU-1 retrofit). Separate from East End 4501 Calvert / DG-22-S002.",
  "source_sheets": {
    "M501B": {"rev": 5, "title": "Mechanical - Controls", "details": {"01":"BAS network architecture","02":"Bypass VAV box","03":"Building electric meter","04":"Gas & domestic water meters","05":"VAV box w/ electric heat (SCR)","06":"VRF controls/sequences/diagram/points","07":"(E)ERAHU-1"}, "read":"text-layer"},
    "M502B": {"rev": 5, "title": "Mechanical - Controls", "details": {"01":"DOAS-1 controls points","02":"DOAS-1 sequences","03":"DOAS-1 controls diagram","04":"WSHP controls points","05":"WSHP sequences","06":"WSHP controls diagram"}, "read":"200dpi-vision"},
    "M503B": {"rev": 6, "title": "Mechanical - Controls", "details": {"01":"Walk-in cooler & freezer","02":"Electric heater","03":"Condenser water BTU meter","04":"Kitchen hood / grease EF / makeup-air unit"}, "read":"200dpi-vision"},
    "M201B": {"rev": 5, "title": "Mechanical - Riser Diagrams", "risers": ["Condenser Water","DOAS Outside Air","(E)ERAHU-1"], "read":"200dpi-vision"},
    "M202B": {"rev": 4, "title": "Mechanical - Riser Diagrams", "risers": ["Exhaust Air (DOAS-CA-1)"], "read":"200dpi-vision"},
    "M121B": {"title": "Mechanical - First Floor Piping Plan - Cafeteria Addition", "keyed_notes": 6, "read":"drive-highdpi"}
  },
  "systems": ["WSHP-CA-01..04","geo/condenser-water loop (existing tie)","DOAS-CA-1","VAV-CA + CAR (CAFR)","(E)ERAHU-1 + VAV-1-8..13","VRF (existing-bldg)","walk-in cooler/freezer","electric unit heaters","kitchen hood/MAU/EF","metering (M-1..M-5, gas, WM, BTU-1)"],
  "setpoints_V": {
    "WSHP_room_cool":"73F/50%RH","WSHP_room_heat":"69F","WSHP_setback":"80/60F","WSHP_CO2":"1000ppm",
    "DOAS_discharge_control":"55F","DOAS_discharge_design_summer":"52/52F","DOAS_discharge_winter":"69F","DOAS_floor_pressure":"+0.05inWG","DOAS_wheel_dP_min":"0.25inWG","DOAS_filter_dP":"0.80inWG",
    "ERAHU_SAT":"55F","ERAHU_bldg_pressure":"0.05inWG","ERAHU_setback":"80/60F",
    "SCR_VAV_CO2":"900ppm","SCR_VAV_alarm":"+/-5F/10min","bypass_VAV_duct_static":"1.0inWG",
    "VRF_indoor_summer":"75F/50%RH","VRF_indoor_winter":"70F",
    "walkin_cooler":"+35F","walkin_freezer":"-10F"
  },
  "flags": ["W1 WSHP mfrs","W2 instrument ranges","W3 M501B detail numbering","W4 DOAS coil hydronic-vs-DX","W5 kitchen VFD swap","W6 SCR box application","W7 shared GWS/GWR","W8 electric meter map","W9 M202B no MAU/KEF","W10 VRF existing-bldg","W11 CD=condensate drain","W12 ERAHU const-vol vs VFD","W13 two BTU-1"],
  "open_items_closed_by": {"existing_plant":"§230593 TAB / existing dwgs","WSHP_caps":"WSHP schedule + TAB","DOAS":"DOAS schedule","valves":"control-valve schedule","kitchen_fans":"fan schedule","VRF":"§238129 / VRF schedule","VAV":"VAV schedule/plans","metering":"meter details","ERAHU_legacy":"base-building dwgs","CD_legend":"symbols sheet"}
}
```
