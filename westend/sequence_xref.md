# Stoddert ES — WEST END CAFETERIA — Sequence Cross-Reference (point ↔ SOO clause)

**Governing logic source:** the controls sheets **M501B** (details 01–07), **M502B** (DOAS 01–03 / WSHP 04–06), **M503B** (walk-in 01 / electric-heater 02 / BTU 03 / kitchen 04), risers **M201B/M202B**, and plan **M121B**, with device basis from the West End [WEST] Div 23/11 specs.
**Status:** SOO **resolved `[V]`** from the drawings. Items needing a schedule/existing-drawing are `[?]`. SCADA aliases/FLAGs carried per `token_map.md` §4 (nothing merged). **No field capture exists** — observed-style values are only in the design-basis synthetic capture.

---

## 1. WSHP-CA-01…04 (05/M502B)

`call(room T at .TH-1) → BAS enable (.ECM-1.CMD, HOA Auto) → manufacturer's cooling/heating/dehum sequence → source 2-way valve .CV-1 modulates/opens (cycles w/ compressor, 24 Vdc per §238146) → on satisfy: compressor+fan off, isolation valve closes, min-off 360 s`. **Safety/fire or condensate overflow (.S-1) → unit off + .CV-1 closes** (§9). `[V]`

| Function | Points | Logic | Conf |
|---|---|---|---|
| Mode setpoints | `.TH-1`,`.CO2-1` | occ cool **73 °F/50%RH**, occ heat **69 °F**, unocc **80/60 °F**; CO₂ **1000 ppm** | `[V]` |
| Ventilation (DCV) | `.ACD-1`,`.D-1`,`.VP-1`,`.CO2-1` | §6.1 non-CO₂ rooms → `CAR-*` constant-volume regulator; §6.2 CO₂ rooms → `VAV-CA-*` modulates to CO₂ | `[V]` |
| Source valve | `.CV-1` | closes on shutdown/safety; **fail = Last position** (§230923.11) | `[V]` |
| Dehum / humidity | `.TH-1`,`WSHP.DEW-1/2`,`.TS-1` | factory dehum; high-humidity alarm at max dewpoint | `[V]`/`[?]` |
| Safeties | `.S-1` | condensate-pan water → unit off + valve close (§9) | `[V]` |
| Alarms (§8) | `.TH-1`,`.CO2-1`,`.ECM-1` | high room temp **±2 °F/10 min**; high humidity; high CO₂; WSHP fault; running-in-hand | `[V]` |
| Capacities/staging | — | "Manufacturer's sequence"; "Capacities: See Plans" (§238146) | `[?]` |

## 2. DOAS-CA-1 (02/M502B)

`HOA Auto → OA+EA dampers open (proven .ES-1/.ES-2) → 10 s → supply fan .VFD-1 to min → "supply air volume control" (duct-static SP per TAB) → exhaust fan .VFD-2 concurrent "exhaust air volume control" → energy wheel .VFD-3 to design speed`. Shutdown → fans+wheel off, `.CV-1` close, 10 s → isolation dampers close. `[V]`

| Function | Points | Logic | Conf |
|---|---|---|---|
| Discharge-air temp | `.TS-4`,`.TS-3` | ±1 °F of **55 °F** → WSHP-coil compressors modulate (design 52/52 summer, 69 winter) | `[V]` |
| SAT reset | `.TS-0` | OA **< 55 °F** → reset to winter discharge SP | `[V]` |
| Fan volume | `.VFD-1`,`.VFD-2` | modulate to duct-static SP determined by TAB | `[V]` |
| Energy recovery | `.VFD-3`,`.DPS-2` | design speed; **economizer → min**; **wheel ΔP > 0.25″ → min** | `[V]` |
| Freeze | `.TS-3`,`.CV-1`,`.CS-1` | OFF + TS-3 **< 40 °F** or FZ → `.CV-1` full open + **heat trace energize** | `[V]` |
| Filters | `.DPS-1/2/3` | dirty OA/EA filter **0.25″**, wheel **0.80″WG** | `[V]` |
| Dehum | `.RH-1`,`.TS-3` | disch enthalpy > **26.4 BTU/lb** → compressors hold 52 °F + **hot-gas reheat** modulates | `[V]` |
| Space pressure | `.SP-1-3`,`.ACD-3-5` | relief dampers hold **+0.05″WG**; alarm ±0.1″WC/10 min | `[V]` |
| Ventilation calc | `.AFMS-1/2` | BAS computes OA/EA CFM | `[V]` |
| Safeties | `.SD-1/2`,`.ES-1/2` | smoke → off (HW to VFDs); no-run unless ES prove open | `[V]` |
| Alarms (§14) | `.TS-5`,`.RH-1/2`,`.VFD-1/2` | return-temp ±5 °F; RH ±10%; fan fault; dirty filter/wheel | `[V]` |
| Energy | `.BTU-1`,`.FM-1` | DOAS coil thermal energy (≠ loop `BTU-1`) | `[V]` |

## 3. (E)ERAHU-1 (07/M501B)

