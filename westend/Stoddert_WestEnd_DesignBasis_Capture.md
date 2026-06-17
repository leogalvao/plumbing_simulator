> 🟠 **DESIGN-BASIS / SYNTHETIC SNAPSHOT — DERIVED FROM DRAWINGS, NOT OBSERVED FIELD DATA.**
> There is **no West End enteliWEB field capture**. This document *synthesizes* what a capture would read at one explicit scenario, so the empty CAP column can be populated for a future twin. **Every value is tagged** `[V]` / `[DERIVED]` / `[ILLUS]`. Do not read this as a measured capture.

# Stoddert ES — WEST END CAFETERIA — Design-Basis Synthetic Capture

**Project:** DCAM-22-CS-RFP-0009 · 4001 Calvert St NW · **Companion data:** `Stoddert_WestEnd_DesignBasis_Capture.json` (`status:"design_basis_synthetic"`, same record shape as the extraction `io_matrix.json` + per-point `provenance`, `basis`, `command`, `status`, and top-level `scenario`).
**Derived from:** `io_matrix.json` (extraction from M501B/M502B/M503B/M201B/M202B/M121B + [WEST] specs). **Setpoints are verbatim from the sequences; states are computed at the scenario; live magnitudes are illustrative.**

## Scenario (pinned for reproducibility)
**`WE-SUMMER-COOLING-DESIGN` — Occupied, summer cooling design day (OA 95 °F DB / 78 °F WB), all systems in Auto, steady state.** Weekday 8:30 AM–3:15 PM occupied; existing geothermal/condenser-water loop in service. A **winter-heating** contrast snapshot is in §H.

## Provenance legend (core requirement — every value carries one)
- **`[V]`** verbatim setpoint/design value from a drawing (cited).
- **`[DERIVED]`** deterministically computed from the SOO at the stated scenario (one-line basis given).
- **`[ILLUS]`** illustrative placeholder where the drawing fixes neither setpoint nor live value (live flow/GPM/CFM/kW/temp) — plausible magnitude, **non-authoritative**.

## Counts (this snapshot)
| Provenance | Count |
|---|---|
| `[V]` verbatim | **17** |
| `[DERIVED]` from SOO | **79** |
| `[ILLUS]` illustrative | **78** |
| **Total points** | **174** |

