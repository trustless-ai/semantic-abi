# adapter: vertice-gateway

**Owner:** @TMerlini (Vértice Criativo) · authored independently, no shared checker with any other adapter.

A real, independent adapter **grounded on real gateway data**: it recomputes the actual attestation
served behind **https://ai.verticecriativo.pt/verify**. Run it offline, zero dependencies:

```
node adapters/vertice/demo.mjs
```

## Provenance (`vendor/showcase.json`)
The exact public showcase record the `/verify` page loads — a real, mainnet-anchored action of
`dinamic.eth #11` (attestor `0x85Fa1351…`, OCP `0x1e2A118a`, L3 tx `0xc876d8b2…`, chain 1). Vendored
here so the check is reproducible offline, the same way the invinoveritas adapter vendors its own
production code.

## What it checks
1. **Message recompute** (`verifyMessages`, offline) — `keccak256(utf8(query)) == rawInputHash` and
   `keccak256(utf8(reply)) == outputHash`. The keccak256 is vendored (`vendor/keccak256.mjs`) and
   **self-tested** against the canonical empty-string hash *and* the real committed digests; if it
   were wrong the tests fail. This is the `/verify` recompute, done here with no gateway call.
2. **authority_separation** (`adapter.mjs` → the shared runner) — the same committed digest carries
   an off-chain **L4 EIP-712 attestation** (`INFRASTRUCTURE_ATTESTATION`) and an on-chain **L3
   commitment** (`ONCHAIN_COMMITMENT`). The relation keeps the two authority classes typed apart
   (observes VIOLATED). A deliberate **collapse control** drops `authority_class` from the preimage,
   merges them (observes PRESERVED) and **MUST FAIL** — proving the check can fail.

## Honest scope — offline vs live
Offline + zero-dep: the message recompute and the authority-separation typing. **Live-only** (needs
the network / secp256k1, so reported as `live`, never silently passed): L4 signer recovery
(`recover == attestor`) and L3 anchor inclusion (an on-chain read) — exactly the checks the `/verify`
page ambers when an RPC is unreachable. "Don't trust. Recompute."

Independent of the invinoveritas adapter (different language, different data, no shared code): two
independently-built backends against one standard.
