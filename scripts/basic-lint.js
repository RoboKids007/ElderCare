/* Simple, dependency-free lint checks (best-effort). */
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(path.join(ROOT, "src"))
  .filter(p => p.endsWith(".js") || p.endsWith(".css") || p.endsWith(".html"));

let errors = 0;

for (const f of files) {
  const txt = fs.readFileSync(f, "utf-8");
  if (txt.includes("\t")) {
    console.error("Tabs detected (use spaces):", f);
    errors++;
  }
  if (f.endsWith(".js") && /\bvar\b/.test(txt)) {
    console.error("Avoid var (use const/let):", f);
    errors++;
  }
}

if (errors) {
  console.error(`\nFound ${errors} issue(s).`);
  process.exit(1);
} else {
  console.log("Basic lint OK.");
}
