// Deadpan Forecasts for Cities That Do Not Exist
// A deterministic program (no network, no randomness) that writes one
// absurd-but-believable weather line for an invented city to
// /output/entry.txt. The sealed gate requires 1-160 UTF-8 characters,
// not only white space.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ENTRY =
  "In Brindlewick, a high of 47 under fog so thick the 8 a.m. train arrived yesterday, with a 70 percent chance of rain falling mostly upward after lunch.";

// The sealed gate: 1 to 160 characters, not only white space.
function gateCheck(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 160) {
    throw new Error(`gate failed: entry is ${chars} characters (must be 1-160)`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: entry is only white space");
  }
  if (text.includes("\n")) {
    throw new Error("gate failed: entry must be a single line");
  }
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");

gateCheck(ENTRY);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");

// Read-back verify: the file on disk must be byte-identical to the line.
// Compare both the decoded string and the SHA-256 of the raw bytes, so a
// stray BOM, trailing newline or encoding change cannot slip through.
const writtenBytes = readFileSync(outPath);
const written = writtenBytes.toString("utf8");
if (written !== ENTRY) {
  throw new Error("verify failed: /output/entry.txt differs from the entry line");
}
const expectedHash = createHash("sha256").update(ENTRY, "utf8").digest("hex");
const actualHash = createHash("sha256").update(writtenBytes).digest("hex");
if (actualHash !== expectedHash) {
  throw new Error(`verify failed: sha256 ${actualHash} != expected ${expectedHash}`);
}

console.log(`wrote ${[...ENTRY].length} chars to ${outPath}`);
