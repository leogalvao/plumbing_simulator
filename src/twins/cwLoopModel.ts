/* ==========================================================================
 *  cwLoopModel.ts — Interconnected hydronic + thermal model for the Stoddert ES
 *  West End Cafeteria condenser-water / geo-exchange loop (ties into the
 *  existing East End 6" GWS/GWR). Pure TypeScript; consumed by WestEndCwLoopTwin.
 *
 *  Methods: Darcy–Weisbach (Swamee–Jain f) + Hazen–Williams head loss, pump
 *  affinity, energy balance (q = ṁ·cp·ΔT), and glycol property curves from
 *  ../glycol.js. Every output is a function of the shared inputs, so changing one
 *  parameter propagates through the whole loop. See docs/Glycol_CW_Loop_Engineering.md.
 * ========================================================================== */
import { props as glProps, impacts as glImpacts, freezePointF, burstPointF } from "../glycol.js";

export type GType = "PG" | "EG";
export type Kind = "wshp" | "cooler" | "freezer";

export interface UnitInput { load: number; waterFlowPct: number; cop: number; fanPct: number; }
export interface ModelInputs {
  glycol: number; glycolType: GType;
  supplyTempF: number;   // GWS entering the cafeteria from the East End loop
  pumpSpeed: number;     // % (affinity) — scales total loop flow
  pipeC: number;         // Hazen–Williams roughness coefficient (material)
  units: Record<string, UnitInput>;
}

export interface Equip {
  id: string; name: string; room: string; kind: Kind;
  gpm: number; nomIn: number; tons: number; cop: number;
}

/* Equipment served by the cafeteria condenser-water loop (design GPM / pipe size
 * from M201B condenser-water riser; rated tons ≈ gpm / 3 gpm-per-ton). */
export const EQUIP: Equip[] = [
  { id: "WSHP-CA-01", name: "WSHP-CA-01", room: "Student Dining 1400", kind: "wshp", gpm: 18, nomIn: 2.0, tons: 6.0, cop: 4.5 },
  { id: "WSHP-CA-03", name: "WSHP-CA-03", room: "Kitchen 1410", kind: "wshp", gpm: 6.5, nomIn: 1.25, tons: 2.2, cop: 4.4 },
  { id: "WSHP-CA-02", name: "WSHP-CA-02", room: "Dry Food 1415", kind: "wshp", gpm: 1.5, nomIn: 0.75, tons: 0.5, cop: 4.3 },
  { id: "WSHP-CA-04", name: "WSHP-CA-04", room: "Chair Storage 1407", kind: "wshp", gpm: 1.5, nomIn: 0.75, tons: 0.5, cop: 4.3 },
  { id: "WIC", name: "Walk-in Cooler", room: "Cooler 1416-A · +35°F", kind: "cooler", gpm: 4.0, nomIn: 1.0, tons: 1.3, cop: 2.8 },
  { id: "WIF", name: "Walk-in Freezer", room: "Freezer 1416-B · −10°F", kind: "freezer", gpm: 5.5, nomIn: 1.0, tons: 1.8, cop: 1.8 },
];

export const MATERIALS: { name: string; C: number }[] = [
  { name: "Copper (Type L)", C: 140 },
  { name: "Steel (Sch 40)", C: 130 },
  { name: "HDPE", C: 150 },
  { name: "PVC", C: 150 },
];

/* Schedule-40 inside diameters (in) by nominal size. */
const ID: Record<number, number> = { 0.75: 0.824, 1: 1.049, 1.25: 1.38, 1.5: 1.61, 2: 2.067, 2.5: 2.469, 3: 3.068, 6: 6.065 };
const idOf = (nom: number) => ID[nom] ?? nom;

export function velocity(gpm: number, idIn: number): number {
  const Qcfs = gpm * 0.002228, A = (Math.PI / 4) * Math.pow(idIn / 12, 2);
  return A > 0 ? Qcfs / A : 0;
}
export function reynolds(v: number, idIn: number, rho: number, mu_cP: number): number {
  const mu = mu_cP * 6.7197e-4; // lb/(ft·s)
  return mu > 0 ? (rho * v * (idIn / 12)) / mu : 0;
}
function darcyF(Re: number, rr: number): number {
  if (Re < 2300) return 64 / Math.max(Re, 1);
  const x = rr / 3.7 + 5.74 / Math.pow(Re, 0.9);
  return 0.25 / Math.pow(Math.log10(x), 2);
}
/* Darcy–Weisbach head loss (ft). */
export function darcyHeadFt(gpm: number, idIn: number, Lft: number, rough: number, rho: number, mu_cP: number): number {
  if (gpm <= 0) return 0;
  const Dft = idIn / 12, v = velocity(gpm, idIn);
  const Re = reynolds(v, idIn, rho, mu_cP), f = darcyF(Re, rough / Dft);
  return (f * (Lft / Dft) * v * v) / (2 * 32.174);
}
/* Hazen–Williams head loss (ft): hf = 0.002083·L·(100/C)^1.852·gpm^1.852 / d_in^4.8655 */
export function hazenHeadFt(gpm: number, idIn: number, Lft: number, C: number): number {
  if (gpm <= 0) return 0;
  return 0.002083 * Lft * Math.pow(100 / C, 1.852) * Math.pow(gpm, 1.852) / Math.pow(idIn, 4.8655);
}