| Function | Points | Logic | Conf |
|---|---|---|---|
| Supply-air volume | `.SF-VFD`,`.DPS-1`,`.SPH/.SPL` | VFD to **duct-static SP (TAB)**; continuous occupied; stage on/off unoccupied to **setback 80/60 °F** | `[V]` |
| Exhaust / bldg press | `.EF-VFD`,`.BLDG-P` | EF VFD holds **building pressure 0.05″WG (adj)** | `[V]` |
| Discharge-air temp | `.DAT`,`.HW-CV`,`.CHW-CV` | **55 °F** by modulating HW + CHW valves; **CHW locked out in heating & vice-versa**; valves **fail Close** (§230923.11) | `[V]` |
| Ventilation | — | fixed to minimum OA per ventilation calcs | `[V]` |
| Bypass | `BYPVAV.D-1`,`.VP-1` | `VAV-1-10` return-air bypass holds duct static **1.0″WG** (02/M501B) | `[V]` |
| Legacy points / terminals | `VAV-1-8…-13` | retained per base-building drawings | `[?]` |

## 4. VAV box w/ electric heat — SCR1 (05/M501B)

| Function | Points | Logic | Conf |
|---|---|---|---|
| Cooling | `SCR1.D-1`,`.VP-1` | damper min (0 CFM w/ combo Tstat) → max for room temp | `[V]` |
| Heating | `SCR1.SCR-1` | at min damper, SCR coil modulates for room temp | `[V]` |
| Ventilation | `SCR1.CO2-1`,`.THC-1` | CO₂ drives damper open to **900 ppm** | `[V]` |
| Alarm | `SCR1.THC-1` | high room temp **±5 °F/10 min** | `[V]` |

## 5. VRF (06/M501B) — BAS monitor/alarm only

`VRF runs on factory programming + iTouch panel; NOT interlocked to BAS`. BAS sees ONLY: `IDU-ONOFF`, `IDU-FAIL` (+code), `IDU-ROOMT`, `IDU-FILTER`, `IDU-CO2-AC1` (AC-1 only), `ODU-COMP`, `ERV-ONOFF`, `ROOM-SP-SCH`. Indoor design **75 °F/50%RH summer, 70 °F winter**. All compressor/refrigerant/EEV/defrost/fan logic = **factory (iTouch), not in BAS**. `[V]` Unit counts/tags `[?]` (§238129).

## 6. Walk-in cooler/freezer (01/M503B) · Electric heaters (02/M503B) · Kitchen (04/M503B)

| System | Points | Logic | Conf |
|---|---|---|---|
| Walk-in cooler/freezer | `WIC.CS-2`,`WIC.TS-2`; `WIF.CS-1`,`WIF.TS-1` | WSHP-type condensers cycle to room SP (**+35 / −10 °F**); **BAS = monitor/alarm + on/off + setpoint only; factory KE2 control** | `[V]` |
| Electric unit heaters | `EH1.CS-1`,`EH1.T-1` | factory tstat controls; BAS monitors status + ceiling-plenum space temp (**monitoring only**) | `[V]` |
| Kitchen hood/EF/MAU | `HOOD1.TS-2`(VFD-tstat),`KEF-1.VFD`,`KMAU-1.VFD`,`KMAU-1.ACD-1`,`HOOD1.S-1` | hood VFD-thermostat **0-10 VDC** modulates EF + MAU by cooking intensity; MAU damper opens on start; EF+MAU air-balanced; BAS remote monitor/override | `[V]` |

## 7. Metering & loop

| Function | Points | Logic | Conf |
|---|---|---|---|
| Electric submetering | `M-1…M-5` | HVAC/Lighting/Plug/Kitchen/DOAS; 19 BACnet meters; h/d/m/y → BAS + Sustainability Dashboard (Main Lobby); **DC2017 IECC §8.4.3** | `[V]` |
| Gas / water metering | `M-GAS`,`WM-1/2` | gas at main line; turbine water meters; h/d/m/y → BAS + main-circ monitor | `[V]`/`[?]` |
| Loop energy | `BTU-1` | condenser-water energy h/d/m/y to existing school BAS (3″ GWS) | `[V]` |
| Heat trace | `DOAS1.CS-1`,`HTRC-1` | broken-circuit alarm; energizes on DOAS freeze; controller located per KN-2 | `[V]` |
| Existing plant | `GEO-LOOP-*` | loop temps/GPM/pumps **existing**; §230593 TAB of existing CW system | `[?]` |

---

## 8. Still `[?]` after the SOO
Existing geo/condenser-water plant (loop temps, total GPM, pumps/DP) · `VAV-1-8…-13` legacy controls · WSHP `DEW-1/2` sharing · `M-GAS`/`WM-2` details · all valve **Cv** · WSHP **capacities/types** · DOAS coil/wheel data (**FLAG-W4**) · VRF unit counts (§238129) · kitchen-fan CFM/HP (**FLAG-W5**) · SCR-box application (**FLAG-W6**). Each is named with its closing sheet/schedule in `coverage_report.md` §3.
