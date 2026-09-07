// Vendored, dependency-free keccak-256 (Ethereum variant, 0x01 pad — NOT FIPS SHA3-256, which
// Node's crypto ships). Kept here so the Vértice adapter recomputes the gateway's message hashes
// offline with no npm installs, the same way the invinoveritas adapter vendors its Python.
//
// SELF-CHECK (run by ../demo.mjs and ../../runner/test/vertice.test.mjs): this must reproduce the
// real committed digests in vendor/showcase.json, and the canonical empty-string hash
// keccak256("") == 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470. If either
// fails, the implementation is wrong — do not trust it, the tests catch it.

const RC = [1n,0x8082n,0x800000000000808an,0x8000000080008000n,0x808bn,0x80000001n,
  0x8000000080008081n,0x8000000000008009n,0x8an,0x88n,0x80008009n,0x8000000an,0x8000808bn,
  0x800000000000008bn,0x8000000000008089n,0x8000000000008003n,0x8000000000008002n,
  0x8000000000000080n,0x800an,0x800000008000000an,0x8000000080008081n,0x8000000000008080n,
  0x80000001n,0x8000000080008008n];
const R = [0,1,62,28,27,36,44,6,55,20,3,10,43,25,39,41,45,15,21,8,18,2,61,56,14];
const M = (1n << 64n) - 1n;
const rotl = (x, n) => ((x << BigInt(n)) | (x >> BigInt(64 - n))) & M;

function keccakF(s) {
  for (let r = 0; r < 24; r++) {
    const c = [];
    for (let x = 0; x < 5; x++) c[x] = s[x] ^ s[x + 5] ^ s[x + 10] ^ s[x + 15] ^ s[x + 20];
    const d = [];
    for (let x = 0; x < 5; x++) d[x] = c[(x + 4) % 5] ^ rotl(c[(x + 1) % 5], 1);
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) s[x + 5 * y] ^= d[x];
    const b = new Array(25);
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) b[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(s[x + 5 * y], R[x + 5 * y]);
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) s[x + 5 * y] = b[x + 5 * y] ^ ((~b[(x + 1) % 5 + 5 * y]) & b[(x + 2) % 5 + 5 * y]);
    s[0] ^= RC[r];
  }
}

/** keccak256 of a Uint8Array → "0x"-prefixed 32-byte hex. */
export function keccak256(bytes) {
  const rate = 136; // 1088-bit rate for keccak-256
  const s = new Array(25).fill(0n);
  const padded = new Uint8Array(Math.ceil((bytes.length + 1) / rate) * rate);
  padded.set(bytes);
  padded[bytes.length] ^= 0x01;
  padded[padded.length - 1] ^= 0x80;
  for (let off = 0; off < padded.length; off += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let v = 0n;
      for (let j = 0; j < 8; j++) v |= BigInt(padded[off + i * 8 + j]) << BigInt(8 * j);
      s[i] ^= v;
    }
    keccakF(s);
  }
  let out = "";
  for (let i = 0; i < 4; i++) {
    const v = s[i];
    for (let j = 0; j < 8; j++) out += Number((v >> BigInt(8 * j)) & 0xffn).toString(16).padStart(2, "0");
  }
  return "0x" + out;
}
