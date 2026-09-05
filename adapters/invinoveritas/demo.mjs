// Real (not reference) invinoveritas adapter, run standalone: `node adapters/invinoveritas/demo.mjs`
// Requires python3 on PATH (stdlib only -- json, hashlib -- no pip installs needed).
import { run, PAIR, BACKEND } from "../../runner/src/evaluate.mjs";
import { invinoveritasAdapter } from "./adapter.mjs";
import { VECTORS } from "./vectors.mjs";

const { rows, witnesses, tally } = run(VECTORS, [invinoveritasAdapter]);

console.log("\n  invinoveritas adapter — signed_decision_commitment, real replay + live recompute\n");
console.log("  vector                     oracle       observed     backend");
console.log("  " + "-".repeat(68));
for (const r of rows) {
  console.log(
    `  ${r.vector.padEnd(26)} ${String(r.oracle_pair).padEnd(12)} ${String(r.observed_pair).padEnd(12)} ${r.backend}`
  );
}
console.log(`\n  pairs (oracle) · PRESERVED ${tally.PRESERVED}  VIOLATED ${tally.VIOLATED}  UNVERIFIABLE ${tally.UNVERIFIABLE}`);
console.log(`  backends       · PASS ${tally.PASS}  FAIL ${tally.FAIL}  CANNOT_CHECK ${tally.CANNOT_CHECK}`);

if (witnesses.length) {
  console.log(`\n  ${witnesses.length} collapse(s) caught:`);
  for (const w of witnesses) console.log(`  ✗ ${w.adapter} · ${w.vector}: ${w.minimal}`);
}

const wantPass = rows.every((r) => r.backend === BACKEND.PASS);
console.log(
  wantPass
    ? "\n  Both vectors PASS: the real pre-v18 collapse replays as VIOLATED, the real v18 fix replays as PRESERVED — independently recomputed, not asserted.\n"
    : "\n  Unexpected result — see rows above.\n"
);
