import React, { useMemo, useState } from "react";
import {
  Beaker, Thermometer, Gauge, Activity, Waves, Snowflake, RotateCcw, Building2,
} from "lucide-react";
import {
  computeLoop, DEFAULT_INPUTS, EQUIP, MATERIALS,
  type ModelInputs, type LoopResult, type BranchResult,
} from "./cwLoopModel";

/* ==========================================================================
 *  West End Cafeteria — Condenser-Water / Geo-Exchange Digital Twin (TSX + Tailwind)
 *  Interactive SVG piping map (existing East End 6" GWS/GWR tie-in → 3" → branch
 *  circuits → WSHP-CA-01..04 + walk-in cooler/freezer + BTU/water meters), with
 *  flow / heat / pressure map modes, a glycol module, a live dashboard, and
 *  per-unit heat-pump / refrigeration controls. Engine: ./cwLoopModel.ts.
 * ========================================================================== */

type Mode = "flow" | "heat" | "pressure";

/* ---- colour helpers (palette interpolation for the map modes) ---- */
function lerpHex(a: string, b: string, t: number): string {
  const ch = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = ch(a), B = ch(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
function scale(t: number, stops: [number, string][]): string {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return lerpHex(c0, c1, (t - t0) / ((t1 - t0) || 1)); }
  }
  return stops[stops.length - 1][1];
}
const TEMP: [number, string][] = [[0, "#4ea3e0"], [0.5, "#f5d23a"], [1, "#ff5a5f"]];
const PRESS: [number, string][] = [[0, "#ff5a5f"], [0.5, "#f5a623"], [1, "#37d399"]];
const VEL: [number, string][] = [[0, "#37d399"], [0.55, "#f5a623"], [1, "#ff5a5f"]];

const fmt = (v: number, d = 1) => (v == null || isNaN(v) ? "—" : v.toFixed(d));
const f0 = (v: number) => Math.round(v).toLocaleString();

/* ---- SVG primitives ---- */
function Pipe({ d, w, color, flow, dir = 1 }: { d: string; w: number; color: string; flow: number; dir?: number }) {
  const dur = Math.max(0.5, Math.min(6, 16 / Math.max(flow, 2)));
  return (
    <g>
      <path d={d} stroke={color} strokeWidth={w} fill="none" opacity={0.62} strokeLinecap="round" strokeLinejoin="round" />
      {flow > 0.15 && (
        <path d={d} stroke="#eef8ff" strokeWidth={Math.max(w * 0.34, 1.3)} fill="none" strokeDasharray="2 16"
          strokeLinecap="round" style={{ animation: `cwflow ${dur}s linear infinite`, animationDirection: dir > 0 ? "normal" : "reverse" }} />
      )}
    </g>
  );
}

const COLS = [360, 520, 660, 800, 960, 1120]; // equipment columns (matches EQUIP order)
const SUPPLY_Y = 330, RETURN_Y = 446, UNIT_Y = 150;

