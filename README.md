# semantic-abi

**A semantic type system for composing Ethereum verification.**

Ethereum has an ABI for how contracts compose at the **byte / execution** level. There is no equivalent
for what one protocol's *evidence is allowed to mean* when another protocol consumes it. A commitment, an
attestation, a state proof, and an independent recomputation can each return `true` and still carry
completely different authority. Today those distinctions live in prose and implementation discipline.

`semantic-abi` makes them machine-readable and testable — so a composition can't silently upgrade what its
evidence proves.

> Ethereum catches byte-level type errors when contracts compose. This catches **meaning-level** type errors
> when verification protocols compose.

Built at **ETHOnline 2026** (from-scratch track) by the trustless-ai working group. CC0 spec, Apache-2.0 code.

---

## The two levels (kept strictly separate)

Every evaluation reports two independent results — collapsing them is the exact defect this project detects:

- **pair outcome** — `PRESERVED | VIOLATED | UNVERIFIABLE` — what the tested evidence *pair* did.
- **backend conformance** — `PASS | FAIL | CANNOT_CHECK` — whether the *system under test* did its job.

A tampered proof → **pair VIOLATED**, backend **PASS** (it correctly detected the violation). Backend
**FAIL** only when a real distinction is *collapsed*. Each vector pins an expected pair outcome (the oracle);
conformance is observed-vs-oracle, backed by a reproducible **witness / minimal counterexample**.

## Semantic manifests

Each protocol/endpoint/adapter declares what it means:

```
Evidence< claim_type, authority_class, scope, as_of >

consumes:            ...
establishes:         exactly one authority class
does_not_establish:  the classes it explicitly disclaims   ← the field that makes a TYPE ERROR possible
authority_class:     ...
```

A **semantic linker** checks a composition: `producer.establishes ⊇ consumer.requires` → valid edge; else a
meaning-level **TYPE ERROR** + counterexample (the implicit authority upgrade, caught).

Pipeline: `manifests → typed relation graph → linker → live/replay adapters → protected-relation eval → witness`

## First protected relations
1. **Signed decision commitment** — `reject/evidence_against ≠ reject/insufficient_evidence` (signed layer).
2. **Authority separation** — `InfrastructureAttestation<Action> ≠ OnchainCommitment<Action>`.
3. **Proof vs header authority** — `StateInclusion<Value> ≠ ConsensusValidatedHeader`.

## Independence rule
The runner and schema are **neutral** (this repo). Each system's **adapter is authored by its owner**, with
**no shared checker code** — so "N systems conform" means N *independent* systems, not one checked N times.

## Layout
```
/schema      manifest v0 (fields + worked manifests) + JSON Schema + witness format
/runner      the two-level protected-relation runner
/adapters    one per system under test — authored independently by each owner
/ui          the demo surface (drive an agent → recompute across backends)
```

## Governance & license
`semantic-abi` lives under **trustless-ai** — the neutral, open home — deliberately, so no single company
controls the shared protocol. Commercial products (adapters, polished UIs) are built *on top* by any party,
including [Vértice Criativo](https://verticecriativo.pt).

- **Code** (`/runner`, `/adapters`, `/ui`): Apache-2.0 — see `LICENSE`.
- **Spec** (`/schema`): CC0 — see `schema/LICENSE-CC0.txt`.

*Don't trust it — recompute it.*
