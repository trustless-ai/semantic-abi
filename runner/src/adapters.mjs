import { PAIR } from "./evaluate.mjs";

// REFERENCE adapters for the runnable demo. Real adapters (one per owner, under
// /adapters/*) derive the observed pair outcome INDEPENDENTLY from live or replayed
// endpoint responses — no shared checker. These stand in until those are wired.

// A conforming backend: correctly derives the fixture's true pair outcome.
export const goodBackend = (name) => ({
  name,
  observe: (v) => v.oracle,
});

// A backend that COLLAPSES one relation: reports VIOLATED cases as PRESERVED for that
// relation — i.e. it fails to keep the protected distinction. Models the invinoveritas
// pre-v18 replay (the real historical signed-commitment collapse). Produces a FAIL + witness.
export const collapsingBackend = (name, collapseRelation) => ({
  name,
  observe: (v) =>
    v.relation === collapseRelation && v.oracle === PAIR.VIOLATED ? PAIR.PRESERVED : v.oracle,
});

// A not-yet-wired backend: cannot check anything → CANNOT_CHECK / UNVERIFIABLE, never green.
export const pendingBackend = (name) => ({
  name,
  observe: () => null,
});
