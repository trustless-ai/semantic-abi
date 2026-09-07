# adapter: 1inch-swap-guard (fixture)

**Status: WIP — mechanism real + tested; quote data is REPRESENTATIVE until a real 1inch quote is dropped in.
Not merged to main; pending (a) a real captured quote and (b) the team's decision to claim the 1inch prize.**

## The gap it catches
An AI swap agent that enforces a **relative** slippage tolerance (e.g. 1%) against the **latest** quote can
silently violate the user's **absolute** minimum-out when a quote is re-fetched lower. "Slippage passed" is
not "the user's minimum was honoured" — a category error the linker/runner catch.

## How it demonstrates (recompute, not assertion)
`node adapters/oneinch/demo.mjs`. Each vector carries a 1inch quote sequence + the user's declared minimum +
the agent's slippage tolerance. The adapter reports what the guard observes; the shared runner grades it vs the
oracle (does the executable floor still honour the declared minimum?):
- **relative-only guard** on a requote drop (100 → 80, min 90, 1% → floor 79.2) → observes PRESERVED while the
  oracle is VIOLATED → **FAIL** (the collapse). The headline case.
- **min-aware guard**, same drop → observes VIOLATED → **PASS** (catches it) — proves the check can fail and
  that a correct guard closes the gap.
- control (100 → 95) → PASS (not always-failing).

## To make it prize-eligible (the Graph-style "show it live" bar)
Replace `quotes` in `vectors.mjs` with a **real 1inch quote + requote** and cite the request:
`GET https://api.1inch.dev/swap/v6.0/1/quote?src=<token>&dst=<token>&amount=<baseunits>` with
`Authorization: Bearer <ONEINCH_API_KEY>`; read `dstAmount`; take a second quote after a price move. Then it's
a real 1inch workflow the runner checks — not analysis. Honest scope: it's the workflow-guarantee gap shown by
recompute, NOT an observed on-chain exploit.

## Linker framing (the meaning-level statement)
`RelativeSlippageSatisfied` (scope: this requote) must not be consumed as `UserMinimumSatisfied` (absolute) —
different claim_type + scope. The linker rejects that upgrade with the counterexample (floor 79.2 < min 90).
