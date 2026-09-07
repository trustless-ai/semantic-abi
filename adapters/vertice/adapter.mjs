import { createHash } from "node:crypto";
import { keccak256 } from "./vendor/keccak256.mjs";
import { PAIR } from "../../runner/src/evaluate.mjs";

// REAL, independent Vértice adapter — GROUNDED ON REAL GATEWAY DATA. It recomputes the actual
// showcase attestation served behind ai.verticecriativo.pt/verify (vendored hash-cited at
// vendor/showcase.json, a real mainnet-anchored action of dinamic.eth #11). No shared checker with
// any other owner's adapter (invinoveritas vendors its own Python; this is JS), and it never reads
// the vector's oracle — the shared runner grades observed vs expected.
//
// Offline + zero-dependency: Node stdlib + a vendored, self-tested keccak256. The two parts that
// genuinely need the network or secp256k1 — L3 anchor inclusion (an on-chain read) and L4 signer
// recovery (recover == attestor) — are LIVE-only and reported by verifyMessages() as "live",
// never silently passed. That mirrors the /verify page, which ambers the on-chain check offline.

const enc = new TextEncoder();

// Vértice's own canonicalisation: sorted keys, JSON, sha256. Independent of every other adapter.
function commitmentRef(obj, preimageFields) {
  const preimage = {};
  for (const field of [...preimageFields].sort()) preimage[field] = obj[field];
  return createHash("sha256").update(JSON.stringify(preimage), "utf8").digest("hex");
}

export const verticeAdapter = {
  name: "vertice",
  // authority_separation: the SAME committed digest carried under two authority classes must stay
  // typed apart. Observe VIOLATED when they are (distinct refs), PRESERVED when a stripped preimage
  // merges them.
  observe(vector) {
    if (!Array.isArray(vector.pair) || vector.pair.length !== 2) return null;
    if (!Array.isArray(vector.preimage) || vector.preimage.length === 0) return null;
    const [a, b] = vector.pair;
    const distinct = commitmentRef(a, vector.preimage) !== commitmentRef(b, vector.preimage);
    return distinct ? PAIR.VIOLATED : PAIR.PRESERVED;
  },
};

// The /verify message recompute, run OFFLINE against the real committed digests: keccak256 over the
// public preimages must reproduce the record's rawInputHash / outputHash. Also surfaces the two
// live-only checks so nothing offline is mislabelled as proven.
export function verifyMessages(record) {
  const offline = [
    { id: "raw_input_hash", recipe: "keccak256(utf8(query))", scope: "offline",
      expected: record.rawInputHash, got: keccak256(enc.encode(record.query)) },
    { id: "output_hash", recipe: "keccak256(utf8(reply))", scope: "offline",
      expected: record.outputHash, got: keccak256(enc.encode(record.reply)) },
  ].map((c) => ({ ...c, status: c.expected.toLowerCase() === c.got.toLowerCase() ? "pass" : "fail" }));

  const live = [
    { id: "l4_signer", recipe: "recover(EIP-712 KYA-L4) == attestor", scope: "live",
      status: "live", note: `needs secp256k1 recovery; expected signer ${record.attestor}` },
    { id: "l3_anchor", recipe: `OCP record() inclusion on chain ${record.l3ChainId}`, scope: "live",
      status: "live", note: `needs an RPC read; tx ${record.l3Tx} @ ${record.ocpContract}` },
  ];
  return [...offline, ...live];
}
