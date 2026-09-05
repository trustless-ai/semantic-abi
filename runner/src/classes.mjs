// Authority classes (v0-draft — to be frozen as a closed enum).
// See ../../schema/manifest-v0.md.
export const AUTHORITY_CLASSES = [
  "INDEPENDENT_JUDGMENT",
  "CRYPTOGRAPHIC_VERIFICATION",
  "EX_POST_VALIDATION",
  "INFRASTRUCTURE_ATTESTATION",
  "ONCHAIN_COMMITMENT",
  "INDEPENDENT_RECOMPUTATION",
  "KEY_BINDING_AUTHORITY",
  "SEMANTIC_VERIFICATION",
  "CONSENSUS_VALIDATED_HEADER",
  "STATE_INCLUSION",
  "NOT_BACKDATED",
  "ECONOMIC_SETTLEMENT",
];

// An Evidence TYPE is not just a class — it is (authority_class, claim_type, scope).
// Authority never transfers on the class alone; it transfers only for the SAME claim at the
// SAME scope. This is deliberate: a global "recompute ⇒ semantic-verification" edge would be
// the exact authority overclaim the linker exists to catch (Pavlo, before-freeze review).
//
// ev = { authority_class, claim_type, scope }
export function evidenceEq(a, b) {
  return a.authority_class === b.authority_class && a.claim_type === b.claim_type && a.scope === b.scope;
}

// Does `producer` (an Evidence type) satisfy what a consumer `required` (an Evidence type)?
// Returns { ok } or { ok:false, why } naming the dimension that failed.
export function satisfies(producer, required) {
  // 1. Exact same evidence type always satisfies.
  if (evidenceEq(producer, required)) return { ok: true };

  // 2. The ONLY cross-class upgrade, and it is claim- AND scope-scoped:
  //    recomputing claim C at scope S establishes semantic verification of claim C at scope S — nothing broader.
  if (
    producer.authority_class === "INDEPENDENT_RECOMPUTATION" &&
    required.authority_class === "SEMANTIC_VERIFICATION"
  ) {
    if (producer.claim_type !== required.claim_type) return { ok: false, why: "claim_type mismatch" };
    if (producer.scope !== required.scope) return { ok: false, why: "scope mismatch" };
    return { ok: true };
  }

  // 3. Everything else: no edge.
  if (producer.authority_class !== required.authority_class) return { ok: false, why: "authority_class mismatch" };
  if (producer.claim_type !== required.claim_type) return { ok: false, why: "claim_type mismatch" };
  return { ok: false, why: "scope mismatch" };
}
