# Semantic manifest — v0 (draft, not yet frozen)

A manifest declares, per endpoint/component, **what its evidence is allowed to mean**. The generalizable
principle: every component establishes **exactly one** authority class and **explicitly disclaims the rest**.
`does_not_establish` is not a nice-to-have — it is the field that makes the linker's TYPE ERROR possible at
all. Without it, every component just returns `true` and there is nothing to catch an implicit authority
upgrade against.

## Fields
```
Evidence< claim_type, authority_class, scope, as_of >
```
| field | meaning |
|---|---|
| `consumes` | what the component takes as input |
| `establishes` | the ONE authority class this component genuinely creates |
| `does_not_establish` | the classes it explicitly disclaims (enables TYPE ERROR detection) |
| `authority_class` | the class label of `establishes` |
| `scope` | over what the claim holds (per-action, value@root, per-review…) |
| `as_of` | ⚠ OPEN (Pavlo, Fede): split `issued_at` vs `verified_at` so `as_of` never conflates issuance with verification time — resolve before freezing |

Two result levels, kept separate by the runner:
- **pair outcome**: `PRESERVED | VIOLATED | UNVERIFIABLE`
- **backend conformance**: `PASS | FAIL | CANNOT_CHECK`

---

## Worked manifest — invinoveritas (authored by @babyblueviper1)
```
/review (sign=true):
  consumes:            an artifact + proposed action
  establishes:         SIGNED_VERDICT — independently-issued judgment, schnorr-signed, decision_ref bound to artifact+verdict+policy
  does_not_establish:  PROOF_OF_EXECUTION, SEMANTIC_TRUTH
  authority_class:     INDEPENDENT_JUDGMENT

/verify-proof:
  consumes:            a SIGNED_VERDICT event
  establishes:         AUTHENTICITY — signature valid, decision_ref recomputes from stored preimage
  does_not_establish:  that the judgment was correct  (valid=true means REAL, not RIGHT — the trap)
  authority_class:     CRYPTOGRAPHIC_VERIFICATION

/ledger outcome_evidence:
  consumes:            a settled real-world result
  establishes:         OUTCOME_SETTLEMENT — was the verdict later proven right/wrong
  does_not_establish:  anything about the verdict's own pre-outcome commitment
  authority_class:     EX_POST_VALIDATION

freshness_beacon (Bitcoin-anchored):
  establishes:         NOT_BACKDATED — existed no later than a real chain-tip time
  does_not_establish:  verdict correctness
```

## Worked manifest — Vértice gateway (authored by @TMerlini)
```
per-action attestation (EIP-712 L4 + PQ companion):
  consumes:            an agent action (inputs + produced output)
  establishes:         INFRASTRUCTURE_ATTESTATION — operator-signed + per-agent PQ companion signature
  does_not_establish:  SEMANTIC_VERIFICATION, INDEPENDENT_RECOMPUTATION, OUTCOME_SETTLEMENT
  authority_class:     INFRASTRUCTURE_ATTESTATION

on-chain anchor (per-action, Base Sepolia):
  consumes:            the attestation digest
  establishes:         ONCHAIN_COMMITMENT@testnet — digest committed at a block
  does_not_establish:  ECONOMIC_SETTLEMENT (it's a testnet — anchored ≠ secured), SEMANTIC_VERIFICATION
  authority_class:     ONCHAIN_COMMITMENT (testnet-scoped — NOT finality)

/verify (public recompute):
  consumes:            a receipt id
  establishes:         INDEPENDENT_RECOMPUTATION — third party re-derived from public data, matches
  does_not_establish:  correctness of any non-deterministic judgment inside the action
  authority_class:     INDEPENDENT_RECOMPUTATION

PQ key binding (ERC-8373, mainnet):
  consumes:            agent identity + ML-DSA-65 / SLH-DSA public keys
  establishes:         KEY_BINDING_AUTHORITY — classical→PQ binding, mainnet-anchored, non-custodial, dual-family
  does_not_establish:  any action's correctness
  authority_class:     KEY_BINDING_AUTHORITY
```

## Open items before freezing v0
- [ ] Resolve `as_of` (issued_at vs verified_at) — Pavlo/Fede.
- [ ] Freeze the closed enum of authority classes.
- [ ] Confirm field names final: `consumes / establishes / does_not_establish / authority_class`.
