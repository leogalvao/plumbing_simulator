# Stoddert ES · Geo-Exchange Digital Twins

Interactive web-based digital-twin simulators for the Stoddert ES (DG-22-S002)
water-source-heat-pump (WSHP) / geo-exchange system. Two twins are combined into
a single app behind a tabbed navigation shell:

| Tab | Twin | What it does |
| --- | --- | --- |
| **CW / Geo-Exchange Plant** | `src/twins/CwPlantTwin.jsx` | Interactive plant SCADA twin matched to the 2025-11-21 enteliWEB capture. Toggle pumps, drive valves (CV-5 / CV-3 / bypasses), switch the ACCU free-cooler, and watch temperatures, flows, head loss and pump power respond. |
| **WSHP Distribution Network** | `src/twins/WshpHydraulicTwin.jsx` | Design-basis hydraulic twin built from the riser diagram. Click any pipe to resize it and see velocity / head-loss (Hazen-Williams + Darcy-Weisbach) update, with a grounded engineering-query helper. |

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

Requires Node 18+.

## Project structure

```
index.html              # Vite entry
src/
  main.jsx              # React root
  App.jsx               # navigation shell (tab switcher + header)
  theme.js             # shared design tokens + number formatters
  components.jsx        # shared UI primitives (Slider, Toggle, Panel, Stat, InfoDot)
  twins/
    CwPlantTwin.jsx
    WshpHydraulicTwin.jsx
```

## Modelling notes (read before quoting numbers)

These are **decision-support twins**, not calibrated P&ID hydraulic solutions:

- **CW Plant twin** is a reduced-order *relational* model anchored to the
  2025-11-21 enteliWEB capture. The physics live in `src/twins/cwPlantModel.js`
  (pure, no React) and are checked head-less by `src/twins/cwPlantModel.test.mjs`
  (`node src/twins/cwPlantModel.test.mjs` prints Real vs Sim vs Variance and
  fails if any point is out of tolerance). Topology is physically correct:
  - **GWS Flow (geo loop) is driven by the geo/condenser pumps P3 + P4** —
    throttling P3 (lead/lag) lowers GWS, which is how the plant holds ~671 GPM
    with P4 at 100 %. **Building flow / New-Add DP / Existing DP / BTU branch are
    driven by the primary VS pumps P1 + P2** (parallel, lead/standby — P2 Off ⇒
    its branch carries zero flow).
  - **CV-1-1/CV-1-2 (wellfield bypass) divert** flow *around* the wellfield; GWS
    reads the wellfield flow, so opening them lowers it (they are not an additive
    path). Closed bypass ⇒ full pump flow on GWS.
  - **LWT is ambient wet-bulb driven** (`wetbulb(OA-T, OA-H) + offset`), so OA-H
    now feeds the model; **EWT = LWT + ACCU loop ΔT**, capped by the CV-5
    diverting setpoint.
  - `CV-5 = % bypass` (0 % ⇒ full cold flow to building). Confirm the CV-5
    convention against the sequence of operations (M503 ⑨ / FLAG-B).
  The on-screen **ACCU Alarm** mirrors the live plant and is out of model scope.
- **WSHP hydraulic twin** takes topology, pipe sizes and design GPM from the
  riser; velocity and head loss are computed. Segment **lengths are assumed**
  (branch 25 ft / header 30 ft / main 150 ft, scalable). Pump operating points,
  NPSH and energy are **illustrative** pending P-1…P-4 curves, valve Cv,
  lengths/materials, elevations, equipment ΔP and balancing/Cx reports.

## What changed in this revision

- Turned two standalone `.jsx` component files into a runnable Vite + React app.
- Combined both twins under one navigation shell with a shared theme and UI kit.
- **Bug fix:** WSHP pipe-diameter edits previously mutated module-level constants,
  so **Reset never restored them**. Diameters now live in React state
  (`dia` override map) and Reset correctly returns every segment to design size.
- Added at-a-glance KPI strips, hover tooltips on diagram glyphs, a sticky header,
  focus-visible outlines, and responsive/mobile-friendly layout.
- **CW Plant recalibration (2025-11-21 capture).** Extracted the plant physics
  into a pure, testable `cwPlantModel.js`; re-derived the flow topology so the
  **geo loop (GWS) is driven by P3/P4** and the **building loop by P1/P2** (P2 is
  now a true parallel/standby pump with a dead branch when off); made the
  **wellfield bypass divert** instead of inflating GWS; replaced the dry-bulb
  free-cooling floor with a **wet-bulb LWT model** (EWT = LWT + loop ΔT); and
  re-anchored every fitted constant to the capture. Added a **"Load 2025-11-21
  capture" preset** and an in-app **Real vs Sim vs Variance** calibration table
  (mirrored by the head-less test). All 11 calibration points land within their
  acceptance tolerances.
