// Enrichment + FULLY-AUTOMATED verification with exception-only escalation.
//
// Design goal (per requirements): the weekly check runs unattended and only
// flags the hardest / most problematic cases for a human. This must scale to
// all of Japan and, later, multiple countries — so human review is the
// exception, not the rule.
//
// This is a runnable skeleton: the Claude research call is stubbed behind
// ANTHROPIC_API_KEY. Wire it to the real API and your DB in Phase B. The
// important, reusable part is the AUTO-APPROVAL GATE below.

import { readFile, writeFile, mkdir } from "node:fs/promises";

// ---- The gate: decide auto-publish vs. escalate -----------------------------
// Returns { action: "auto-publish" | "escalate", reasons: string[] }.
export function decide(existing, proposed) {
  const reasons = [];

  // 1) Low model confidence -> always escalate.
  if (proposed.confidence === "low") reasons.push("low confidence");

  // 2) Sources disagree with each other.
  if (proposed.sourceConflict) reasons.push("conflicting sources");

  // 3) Closure / removal is high-impact and easy to get wrong -> escalate.
  if (proposed.status === "closed" || proposed.remove) reasons.push("possible closure");

  // 4) "Surprising" flips that contradict a strong prior. The classic case:
  //    a chain that is normally outlet-free suddenly reads as having outlets
  //    (or vice-versa). These are exactly the branch-level cases worth a human.
  const OUTLET_RARE_CHAINS = ["Starbucks", "Blue Bottle"];
  if (
    existing &&
    OUTLET_RARE_CHAINS.includes(existing.chainName) &&
    proposed.hasPower === true &&
    existing.hasPower === false
  ) {
    reasons.push(`outlet flip on ${existing.chainName} (branch-level — verify)`);
  }

  // 5) A safety/trust-sensitive field would change with anything less than high
  //    confidence. (Cafe data is low-stakes, but keep the hook for future layers
  //    like lockers, medical, transport where the requirements demand review.)
  if (proposed.trustSensitive && proposed.confidence !== "high") {
    reasons.push("trust-sensitive change below high confidence");
  }

  return { action: reasons.length ? "escalate" : "auto-publish", reasons };
}

// ---- Claude research (stub) -------------------------------------------------
// Replace with a real Anthropic API call that returns proposed utility fields
// PLUS a confidence level and source URLs. Prompt it to (a) write ORIGINAL
// summaries, never copied text, and (b) set confidence honestly and flag
// sourceConflict when public sources disagree.
async function researchWithClaude(venue) {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Offline stub so the script runs without a key: no change proposed.
    return { ...venue, confidence: venue.confidence || "low", _stub: true };
  }
  // TODO: call Anthropic API here with a strict JSON schema for the response.
  // const client = new Anthropic();  ...  return parsed;
  return { ...venue, confidence: "medium" };
}

// ---- Weekly run -------------------------------------------------------------
async function main() {
  const area = process.argv[2] || "shibuya";
  const path = `data/collected/${area}-draft.json`;
  let venues;
  try {
    venues = JSON.parse(await readFile(path, "utf8"));
  } catch {
    console.error(`No draft file at ${path}. Run: node scripts/collect-overpass.mjs ${area}`);
    process.exit(1);
  }

  const published = [];
  const reviewQueue = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const v of venues) {
    const proposed = await researchWithClaude(v);
    const { action, reasons } = decide(v, proposed);

    if (action === "auto-publish") {
      published.push({ ...proposed, lastChecked: today, _status: "published" });
    } else {
      reviewQueue.push({ venue: proposed.name || proposed.id, reasons, proposed });
    }
  }

  await mkdir("data/out", { recursive: true });
  await writeFile(`data/out/${area}-published.json`, JSON.stringify(published, null, 2));
  await writeFile(`data/out/${area}-review-queue.json`, JSON.stringify(reviewQueue, null, 2));

  console.log(`Auto-published: ${published.length}`);
  console.log(`Escalated for human review: ${reviewQueue.length}`);
  if (reviewQueue.length) {
    console.log("  Cases needing a look:");
    for (const r of reviewQueue) console.log(`   - ${r.venue}: ${r.reasons.join("; ")}`);
  }
  console.log("Digest complete. Only the escalated cases need a human.");
}

// Only run main() when invoked directly (so decide() can be imported/tested).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
