// semantic-abi — runnable demo. Zero dependencies: `node runner/demo.mjs`.
//   1. Semantic linker: valid edge + TYPE ERRORs, incl. a claim/scope-specific one
//      (recompute of one receipt does NOT establish semantic verification of another).
//   2. Two-level runner: oracle_pair / observed_pair / backend kept separate, reproducing
//      the pre-v18 collapse as oracle=VIOLATED, observed=PRESERVED, backend=FAIL + a witness.
import { linkEdge } from "./src/linker.mjs";
import { run } from "./src/evaluate.mjs";
import { goodBackend, collapsingBackend } from "./src/adapters.mjs";
import { VECTORS } from "./vectors/relations.mjs";

const line = (s = "") => console.log(s);
const rule = () => line("─".repeat(74));

line("\n  semantic-abi · demo — type-check MEANING, not bytes\n");

// ── 1. Semantic linker (claim- and scope-specific) ───────────────────────────
rule();
line("  1. SEMANTIC LINKER — authority transfers only for the SAME claim at the SAME scope");
rule();

const recompute = {
  component: "vertice./verify",
  establishes: { authority_class: "INDEPENDENT_RECOMPUTATION", claim_type: "agent_action", scope: "receipt:0xab12" },
  does_not_establish: [],
};
const attest = {
  component: "vertice.attestation",
  establishes: { authority_class: "INFRASTRUCTURE_ATTESTATION", claim_type: "agent_action", scope: "receipt:0xab12" },
  does_not_establish: ["SEMANTIC_VERIFICATION", "INDEPENDENT_RECOMPUTATION"],
};

const checks = [
  // recompute of receipt 0xab12 ⇒ semantic verification of the SAME receipt — valid
  [recompute, { authority_class: "SEMANTIC_VERIFICATION", claim_type: "agent_action", scope: "receipt:0xab12" }],
  // recompute of 0xab12 ⇒ semantic verification of a DIFFERENT receipt — TYPE ERROR (no global upgrade)
  [recompute, { authority_class: "SEMANTIC_VERIFICATION", claim_type: "agent_action", scope: "receipt:0xff99" }],
  // attestation ⇒ semantic verification — TYPE ERROR (attestation is not verification; disclaimed)
  [attest, { authority_class: "SEMANTIC_VERIFICATION", claim_type: "agent_action", scope: "receipt:0xab12" }],
];
for (const [producer, required] of checks) {
  const r = linkEdge(producer, required);
  if (r.valid) {
    line(`  ✓ ${producer.component}`);
    line(`      valid edge: ${r.edge}`);
  } else {
    line(`  ✗ ${producer.component}  —  TYPE ERROR (${r.counterexample.failed_on})`);
    line(`      ${r.counterexample.producer_establishes}  ⇏  ${r.counterexample.consumer_requires}`);
    line(`      ${r.counterexample.note}`);
  }
  line();
}

// ── 2. Two-level protected-relation runner ───────────────────────────────────
rule();
line("  2. RUNNER — oracle_pair · observed_pair · backend, kept separate (2 independent backends)");
rule();

const adapters = [
  goodBackend("vertice-gw"),
  collapsingBackend("invinoveritas@pre-v18", "signed_decision_commitment"), // replay of the real bug
  // horizon-shield (Toshikatsu) deferred to post-ETHOnline — see adapters/horizon-shield returns after the event
];

const { rows, witnesses, tally } = run(VECTORS, adapters);

const pad = (s, n) => String(s === null ? "—" : s).padEnd(n);
line(`  ${pad("vector", 13)}${pad("adapter", 24)}${pad("oracle", 13)}${pad("observed", 13)}backend`);
line(`  ${"-".repeat(70)}`);
for (const r of rows) {
  line(`  ${pad(r.vector, 13)}${pad(r.adapter, 24)}${pad(r.oracle_pair, 13)}${pad(r.observed_pair, 13)}${r.backend}`);
}

line();
line(`  pairs (oracle) · PRESERVED ${tally.PRESERVED}  VIOLATED ${tally.VIOLATED}  UNVERIFIABLE ${tally.UNVERIFIABLE}`);
line(`  backends       · PASS ${tally.PASS}  FAIL ${tally.FAIL}  CANNOT_CHECK ${tally.CANNOT_CHECK}`);

// ── 3. Witnesses ─────────────────────────────────────────────────────────────
line();
rule();
line(`  3. WITNESSES — ${witnesses.length} collapse(s) caught`);
rule();
for (const w of witnesses) {
  line(`  ✗ ${w.adapter} · ${w.relation} [${w.vector}]`);
  line(`      ${w.minimal}`);
}
line();
line("  A tampered fixture is oracle=VIOLATED; a correct backend observes VIOLATED and PASSes.");
line("  FAIL = observed differs from oracle (a real collapse). Three values, never merged.");
line("  Don't trust it — recompute it.\n");