export interface BranchResult extends Equip {
  idIn: number; gpm: number; v: number; Re: number; flow: "laminar" | "transitional" | "turbulent";
  hlDarcy: number; hlHazen: number; tons: number; heat: number; dT: number; ewt: number; lwt: number;
  eer: number;
}
export interface LoopResult {
  branches: BranchResult[];
  totalGpm: number; totalHeat: number; tons: number;
  supplyTempF: number; loopRetT: number; loopDT: number;
  pumpHP: number; pumpKW: number; totalHeadFt: number; headPsi: number;
  trunk3: { gpm: number; v: number; Re: number; hl: number }; trunk6: { gpm: number; v: number; Re: number; hl: number };
  freeze: number; burst: number;
  rho: number; cp: number; mu: number; k: number;
  rhoRatio: number; cpRatio: number; muRatio: number; kRatio: number; coilHTCRatio: number; frictionMult: number;
  loopEff: number; // tons rejected per pump kW
}

export function computeLoop(I: ModelInputs): LoopResult {
  const Tavg = I.supplyTempF + 5;
  const p = glProps(I.glycolType, I.glycol, Tavg);
  const im = glImpacts(I.glycolType, I.glycol, Tavg);
  const rho = p.rho, cp = p.cp, mu = p.mu_cP, k = p.k;
  const heatF = 500 * p.rhoRatio * p.cpRatio; // 60·8.33·1.0 · ρ_r · cp_r
  const spd = I.pumpSpeed / 100;
  const capFactor = 0.9 + 0.1 * im.coilHTCRatio; // mild coil-HTC derate from glycol

  let totalGpm = 0, totalHeat = 0;
  const branches: BranchResult[] = EQUIP.map((e) => {
    const u = I.units[e.id] || { load: 75, waterFlowPct: 100, cop: e.cop, fanPct: 100 };
    const idIn = idOf(e.nomIn);
    const gpm = e.gpm * (u.waterFlowPct / 100) * spd;
    const v = velocity(gpm, idIn);
    const Re = reynolds(v, idIn, rho, mu);
    const flow = Re < 2300 ? "laminar" : Re < 4000 ? "transitional" : "turbulent";
    const hlDarcy = darcyHeadFt(gpm, idIn, 40, 0.00015, rho, mu);
    const hlHazen = hazenHeadFt(gpm, idIn, 40, I.pipeC);
    const fan = 0.85 + 0.15 * (u.fanPct / 100);
    const tons = e.tons * (u.load / 100) * capFactor * fan;
    const cop = Math.max(u.cop, 0.5);
    const heat = tons * 12000 * (1 + 1 / cop); // condenser heat rejected to the loop (BTU/hr)
    const dT = heat / Math.max(heatF * gpm, 1);
    const ewt = I.supplyTempF, lwt = ewt + dT;
    const eer = cop * 3.412;
    totalGpm += gpm; totalHeat += heat;
    return { ...e, idIn, gpm, v, Re, flow, hlDarcy, hlHazen, tons, heat, dT, ewt, lwt, cop, eer };
  });

  const t3v = velocity(totalGpm, idOf(3)), t6v = velocity(totalGpm, idOf(6));
  const trunk3 = { gpm: totalGpm, v: t3v, Re: reynolds(t3v, idOf(3), rho, mu), hl: darcyHeadFt(totalGpm, idOf(3), 60, 0.00015, rho, mu) };
  const trunk6 = { gpm: totalGpm, v: t6v, Re: reynolds(t6v, idOf(6), rho, mu), hl: darcyHeadFt(totalGpm, idOf(6), 80, 0.00015, rho, mu) };
  const worst = Math.max(0, ...branches.map((b) => b.hlDarcy));
  const totalHeadFt = trunk3.hl + trunk6.hl + worst + 12; // +equipment & valve losses
  const SG = rho / 62.4;
  const pumpHP = (totalGpm * totalHeadFt * SG) / (3960 * 0.70);
  const pumpKW = pumpHP * 0.746;
  const loopRetT = I.supplyTempF + totalHeat / Math.max(heatF * totalGpm, 1);
  const tons = totalHeat / 12000;
  return {
    branches, totalGpm, totalHeat, tons, supplyTempF: I.supplyTempF, loopRetT, loopDT: loopRetT - I.supplyTempF,
    pumpHP, pumpKW, totalHeadFt, headPsi: totalHeadFt * SG * 0.4335,
    trunk3, trunk6,
    freeze: freezePointF(I.glycolType, I.glycol), burst: burstPointF(I.glycolType, I.glycol),
    rho, cp, mu, k,
    rhoRatio: p.rhoRatio, cpRatio: p.cpRatio, muRatio: p.muRatio, kRatio: p.kRatio,
    coilHTCRatio: im.coilHTCRatio, frictionMult: im.frictionMult,
    loopEff: tons / Math.max(pumpKW, 0.001),
  };
}

export const DEFAULT_INPUTS: ModelInputs = {
  glycol: 10, glycolType: "PG", supplyTempF: 75, pumpSpeed: 100, pipeC: 140,
  units: Object.fromEntries(EQUIP.map((e) => [e.id, { load: 75, waterFlowPct: 100, cop: e.cop, fanPct: 100 }])),
};
