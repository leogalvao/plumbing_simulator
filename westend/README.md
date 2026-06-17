# Stoddert ES — WEST END CAFETERIA — controls extraction & design-basis capture

Mirror of the East End controls artifact suite (`/controls/`), for the **separate** West End Cafeteria project
(**4001 Calvert St NW · Contract DCAM-22-CS-RFP-0009 · 100% CD 2025-06-06**). East End (4501 Calvert / DG-22-S002) is
untouched. Both projects use `GWS/GWR` — kept in separate scopes (FLAG-W7).

| File | What it is |
|---|---|
| `Stoddert_WestEnd_SOO_Controls_Extracted.md` | **Start here.** Verbatim cleaned SOO + tokenized points + point→logic per system; abbreviations; BAS architecture & metering; equipment register; **water-source-loop subsystem** (equipment + GWS/GWR pipe-segment table + point→logic); distribution map from M121B/M201B/M202B; tag cross-map; consolidated open items; JSON index. |
| `token_map.md` | Authoritative token namespace (`WSHP-CA-*`, `DOAS-CA-1`, `VAV-CA-*`, `CAR-*`, `ERAHU-1`, `VRF-*`, `WIC/WIF`, `CP-*`, `BTU-1`, `M-*`…), unit-level namespacing, and all FLAG-W1…W13. |
| `points_list.md` | Per-system control points (174 records) with counts by type/source/confidence. |
| `io_matrix.json` | Canonical per-point data (binds on `token`); same record schema as East End. |
| `sequence_xref.md` | Point ↔ SOO-clause cross-reference per system. |
| `coverage_report.md` | What is resolved vs. `[?]`, with the exact closing sheet/schedule for each gap. |
| `Stoddert_WestEnd_DesignBasis_Capture.md` / `.json` | **Synthesized** enteliWEB snapshot (no field capture exists). Banner on every page; pinned scenario (`WE-SUMMER-COOLING-DESIGN`); every value tagged `[V]`/`[DERIVED]`/`[ILLUS]`; VRF = BAS-visible monitor/alarm only. JSON: `status:"design_basis_synthetic"` + per-point `provenance`. |
| `source_drawings/` | The five source sheets read directly (M501B/M502B/M503B controls, M201B/M202B risers). *M121B piping plan is in the project Drive (not uploaded); its keyed notes/equipment are cited throughout.* |

**Read method:** M501B from its embedded text layer; M502B/M503B/M201B/M202B rendered from vector PDF at 200 DPI and read by region (vision); M121B from the Drive copy at high DPI. SPEC facts from the actual West End [WEST] Division 23/11 spec PDFs. Every fact cited by sheet+detail bubble or spec section. No Cv/capacity/curve/flow/range/sequence value is fabricated; the synthetic capture is the only place `[DERIVED]`/`[ILLUS]` values appear.
