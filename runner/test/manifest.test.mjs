import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateManifest } from "../src/manifest.mjs";
import { AUTHORITY_CLASSES } from "../src/classes.mjs";

const claim = {
  claim_type: "SIGNED_VERDICT_AUTHENTIC",
  authority_class: "CRYPTOGRAPHIC_VERIFICATION",
  scope: "verdict:event-id",
  verification_time: "verification.completed_at",
};

const manifest = () => ({
  component: "invinoveritas./verify-proof",
  author: "@babyblueviper1",
  declarations: [{
    endpoint: "/verify-proof",
    consumes: [{
      claim_type: "SIGNED_VERDICT",
      authority_class: "INDEPENDENT_JUDGMENT",
      scope: "verdict:event-id",
      issued_at: "proof.created_at",
    }],
    establishes: [{ ...claim }],
    does_not_establish: [{
      claim_type: "JUDGMENT_CORRECT",
      authority_class: "SEMANTIC_VERIFICATION",
      scope: "verdict:event-id",
      reason: "authenticity is not judgment correctness",
    }],
  }],
});

test("claim-level manifest is valid", () => {
  assert.deepEqual(validateManifest(manifest()), { valid: true, errors: [] });
});

test("schema/runtime rejects generic as_of", () => {
  const candidate = manifest();
  candidate.declarations[0].establishes[0].as_of = "now";
  delete candidate.declarations[0].establishes[0].verification_time;
  const result = validateManifest(candidate);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /unsupported field/);
});

test("schema/runtime rejects issued_at and verification_time on one claim", () => {
  const candidate = manifest();
  candidate.declarations[0].establishes[0].issued_at = "proof.created_at";
  const result = validateManifest(candidate);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /exactly one/);
});

test("schema/runtime rejects plain-string claim and negative-boundary aliases", () => {
  const candidate = manifest();
  candidate.declarations[0].consumes = ["SIGNED_VERDICT"];
  candidate.declarations[0].does_not_establish = ["SEMANTIC_VERIFICATION"];
  const result = validateManifest(candidate);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /claim object/);
  assert.match(result.errors.join("\n"), /negative claim-boundary object/);
});

test("JSON Schema encodes the same temporal and claim-level boundary", async () => {
  const schemaUrl = new URL("../../schema/manifest.schema.json", import.meta.url);
  const schema = JSON.parse(await readFile(schemaUrl, "utf8"));
  const declaration = schema.$defs.declaration;
  assert.equal(declaration.properties.consumes.type, "array");
  assert.equal(declaration.properties.establishes.type, "array");
  assert.equal(declaration.properties.does_not_establish.items.$ref,
    "#/$defs/negativeClaimBoundary");
  assert.equal(schema.$defs.evidenceClaim.additionalProperties, false);
  assert.equal(Object.hasOwn(schema.$defs.evidenceClaim.properties, "as_of"), false);
  assert.equal(schema.$defs.evidenceClaim.oneOf.length, 2);
});

test("claim names are not retained as authority-class aliases", () => {
  for (const claimName of ["STATE_INCLUSION", "NOT_BACKDATED", "ECONOMIC_SETTLEMENT"]) {
    assert.equal(AUTHORITY_CLASSES.includes(claimName), false);
  }
});

test("runtime rejects an undeclared authority class", () => {
  const candidate = manifest();
  candidate.declarations[0].establishes[0].authority_class = "STATE_INCLUSION";
  const result = validateManifest(candidate);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /authority-class enum/);
});

test("worked manifest examples conform to the claim-level runtime contract", async () => {
  const specUrl = new URL("../../schema/manifest-v0.md", import.meta.url);
  const spec = await readFile(specUrl, "utf8");
  const examples = [...spec.matchAll(/```json\n([\s\S]*?)```/g)].map((match) => JSON.parse(match[1]));
  assert.equal(examples.length, 2);
  for (const example of examples) {
    assert.deepEqual(validateManifest(example), { valid: true, errors: [] });
  }
});
