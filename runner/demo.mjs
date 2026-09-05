// semantic-abi — runnable demo. Zero dependencies: `node runner/demo.mjs`.
//   1. Claim-, authority-, scope-, and time-aware semantic linking.
//   2. Expected pair / observed pair / backend conformance kept explicit.
import { linkEdge } from "./src/linker.mjs";
import { run } from "./src/evaluate.mjs";
import { goodBackend, collapsingBackend } from "./src/adapters.mjs";
import { VECTORS } from "./vectors/relations.mjs";

const line = (s = "") => console.log(s);
const rule = () => line("─".repeat(72));

line("\n  semantic-abi · demo — type-check MEANING, not bytes\n");

// ── 1. Semantic linker ───────────────────────────────────────────────────────
rule();
line("  1. SEMANTIC LINKER — can this composition upgrade authority silently?");
rule();

const claim = (claim_type, authority_class, scope, temporal = { verification_time: "receipt.verified_at" }) =>
  ({ claim_type, authority_class, scope, ...temporal });
const boundary = (claim_type, authority_class, scope, reason) =>
  ({ claim_type, authority_class, scope, reason });

const actionScope = "action:demo-001/output";
const verticeVerify = {
  component: "vertice./verify",
  establishes: [claim("DETERMINISTIC_ACTION_RESULT", "INDEPENDENT_RECOMPUTATION", actionScope)],
  does_not_establish: [
    boundary("ACTION_SETTLED", "EX_POST_VALIDATION", actionScope, "recomputation is not settlement"),
  ],
};
const verticeAttest = {
  component: "vertice.attestation",
  establishes: [claim("ACTION_RECEIPT_AUTHENTIC", "INFRASTRUCTURE_ATTESTATION", actionScope,
    { issued_at: "receipt.issued_at" })],
  does_not_establish: [
    boundary("DETERMINISTIC_ACTION_RESULT", "SEMANTIC_VERIFICATION", actionScope,
      "an infrastructure attestation does not re-derive action semantics"),
  ],
};
const onchainAnchor = {
  component: "vertice.anchor@testnet",
  establishes: [claim("RECEIPT_DIGEST_COMMITTED", "ONCHAIN_COMMITMENT", actionScope,
    { issued_at: "anchor.block_time" })],
  does_not_establish: [
    boundary("ACTION_SETTLED", "EX_POST_VALIDATION", actionScope,
      "a testnet commitment is not economic settlement"),
  ],
};

const checks = [
  [verticeVerify, claim("DETERMINISTIC_ACTION_RESULT", "SEMANTIC_VERIFICATION", actionScope)],
  [verticeVerify, claim("NONDETERMINISTIC_JUDGMENT_CORRECT", "SEMANTIC_VERIFICATION", actionScope)],
  [verticeAttest, claim("DETERMINISTIC_ACTION_RESULT", "SEMANTIC_VERIFICATION", actionScope)],
  [onchainAnchor, claim("ACTION_SETTLED", "EX_POST_VALIDATION", actionScope,
    { issued_at: "anchor.block_time" })],
];
for (const [producer, required] of checks) {
  const result = linkEdge(producer, required);
  if (result.valid) {
    line(`  ✓ ${producer.component}  ⇒  requires ${required.claim_type} / ${required.authority_class}`);
    line(`      valid claim+authority+scope edge: ${required.scope}`);
  } else {
    line(`  ✗ ${producer.component}  ⇒  requires ${required.claim_type} / ${required.authority_class}`);
    line(`      TYPE ERROR — ${result.counterexample.reason}`);
    line(`      mismatched: ${result.counterexample.minimal_unsupported_semantic_upgrade.mismatched_dimensions.join(", ")}`);
  }
  line();
}

// ── 2. Two-level protected-relation runner ───────────────────────────────────
rule();
line("  2. RUNNER — expected pair × observed pair × backend conformance (2 independent backends)");
rule();

const adapters = [
  goodBackend("vertice-gw"),
  collapsingBackend("invinoveritas@pre-v18", "signed_decision_commitment"), // replay of the real bug
  // horizon-shield (Toshikatsu) deferred to post-ETHOnline — see adapters/horizon-shield returns after the event
];

const { rows, witnesses, tally } = run(VECTORS, adapters);

const pad = (s, n) => String(s).padEnd(n);
line(`  ${pad("vector", 14)}${pad("adapter", 24)}${pad("expected", 14)}${pad("observed", 14)}conformance`);
line(`  ${"-".repeat(88)}`);
for (const result of rows) {
  line(`  ${pad(result.vector, 14)}${pad(result.adapter, 24)}${pad(result.expected_pair, 14)}${pad(result.observed_pair, 14)}${result.backend_conformance}`);
}

line();
line(`  expected  · PRESERVED ${tally.expected_pair.PRESERVED}  VIOLATED ${tally.expected_pair.VIOLATED}  UNVERIFIABLE ${tally.expected_pair.UNVERIFIABLE}`);
line(`  observed  · PRESERVED ${tally.observed_pair.PRESERVED}  VIOLATED ${tally.observed_pair.VIOLATED}  UNVERIFIABLE ${tally.observed_pair.UNVERIFIABLE}`);
line(`  backends  · PASS ${tally.backend_conformance.PASS}  FAIL ${tally.backend_conformance.FAIL}  CANNOT_CHECK ${tally.backend_conformance.CANNOT_CHECK}`);

// ── 3. Witnesses (minimal counterexamples) ───────────────────────────────────
line();
rule();
line(`  3. WITNESSES — ${witnesses.length} collapse(s) caught`);
rule();
for (const witness of witnesses) {
  line(`  ✗ ${witness.adapter} · ${witness.relation} [${witness.vector}]`);
  line(`      ${witness.minimal}`);
}
line();
line("  Note: expected VIOLATED + observed VIOLATED means PASS. Expected VIOLATED +");
line("  observed PRESERVED means FAIL: the backend collapsed a real distinction. Oracle,");
line("  observation, and conformance stay explicit. Don't trust it — recompute it.\n");
