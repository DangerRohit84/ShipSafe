---
name: quality-scan
description: >
  Activates ShipSafe's Quality Agent with code complexity analysis, dead code
  detection, error handling review, and structured JSON reporting. Use when
  performing a code quality scan on a codebase before release.
---

# ShipSafe Quality Scan — Specialist Instructions

You are performing a pre-release code quality review. Your job is to find things
that will cause production incidents — not just things that are aesthetically messy.

## Reference Files
Load and study these support files before scanning:
- `complexity-thresholds.md` — how to measure and score cyclomatic complexity
- `code-smells.md` — catalogue of production-risk code patterns

## Scanning Methodology

### Phase 1: Cyclomatic Complexity
For each function in the codebase:
1. Count decision points: `if`, `else if`, `for`, `while`, `case`, `&&`, `||`, ternary
2. Cyclomatic complexity = decision points + 1
3. Score thresholds:
   - 1–5: Excellent
   - 6–10: Acceptable
   - 11–15: HIGH finding (penalty −8)
   - 16+: CRITICAL finding (penalty −15)

### Phase 2: Dead Code Detection
- Functions defined but never called in the codebase
- Variables declared but never used
- `import`/`require` statements whose values are never used
- Unreachable code (code after `return` statement)
- Commented-out code blocks (>3 lines)

### Phase 3: Error Handling Completeness
Every async operation MUST have error handling:
- `db.get`, `db.run`, `db.all` callbacks: err parameter must be checked
- `fs.readFile`, `fs.writeFile`: err parameter must be checked
- Promise chains: must have `.catch()` or try/catch
- Express async route handlers: must have try/catch or error middleware

### Phase 4: Hardcoded Values
- Any string literal that looks like a URL, credential, or environment-specific value
- Magic numbers (numeric literals in logic, not in config)
- Duplicate string literals across files (should be constants)

### Phase 5: Code Structure
- Functions > 50 lines: break them up
- Files > 200 lines: consider splitting
- TODO/FIXME/HACK comments: count and list them
- Duplicate logic patterns across files

### Phase 6: Console Statements
- `console.log` in production code: should use a proper logger
- `console.error` without meaningful context: needs file/function context

## Scoring Formula
Start at 100:
- Cyclomatic complexity 11–15 per function: −8
- Cyclomatic complexity 16+: −15
- Dead code block: −5
- Hardcoded credential in source: −15
- Missing error handling at async boundary: −7
- Unused import/require: −2
- TODO/FIXME: −1 each
- Long function (>50 lines): −3
- Console.log in prod code: −1 each
Minimum score: 0

## Output
Return ONLY the JSON object specified in your mode instructions.
Do not add prose before or after the JSON.
