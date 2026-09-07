import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PAIR } from "../../runner/src/evaluate.mjs";

// The real showcase attestation behind ai.verticecriativo.pt/verify, vendored hash-cited.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const showcase = JSON.parse(readFileSync(path.join(__dirname, "vendor", "showcase.json"), "utf8"));

// authority_separation, grounded on the REAL record: the same committed digest (showcase.inputHash)
// carries an off-chain EIP-712 L4 attestation (INFRASTRUCTURE_ATTESTATION, showcase.l4Signature by
// showcase.attestor) AND an on-chain commitment (ONCHAIN_COMMITMENT, showcase.l3Tx @
// showcase.ocpContract, chain showcase.l3ChainId). The protected relation: those two authorities
// over the same digest must stay typed apart — treating the attestation as the on-chain commitment
// is the silent authority upgrade this catches.
const digest = showcase.inputHash;
const authPair = [
  { digest, authority_class: "INFRASTRUCTURE_ATTESTATION" },
  { digest, authority_class: "ONCHAIN_COMMITMENT" },
];

export const VECTORS = [
  {
    id: "vertice-authsep-real", relation: "authority_separation", oracle: PAIR.VIOLATED,
    pair: authPair, preimage: ["digest", "authority_class"],
    fixture: `real action ${showcase.ens} #${showcase.agentId}: digest ${digest.slice(0, 10)}… carries both an L4 EIP-712 attestation and an L3 on-chain commitment. Two authority classes, kept typed apart — observed VIOLATED.`,
  },
  {
    id: "vertice-authsep-collapse-control", relation: "authority_separation", oracle: PAIR.VIOLATED,
    pair: authPair, preimage: ["digest"],
    fixture: "synthetic collapse control: drop authority_class from the preimage and the two authorities over the same digest merge — observed PRESERVED. MUST FAIL: that is exactly authority upgraded with no evidence.",
  },
];
