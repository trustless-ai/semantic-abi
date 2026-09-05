# runner

The protected-relation runner takes a set of manifests plus a vector and runs it through pluggable adapters.
It reports the oracle, observation, and grade separately:

- **expected pair** — `PRESERVED | VIOLATED | UNVERIFIABLE` (the vector oracle)
- **observed pair** — `PRESERVED | VIOLATED | UNVERIFIABLE` (the adapter observation)
- **backend conformance** — `PASS | FAIL | CANNOT_CHECK` (observation vs oracle)

On the first boundary where a backend collapses a protected relation, the runner emits a **minimal,
machine-checkable counterexample** (the witness).

For an adversarial pair with expected `VIOLATED`, a conforming backend reports observed `VIOLATED` and
earns `PASS`. A collapsing backend reports observed `PRESERVED` and earns `FAIL`. An unavailable backend
reports observed `UNVERIFIABLE` and receives `CANNOT_CHECK`.

## Run it (zero dependencies)
```
node runner/demo.mjs
```
Shows: (1) the semantic linker checking claim + authority + scope + temporal identity and rejecting
unsupported upgrades; (2) the runner across three independent adapters, reproducing the historical
signed-commitment collapse (`invinoveritas@pre-v18`) as expected `VIOLATED`, observed `PRESERVED`, `FAIL`.

## Working now
- ✅ `src/classes.mjs` — authority-class vocabulary without global coercions
- ✅ `src/linker.mjs` — claim/authority/scope/time edge checking | TYPE ERROR + counterexample
- ✅ `src/evaluate.mjs` — expected pair × observed pair × backend conformance + witness/tallies
- ✅ `src/manifest.mjs` — zero-dependency fail-closed manifest-shape validator
- ✅ `src/adapters.mjs` — reference adapters (good / collapsing / pending)
- ✅ `vectors/relations.mjs` — vectors pinning expected pair outcomes for the 3 relations
- ✅ `demo.mjs` — end-to-end runnable

## Next (ETHOnline)
- [ ] general JSON-Schema loader (the runner already enforces the v0 shape without dependencies)
- [ ] real per-owner adapters reading live/replay endpoints (`../adapters/*`) — no shared checker
- [ ] pin the pre-v18 replay evidence
- [ ] freeze the authority-class enum
- [x] generic temporal alias removed — use exactly one of `issued_at` or `verification_time` per claim; see `../schema/manifest-v0.md` (commit 7ef8761)
