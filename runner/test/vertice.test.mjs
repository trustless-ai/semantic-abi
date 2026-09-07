import test from "node:test";
import assert from "node:assert/strict";

import { verticeAdapter, verifyMessages } from "../../adapters/vertice/adapter.mjs";
import { VECTORS, showcase } from "../../adapters/vertice/vectors.mjs";
import { keccak256 } from "../../adapters/vertice/vendor/keccak256.mjs";
import { BACKEND, PAIR, run } from "../src/evaluate.mjs";

test("vendored keccak256 reproduces known + real committed digests", () => {
  const enc = new TextEncoder();
  // canonical empty-string keccak (guards against a broken permutation)
  assert.equal(keccak256(enc.encode("")), "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  // the REAL committed digests from the vendored /verify record
  assert.equal(keccak256(enc.encode(showcase.query)).toLowerCase(), showcase.rawInputHash.toLowerCase());
  assert.equal(keccak256(enc.encode(showcase.reply)).toLowerCase(), showcase.outputHash.toLowerCase());
});

test("verifyMessages: real messages recompute to their committed digests (offline)", () => {
  const checks = verifyMessages(showcase);
  const offline = checks.filter((c) => c.scope === "offline");
  assert.ok(offline.length >= 2);
  for (const c of offline) assert.equal(c.status, "pass", `${c.id} should recompute to its committed digest`);
  // the two chain/sig checks must be labelled live, never silently passed
  assert.ok(checks.some((c) => c.id === "l4_signer" && c.status === "live"));
  assert.ok(checks.some((c) => c.id === "l3_anchor" && c.status === "live"));
});

test("authority_separation: real pair PASSes, collapse control FAILs", () => {
  const { rows } = run(VECTORS, [verticeAdapter]);
  const byId = Object.fromEntries(rows.map((row) => [row.vector, row]));

  assert.deepEqual(
    {
      expected_pair: byId["vertice-authsep-real"].expected_pair,
      observed_pair: byId["vertice-authsep-real"].observed_pair,
      backend_conformance: byId["vertice-authsep-real"].backend_conformance,
    },
    { expected_pair: PAIR.VIOLATED, observed_pair: PAIR.VIOLATED, backend_conformance: BACKEND.PASS },
  );

  assert.deepEqual(
    {
      expected_pair: byId["vertice-authsep-collapse-control"].expected_pair,
      observed_pair: byId["vertice-authsep-collapse-control"].observed_pair,
      backend_conformance: byId["vertice-authsep-collapse-control"].backend_conformance,
    },
    { expected_pair: PAIR.VIOLATED, observed_pair: PAIR.PRESERVED, backend_conformance: BACKEND.FAIL },
  );
});
