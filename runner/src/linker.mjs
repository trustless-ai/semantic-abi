import { satisfies } from "./classes.mjs";

// Semantic linker: can a consumer that REQUIRES `requiredClass` safely consume a
// producer that ESTABLISHES `producer.establishes`? Valid iff the required class is
// in the producer's satisfy-closure. Otherwise a meaning-level TYPE ERROR — the
// implicit authority upgrade, caught, with a minimal counterexample.
//
// producer: { component, establishes, does_not_establish? }
export function linkEdge(producer, requiredClass) {
  const closure = satisfies(producer.establishes);
  if (closure.includes(requiredClass)) {
    return { valid: true, edge: `${producer.establishes} ⊇ ${requiredClass}` };
  }
  const disclaimed = (producer.does_not_establish || []).includes(requiredClass);
  return {
    valid: false,
    error: "TYPE_ERROR",
    counterexample: {
      producer: producer.component,
      producer_establishes: producer.establishes,
      consumer_requires: requiredClass,
      reason: disclaimed
        ? "explicitly disclaimed by producer.does_not_establish"
        : "no semantic edge exists",
      note: `composing these would upgrade ${producer.establishes} into ${requiredClass} with no evidence`,
    },
  };
}