**VRF BAS-vs-factory split:** **8** BAS-visible monitor/alarm points populated; **all** compressor/refrigerant/EEV/defrost/indoor-fan logic = **factory controlled (iTouch), not in BAS** (see §F).

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## A. Metering & condenser-water loop
| Token | Command | Status | Value | Setpoint | Prov |
|---|---|---|---|---|---|
| `M-1` HVAC kW | — | — | 41.0 kW | — | ILLUS |
| `M-2` Lighting / `M-3` Plug / `M-4` Kitchen / `M-5` DOAS kW | — | — | 12.5 / 8.7 / 46.0 / 5.8 kW | — | ILLUS |
| `M-GAS` | — | — | 310 CF/h | — | ILLUS |
| `WM-1` / `WM-2` | — | — | 1,240 gal (cum.) / — | — | ILLUS |
| `BTU-1` loop CW energy | — | — | 1,150 MBH (cum.) | — | ILLUS |
| `GEO-LOOP-GPM` (addition) | — | — | **61.0 GPM** | design | **V** (M201B 3″ main) |
| `GEO-LOOP-SWT/RWT` (existing) | — | — | ~88 / ~95 °F | — | ILLUS (existing-loop; range 0–120 °F §230923.27) |
| `GEO-PUMPS` (existing) | — | running | existing pumps running | — | DERIVED |
| `HTRC-1` heat trace | — | Off | de-energized | <40 °F (DOAS)/<35 °F (WSHP) | DERIVED (OA 95 °F) |

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## B. WSHP-CA-01…04 (per-unit template; applies to all four, 05/M502B)
| Point | Command | Status | Value | Setpoint | Prov |
|---|---|---|---|---|---|
| `.ECM-1` fan | On | On | ~70 % | — | DERIVED / ILLUS(spd) |
| `.CV-1` source 2-way valve | Open | — | Open (modulating) | fail = Last position | **DERIVED** |
| `.D-1` / `.VP-1` | — | — | ~60 % / design CFM | — | ILLUS |
| `.ACD-1` ventilation damper | Open | — | Open | — | DERIVED |
| `.CO2-1` | — | — | ~650 ppm | **1000 ppm** | ILLUS / **V**(SP) |
| `.TH-1` room | — | — | ~73.5 °F/50%RH | **73 °F/50%RH** | DERIVED / **V**(SP) |
| `.TS-1` discharge air | — | — | ~55 °F | — | ILLUS |
| `.TS-2` leaving water | — | — | ~92 °F | — | ILLUS |
| `.S-1` condensate overflow | — | Normal | no overflow | — | DERIVED |
| `.EWT` (Div23) | — | — | ~88 °F | 25–125 °F TXV | ILLUS |
| `.SP-ADJ` / `.OCC` / `.FAULT` | — | Occupied/Normal | 73 °F | — | **V** / DERIVED |
*Cooling/heating refrigerant staging is the manufacturer's factory sequence; capacities "See Plans." `WSHP.DEW-1/2` floor dewpoint ~55 °F [ILLUS].*

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## C. DOAS-CA-1 (02/M502B)
| Point | Command | Status | Value | Setpoint | Prov |
|---|---|---|---|---|---|
| `.VFD-1`/`.VFD-2` fans | On | Running | ~65 % | duct-static SP (TAB) | DERIVED / ILLUS(spd) |
| `.VFD-3` energy wheel | — | — | Design speed | — | DERIVED (OA 95 °F, not econ) |
| `.ACD-1`/`.ACD-2` + `.ES-1`/`.ES-2` | Open | Proven Open | Open | — | DERIVED |
| `.ACD-3-5` relief | — | — | Modulating | floor +0.05″WG | DERIVED |
| `.CV-1` geothermal coil valve | Open | — | Open (modulating) | fail = Open | DERIVED |
| `.TS-4` supply discharge | — | — | **55 °F** | **55 °F** (design 52/52 summer) | **V** |
| `.TS-3` coil | — | — | ~52 °F | — | DERIVED |
| `.TS-0` OA | — | — | **95 °F** | — | **V** (scenario) |
| `.SP-1-3` floor pressure | — | — | **+0.05″WG** | **+0.05″WG** | **V** |
| `.DPS-2` wheel / `.DPS-1/3/4/5` | — | — | ~0.4 / ~0.15″WG | dirty 0.80 / 0.25″ | ILLUS |
| `.FM-1` coil flow | — | — | **24.0 GPM** | — | **V** (M201B) |
| `.BTU-1` coil energy / `.AFMS-1/2` | — | — | ~210 MBH / design CFM | — | ILLUS |
| `.CS-1` heat trace / `.SD-1/2` | — | Normal | Off / Normal | — | DERIVED |
| `.RH-0/1/2`, `.TS-1/2/5`, `.VP-1` | — | — | ~50–55%RH / ~88–95 °F / CFM | — | ILLUS |

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## D. VAV-CA / CAR · SCR VAV box · Bypass VAV
| Point | Value | Setpoint | Prov |
|---|---|---|---|
| `VAV-CA-01`/`-02` | Modulating to CO₂ | room CO₂ (per VAV sched) | DERIVED |
| `CAR-A` / `CAR-B` | **95 / 400 CFM** | fixed | **V** |
| `SCR1.D-1` | Modulating (cooling) | min→max for room temp | DERIVED |
| `SCR1.SCR-1` (electric coil) | **Off** | — | DERIVED (cooling) |
| `SCR1.CO2-1` | **900 ppm** | **900 ppm** | **V** |
| `SCR1.THC-1` / `.VP-1` | ~73 °F / CFM | — | ILLUS |
| `BYPVAV.D-1` | Modulating | **1.0″WG** duct static | DERIVED |

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## E. (E)ERAHU-1 (07/M501B)
| Point | Command | Status | Value | Setpoint | Prov |
|---|---|---|---|---|---|
| `.SF-VFD` supply fan | On (continuous) | Running | ~70 % | duct-static SP (TAB) | DERIVED / ILLUS(spd) |
| `.EF-VFD` exhaust fan | On | Running | ~60 % | bldg press SP | DERIVED |
| `.BLDG-P` | — | — | **+0.05″WG** | **+0.05″WG** | **V** |
| `.DAT` discharge | — | — | **55 °F** | **55 °F** | **V** |
| `.CHW-CV` | — | — | Modulating (cooling) | to 55 °F SAT | DERIVED |
| `.HW-CV` | Closed | — | locked out (cooling) | fail = Close | DERIVED |
| `.DPS-1` / `.SPH` / `.SPL` | — | Normal | within limits | — | DERIVED |
| `VAV-1-8…-13` | — | — | existing (off-sheet) | — | ILLUS |

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## F. VRF — BAS-visible monitor/alarm ONLY (06/M501B)
| Point | Value | Prov |
|---|---|---|
| `VRF.IDU-ONOFF` | On | DERIVED |
| `VRF.IDU-FAIL` | Normal | DERIVED |
| `VRF.IDU-ROOMT` | ~75 °F | ILLUS |
| `VRF.IDU-FILTER` | Clean | DERIVED |
| `VRF.IDU-CO2-AC1` (AC-1 only) | ~700 ppm | ILLUS |
| `VRF.ODU-COMP` | On | DERIVED |
| `VRF.ERV-ONOFF` | On | DERIVED |
| `VRF.ROOM-SP-SCH` | **75 °F / 50%RH** (summer) | **V** |

