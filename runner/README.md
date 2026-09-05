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

## Run it (zero dependencies)
```
node runner/demo.mjs
```
Shows: (1) the semantic linker passing a valid edge and throwing two meaning-level TYPE ERRORs with
counterexamples; (2) the two-level runner across three independent adapters, reproducing a real
signed-commitment collapse (`invinoveritas@pre-v18`) as a single backend FAIL + a minimal witness — while
every tampered fixture correctly reads *pair VIOLATED, backend PASS* on conforming adapters.

## Working now
- ✅ `src/classes.mjs` — authority classes + satisfy-closure
- ✅ `src/linker.mjs` — `producer.establishes ⊇ consumer.requires` → edge | TYPE ERROR + counterexample
- ✅ `src/evaluate.mjs` — two-level evaluator (pair × backend) + witness emitter + tallies
- ✅ `src/adapters.mjs` — reference adapters (good / collapsing / pending)
- ✅ `vectors/relations.mjs` — vectors pinning expected pair outcomes for the 3 relations
- ✅ `demo.mjs` — end-to-end runnable

## Next (ETHOnline)
- [ ] manifest loader + JSON-Schema validation against `../schema/manifest.schema.json`
- [ ] real per-owner adapters reading live/replay endpoints (`../adapters/*`) — no shared checker
- [ ] pin the pre-v18 replay evidence
- [ ] freeze the authority-class enum + resolve `as_of`
