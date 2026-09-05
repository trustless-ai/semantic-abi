// The two levels — kept strictly separate (this separation IS the product).
export const PAIR = { PRESERVED: "PRESERVED", VIOLATED: "VIOLATED", UNVERIFIABLE: "UNVERIFIABLE" };
export const BACKEND = { PASS: "PASS", FAIL: "FAIL", CANNOT_CHECK: "CANNOT_CHECK" };

// Evaluate one vector against one adapter.
//   vector : { id, relation, oracle: <pair outcome the fixture pins>, fixture }
//   adapter: { name, observe(vector) -> pair outcome | null }
//
// pair outcome    = what the evidence pair actually did (the fixture's pinned oracle)
// backend conf.   = did the backend correctly REPORT it (observed vs oracle)
// A tampered fixture (oracle=VIOLATED) with a correct backend => pair VIOLATED, backend PASS.
// backend FAIL is reserved for a genuine collapse (observed a different outcome than the truth).
export function evaluate(vector, adapter) {
  let observed;
  try {
    observed = adapter.observe(vector);
  } catch {
    observed = null;
  }
  if (observed == null) {
    return { relation: vector.relation, vector: vector.id, adapter: adapter.name, pair: PAIR.UNVERIFIABLE, backend: BACKEND.CANNOT_CHECK, observed: null };
  }
  if (observed === vector.oracle) {
    return { relation: vector.relation, vector: vector.id, adapter: adapter.name, pair: vector.oracle, backend: BACKEND.PASS, observed };
  }
  // Mismatch: the backend reported a different pair outcome than the fixture's truth — a collapse.
  return {
    relation: vector.relation, vector: vector.id, adapter: adapter.name,
    pair: vector.oracle, backend: BACKEND.FAIL, observed,
    witness: {
      relation: vector.relation,
      vector: vector.id,
      adapter: adapter.name,
      oracle_pair: vector.oracle,
      observed_pair: observed,
      minimal: `expected pair ${vector.oracle}, backend reported ${observed} — protected relation collapsed`,
    },
  };
}

// Run every vector across every adapter; return rows + collected witnesses + two-level tallies.
export function run(vectors, adapters) {
  const rows = [];
  const witnesses = [];
  const tally = { PRESERVED: 0, VIOLATED: 0, UNVERIFIABLE: 0, PASS: 0, FAIL: 0, CANNOT_CHECK: 0 };
  for (const v of vectors) {
    for (const a of adapters) {
      const r = evaluate(v, a);
      rows.push(r);
      tally[r.pair]++;
      tally[r.backend]++;
      if (r.witness) witnesses.push(r.witness);
    }
  }
  return { rows, witnesses, tally };
}
