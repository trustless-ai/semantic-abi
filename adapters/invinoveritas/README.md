# adapter: invinoveritas

**Owner:** @babyblueviper1 (Fede) · authored independently — no shared checker with other adapters.

Thin wrapper over the real invinoveritas endpoints (`/review`, `/verify-proof`, `/ledger`, freshness beacon),
mapping their responses to the semantic manifest declarations in `../../schema/manifest-v0.md`.

**Flagship case:** signed decision commitment — `reject/evidence_against ≠ reject/insufficient_evidence`.
- **pre-v18 adversarial pair**: expected `VIOLATED`; the historical commitment observes `PRESERVED` because
  it collapses the two epistemic bases; backend conformance is `FAIL`.
- **post-v18 adversarial pair**: expected `VIOLATED`; the commitment observes `VIOLATED` because
  `epistemic_basis` is authenticated; backend conformance is `PASS`.

The protected pair remains violated in both comparisons. What changes at v18 is the backend observation:
the repaired backend detects the distinction. A clean, unchanged control pair is separately `PRESERVED`.

**Wired.** `adapter.mjs`/`vectors.mjs`/`demo.mjs`/`vendor/` are real, not placeholders — run
`node adapters/invinoveritas/demo.mjs` (needs `python3` on PATH, stdlib only). Ported to this
branch's `expected_pair`/`observed_pair`/`backend_conformance` field names — 17/17 suite + both
demos pass here.
