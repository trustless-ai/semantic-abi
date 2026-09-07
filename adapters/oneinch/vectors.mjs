import { PAIR } from "../../runner/src/evaluate.mjs";

// ⚠ REPRESENTATIVE QUOTE DATA — NOT YET A REAL CAPTURED 1inch QUOTE.
// The MECHANISM below is real and tested; the numbers are a stand-in matching the scenario until a
// real quote is dropped in. To make this prize-eligible (the Graph-style "show it live" bar), replace
// `quotes` with a REAL 1inch quote + requote and CITE the request. Capture (needs a 1inch API key):
//   GET https://api.1inch.dev/swap/v6.0/1/quote?src=<USDC>&dst=<WETH>&amount=<baseunits>
//       Authorization: Bearer <ONEINCH_API_KEY>
//   → read `dstAmount`; take a second quote after a price move (or a larger `amount`) for the requote.
// Numbers here are human-readable "tokens out" for legibility; real dstAmount is in base units (same math).
//
// Oracle = version-independent truth: does the executable floor (latest quote × (1 − slippage)) still
// honour the user's DECLARED absolute minimum? floor ≥ min → PRESERVED; floor < min → VIOLATED.

const SLIPPAGE_BPS = 100; // 1%

export const VECTORS = [
  {
    id: "oneinch-min-preserved", relation: "swap_minimum_out", oracle: PAIR.PRESERVED,
    mode: "relative_only", min_out: 90, slippage_bps: SLIPPAGE_BPS,
    quotes: [{ dstAmount: 100 }, { dstAmount: 95 }], // floor = 95×0.99 = 94.05 ≥ 90
    fixture: "user min 90; quote 100 → mild requote 95; 1% floor 94.05 still ≥ 90. Relative guard is fine here — control that the check isn't always failing.",
  },
  {
    id: "oneinch-requote-drop-collapse", relation: "swap_minimum_out", oracle: PAIR.VIOLATED,
    mode: "relative_only", min_out: 90, slippage_bps: SLIPPAGE_BPS,
    quotes: [{ dstAmount: 100 }, { dstAmount: 80 }], // floor = 80×0.99 = 79.2 < 90
    fixture: "THE CASE: user min 90; quote 100 → requote 80; the 1%-relative guard would settle at 79.2, below the user's absolute minimum. The relative check reports 'fine' (PRESERVED) while the user's minimum is VIOLATED → collapse (FAIL). 'slippage passed' silently standing in for 'minimum satisfied'.",
  },
  {
    id: "oneinch-requote-drop-minaware", relation: "swap_minimum_out", oracle: PAIR.VIOLATED,
    mode: "min_aware", min_out: 90, slippage_bps: SLIPPAGE_BPS,
    quotes: [{ dstAmount: 100 }, { dstAmount: 80 }], // same drop, but a min-aware guard
    fixture: "same requote drop, but a guard that ALSO enforces the absolute minimum observes the violation → conforms (PASS, caught). Proves the check can fail AND that a correct guard closes the gap.",
  },
];
