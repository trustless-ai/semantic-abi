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

// What each authority class SATISFIES (its closure). Default: only itself.
// The one deliberate edge: re-deriving a result yourself DOES establish semantic verification
// of the recomputable claim — attestation/commitment/proof do NOT. That asymmetry is the point.
export const SATISFIES = {
  INDEPENDENT_RECOMPUTATION: ["INDEPENDENT_RECOMPUTATION", "SEMANTIC_VERIFICATION"],
};

export function satisfies(cls) {
  return SATISFIES[cls] || [cls];
}
