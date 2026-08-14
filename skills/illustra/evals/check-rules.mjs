#!/usr/bin/env node
// Behavior-preservation gate: verify every rule's anchors still appear across the skill docs.
// Usage: node evals/check-rules.mjs <skill-root>
// Concatenates SKILL.md + references/*.md (lowercased) and checks each rule's anchors.
import fs from 'fs';
import path from 'path';

const root = process.argv[2] || path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const inv = JSON.parse(fs.readFileSync(path.join(root, 'evals/rule-inventory.json'), 'utf8'));

function read(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }
const refsDir = path.join(root, 'references');
const refFiles = fs.existsSync(refsDir) ? fs.readdirSync(refsDir).filter((f) => f.endsWith('.md')).map((f) => path.join(refsDir, f)) : [];
const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ');
const corpus = norm([read(path.join(root, 'SKILL.md')), ...refFiles.map(read)].join(' '));

const missing = [];
for (const rule of inv.rules) {
  const gone = rule.anchors.filter((a) => !corpus.includes(norm(a)));
  if (gone.length) missing.push({ id: rule.id, missingAnchors: gone });
}
const total = inv.rules.length;
const preserved = total - missing.length;
console.log(`Rule preservation: ${preserved}/${total} preserved`);
if (missing.length) {
  console.log('REGRESSIONS (anchors missing):');
  for (const m of missing) console.log(`  ${m.id}: ${m.missingAnchors.join(', ')}`);
  process.exit(2);
} else {
  console.log('All rule anchors present. No regression.');
}
