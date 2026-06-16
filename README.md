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

- **CW Plant twin** is a reduced-order *relational* model anchored to the capture.
  Physical forms and directions are correct; absolute values away from the
  baseline are illustrative. `CV-5 = % cooled flow delivered to the building`
  (0.0 % reads as full bypass). Confirm the CV-5 convention against the sequence
  of operations.
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
