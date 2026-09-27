#!/usr/bin/env node
/**
 * ShipSafe Project Validator
 * Run: node scripts/validate-project.js
 * Checks that all required files exist and are non-empty before submission.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    console.log(`  ✅  ${description}`);
    passed++;
  } else {
    console.error(`  ❌  ${description}`);
    failed++;
  }
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function fileHasContent(rel, minBytes = 100) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) && fs.statSync(p).size >= minBytes;
}

function countWords(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return 0;
  return fs.readFileSync(p, 'utf8').split(/\s+/).filter(Boolean).length;
}

console.log('\n🚢 ShipSafe Project Validator\n');

// ── Bob Configuration ─────────────────────────────────────────────────────────
console.log('📁 Bob Configuration');
check('.bob/custom_modes.yaml exists', fileExists('.bob/custom_modes.yaml'));
check('.bob/mcp.json exists', fileExists('.bob/mcp.json'));
check('custom_modes.yaml has content', fileHasContent('.bob/custom_modes.yaml', 500));

// ── Modes ─────────────────────────────────────────────────────────────────────
console.log('\n🧩 Custom Modes');
const modes = ['captain', 'security-agent', 'quality-agent', 'test-agent'];
const modesContent = fs.readFileSync(path.join(ROOT, '.bob/custom_modes.yaml'), 'utf8');
for (const m of modes) {
  check(`Mode slug: ${m}`, modesContent.includes(`slug: ${m}`));
}

// ── Skills ────────────────────────────────────────────────────────────────────
console.log('\n📚 Skills');
const skills = [
  '.bob/skills/captain/SKILL.md',
  '.bob/skills/captain/scoring-formula.md',
  '.bob/skills/captain/report-template.md',
  '.bob/skills/security-scan/SKILL.md',
  '.bob/skills/security-scan/owasp-checklist.md',
  '.bob/skills/security-scan/semgrep-rules.md',
  '.bob/skills/quality-scan/SKILL.md',
  '.bob/skills/quality-scan/complexity-thresholds.md',
  '.bob/skills/quality-scan/code-smells.md',
  '.bob/skills/test-coverage/SKILL.md',
  '.bob/skills/test-coverage/coverage-rules.md',
  '.bob/skills/test-coverage/critical-paths.md',
];
for (const s of skills) {
  check(`Skill file: ${s}`, fileHasContent(s, 50));
}

// ── Rules ─────────────────────────────────────────────────────────────────────
console.log('\n📏 Rules');
check('rules-captain/01-captain-rules.md', fileExists('.bob/rules-captain/01-captain-rules.md'));
check('rules-security-agent/01-security-rules.md', fileExists('.bob/rules-security-agent/01-security-rules.md'));
check('rules-quality-agent/01-quality-rules.md', fileExists('.bob/rules-quality-agent/01-quality-rules.md'));
check('rules-test-agent/01-test-rules.md', fileExists('.bob/rules-test-agent/01-test-rules.md'));

// ── MCP Server ────────────────────────────────────────────────────────────────
console.log('\n🔌 MCP Server');
check('mcp-server/src/index.js exists', fileHasContent('mcp-server/src/index.js', 500));
check('mcp-server/package.json exists', fileExists('mcp-server/package.json'));
const mcpContent = fs.readFileSync(path.join(ROOT, 'mcp-server/src/index.js'), 'utf8');
for (const tool of ['run_tests', 'scan_secrets', 'check_complexity', 'audit_deps', 'list_source_files']) {
  check(`MCP tool registered: ${tool}`, mcpContent.includes(`'${tool}'`));
}

// ── Demo App ──────────────────────────────────────────────────────────────────
console.log('\n🎬 Demo App (BEFORE state)');
check('demo-app/src/index.js — has hardcoded secret', (() => {
  const c = fs.readFileSync(path.join(ROOT, 'demo-app/src/index.js'), 'utf8');
  return c.includes('supersecret123');
})());
check('demo-app/src/routes/users.js — has SQL injection', (() => {
  const c = fs.readFileSync(path.join(ROOT, 'demo-app/src/routes/users.js'), 'utf8');
  return c.includes('${username}') || c.includes("'${");
})());
check('demo-app/src/routes/products.js — has path traversal', fileHasContent('demo-app/src/routes/products.js', 100));
check('demo-app/src/routes/orders.js — has IDOR', fileHasContent('demo-app/src/routes/orders.js', 100));
check('demo-app/tests/users.test.js — has weak test', fileExists('demo-app/tests/users.test.js'));

console.log('\n🔧 Demo App (AFTER state — fixed files)');
check('routes/after/users.js — parameterized queries', (() => {
  const p = path.join(ROOT, 'demo-app/src/routes/after/users.js');
  return fs.existsSync(p) && fs.readFileSync(p, 'utf8').includes('WHERE username = ?');
})());
check('routes/after/products.js — path traversal fixed', fileHasContent('demo-app/src/routes/after/products.js', 100));
check('routes/after/orders.js — IDOR fixed', fileHasContent('demo-app/src/routes/after/orders.js', 100));
check('middleware/authenticate.js exists', fileHasContent('demo-app/src/middleware/authenticate.js', 100));
check('utils/db.js exists', fileHasContent('demo-app/src/utils/db.js', 100));
check('utils/validate.js exists', fileHasContent('demo-app/src/utils/validate.js', 100));

// ── Scripts ───────────────────────────────────────────────────────────────────
console.log('\n⚙️  Scripts');
check('scripts/autofix.js exists', fileHasContent('scripts/autofix.js', 500));
check('scripts/generate-tests.js exists', fileHasContent('scripts/generate-tests.js', 200));

// ── Submission Documents ──────────────────────────────────────────────────────
console.log('\n📝 Submission Documents');
const psWords = countWords('docs/problem-solution-statement.md');
const ibWords = countWords('docs/ibm-bob-usage-statement.md');
check(`Problem & Solution Statement: ${psWords} words (max 500)`, psWords > 100 && psWords <= 500);
check(`IBM Bob Usage Statement: ${ibWords} words (max 500)`, ibWords > 100 && ibWords <= 500);
check('demo-script.md exists', fileHasContent('docs/demo-script.md', 200));
check('shipsafe-run-guide.md exists', fileHasContent('docs/shipsafe-run-guide.md', 500));
check('slides-outline.md exists', fileHasContent('docs/slides-outline.md', 200));

// ── README ────────────────────────────────────────────────────────────────────
console.log('\n📖 README');
check('README.md exists and has content', fileHasContent('README.md', 500));

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`  Total:  ${passed + failed} checks`);
console.log(`  ✅ Passed: ${passed}`);
if (failed > 0) {
  console.error(`  ❌ Failed: ${failed}`);
  console.error('\n  Fix the failed checks before submitting.\n');
  process.exit(1);
} else {
  console.log(`\n  🚢 ALL CHECKS PASSED — ShipSafe is submission-ready!\n`);
}
