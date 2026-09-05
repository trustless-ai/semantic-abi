import { satisfies } from "./classes.mjs";

const fmt = (ev) => `${ev.authority_class}<${ev.claim_type}@${ev.scope}>`;

// Semantic linker. Can a consumer that REQUIRES the evidence type `required` safely consume a
// producer that ESTABLISHES `producer.establishes`? Valid only when the producer's evidence type
// satisfies the required one — SAME claim at SAME scope (see classes.satisfies). Otherwise a
// meaning-level TYPE ERROR with a minimal counterexample naming the failed dimension.
//
// producer: { component, establishes: {authority_class, claim_type, scope}, does_not_establish?: [authority_class] }
// required: { authority_class, claim_type, scope }
export function linkEdge(producer, required) {
  const res = satisfies(producer.establishes, required);
  if (res.ok) {
    return { valid: true, edge: `${fmt(producer.establishes)} ⊇ ${fmt(required)}` };
  }
  const disclaimed = (producer.does_not_establish || []).includes(required.authority_class);
  return {
    valid: false,
    error: "TYPE_ERROR",
    counterexample: {
      producer: producer.component,
      producer_establishes: fmt(producer.establishes),
      consumer_requires: fmt(required),
      failed_on: res.why,
      reason: disclaimed
        ? `explicitly disclaimed (${required.authority_class} ∈ does_not_establish)`
        : `no semantic edge — ${res.why}`,
      note: `composing these would upgrade ${fmt(producer.establishes)} into ${fmt(required)} with no evidence`,
    },
  };
}
