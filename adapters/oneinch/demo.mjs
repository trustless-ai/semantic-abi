// 1inch swap-guard adapter, standalone: `node adapters/oneinch/demo.mjs`. Zero deps.
// Shows a relative-slippage check silently standing in for the user's absolute minimum on a requote.
import { run, BACKEND } from "../../runner/src/evaluate.mjs";
import { oneinchAdapter, executableFloor } from "./adapter.mjs";
import { VECTORS } from "./vectors.mjs";

const { rows, witnesses } = run(VECTORS, [oneinchAdapter]);
console.log("\n  1inch swap-guard — relative slippage vs the user's absolute minimum (requote gap)\n");
console.log("  vector                              guard          expected     observed     conformance");
console.log("  " + "-".repeat(92));
for (const r of rows) {
  const v = VECTORS.find(x => x.id === r.vector);
  console.log(`  ${r.vector.padEnd(35)} ${(v.mode).padEnd(14)} ${String(r.expected_pair).padEnd(12)} ${String(r.observed_pair).padEnd(12)} ${r.backend_conformance}`);
}
const hit = VECTORS.find(v => v.id === "oneinch-requote-drop-collapse");
console.log(`\n  counterexample: user min ${hit.min_out}; quote ${hit.quotes[0].dstAmount} → requote ${hit.quotes[hit.quotes.length-1].dstAmount}; 1% floor = ${executableFloor(hit)} < ${hit.min_out}.`);
if (witnesses.length) { console.log(`\n  ${witnesses.length} collapse(s) caught:`); for (const w of witnesses) console.log(`  ✗ ${w.vector}: ${w.minimal}`); }

const byId = Object.fromEntries(rows.map(r => [r.vector, r]));
const ok = byId["oneinch-min-preserved"].backend_conformance === BACKEND.PASS
  && byId["oneinch-requote-drop-collapse"].backend_conformance === BACKEND.FAIL
  && byId["oneinch-requote-drop-minaware"].backend_conformance === BACKEND.PASS;
console.log(ok
  ? "\n  Expected pattern: relative-only guard collapses on the requote (FAIL); min-aware guard catches it (PASS); control passes. Recomputed, not asserted.\n  NOTE: quote numbers are REPRESENTATIVE until a real 1inch quote is dropped in (see vectors.mjs).\n"
  : "\n  Does NOT match the expected pattern — see rows.\n");
if (!ok) process.exitCode = 1;
