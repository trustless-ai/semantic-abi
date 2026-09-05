import test from "node:test";
import assert from "node:assert/strict";

import { invinoveritasAdapter } from "../../adapters/invinoveritas/adapter.mjs";
import { VECTORS } from "../../adapters/invinoveritas/vectors.mjs";
import { BACKEND, PAIR, run } from "../src/evaluate.mjs";

test("real Invino adapter preserves the expected/observed/conformance split", () => {
  const { rows } = run(VECTORS, [invinoveritasAdapter]);
  const byId = Object.fromEntries(rows.map((row) => [row.vector, row]));

  assert.deepEqual(
    {
      expected_pair: byId["invino-pre-v18-adversarial"].expected_pair,
      observed_pair: byId["invino-pre-v18-adversarial"].observed_pair,
      backend_conformance: byId["invino-pre-v18-adversarial"].backend_conformance,
    },
    {
      expected_pair: PAIR.VIOLATED,
      observed_pair: PAIR.PRESERVED,
      backend_conformance: BACKEND.FAIL,
    },
  );
  assert.deepEqual(
    {
      expected_pair: byId["invino-post-v18-adversarial"].expected_pair,
      observed_pair: byId["invino-post-v18-adversarial"].observed_pair,
      backend_conformance: byId["invino-post-v18-adversarial"].backend_conformance,
    },
    {
      expected_pair: PAIR.VIOLATED,
      observed_pair: PAIR.VIOLATED,
      backend_conformance: BACKEND.PASS,
    },
  );
  assert.deepEqual(
    {
      expected_pair: byId["invino-post-v18-clean"].expected_pair,
      observed_pair: byId["invino-post-v18-clean"].observed_pair,
      backend_conformance: byId["invino-post-v18-clean"].backend_conformance,
    },
    {
      expected_pair: PAIR.PRESERVED,
      observed_pair: PAIR.PRESERVED,
      backend_conformance: BACKEND.PASS,
    },
  );
});
