import test from "node:test";
import assert from "node:assert/strict";

import { BACKEND, PAIR, evaluate, run } from "../src/evaluate.mjs";
import { collapsingBackend, goodBackend, pendingBackend } from "../src/adapters.mjs";

const adversarial = {
  id: "invino-epistemic-pair",
  relation: "signed_decision_commitment",
  oracle: PAIR.VIOLATED,
};

test("pre-v18 keeps expected VIOLATED separate from observed PRESERVED and FAIL", () => {
  const result = evaluate(adversarial, collapsingBackend("invinoveritas@pre-v18", adversarial.relation));
  assert.equal(result.expected_pair, PAIR.VIOLATED);
  assert.equal(result.observed_pair, PAIR.PRESERVED);
  assert.equal(result.backend_conformance, BACKEND.FAIL);
  assert.equal(result.witness.expected_pair, PAIR.VIOLATED);
  assert.equal(result.witness.observed_pair, PAIR.PRESERVED);
  assert.equal("pair" in result, false);
  assert.equal("backend" in result, false);
});

test("post-v18 detects the adversarial pair: VIOLATED, VIOLATED, PASS", () => {
  const result = evaluate(adversarial, goodBackend("invinoveritas@v18"));
  assert.equal(result.expected_pair, PAIR.VIOLATED);
  assert.equal(result.observed_pair, PAIR.VIOLATED);
  assert.equal(result.backend_conformance, BACKEND.PASS);
});

test("unavailable backend is VIOLATED, UNVERIFIABLE, CANNOT_CHECK", () => {
  const result = evaluate(adversarial, pendingBackend("pending"));
  assert.equal(result.expected_pair, PAIR.VIOLATED);
  assert.equal(result.observed_pair, PAIR.UNVERIFIABLE);
  assert.equal(result.backend_conformance, BACKEND.CANNOT_CHECK);
});

test("run tallies expected, observed, and conformance independently", () => {
  const result = run([adversarial], [
    goodBackend("v18"),
    collapsingBackend("pre-v18", adversarial.relation),
    pendingBackend("pending"),
  ]);
  assert.deepEqual(result.tally.expected_pair, { PRESERVED: 0, VIOLATED: 3, UNVERIFIABLE: 0 });
  assert.deepEqual(result.tally.observed_pair, { PRESERVED: 1, VIOLATED: 1, UNVERIFIABLE: 1 });
  assert.deepEqual(result.tally.backend_conformance, { PASS: 1, FAIL: 1, CANNOT_CHECK: 1 });
});
