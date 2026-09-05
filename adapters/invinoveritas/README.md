# adapter: invinoveritas

**Owner:** @babyblueviper1 (Fede) · authored independently — no shared checker with other adapters.

**Status: wired, ahead of the manifest schema freeze.** `adapter.mjs` is a real adapter, not a
reference stand-in — `observe()` shells out to `vendor/invino_signed_decision_commitment.py` and
independently derives the pair outcome from an actual computed sha256, never from the vector's own
oracle. Run it standalone: `node adapters/invinoveritas/demo.mjs` (needs `python3` on PATH, stdlib
only, no pip installs).

**Flagship case:** signed decision commitment — `reject/evidence_against ≠ reject/insufficient_evidence`.
A real, shipped, git-verifiable bug: before `REVIEW_POLICY_VERSION` v18, invinoveritas's
`decision_ref` (the content-addressed pre-execution decision id) did not bind `epistemic_basis`
into its preimage — two REJECT verdicts differing *only* in whether the reject came from a real
deterministic finding (`evidence_against`) or from mere below-floor confidence
(`insufficient_evidence`) produced the *identical* `decision_ref`. v18 (commit
`56e5999d13dbcf4720a67a4a079123301f9d290e`) fixed it by appending `epistemic_basis` as the
preimage's final field.

- **pre-v18 replay** (`invino-pre-v18-replay`): the same two verdicts run through the
  pre-v18 preimage shape → `oracle VIOLATED, observed VIOLATED, backend PASS` — the real historical
  collapse, independently reconfirmed, not just asserted.
- **post-v18 live** (`invino-post-v18-live`): the same two verdicts run through the current
  preimage shape → `oracle PRESERVED, observed PRESERVED, backend PASS` — the fix genuinely holds.

`backend PASS` on both is the point: the adapter's own recompute mechanism honestly detects the
real historical failure *and* confirms the real fix, matching this repo's own rule (a tampered/bad
case must read `pair VIOLATED, backend PASS` — `backend FAIL` is reserved for a checker that itself
collapses the distinction, which this one does not).

**Provenance note (read `vendor/invino_signed_decision_commitment.py`'s own header first):** the
vendored `compute_decision_ref` + `DECISION_REF_PREIMAGE_FIELDS` are a verbatim, hash-cited copy of
the real production functions in invinoveritas's private repo (not network-fetchable, unlike the
`nenrin_ring_reimpl` adapter case) — a hash citation is the honest substitute for a live import
here, not a claim of live equivalence beyond what that citation can verify.

**Not yet wired:** `/review`, `/verify-proof`, `/ledger`, and the freshness beacon endpoints
(`authority_separation`, `proof_vs_header_authority` relations) — this pass covers the
`signed_decision_commitment` flagship case only, since that's the one with a real, git-verifiable
before/after to replay. Those three remain real future work, not placeholders left in by mistake.
