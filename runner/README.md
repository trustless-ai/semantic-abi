# runner

The protected-relation runner. Takes a set of manifests + a vector (a fixture pinning an expected **pair
outcome**), runs it through pluggable adapters, and reports **two levels, kept separate**:

- **pair outcome** — `PRESERVED | VIOLATED | UNVERIFIABLE` (what the evidence pair did)
- **backend conformance** — `PASS | FAIL | CANNOT_CHECK` (observed pair outcome vs the pinned oracle)

On the first boundary where a backend collapses a protected relation, the runner emits a **minimal,
machine-checkable counterexample** (the witness).

A tampered input must yield **pair VIOLATED + backend PASS** (the backend detected it). Backend **FAIL** is
reserved for a genuine collapse. Never conflate the two — collapsing them is the defect this tool exists to
find.

## Status
Stub. To build during ETHOnline:
- [ ] manifest loader + JSON-Schema validation (`../schema/manifest.schema.json`)
- [ ] semantic linker: `producer.establishes ⊇ consumer.requires` → edge | TYPE ERROR + counterexample
- [ ] vector format (fixture + pinned expected pair outcome)
- [ ] adapter interface (live + replay)
- [ ] witness / counterexample emitter
- [ ] two-level reporter
