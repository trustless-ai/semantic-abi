# adapter: invinoveritas

**Owner:** @babyblueviper1 (Fede) · authored independently — no shared checker with other adapters.

Thin wrapper over the real invinoveritas endpoints (`/review`, `/verify-proof`, `/ledger`, freshness beacon),
mapping their responses to the semantic manifest declarations in `../../schema/manifest-v0.md`.

**Flagship case:** signed decision commitment — `reject/evidence_against ≠ reject/insufficient_evidence`.
- **pre-v18**: replay against pinned historical evidence (the real collapse) → pair VIOLATED, backend FAIL.
- **post-v18**: independently reverified against the live surface → pair PRESERVED, backend PASS.

To wire once the manifest schema freezes.
