import { PAIR } from "../../runner/src/evaluate.mjs";

// REAL vectors (not synthetic) for the signed_decision_commitment relation, pinned against
// invinoveritas's own git history rather than a hypothetical example.
//
// CORRECTED (self-caught, see git log): oracle is the fixed, VERSION-INDEPENDENT ground truth
// about the fixture itself -- an adversarial pair (epistemic_basis genuinely differs) is ALWAYS
// oracle=VIOLATED, regardless of which code version processes it, because the underlying claim
// really is different both times. What changes across pre-v18/post-v18 is whether the backend
// correctly OBSERVES that violation -- that's what backend PASS/FAIL grades, not the oracle.
// A clean, non-adversarial pair (same epistemic_basis both sides, no tampering) is a separate
// control vector, oracle=PRESERVED.
//
// All three modes replayed by adapter.mjs -> vendor/invino_signed_decision_commitment.py, a
// vendored, hash-cited copy of the actual production compute_decision_ref (see that file's own
// provenance header). Full incident: services/proof_signing.py commit
// 56e5999d13dbcf4720a67a4a079123301f9d290e (private repo).
export const VECTORS = [
  { id: "invino-pre-v18-adversarial", relation: "signed_decision_commitment", oracle: PAIR.VIOLATED,
    mode: "pre_v18",
    fixture: "REAL historical replay, adversarial pair: two reject verdicts differing ONLY in evidence_against vs insufficient_evidence. Before v18, DECISION_REF_PREIMAGE_FIELDS didn't include epistemic_basis, so the backend can't observe the (real) distinction -- a shipped, git-verifiable collapse" },
  { id: "invino-post-v18-adversarial", relation: "signed_decision_commitment", oracle: PAIR.VIOLATED,
    mode: "post_v18",
    fixture: "REAL live recompute, same adversarial pair: v18 (commit 56e5999d, 2026-09-04) appended epistemic_basis as the preimage's final field -- the backend now correctly observes the distinction" },
  { id: "invino-post-v18-clean", relation: "signed_decision_commitment", oracle: PAIR.PRESERVED,
    mode: "post_v18_clean",
    fixture: "control: same epistemic_basis on both sides (no tampering) -- a correct backend must report these as consistent, proving it isn't just always reporting 'different' regardless of input" },
];
