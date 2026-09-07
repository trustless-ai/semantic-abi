import test from "node:test";
import assert from "node:assert/strict";
import { oneinchAdapter } from "../../adapters/oneinch/adapter.mjs";
import { VECTORS } from "../../adapters/oneinch/vectors.mjs";
import { BACKEND, run } from "../src/evaluate.mjs";

test("1inch guard: relative-only collapses on requote, min-aware catches it", () => {
  const { rows } = run(VECTORS, [oneinchAdapter]);
  const b = Object.fromEntries(rows.map(r => [r.vector, r.backend_conformance]));
  assert.equal(b["oneinch-min-preserved"], BACKEND.PASS);        // control: not always-failing
  assert.equal(b["oneinch-requote-drop-collapse"], BACKEND.FAIL); // the gap: relative stands in for absolute
  assert.equal(b["oneinch-requote-drop-minaware"], BACKEND.PASS); // a min-aware guard closes it
});
