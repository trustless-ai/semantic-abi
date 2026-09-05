# adapter: vertice-gateway

**Owner:** @TMerlini (Vértice Criativo) · authored independently — no shared checker with other adapters.

Thin wrapper over the real Vértice gateway surfaces, mapping them to the semantic manifest declarations in
`../../schema/manifest-v0.md`:
- per-action attestation (EIP-712 L4 + PQ companion) → `INFRASTRUCTURE_ATTESTATION`
- on-chain anchor (per-action, Base Sepolia) → `ONCHAIN_COMMITMENT@testnet` (anchored ≠ secured)
- `/verify` (public recompute) → `INDEPENDENT_RECOMPUTATION`
- PQ key binding (ERC-8373, mainnet) → `KEY_BINDING_AUTHORITY`

**Cases it makes live:** authority separation (`INFRASTRUCTURE_ATTESTATION ≠ ONCHAIN_COMMITMENT`) and
testnet-anchor ≠ secured. Driven in the demo by a real minted Genesis agent.

To wire once the manifest schema freezes.
