import { PAIR } from "../src/evaluate.mjs";

// Vectors pin expected_pair (the oracle). Adapters independently produce observed_pair;
// conformance is derived only after both values exist.
export const VECTORS = [
  // 1 — signed decision commitment: reject/evidence_against ≠ reject/insufficient_evidence
  { id: "c1-clean",    relation: "signed_decision_commitment", oracle: PAIR.PRESERVED,
    fixture: "verdict carries a distinct reason all the way into the signed commitment" },
  { id: "c1-tampered", relation: "signed_decision_commitment", oracle: PAIR.VIOLATED,
    fixture: "same reject verdict with a changed epistemic_basis; v18 must detect the authenticated distinction" },

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
