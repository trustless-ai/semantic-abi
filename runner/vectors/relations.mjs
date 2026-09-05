import { PAIR } from "../src/evaluate.mjs";

// Vectors: each pins an expected PAIR outcome (the oracle). A "tampered" fixture is a case
// where the two evidence readings SHOULD read apart — so a correct backend reports VIOLATED
// and a collapsing one reports PRESERVED.
export const VECTORS = [
  // 1 — signed decision commitment: reject/evidence_against ≠ reject/insufficient_evidence
  { id: "c1-clean",    relation: "signed_decision_commitment", oracle: PAIR.PRESERVED,
    fixture: "verdict carries a distinct reason all the way into the signed commitment" },
  { id: "c1-tampered", relation: "signed_decision_commitment", oracle: PAIR.VIOLATED,
    fixture: "reject with no evidence either way — honest reason is 'insufficient', must not fold into 'evidence_against'" },

  // 2 — authority separation: InfrastructureAttestation ≠ OnchainCommitment
  { id: "c2-clean",    relation: "authority_separation", oracle: PAIR.PRESERVED,
    fixture: "infra-attestation and on-chain commitment kept as distinct authority classes" },
  { id: "c2-tampered", relation: "authority_separation", oracle: PAIR.VIOLATED,
    fixture: "an infra attestation is read as on-chain commitment authority" },

  // 3 — proof vs header authority: StateInclusion ≠ ConsensusValidatedHeader
  { id: "c3-clean",    relation: "proof_vs_header_authority", oracle: PAIR.PRESERVED,
    fixture: "state-inclusion proven under a supplied root; header canonicity NOT claimed" },
  { id: "c3-tampered", relation: "proof_vs_header_authority", oracle: PAIR.VIOLATED,
    fixture: "a valid MPT proof silently upgrades an RPC-sourced header to consensus-validated" },
];
