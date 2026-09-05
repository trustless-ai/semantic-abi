// semantic-abi — runnable demo. Zero dependencies: `node runner/demo.mjs`.
//   1. Semantic linker: a valid edge + a meaning-level TYPE ERROR (+ counterexample).
//   2. Two-level runner: pair outcome × backend conformance across independent adapters,
//      reproducing a real relation collapse as a minimal witness.
import { linkEdge } from "./src/linker.mjs";
import { run } from "./src/evaluate.mjs";
import { goodBackend, collapsingBackend, pendingBackend } from "./src/adapters.mjs";
import { VECTORS } from "./vectors/relations.mjs";

const line = (s = "") => console.log(s);
const rule = () => line("─".repeat(72));

line("\n  semantic-abi · demo — type-check MEANING, not bytes\n");

// ── 1. Semantic linker ───────────────────────────────────────────────────────
rule();
line("  1. SEMANTIC LINKER — can this composition upgrade authority silently?");
rule();

const verticeVerify = { component: "vertice./verify", establishes: "INDEPENDENT_RECOMPUTATION",
  does_not_establish: ["ECONOMIC_SETTLEMENT"] };
const verticeAttest = { component: "vertice.attestation", establishes: "INFRASTRUCTURE_ATTESTATION",
  does_not_establish: ["SEMANTIC_VERIFICATION", "INDEPENDENT_RECOMPUTATION", "OUTCOME_SETTLEMENT"] };
const onchainAnchor = { component: "vertice.anchor@testnet", establishes: "ONCHAIN_COMMITMENT",
  does_not_establish: ["ECONOMIC_SETTLEMENT", "SEMANTIC_VERIFICATION"] };

const checks = [
  [verticeVerify, "SEMANTIC_VERIFICATION"],   // valid — recomputation establishes it
  [verticeAttest, "SEMANTIC_VERIFICATION"],   // TYPE ERROR — attestation is not verification
  [onchainAnchor, "ECONOMIC_SETTLEMENT"],     // TYPE ERROR — testnet anchor is not settlement
];
for (const [producer, required] of checks) {
  const r = linkEdge(producer, required);
  if (r.valid) {
    line(`  ✓ ${producer.component}  ⇒  requires ${required}`);
    line(`      valid edge: ${r.edge}`);
  } else {
    line(`  ✗ ${producer.component}  ⇒  requires ${required}`);
    line(`      TYPE ERROR — ${r.counterexample.reason}`);
    line(`      counterexample: ${r.counterexample.note}`);
  }
  line();
}

// ── 2. Two-level protected-relation runner ───────────────────────────────────
rule();
line("  2. RUNNER — pair outcome × backend conformance (three independent backends)");
rule();

const adapters = [
  goodBackend("vertice-gw"),
  collapsingBackend("invinoveritas@pre-v18", "signed_decision_commitment"), // replay of the real bug
  pendingBackend("horizon-shield"),
];

const { rows, witnesses, tally } = run(VECTORS, adapters);

const pad = (s, n) => String(s).padEnd(n);
line(`  ${pad("vector", 14)}${pad("adapter", 24)}${pad("pair", 14)}backend`);
line(`  ${"-".repeat(66)}`);
for (const r of rows) {
  line(`  ${pad(r.vector, 14)}${pad(r.adapter, 24)}${pad(r.pair, 14)}${r.backend}`);
}

line();
line(`  pairs     · PRESERVED ${tally.PRESERVED}  VIOLATED ${tally.VIOLATED}  UNVERIFIABLE ${tally.UNVERIFIABLE}`);
line(`  backends  · PASS ${tally.PASS}  FAIL ${tally.FAIL}  CANNOT_CHECK ${tally.CANNOT_CHECK}`);

// ── 3. Witnesses (minimal counterexamples) ───────────────────────────────────
line();
rule();
line(`  3. WITNESSES — ${witnesses.length} collapse(s) caught`);
rule();
for (const w of witnesses) {
  line(`  ✗ ${w.adapter} · ${w.relation} [${w.vector}]`);
  line(`      ${w.minimal}`);
}
line();
line("  Note: a tampered fixture is VIOLATED at the pair level, yet a correct backend still");
line("  PASSes because it detected it. FAIL means a real distinction was collapsed. Two levels,");
line("  never merged. Don't trust it — recompute it.\n");
