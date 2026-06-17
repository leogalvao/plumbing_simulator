# Stoddert ES — Sequence Cross-Reference (point ↔ SOO clause)

**Project:** DG-22-S002 · **Governing logic source:** `23 09 93.11` Sequence of Operations — **NOT in repo**.
Until the SOO + control diagrams are provided, **every control sequence below is `[?]`.** Captured
values (CAP §4) are listed **as observations only** — they anchor the state, they do **not** assert logic.
Setpoint/parameter values are real (CAP); the *rules that read or command them* are deferred to the SOO.

> Nothing in this file infers modulation direction, fail position, staging order, or lead/lag.
> Each row names the exact clause/sheet that closes it (see also `coverage_report.md`).

---

## 1. Control valves — modulation + fail position (from SOO `23 09 93.11`; valve schedule `23 09 23.11`)

| Valve | Points | Observed (CAP) | Logic / fail position | Closes via |
|---|---|---|---|---|
| `CV-5` | `CV-5` (AO), `SP-CV5-TEMP`=75.0 °F | position **0.0 %** | `[?]` — % to-system vs % bypass **direction not asserted**; fail position `[?]` | SOO + valve schedule |
| `CV-3` | `CV-3` (AO) | position **0.0 %** | `[?]` — GWS min-flow modulation; fail position `[?]` | SOO + valve schedule |
| `CV-1-1` | `CV-1-1` (AO) | position **100.0 %** | `[?]` — GWS bypass modulation; fail position `[?]` | SOO + valve schedule |
| `CV-1-2` | `CV-1-2` (AO) | position **100.0 %** | `[?]` — GWS bypass modulation; fail position `[?]` | SOO + valve schedule |

*Per §2.2 each CV drives to a defined failed position on loss of power — the **specific** position per valve is `[?]`.*

---

## 2. Pumps P-1…P-4 — lead/lag + DP-setpoint control (SOO `23 09 93.11`; TAB `23 05 93`)

| Function | Points | Observed (CAP) | Logic | Closes via |
|---|---|---|---|---|
| Stage / lead-lag | `PMP-P1..P4 .STS/.CMD/.SPD` | P1 On 85.4 % · P2 Off · P3 On 100 % · P4 On 100 % | `[?]` — lead/lag order & staging not asserted | SOO + pump schedule |
| DP-setpoint control | `SP-CHWDP`=7.0 psi; `PDT-NEWADD`=42.8, `PDT-EXISTBLDG`=7.0 psi | DP setpoint 7.0 psi | `[?]` — which DP transmitter the VFDs control to is **not asserted** (observe `PDT-EXISTBLDG`≈`SP-CHWDP`, correlation only) | SOO + TAB report |

*§2.5 establishes that the VFDs control to a determined system DP setpoint with the discharge valve 100 % open — the binding of `SP-CHWDP` to a specific PDT is `[?]`.*

---

## 3. EQ-ACCU-1 — staging + free-cooling enable (SOO `23 09 93.11`)

| Function | Points | Observed (CAP) | Logic | Closes via |
|---|---|---|---|---|
| Unit enable / status | `ST-ACCU`, `ST-ACCU-CMD`, `AL-ACCU`, `ST-ACCU-RST` | On / On / normal / off | `[?]` enable logic | SOO |
| Fan staging | `ST-ACCU-C1..C4` | 100.0 % each | `[?]` staging order/thresholds | SOO + equipment schedule |
| LWT control | `SP-LWT`=44.0 °F | — | `[?]` reset/control logic | SOO |
| Free-cooling enable | `SP-ACCU-EN-DIFF`=5.0, `SP-ACCU-LOW-EN`=60.0, `SP-ACCU-HIGH-EN`=70.0 °F | — | `[?]` enable/disable band logic | SOO |
| CV-5 temp trigger | `SP-CV5-TEMP`=75.0 °F | — | `[?]` — relationship to `CV-5` modulation not asserted | SOO |

---

## 4. EQ-WELLFIELD / SYS — plant parameters (SOO `23 09 93.11`)

| Function | Points | Observed (CAP) | Logic | Closes via |
|---|---|---|---|---|
| System enable / reset | `PRM-SYSTEM-EN`=True, `PRM-SYS-RESET`=Off | — | `[?]` | SOO |
| Pump-down timing | `PRM-PMPDOWN-TIME`=300.0 s | — | `[?]` | SOO |
| Wellfield replenish | `PRM-WELLFIELD-REPL`=Off | — | `[?]` replenish trigger | SOO + RFI 181/183 |

---

## 5. WSHP networks — occupancy + unit control (SOO `23 09 93.11`; Div 23 WSHP §2.4)

| Function | Points (×16) | Logic | Closes via |
|---|---|---|---|
| Occupied/unoccupied schedule | `WSHP-x.OCC`, `WSHP-x.SCHED` | `[?]` schedule + setback logic | SOO |
| Unit start/stop + setpoint | `WSHP-x.CMD`, `WSHP-x.SP-ADJ`, `WSHP-x.STS` | `[?]` enable + setpoint reset | SOO |
| Fault handling | `WSHP-x.FAULT` | `[?]` alarm/response | SOO |
| Monitoring (no command) | `WSHP-x.SAT/.RAT/.RH/.EWT` | data-inquiry only (§2.4) | — (resolved as SPEC) |

*Branch balancing (`BV-WSHP-x`) is a TAB activity (§2.5), not a sequence — see `points_list.md`.*

---

## Summary

All commanded/modulated points (CV-5/CV-3/CV-1-1/CV-1-2, P-1…P-4, ACCU staging, WSHP occupancy)
resolve their **logic, fail position, lead/lag, and staging from `23 09 93.11`**, which is not in the
repo. Every such cell is `[?]`. Captured setpoints and positions are recorded as the 2025-11-21 state
only. Closing all of Section 1–4 requires the **Sequence of Operations + control diagrams**;
Section 1 fail positions/Cv additionally require the **control-valve schedule (`23 09 23.11`)**.