export default function WestEndCwLoopTwin() {
  const [inp, setInp] = useState<ModelInputs>(() => JSON.parse(JSON.stringify(DEFAULT_INPUTS)));
  const [mode, setMode] = useState<Mode>("flow");
  const [sel, setSel] = useState<string>("WSHP-CA-01");
  const R: LoopResult = useMemo(() => computeLoop(inp), [inp]);

  const setTop = <K extends keyof ModelInputs>(k: K, v: ModelInputs[K]) => setInp((s) => ({ ...s, [k]: v }));
  const setU = (id: string, key: string, v: number) =>
    setInp((s) => ({ ...s, units: { ...s.units, [id]: { ...s.units[id], [key]: v } } }));
  const reset = () => setInp(JSON.parse(JSON.stringify(DEFAULT_INPUTS)));

  // map ranges
  const tMin = R.supplyTempF, tMax = Math.max(R.loopRetT, ...R.branches.map((b) => b.lwt), tMin + 1);
  const vMax = Math.max(2, R.trunk3.v, ...R.branches.map((b) => b.v));
  const Hd = Math.max(1, R.totalHeadFt);
  const wOf = (gpm: number) => Math.max(2.4, Math.min(14, 2.4 + gpm / 6));

  // colour a segment given its (temp, pressureFrac, velocity) by the active mode
  const col = (supply: boolean, temp: number, pFrac: number, vel: number) => {
    if (mode === "heat") return scale((temp - tMin) / (tMax - tMin), TEMP);
    if (mode === "pressure") return scale(pFrac, PRESS);
    if (mode === "flow") return scale(vel / vMax, VEL);
    return supply ? "#4ea3e0" : "#ff5a5f";
  };

  const sb = R.branches.find((b) => b.id === sel) || R.branches[0];
  const selU = inp.units[sb.id];

  const Card: React.FC<{ label: string; value: string; unit?: string; color?: string; hint?: string }> = ({ label, value, unit, color, hint }) => (
    <div className="rounded-xl border border-line bg-box px-3 py-2 min-w-[112px]">
      <div className="text-[10px] uppercase tracking-wide text-dim">{label}</div>
      <div className="font-mono text-[17px] font-bold" style={{ color: color || "#f3f8fe" }}>{value}<span className="text-[10px] text-unit"> {unit}</span></div>
      {hint && <div className="text-[10px] text-txt2">{hint}</div>}
    </div>
  );

  const Range = ({ label, value, min, max, step = 1, unit, onChange, accent = "#4ea3e0", d = 1 }:
    { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; accent?: string; d?: number }) => (
    <label className="block mb-2.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[12px] text-lab">{label}</span>
        <span className="font-mono text-[12.5px]" style={{ color: accent }}>{value.toFixed(d)}<span className="text-unit text-[10px]"> {unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)}
        className="w-full cursor-pointer" style={{ accentColor: accent, height: 16 }} />
    </label>
  );

  return (
    <div className="font-sans text-ink p-4" style={{ background: "#0a0e16" }}>
      {/* header + dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-2">
          <Card label="Loop flow" value={fmt(R.totalGpm)} unit="GPM" color="#4ea3e0" />
          <Card label="Loop ΔT" value={fmt(R.loopDT)} unit="°F" color="#23b6a4" />
          <Card label="Heat rejected" value={f0(R.totalHeat)} unit="BTU/hr" color="#f5a623" hint={`${fmt(R.tons)} ton`} />
          <Card label="Pump power" value={fmt(R.pumpKW, 2)} unit="kW" color="#f5a623" hint={`${fmt(R.pumpHP)} HP · ${fmt(R.totalHeadFt)} ft`} />
          <Card label="Loop efficiency" value={fmt(R.loopEff, 1)} unit="ton/kW" color="#37d399" />
          <Card label="Freeze protect" value={fmt(R.freeze)} unit="°F" color={R.freeze > inp.supplyTempF - 30 ? "#b48ef0" : "#4ea3e0"} hint={`burst ${fmt(R.burst)}°F`} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-line bg-box p-1 gap-1">
            {([["flow", Waves], ["heat", Thermometer], ["pressure", Gauge]] as [Mode, any][]).map(([m, Icon]) => (
              <button key={m} onClick={() => setMode(m)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold cursor-pointer capitalize"
                style={{ background: mode === m ? "#16243a" : "transparent", color: mode === m ? "#f3f8fe" : "#9aa7bb", boxShadow: mode === m ? "inset 0 0 0 1px #4ea3e066" : "none" }}>
                <Icon size={13} color={mode === m ? "#4ea3e0" : "#6a7588"} /> {m}
              </button>
            ))}
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-box px-3 py-2 text-[12.5px] text-txt2 cursor-pointer"><RotateCcw size={13} /> Reset</button>
        </div>
      </div>

      {/* SVG piping map */}
      <div className="rounded-xl border border-line bg-canvas p-2">
        <svg viewBox="0 0 1240 560" className="w-full h-auto block">
          {/* existing East End building */}
          <g>
            <rect x={20} y={250} width={150} height={170} rx={8} fill="#0e1726" stroke="#283751" strokeDasharray="5 4" />
            <Building2 x={78} y={278} width={34} height={34} color="#6a7588" />
            <text x={95} y={345} textAnchor="middle" fontSize="11.5" fontWeight={700} fill="#aebcd0">EXISTING</text>
            <text x={95} y={360} textAnchor="middle" fontSize="11.5" fontWeight={700} fill="#aebcd0">EAST END</text>
            <text x={95} y={378} textAnchor="middle" fontSize="10.5" fill="#6a7588">6&quot; GWS · GWR</text>
            <text x={95} y={398} textAnchor="middle" fontSize="9.5" fill="#6a7588">geo / condenser loop</text>
          </g>

          {/* trunks: 6" tie + 3" cafeteria main (supply blue / return red) */}
          <Pipe d={`M 170 ${SUPPLY_Y} L 1180 ${SUPPLY_Y}`} w={wOf(R.totalGpm)} flow={R.trunk3.v} dir={1}
            color={col(true, R.supplyTempF, 1, R.trunk3.v)} />
          <Pipe d={`M 1180 ${RETURN_Y} L 170 ${RETURN_Y}`} w={wOf(R.totalGpm)} flow={R.trunk3.v} dir={1}
            color={col(false, R.loopRetT, 0.15, R.trunk3.v)} />
          {/* east-end tie risers */}
          <Pipe d={`M 170 ${SUPPLY_Y} L 150 ${SUPPLY_Y} L 150 318 L 170 318`} w={wOf(R.totalGpm)} flow={R.trunk6.v} dir={-1} color={col(true, R.supplyTempF, 1, R.trunk6.v)} />
          <Pipe d={`M 170 ${RETURN_Y} L 150 ${RETURN_Y} L 150 432 L 170 432`} w={wOf(R.totalGpm)} flow={R.trunk6.v} dir={1} color={col(false, R.loopRetT, 0.1, R.trunk6.v)} />
          <text x={262} y={SUPPLY_Y - 10} fontSize="10.5" fontFamily="ui-monospace" fill="#6a7588">3&quot; GWS · {f0(R.totalGpm)} GPM</text>
          <text x={262} y={RETURN_Y + 18} fontSize="10.5" fontFamily="ui-monospace" fill="#6a7588">3&quot; GWR · {fmt(R.loopRetT)}°F</text>

          {/* pump on supply */}
          <g>
            <circle cx={232} cy={SUPPLY_Y} r={15} fill="#0e1726" stroke="#37d399" strokeWidth={2.4} />
            {[0, 120, 240].map((a) => (
              <line key={a} x1={232} y1={SUPPLY_Y} x2={232 + 11 * Math.cos((a * Math.PI) / 180)} y2={SUPPLY_Y + 11 * Math.sin((a * Math.PI) / 180)}
                stroke="#37d399" strokeWidth={2.2} style={{ animation: "cwspin 2.2s linear infinite", transformOrigin: `232px ${SUPPLY_Y}px` }} />
            ))}
            <text x={232} y={SUPPLY_Y - 22} textAnchor="middle" fontSize="10.5" fontFamily="ui-monospace" fill="#aebcd0">PUMP {fmt(inp.pumpSpeed, 0)}%</text>
          </g>
          {/* BTU + water meters on the cafeteria branch */}
          {[["BTU", 300, "#f5a623"], ["WM", 300, "#4ea3e0"]].map(([t], i) => (
            <g key={i as number}>
              <rect x={290} y={i ? RETURN_Y - 11 : SUPPLY_Y - 11} width={26} height={22} rx={3} fill="#0d1320" stroke="#283751" />
              <text x={303} y={(i ? RETURN_Y : SUPPLY_Y) + 4} textAnchor="middle" fontSize="9" fontFamily="ui-monospace" fill={i ? "#4ea3e0" : "#f5a623"}>{t as string}</text>
            </g>
          ))}

          {/* equipment + branch risers */}
          {R.branches.map((b, i) => {
            const x = COLS[i];
            const isSel = b.id === sel;
            const supC = col(true, R.supplyTempF, 0.85, b.v);
            const retC = col(false, b.lwt, 0.2, b.v);
            const kindColor = b.kind === "freezer" ? "#4ea3e0" : b.kind === "cooler" ? "#23b6a4" : "#b48ef0";
            return (
              <g key={b.id}>
                <Pipe d={`M ${x - 16} ${SUPPLY_Y} L ${x - 16} ${UNIT_Y + 34}`} w={wOf(b.gpm)} flow={b.v} dir={-1} color={supC} />
                <Pipe d={`M ${x + 16} ${UNIT_Y + 34} L ${x + 16} ${RETURN_Y}`} w={wOf(b.gpm)} flow={b.v} dir={1} color={retC} />
                {/* control valve glyph on supply riser */}
                <rect x={x - 22} y={250} width={12} height={12} rx={2} fill="#0e1726" stroke="#283751" transform={`rotate(45 ${x - 16} 256)`} />
                {/* unit box */}
                <g onClick={() => setSel(b.id)} style={{ cursor: "pointer" }}>
                  <rect x={x - 56} y={UNIT_Y - 56} width={112} height={90} rx={9}
                    fill={isSel ? "#16243a" : "#111a28"} stroke={isSel ? "#4ea3e0" : "#283751"} strokeWidth={isSel ? 2.2 : 1.3} />
                  <text x={x} y={UNIT_Y - 38} textAnchor="middle" fontSize="11.5" fontWeight={700} fill="#f3f8fe">{b.name}</text>
                  <text x={x} y={UNIT_Y - 24} textAnchor="middle" fontSize="8.5" fill="#6a7588">{b.room}</text>
                  <rect x={x - 30} y={UNIT_Y - 17} width={60} height={20} rx={4} fill="#0a111d" stroke={kindColor + "66"} />
                  <text x={x} y={UNIT_Y - 3} textAnchor="middle" fontSize="11" fontFamily="ui-monospace" fill={kindColor}>{fmt(b.tons, 1)} ton</text>
                  <text x={x} y={UNIT_Y + 19} textAnchor="middle" fontSize="9.5" fontFamily="ui-monospace" fill="#aebcd0">
                    {fmt(b.ewt, 0)}→{fmt(b.lwt, 0)}°F · {fmt(b.gpm, 1)}gpm
                  </text>
                </g>
              </g>
            );
          })}

          <text x={620} y={528} textAnchor="middle" fontSize="11" fontFamily="ui-monospace" fill="#6a7588">
            pipe width ∝ flow · dashes animate with velocity · click a unit to edit · mode: {mode}
          </text>
        </svg>
        {/* map legend */}
        <div className="flex items-center gap-3 px-2 pt-1 text-[11px] text-txt2 font-mono">
          {mode === "flow" && <><span>velocity</span><Legend stops={VEL} lo="0" hi={`${fmt(vMax)} ft/s`} /></>}
          {mode === "heat" && <><span>temperature</span><Legend stops={TEMP} lo={`${fmt(tMin)}°F`} hi={`${fmt(tMax)}°F`} /></>}
          {mode === "pressure" && <><span>pressure</span><Legend stops={PRESS} lo="low" hi="high (pump)" /></>}
        </div>
      </div>

      {/* controls */}
      <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
        {/* Glycol module */}
        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wide text-dim flex items-center gap-1.5"><Beaker size={13} /> Glycol management</div>
            <div className="flex gap-1.5">
              {(["PG", "EG"] as const).map((g) => (
                <button key={g} onClick={() => setTop("glycolType", g)} className="rounded-md px-2 py-0.5 text-[11px] font-mono font-bold cursor-pointer"
                  style={{ border: `1px solid ${inp.glycolType === g ? "#4ea3e0" : "#283751"}`, background: inp.glycolType === g ? "#10202c" : "#0e1726", color: inp.glycolType === g ? "#4ea3e0" : "#9aa7bb" }}>{g}</button>
              ))}
            </div>
          </div>
          <Range label="Glycol Concentration (%)" value={inp.glycol} min={0} max={50} step={0.5} unit={`% ${inp.glycolType}`} accent="#b48ef0" onChange={(v) => setTop("glycol", v)} />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Mini label="Freeze point" v={`${fmt(R.freeze)} °F`} c={R.freeze > inp.supplyTempF - 30 ? "#ff5a5f" : "#4ea3e0"} icon={<Snowflake size={12} />} />
            <Mini label="Burst point" v={`${fmt(R.burst)} °F`} c="#b48ef0" />
            <Mini label="Density" v={`${fmt(R.rho, 1)} lb/ft³`} c="#aebcd0" />
            <Mini label="Viscosity" v={`${fmt(R.mu, 2)} cP`} c={R.muRatio > 1.05 ? "#f5a623" : "#aebcd0"} />
            <Mini label="Specific heat" v={`${fmt(R.cp, 3)} BTU/lb·°F`} c="#aebcd0" />
            <Mini label="Therm. cond." v={`${fmt(R.k, 3)} BTU/h·ft·°F`} c="#aebcd0" />
          </div>
          <div className="text-[10.5px] text-txt2 mt-2 leading-snug">
            Coil HTC {fmt(R.coilHTCRatio * 100, 0)}% of water · friction ×{fmt(R.frictionMult, 2)}. Glycol propagates to flow, pump power, ΔT and BTU above.
          </div>
        </div>

        {/* Loop parameters */}
        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="text-[11px] uppercase tracking-wide text-dim flex items-center gap-1.5 mb-2"><Waves size={13} /> Loop parameters</div>
          <Range label="Supply temp (EWT to units)" value={inp.supplyTempF} min={55} max={95} unit="°F" accent="#4ea3e0" onChange={(v) => setTop("supplyTempF", v)} />
          <Range label="Pump speed (affinity)" value={inp.pumpSpeed} min={40} max={110} unit="%" accent="#f5a623" onChange={(v) => setTop("pumpSpeed", v)} />
          <label className="block">
            <span className="text-[12px] text-lab">Pipe material (Hazen-Williams C)</span>
            <select value={inp.pipeC} onChange={(e) => setTop("pipeC", +e.target.value)}
              className="w-full mt-1 rounded-md border border-line bg-box text-ink font-mono text-[12px] px-2 py-1.5 cursor-pointer">
              {MATERIALS.map((m) => <option key={m.name} value={m.C}>{m.name} (C={m.C})</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Mini label="Return temp" v={`${fmt(R.loopRetT)} °F`} c="#ff5a5f" />
            <Mini label="3″ trunk vel." v={`${fmt(R.trunk3.v)} ft/s`} c={R.trunk3.v > 8 ? "#ff5a5f" : "#37d399"} />
            <Mini label="Pump head" v={`${fmt(R.totalHeadFt)} ft`} c="#aebcd0" />
            <Mini label="Head" v={`${fmt(R.headPsi)} psi`} c="#aebcd0" />
          </div>
        </div>

        {/* Selected unit */}
        <div className="rounded-xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wide text-dim flex items-center gap-1.5">
              {sb.kind === "wshp" ? <Gauge size={13} /> : <Snowflake size={13} />} {sb.name}
            </div>
            <span className="text-[10px] text-txt2 font-mono">{sb.room}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {EQUIP.map((e) => (
              <button key={e.id} onClick={() => setSel(e.id)} className="rounded-md px-2 py-0.5 text-[10px] font-mono cursor-pointer"
                style={{ border: `1px solid ${sel === e.id ? "#4ea3e0" : "#283751"}`, background: sel === e.id ? "#10202c" : "#0e1726", color: sel === e.id ? "#4ea3e0" : "#9aa7bb" }}>{e.id.replace("WSHP-", "")}</button>
            ))}
          </div>
          <Range label="Load" value={selU.load} min={0} max={100} unit="%" accent="#23b6a4" onChange={(v) => setU(sb.id, "load", v)} />
          <Range label="Water flow" value={selU.waterFlowPct} min={20} max={120} unit="%" accent="#4ea3e0" onChange={(v) => setU(sb.id, "waterFlowPct", v)} />
          <Range label="Fan speed" value={selU.fanPct} min={0} max={100} unit="%" accent="#9aa7bb" onChange={(v) => setU(sb.id, "fanPct", v)} />
          <Range label={sb.kind === "wshp" ? "COP" : "Compressor COP"} value={selU.cop} min={1} max={6} step={0.1} unit="" accent="#37d399" d={1} onChange={(v) => setU(sb.id, "cop", v)} />
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Mini label="EWT→LWT" v={`${fmt(sb.ewt, 0)}→${fmt(sb.lwt, 0)}°F`} c="#aebcd0" />
            <Mini label="ΔT" v={`${fmt(sb.dT)} °F`} c="#23b6a4" />
            <Mini label="Water" v={`${fmt(sb.gpm, 1)} gpm`} c="#4ea3e0" />
            <Mini label="Capacity" v={`${fmt(sb.tons)} ton`} c="#b48ef0" />
            <Mini label="Heat reject" v={`${f0(sb.heat)} BTU/h`} c="#f5a623" />
            <Mini label="EER" v={`${fmt(sb.eer, 1)}`} c="#37d399" />
            <Mini label="Reynolds" v={`${f0(sb.Re)}`} c="#aebcd0" />
            <Mini label="Velocity" v={`${fmt(sb.v)} ft/s`} c={sb.v > 8 ? "#ff5a5f" : "#37d399"} />
            <Mini label="Regime" v={sb.flow} c={sb.flow === "turbulent" ? "#37d399" : "#f5a623"} />
          </div>
          <div className="text-[10.5px] text-txt2 mt-2 leading-snug">
            Head loss: Darcy {fmt(sb.hlDarcy, 2)} ft · Hazen-Williams {fmt(sb.hlHazen, 2)} ft (branch, {sb.idIn}″ ID).
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-line text-[10.5px] text-dim font-mono leading-relaxed">
        Digital twin of the West End Cafeteria condenser-water loop tying into the existing East End 6″ GWS/GWR. Interconnected model — Darcy-Weisbach + Hazen-Williams head loss, pump affinity, energy balance (q=ṁ·cp·ΔT), glycol property curves (src/glycol.js). Pipe lengths assumed; capacities ≈ riser design GPM. Engine: src/twins/cwLoopModel.ts · see docs/Glycol_CW_Loop_Engineering.md.
      </div>
    </div>
  );
}

function Mini({ label, v, c, icon }: { label: string; v: string; c: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-box px-2 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wide text-dim flex items-center gap-1">{icon}{label}</div>
      <div className="font-mono text-[12.5px] font-bold" style={{ color: c }}>{v}</div>
    </div>
  );
}
function Legend({ stops, lo, hi }: { stops: [number, string][]; lo: string; hi: string }) {
  const g = `linear-gradient(90deg, ${stops.map((s) => `${s[1]} ${s[0] * 100}%`).join(", ")})`;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{lo}</span>
      <span className="inline-block rounded" style={{ width: 120, height: 9, background: g, border: "1px solid #283751" }} />
      <span>{hi}</span>
    </span>
  );
}