**Factory controlled — NOT in BAS** (no points; iTouch panel only): compressor staging/modulation, refrigerant & oil management, electronic expansion valves, defrost, indoor-fan speed mapping, inter-unit refrigerant balancing, outdoor-fan control. Indoor winter design 70 °F. Unit counts/tags per §238129 `[?]`. **VRF split = 8 BAS-visible : all-else factory.**

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## G. Walk-in cooler/freezer · Electric heaters · Kitchen
| Point | Command | Status | Value | Setpoint | Prov |
|---|---|---|---|---|---|
| `WIC.CS-2` / `WIF.CS-1` | Enabled | On (cycling) | cycling | — | DERIVED |
| `WIC.TS-2` / `.SP` | — | — | ~+35 °F | **+35 °F** | DERIVED / **V** |
| `WIF.TS-1` / `.SP` | — | — | ~−10 °F | **−10 °F** | DERIVED / **V** |
| `EH1.CS-1` electric heater | Off | Off | off | — | DERIVED (summer) |
| `EH1.T-1` / `.SP` | — | — | ~75 °F | ~68 °F (heating) | ILLUS |
| `KMAU-1`/`KEF-1` fans (`.VFD`) | On | Running | ~75 % | per hood VFD-tstat | DERIVED / ILLUS(spd) |
| `KMAU-1.ACD-1` | Open | — | Open | — | DERIVED |
| `HOOD1.S-1` / `HOOD1.TS-2` | On | On | elevated (cooking) | 0-10 VDC modulation | DERIVED / ILLUS |

---

> 🟠 **DESIGN-BASIS / SYNTHETIC — NOT OBSERVED FIELD DATA.**
## H. Winter-heating contrast snapshot (OA 10 °F DB / 9 °F WB, occupied)
Cheap second scenario for key points (logic flips per the same sequences):
| System | Point | Winter value | Basis |
|---|---|---|---|
| WSHP | `.TH-1` room SP | **69 °F** heat | 05/M502B 1.2.2 `[V]` |
| WSHP | `.CV-1` source valve | Open (heat extraction) | heating call `[DERIVED]` |
| DOAS | `.TS-4` discharge | **69 °F** (winter) | SAT reset OA<55 °F → winter SP `[V]/[DERIVED]` |
| DOAS | `.VFD-3` wheel | Design speed (max recovery) | cold OA, recovery active `[DERIVED]` |
| DOAS | `.CS-1`/`.CV-1` freeze | Heat trace **energized**; CV-1 may full-open if unit cycles off | TS-3<40 °F (02/M502B 7.1) `[DERIVED]` |
| ERAHU-1 | `.HW-CV` / `.CHW-CV` | HW **modulating** / CHW **locked out** | 07/M501B 3 `[DERIVED]` |
| ERAHU-1 | unocc setback | **80/60 °F** | 07/M501B 1 `[V]` |
| SCR VAV | `SCR1.SCR-1` | **Modulating** (heating) | at min damper, SCR to room temp `[DERIVED]` |
| VRF | `VRF.ROOM-SP-SCH` | **70 °F** winter | 06/M501B 2.3 `[V]` |
| Walk-ins | `WIC/WIF` SP | **+35 / −10 °F** (unchanged) | 114000 `[V]` |
| Electric heaters | `EH1.CS-1` | **On** (heating call) | 02/M503B `[DERIVED]` |

---

> 🟠 **DESIGN-BASIS / SYNTHETIC SNAPSHOT — DERIVED FROM DRAWINGS, NOT OBSERVED FIELD DATA.** Full per-point detail (all 174 points, with `command`/`status`/`value`/`setpoint`/`provenance`/`basis`) is in `Stoddert_WestEnd_DesignBasis_Capture.json` (`status:"design_basis_synthetic"`, `scenario_id:"WE-SUMMER-COOLING-DESIGN"`). This snapshot can seed the empty CAP column of a future West End twin once a real enteliWEB capture is taken.
