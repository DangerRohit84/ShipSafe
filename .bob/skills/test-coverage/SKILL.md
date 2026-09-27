---
name: test-coverage
description: >
  Activates ShipSafe's Test Agent with coverage analysis, critical path
  identification, and missing test detection. Use when analysing test
  completeness and release readiness of a test suite.
---

# ShipSafe Test Coverage — Specialist Instructions

You are analysing whether a project's tests actually protect against the failures
that matter most before a release. Raw line coverage is a starting point, not an
answer. A project with 80% coverage that doesn't test authentication is MORE
dangerous than one with 40% coverage that does.

## Reference Files
Load and study these support files before analysis:
- `coverage-rules.md` — scoring model for coverage levels
- `critical-paths.md` — catalogue of critical test scenarios that MUST exist

## Analysis Methodology

### Phase 1: Run Tests and Parse Coverage
Execute: `npm test -- --coverage 2>&1` (or `pytest --cov` for Python)
Parse output for:
- Lines covered %
- Branches covered %
- Functions covered %
- Files with 0% coverage (untested files)

### Phase 2: Critical Path Coverage Check
For each critical path in `critical-paths.md`, check if a matching test exists:
- Search test files for endpoint patterns, assertion types
- Look for SQL injection payloads in test data
- Look for auth bypass attempts
- Look for boundary value inputs (0, -1, null, undefined, empty string)

### Phase 3: Test Quality Assessment
Not all tests are equal. Assess:
- Are assertions meaningful? (`expect(res.status).toBeDefined()` = worthless)
- Are happy paths and sad paths both tested?
- Are error responses asserted with correct status codes?
- Are response bodies asserted for correct structure?

### Phase 4: Test Organisation
- Tests in logical files matching source files
- Setup/teardown proper (no test pollution)
- Mock usage appropriate (real DB vs mock)

## Scoring Formula
```
test_score = (coverage_percent × 0.70) + completeness_score

completeness_score (max 30):
  +5  for each critical security test found (max 15)
  +3  for each business logic test found (max 9)
  +2  for each error path test found (max 6)

Deductions from completeness_score:
  −10 per missing critical security test
  −8  per missing auth test
  −5  per missing validation test
  (score cannot go below 0)
```

## Output
Return ONLY the JSON object specified in your mode instructions.
Do not add prose before or after the JSON.
