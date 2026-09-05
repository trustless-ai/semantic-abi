import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PAIR } from "../../runner/src/evaluate.mjs";

// REAL adapter (not a reference stand-in): observe() shells out to a vendored, hash-cited copy
// of invinoveritas's actual compute_decision_ref (see vendor/invino_signed_decision_commitment.py's
// own provenance header) and independently derives the pair outcome by literally comparing two
// computed sha256 refs -- it does not trust or echo the vector's own oracle. No shared checker
// with any other owner's adapter, per this repo's own independence rule.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "vendor", "invino_signed_decision_commitment.py");

export const invinoveritasAdapter = {
  name: "invinoveritas",
  observe(vector) {
    if (vector.relation !== "signed_decision_commitment") return null;
    if (vector.mode !== "pre_v18" && vector.mode !== "post_v18") return null;
    const out = execFileSync("python3", [SCRIPT, vector.mode], { encoding: "utf8" });
    const { distinct } = JSON.parse(out);
    return distinct ? PAIR.PRESERVED : PAIR.VIOLATED;
  },
};
