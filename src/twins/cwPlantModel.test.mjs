/* Head-less calibration check for the CW / Geo-Exchange plant model.
 * Run:  node src/twins/cwPlantModel.test.mjs
 * Prints the Real vs Sim vs Variance table at the 2025-11-21 capture and
 * exits non-zero if any point is outside its acceptance tolerance. */
import { BASE, CAPTURE, buildComparison, computeState, wetBulbF, CONSTANTS } from "./cwPlantModel.js";

const rows = buildComparison(BASE);

const pad = (s, n, right = false) => (right ? String(s).padStart(n) : String(s).padEnd(n));
console.log("\nStoddert ES · CW/Geo-Exchange — calibration @ 2025-11-21 capture");
console.log("OA-T 75.1°F · OA-H 73.2%RH · Geo ST 80.6°F · P1 100% · P2 off · P3 65% · P4 100% · CV-1-1/1-2 0% · CV-5 2.7%\n");
console.log(`ambient wet-bulb = ${wetBulbF(BASE.oat, BASE.oah).toFixed(1)}°F · fitted LWT_WB_OFFSET = ${CONSTANTS.LWT_WB_OFFSET.toFixed(2)}°F\n`);

console.log(pad("Point", 18) + pad("Real", 9, true) + pad("Sim", 9, true) + pad("Var", 9, true) + pad("Tol", 8, true) + "  ok");
console.log("-".repeat(62));
let allPass = true;
for (const r of rows) {
  allPass = allPass && r.pass;
  console.log(
    pad(r.label, 18) +
    pad(r.real.toFixed(1), 9, true) +
    pad(r.sim.toFixed(1), 9, true) +
    pad((r.variance >= 0 ? "+" : "") + r.variance.toFixed(1), 9, true) +
    pad(r.tolText, 8, true) +
    "  " + (r.pass ? "ok" : "FAIL")
  );
}

/* Structural / directional checks for the topology fixes. */
const checks = [];
const at = (o) => computeState({ ...BASE, ...o });
const cap = at({});

// P3 (lead/lag) throttling must LOWER GWS (geo-pump driven).
checks.push(["GWS rises when P3 100% vs 65%", at({ p3: 100 }).GWS > cap.GWS + 5]);
checks.push(["GWS falls when P3 off", at({ p3on: false }).GWS < cap.GWS - 50]);
// Building pumps must NOT drive GWS.
checks.push(["GWS unchanged when P1 drops to 50%", Math.abs(at({ p1: 50 }).GWS - cap.GWS) < 0.5]);
// Building flow / DP driven by P1/P2.
checks.push(["Building flow falls when P1 50%", at({ p1: 50 }).bldgFlow < cap.bldgFlow - 10]);
checks.push(["New DP falls when P1 50%", at({ p1: 50 }).NewDP < cap.NewDP - 5]);
// P2 parallel: turning P2 on (lag) raises building flow; P2 off carries zero.
checks.push(["P2 off branch carries 0 GPM", cap.P2.q === 0]);
checks.push(["Building flow rises when P2 added @100%", at({ p2: 100, p2on: true }).bldgFlow > cap.bldgFlow + 50]);
// Bypass DIVERTS (closing does not inflate GWS; opening reduces measured GWS).
checks.push(["Opening bypass reduces GWS (divert)", at({ cv11: 100, cv12: 100 }).GWS < cap.GWS]);
checks.push(["Closed bypass holds ~671 GPM", Math.abs(cap.GWS - 670.9) < 670.9 * 0.05]);
// Wet-bulb free cooling: LWT responds to OA-H.
checks.push(["LWT rises with higher OA-H (wet-bulb)", at({ oah: 90 }).LWT > cap.LWT + 0.5]);
checks.push(["EWT = LWT + loop ΔT", Math.abs(cap.EWT - (cap.LWT + cap.dtAccu)) < 0.2 || cap.EWT === BASE.cv5tempSP]);

console.log("\nTopology / directional checks");
console.log("-".repeat(62));
let allChecks = true;
for (const [label, ok] of checks) {
  allChecks = allChecks && ok;
  console.log("  " + (ok ? "ok  " : "FAIL") + "  " + label);
}

const ok = allPass && allChecks;
console.log("\n" + (ok ? "PASS — all calibration points and topology checks within tolerance" : "FAIL — see rows above"));
process.exit(ok ? 0 : 1);
