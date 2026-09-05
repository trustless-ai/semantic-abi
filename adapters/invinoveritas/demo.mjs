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

// Expected pattern: the pre-v18 replay MUST fail (that's the real historical bug, reproduced,
// not a bug in this adapter) -- post-v18 and the clean control must both pass.
const byId = Object.fromEntries(rows.map((r) => [r.vector, r]));
const expected =
  byId["invino-pre-v18-adversarial"]?.backend === BACKEND.FAIL &&
  byId["invino-post-v18-adversarial"]?.backend === BACKEND.PASS &&
  byId["invino-post-v18-clean"]?.backend === BACKEND.PASS;
console.log(
  expected
    ? "\n  Matches the expected pattern: the real pre-v18 collapse reproduces as a genuine FAIL, the real v18 fix and a clean control both PASS — independently recomputed, not asserted.\n"
    : "\n  Does NOT match the expected pattern — see rows above, something regressed.\n"
);
