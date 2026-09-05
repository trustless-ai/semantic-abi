// Real (not reference) invinoveritas adapter, run standalone: `node adapters/invinoveritas/demo.mjs`
// Requires python3 on PATH (stdlib only -- json, hashlib -- no pip installs needed).
import { run, PAIR, BACKEND } from "../../runner/src/evaluate.mjs";
import { invinoveritasAdapter } from "./adapter.mjs";
import { VECTORS } from "./vectors.mjs";

const { rows, witnesses, tally } = run(VECTORS, [invinoveritasAdapter]);

console.log("\n  invinoveritas adapter — signed_decision_commitment, real replay + live recompute\n");
console.log("  vector                     expected     observed     conformance");
console.log("  " + "-".repeat(68));
for (const r of rows) {
  console.log(
    `  ${r.vector.padEnd(26)} ${String(r.expected_pair).padEnd(12)} ${String(r.observed_pair).padEnd(12)} ${r.backend_conformance}`
  );
}
console.log(`\n  expected  · PRESERVED ${tally.expected_pair.PRESERVED}  VIOLATED ${tally.expected_pair.VIOLATED}  UNVERIFIABLE ${tally.expected_pair.UNVERIFIABLE}`);
console.log(`  observed  · PRESERVED ${tally.observed_pair.PRESERVED}  VIOLATED ${tally.observed_pair.VIOLATED}  UNVERIFIABLE ${tally.observed_pair.UNVERIFIABLE}`);
console.log(`  backends  · PASS ${tally.backend_conformance.PASS}  FAIL ${tally.backend_conformance.FAIL}  CANNOT_CHECK ${tally.backend_conformance.CANNOT_CHECK}`);

if (witnesses.length) {
  console.log(`\n  ${witnesses.length} collapse(s) caught:`);
  for (const w of witnesses) console.log(`  ✗ ${w.adapter} · ${w.vector}: ${w.minimal}`);
}

// Expected pattern: the pre-v18 replay MUST fail (that's the real historical bug, reproduced,
// not a bug in this adapter) -- post-v18 and the clean control must both pass.
const byId = Object.fromEntries(rows.map((r) => [r.vector, r]));
const expected =
  byId["invino-pre-v18-adversarial"]?.backend_conformance === BACKEND.FAIL &&
  byId["invino-post-v18-adversarial"]?.backend_conformance === BACKEND.PASS &&
  byId["invino-post-v18-clean"]?.backend_conformance === BACKEND.PASS;
console.log(
  expected
    ? "\n  Matches the expected pattern: the real pre-v18 collapse reproduces as a genuine FAIL, the real v18 fix and a clean control both PASS — independently recomputed, not asserted.\n"
    : "\n  Does NOT match the expected pattern — see rows above, something regressed.\n"
);
if (!expected) process.exitCode = 1;
