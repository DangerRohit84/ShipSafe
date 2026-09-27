#!/usr/bin/env node
/**
 * ShipSafe Auto-Fix Engine
 * ========================
 * Applies safe, mechanical fixes to common security and quality issues.
 * Run by the Captain Mode after scan. Only touches issues it can fix
 * deterministically without changing business logic.
 *
 * Usage:
 *   node scripts/autofix.js --project ./demo-app --report ./scan-report.json
 *
 * Returns:
 *   JSON array of applied fixes with file/line details
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const projectPath = args[args.indexOf('--project') + 1] || './demo-app';
const absPath = path.resolve(projectPath);

const appliedFixes = [];

// ── Fix Registry ──────────────────────────────────────────────────────────────
// Each fix has: name, description, detect(line), fix(line), severity
const FIXES = [
  {
    id: 'FIX-001',
    name: 'JWT missing expiresIn',
    description: 'Add expiresIn: "1h" and algorithm: "HS256" to jwt.sign()',
    detect: (line) => /jwt\.sign\([^,]+,\s*\w+\s*\)(?!\s*,)/.test(line) &&
                      !line.includes('expiresIn'),
    fix: (line) =>
      line.replace(
        /jwt\.sign\(([^,]+),\s*(\w+)\s*\)/,
        "jwt.sign($1, $2, { expiresIn: '1h', algorithm: 'HS256' })",
      ),
    severity: 'HIGH',
  },
  {
    id: 'FIX-002',
    name: 'Hardcoded JWT secret → process.env',
    description: 'Replace hardcoded JWT_SECRET string with process.env.JWT_SECRET',
    detect: (line) =>
      /const\s+JWT_SECRET\s*=\s*['"`][^'"`]+['"`]/.test(line),
    fix: (line) =>
      line.replace(
        /const\s+JWT_SECRET\s*=\s*['"`][^'"`]+['"`]/,
        "const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env'",
      ),
    severity: 'CRITICAL',
  },
  {
    id: 'FIX-003',
    name: 'Hardcoded DB_PASSWORD → process.env',
    description: 'Replace hardcoded DB_PASSWORD string with process.env.DB_PASSWORD',
    detect: (line) =>
      /const\s+DB_PASSWORD\s*=\s*['"`][^'"`]+['"`]/.test(line),
    fix: (line) =>
      line.replace(
        /const\s+DB_PASSWORD\s*=\s*['"`][^'"`]+['"`]/,
        'const DB_PASSWORD = process.env.DB_PASSWORD',
      ),
    severity: 'CRITICAL',
  },
  {
    id: 'FIX-004',
    name: 'Remove console.log with secret variable',
    description: 'Remove console.log statements that print secret values',
    detect: (line) =>
      /console\.log\([^)]*(?:DB_PASSWORD|JWT_SECRET|API_KEY|password|secret)[^)]*\)/.test(
        line,
      ),
    fix: (line) =>
      line.replace(
        /.*console\.log\([^)]*(?:DB_PASSWORD|JWT_SECRET|API_KEY|password|secret)[^)]*\).*/,
        '  // [ShipSafe AUTO-FIXED] Removed secret from log output',
      ),
    severity: 'HIGH',
  },
  {
    id: 'FIX-005',
    name: 'Error detail leakage → generic message',
    description: 'Replace err.message in res.json with generic error string',
    detect: (line) =>
      /res\.status\(500\)\.json\(\{\s*error:\s*err\.message\s*\}\)/.test(line),
    fix: (line) =>
      line.replace(
        /res\.status\(500\)\.json\(\{\s*error:\s*err\.message\s*\}\)/,
        "res.status(500).json({ error: 'Internal server error' })",
      ),
    severity: 'MEDIUM',
  },
  {
    id: 'FIX-006',
    name: 'SQL injection (template literal) → parameterized query',
    description: 'Convert template literal SQL with user input to parameterized query',
    detect: (line) =>
      /db\.(get|run|all)\(`[^`]*\$\{[^}]+\}[^`]*`/.test(line),
    fix: (line) => {
      // Replace template literal SQL with parameterized version
      // This is a structural hint — Bob applies the full fix with context
      return line + ' // [ShipSafe] TODO: Convert to parameterized query — see fix guide';
    },
    severity: 'CRITICAL',
    requires_context: true, // Full fix requires multi-line context — Bob handles it
  },
  {
    id: 'FIX-007',
    name: 'SQL injection (string concat) → parameterized query',
    description: 'Convert string concatenation SQL to parameterized query',
    detect: (line) =>
      /const\s+query\s*=\s*`[^`]*\$\{(?:username|password|email|req\.[^}]+)\}/.test(line),
    fix: (line) =>
      line + ' // [ShipSafe] TODO: Use parameterized query — replace ${var} with ? and pass array',
    severity: 'CRITICAL',
    requires_context: true,
  },
  {
    id: 'FIX-008',
    name: 'Unused fs import',
    description: 'Remove unused fs require statement',
    detect: (line, fileContent) =>
      line.trim() === "const fs = require('fs');" &&
      fileContent &&
      (fileContent.match(/fs\./g) || []).length <= 1,
    fix: () => '// [ShipSafe AUTO-FIXED] Removed unused fs import',
    severity: 'LOW',
  },
];

// ── File Walker ───────────────────────────────────────────────────────────────
function getSourceFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'coverage' ||
      entry.name.startsWith('.')
    )
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(full));
    } else if (/\.(js|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// ── Apply Fixes ───────────────────────────────────────────────────────────────
function applyFixesToFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  const newLines = lines.map((line, idx) => {
    for (const fix of FIXES) {
      if (fix.detect(line, content)) {
        const fixed = fix.fix(line);
        if (fixed !== line) {
          changed = true;
          appliedFixes.push({
            fix_id: fix.id,
            name: fix.name,
            severity: fix.severity,
            file: path.relative(absPath, filePath),
            line: idx + 1,
            original: line.trim(),
            replacement: fixed.trim(),
            requires_context: fix.requires_context || false,
          });
          return fixed;
        }
      }
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  }
}

// ── Add .gitignore entry for .env ─────────────────────────────────────────────
function ensureGitignoreCoversEnv() {
  const gitignorePath = path.join(absPath, '.gitignore');
  let content = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8')
    : '';

  if (!content.includes('.env')) {
    content = content + '\n# [ShipSafe AUTO-FIXED] Added by ShipSafe\n.env\n*.env\n';
    fs.writeFileSync(gitignorePath, content, 'utf8');
    appliedFixes.push({
      fix_id: 'FIX-009',
      name: 'Added .env to .gitignore',
      severity: 'CRITICAL',
      file: '.gitignore',
      line: 0,
      original: '(missing)',
      replacement: '.env added to .gitignore',
      requires_context: false,
    });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const sourceFiles = getSourceFiles(absPath);
for (const file of sourceFiles) {
  applyFixesToFile(file);
}
ensureGitignoreCoversEnv();

// Output results
const result = {
  total_fixes_applied: appliedFixes.length,
  auto_fixed: appliedFixes.filter((f) => !f.requires_context),
  manual_required: appliedFixes.filter((f) => f.requires_context),
  fixes: appliedFixes,
};

process.stdout.write(JSON.stringify(result, null, 2));
