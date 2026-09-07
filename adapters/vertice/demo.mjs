// Real (not reference stand-in) Vértice adapter, run standalone: `node adapters/vertice/demo.mjs`
// Grounded on the real attestation behind ai.verticecriativo.pt/verify (vendored hash-cited).
// Offline + zero dependencies (Node stdlib + a vendored, self-tested keccak256).
import { run, BACKEND } from "../../runner/src/evaluate.mjs";
import { verticeAdapter, verifyMessages } from "./adapter.mjs";
import { VECTORS, showcase } from "./vectors.mjs";

console.log(`\n  vertice adapter — recomputing the real /verify record: ${showcase.ens} #${showcase.agentId}\n`);

// 1. The /verify message recompute (offline), against the real committed digests.
console.log("  message recompute (ai.verticecriativo.pt/verify)");
console.log("  " + "-".repeat(78));
const checks = verifyMessages(showcase);
for (const c of checks) {
  const mark = c.status === "pass" ? "✓" : c.status === "fail" ? "✗" : "·";
  const detail = c.scope === "offline" ? `${c.got.slice(0, 18)}… vs ${c.expected.slice(0, 18)}…` : c.note;
  console.log(`  ${mark} [${c.scope}] ${c.id.padEnd(15)} ${c.recipe.padEnd(42)} ${c.status === "pass" ? "MATCH" : c.status === "fail" ? "MISMATCH" : detail}`);
}

// 2. authority_separation through the shared runner.
console.log("\n  authority_separation (protected-relation runner)");
console.log("  " + "-".repeat(78));
const { rows, witnesses } = run(VECTORS, [verticeAdapter]);
for (const r of rows) {
  console.log(`  ${r.vector.padEnd(34)} expected ${String(r.expected_pair).padEnd(10)} observed ${String(r.observed_pair).padEnd(10)} ${r.backend_conformance}`);
}
if (witnesses.length) {
  console.log(`\n  ${witnesses.length} collapse control(s) caught:`);
  for (const w of witnesses) console.log(`  ✗ ${w.vector}: ${w.minimal}`);
}

// Expected pattern: both offline message hashes MATCH the real record; the real authority-separation
// vector PASSes; the deliberate collapse control FAILs (proving the check can fail). Recomputed here.
const offlineOk = checks.filter((c) => c.scope === "offline").every((c) => c.status === "pass");
const byId = Object.fromEntries(rows.map((r) => [r.vector, r]));
const ok =
  offlineOk &&
  byId["vertice-authsep-real"]?.backend_conformance === BACKEND.PASS &&
  byId["vertice-authsep-collapse-control"]?.backend_conformance === BACKEND.FAIL;
console.log(
  ok
    ? "\n  Matches the expected pattern: the real messages recompute to their committed digests, authority separation holds, and the collapse control fails — recomputed offline, not asserted. (L4 signer + L3 anchor are live-only, shown above.)\n"
    : "\n  Does NOT match the expected pattern — see above, something regressed.\n"
);
if (!ok) process.exitCode = 1;
