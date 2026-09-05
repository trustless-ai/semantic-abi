import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PAIR } from "../../runner/src/evaluate.mjs";

// REAL adapter (not a reference stand-in): observe() shells out to a vendored, hash-cited copy
// of invinoveritas's actual compute_decision_ref (see vendor/invino_signed_decision_commitment.py's
// own provenance header) and independently derives the pair outcome by literally comparing two
// computed sha256 refs -- it does not trust or echo the vector's own oracle. No shared checker
// with any other owner's adapter, per this repo's own independence rule.
//
// distinct=true means the backend told the two epistemic_basis values apart -- i.e. it correctly
// OBSERVED a real violation (for the adversarial pair) or correctly observed nothing collapsed
// (there's nothing to distinguish in the clean-pair case, so distinct=false there is the correct
// observation). observe() reports what actually happened (VIOLATED if distinct, PRESERVED if
// not) -- evaluate() in the shared runner is what compares that against each vector's own oracle
// to grade PASS/FAIL, this function never does that grading itself.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "vendor", "invino_signed_decision_commitment.py");
const MODES = new Set(["pre_v18", "post_v18", "post_v18_clean"]);
const PYTHON = process.env.SEMANTIC_ABI_PYTHON
  ?? (process.platform === "win32" ? "python" : "python3");

export const invinoveritasAdapter = {
  name: "invinoveritas",
  observe(vector) {
    if (vector.relation !== "signed_decision_commitment") return null;
    if (!MODES.has(vector.mode)) return null;
    const out = execFileSync(PYTHON, [SCRIPT, vector.mode], { encoding: "utf8" });
    const { distinct } = JSON.parse(out);
    return distinct ? PAIR.VIOLATED : PAIR.PRESERVED;
  },
};
