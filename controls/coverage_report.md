# Stoddert ES — Coverage Report

**Project:** DG-22-S002 · **Generated against:** `Stoddert_ES_Controls_Source_Bundle.md`
**Capture:** enteliWEB 2025-11-21 · **Bind key:** `token` (see `io_matrix.json`)

What is resolved from an in-hand source (CAP/SPEC) versus still `[?]`, and the **exact sheet** that
closes each gap. No Cv, capacity, curve, range, or sequence value has been fabricated.

---

## 1. Headline

| Metric | Count |
|---|---|
| Total records | **231** |
| Verified (`conf:V`) — backed by CAP value or SPEC basis | **209** |
| Unresolved (`conf:?`) — needs a drawing/schedule | **22** |
| Source: CAP (observed) | 48 |
| Source: SPEC (Div 23 basis) | 161 |
| Source: DWG (gap placeholder) | 22 |

The 22 `[?]` records are the **6 equipment elements with no point list** + the **16 balancing-valve
branch-flow entries**. Separately, many *resolved* rows still carry **field-level** `[?]` (Cv, fail
position, ranges, capacities, sequence clauses) — itemized in §3.

---

## 2. Per-element resolution

| Element(s) | Resolved from | Still `[?]` (field-level) |
|---|---|---|
| `EQ-ACCU-1` | CAP status/alarm/fan%, 5 setpoints | unit type, staging logic, fan-signal type |
| `EQ-DOAS-2` | — | **entire point list** |
| `EQ-WELLFIELD` | CAP replenish flag | capacity (700 GPM), well-pump pts, level |
| `EQ-BT-1`,`EQ-AS-1`,`EQ-AS-2`,`EQ-ET-5`,`EQ-CHEM-1` | — | **entire point list** (AS/ET may be mechanical-only) |
| `PMP-P1…P4` | CAP sts/cmd/spd (12 pts) | role/loop, curves, HP, NPSH, design GPM, lead/lag |
| `CV-5`,`CV-3`,`CV-1-1`,`CV-1-2` | CAP position | **Cv, fail position, modulation logic** |
| `FM-2` | CAP flow/sup/ret; SPEC energy pt | metered branch (one cycle vs both), energy unit |
| `FM-GWS` | CAP flow | which main (building vs geo) |
| `TT-*` (7), `AHT-OAH` | CAP value + SPEC accuracy | instrument range/span |
| `PDT-NEWADD`,`PDT-EXISTBLDG` | CAP value + SPEC accuracy | instrument range/span |
| `SYS` | CAP params + DP setpoint | owning controller, DP-transmitter binding |
| `WSHP-1-1…2-8` (16) | SPEC BACnet template (10 pts/unit) | capacities/types (esp. `WSHP-2-4/2-5`), design EWT, air-sensor set |
| `BV-WSHP-*` (16) | SPEC device basis | **balanced branch GPM** (TAB / WSHP schedule) |

---

## 3. Gap register — what each missing sheet unlocks

| # | Missing sheet (request from R&R / design team) | Unlocks (tokens / fields) |
|---|---|---|
| G1 | **Control-valve schedule** (`23 09 23.11`) | `CV-5/CV-3/CV-1-1/CV-1-2`: **Cv**, line size, actuator, fail position |
| G2 | **Sequence of Operations** `23 09 93.11` + control diagrams | ALL sequence logic: CV-5 direction, valve fail positions, ACCU staging, pump lead/lag, `SP-CHWDP`→PDT binding, WSHP occ/unocc |
| G3 | **Pump schedule + curves** | `PMP-P1..P4`: role/loop, head/TDH, impeller, HP, NPSH, design GPM |
| G4 | **WSHP schedule** ("Capacities: See Plans") | `WSHP-*` balanced GPM, types (esp. `WSHP-2-4/2-5`), entering-water temp, electrical |
| G5 | **Controls / flow-meter plan** | `FM-2` metered branch (resolves the "one cycle vs both" question); `FM-GWS` which main |
| G6 | **Mechanical riser detail** | `SEG-R3` size (3" vs 8"); header/branch sizes |
| G7 | **Equipment schedule** | `EQ-ACCU-1` unit type; `EQ-DOAS-2`/`EQ-BT-1`/`EQ-CHEM-1` point lists |
| G8 | **Controls / points-list sheets** | `EQ-DOAS-2`, `EQ-BT-1`, `EQ-AS-1/2`, `EQ-ET-5`, `EQ-CHEM-1` full points; VFD aux points; WSHP air-sensor set |
| G9 | **RFI 181 / RFI 183** | ACCU connection detail; wellfield 700 GPM confirmation |
| G10 | **TAB / balancing report** | `BV-WSHP-*` balanced branch GPM (`conf:?` → `V`); pump TDH/curve verification; system DP setpoint confirmation |
| G11 | **DDC network riser / instrument schedule** | analog signal protocols (`[?]` signals), PDT/TT instrument ranges |

---

## 4. Resolved instrumentation (no further source needed)

Fully closed by CAP value + SPEC §2.1 accuracy (range/span aside):
`TT-LWT, TT-EWT, TT-GWST, TT-GWRT, TT-GEOST, TT-GEORT, TT-OAT, AHT-OAH, PDT-NEWADD, PDT-EXISTBLDG`,
plus `FM-2` (flow/supply/return) and `FM-GWS` (flow). The WSHP BACnet point **existence** is closed
by SPEC §2.4; only their **values/capacities** await G4.

---

## 5. Priority to maximize closure

1. **G2 (SOO)** — unblocks every sequence cell across all four valves, pumps, ACCU, WSHP.
2. **G1 (valve schedule)** — Cv + fail positions for all four CVs.
3. **G4 + G10 (WSHP schedule + TAB)** — closes 16 balancing-valve flows and all WSHP capacities.
4. **G8 (points-list)** — converts the 6 empty equipment elements from `[?]` to populated.
5. **G5 (flow-meter plan)** — settles the FM-2 "both pipe cycles" question directly.

> Note: the FM-2 metered-branch question that started this thread is **G5**. It cannot be answered
> from the capture or specs alone — the controls/flow-meter plan defines which branch(es) FM-2 spans.
