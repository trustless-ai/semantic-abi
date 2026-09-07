import { PAIR } from "../../runner/src/evaluate.mjs";

// Independent 1inch swap-guard adapter. Models the evidence-boundary gap in an AI swap agent:
// a RELATIVE slippage check silently standing in for the user's ABSOLUTE minimum-out when a quote
// is re-fetched. No shared checker with other adapters; never reads the oracle.
//
// A vector carries a real (or clearly-marked representative) 1inch quote sequence + the user's
// declared minimum + the agent's slippage tolerance. observe() reports what the AGENT'S GUARD sees:
//   - "relative_only" guard (the real gap): only enforces slippage vs the LATEST quote, so it always
//     reports PRESERVED — it cannot see an absolute-minimum violation. This is the collapsing backend.
//   - "min_aware" guard (the fix): also enforces the user's absolute minimum, so it reports VIOLATED
//     when the executable floor drops below it — i.e. it CATCHES the gap.
// The shared runner grades observed vs the oracle (the version-independent truth: does the executable
// floor still honour the user's declared minimum?).

export const oneinchAdapter = {
  name: "1inch-swap-guard",
  observe(vector) {
    const q = vector.quotes;
    if (!Array.isArray(q) || q.length < 1) return null;
    if (typeof vector.min_out !== "number" || typeof vector.slippage_bps !== "number") return null;
    const latest = q[q.length - 1].dstAmount;                 // agent guards against the latest quote
    const floor = latest * (10000 - vector.slippage_bps) / 10000; // executable floor after slippage
    const mode = vector.mode ?? "relative_only";
    if (mode === "min_aware") {
      return floor >= vector.min_out ? PAIR.PRESERVED : PAIR.VIOLATED; // catches the drop
    }
    // relative_only: slippage-vs-latest always "passes" → the guard reports no violation
    return PAIR.PRESERVED;
  },
};

// Convenience: the executable floor a vector would settle at (for the demo's counterexample line).
export function executableFloor(vector) {
  const latest = vector.quotes[vector.quotes.length - 1].dstAmount;
  return latest * (10000 - vector.slippage_bps) / 10000;
}
