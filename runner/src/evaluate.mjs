// The two levels — kept strictly separate (this separation IS the product).
export const PAIR = { PRESERVED: "PRESERVED", VIOLATED: "VIOLATED", UNVERIFIABLE: "UNVERIFIABLE" };
export const BACKEND = { PASS: "PASS", FAIL: "FAIL", CANNOT_CHECK: "CANNOT_CHECK" };

// Evaluate one vector against one adapter. THREE values are always reported separately —
// never collapsed (Pavlo, before-freeze review):
//   oracle_pair   = what the fixture pins the evidence pair as doing (ground truth)
//   observed_pair = what THIS backend actually reported (or null if it couldn't check)
//   backend       = PASS if observed==oracle, FAIL if it collapsed to a different outcome, CANNOT_CHECK if it couldn't run
//
//   vector : { id, relation, oracle: <pair outcome>, fixture }
//   adapter: { name, observe(vector) -> pair outcome | null }
export function evaluate(vector, adapter) {
  let observed;
  try {
    observed = adapter.observe(vector);
  } catch {
    observed = null;
  }
  const base = { relation: vector.relation, vector: vector.id, adapter: adapter.name, oracle_pair: vector.oracle };

  if (observed == null) {
    return { ...base, observed_pair: null, backend: BACKEND.CANNOT_CHECK };
  }
  if (observed === vector.oracle) {
    return { ...base, observed_pair: observed, backend: BACKEND.PASS };
  }
  // The backend reported a different pair outcome than the fixture's truth — a collapse.
  // e.g. oracle_pair=VIOLATED, observed_pair=PRESERVED, backend=FAIL — all three kept distinct.
  return {
    ...base,
    observed_pair: observed,
    backend: BACKEND.FAIL,
    witness: {
      relation: vector.relation,
      vector: vector.id,
      adapter: adapter.name,
      oracle_pair: vector.oracle,
      observed_pair: observed,
      minimal: `oracle ${vector.oracle}, observed ${observed} — protected relation collapsed by the backend`,
    },
  };
}

// Run every vector across every adapter; return rows + witnesses + separate pair/backend tallies.
export function run(vectors, adapters) {
  const rows = [];
  const witnesses = [];
  const tally = { PRESERVED: 0, VIOLATED: 0, UNVERIFIABLE: 0, PASS: 0, FAIL: 0, CANNOT_CHECK: 0 };
  for (const v of vectors) {
    for (const a of adapters) {
      const r = evaluate(v, a);
      rows.push(r);
      tally[r.oracle_pair]++; // pair tally follows the ground-truth pair outcome
      tally[r.backend]++;
      if (r.witness) witnesses.push(r.witness);
    }
  }
  return { rows, witnesses, tally };
}
