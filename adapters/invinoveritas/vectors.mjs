import { PAIR } from "../../runner/src/evaluate.mjs";

// REAL vectors (not synthetic) for the signed_decision_commitment relation, pinned against
// invinoveritas's own git history rather than a hypothetical "clean/tampered" pair. Both
// `mode` values are literally replayed by adapter.mjs -> vendor/invino_signed_decision_commitment.py,
// which computes real decision_refs via a vendored, hash-cited copy of the actual production
// compute_decision_ref (see that file's own provenance header). Full incident: services/proof_signing.py
// commit 56e5999d13dbcf4720a67a4a079123301f9d290e (private repo; the vendored copy here is the
// independently-runnable substitute, see README.md for how to double-check it).
export const VECTORS = [
  { id: "invino-pre-v18-replay", relation: "signed_decision_commitment", oracle: PAIR.VIOLATED,
    mode: "pre_v18",
    fixture: "REAL historical replay: before REVIEW_POLICY_VERSION v18, DECISION_REF_PREIMAGE_FIELDS did not include epistemic_basis -- two reject verdicts differing ONLY in evidence_against vs insufficient_evidence produced the IDENTICAL decision_ref (a shipped, git-verifiable bug, not a hypothetical)" },
  { id: "invino-post-v18-live", relation: "signed_decision_commitment", oracle: PAIR.PRESERVED,
    mode: "post_v18",
    fixture: "REAL live recompute: v18 (commit 56e5999d, 2026-09-04) appended epistemic_basis as the final preimage field -- the same two verdicts now produce distinct decision_refs" },
];
