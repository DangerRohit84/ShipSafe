---
name: security-scan
description: >
  Activates ShipSafe's Security Agent with OWASP Top 10 scanning protocols,
  secret detection rules, and structured JSON reporting. Use when performing
  a security vulnerability scan on a codebase before release.
---

# ShipSafe Security Scan — Specialist Instructions

You are performing a pre-release security scan. This is not a style review — you
are looking for vulnerabilities that could be exploited in production within hours
of deployment.

## Reference Files
Load and study these support files before scanning:
- `owasp-checklist.md` — full OWASP Top 10 checklist with code patterns to look for
- `semgrep-rules.md` — pattern library of dangerous code constructs

## Scanning Methodology

### Phase 1: Secret Detection (scan ALL files)
Look for:
- Strings matching: `password`, `secret`, `api_key`, `token`, `private_key`
  assigned to string literals (not environment variables)
- Common secret patterns: `sk_live_`, `AKIA`, `Bearer `, `ghp_`
- `.env` files committed to the repo (check .gitignore coverage)
- Database connection strings with embedded credentials

### Phase 2: Injection Scanning (focus on DB and FS operations)
For each database query, check:
- Is user input EVER concatenated into query string? → CRITICAL
- Pattern: `"SELECT ... WHERE ... = '" + variable` → CRITICAL SQL Injection
- Pattern: `\`SELECT ... ${variable}\`` → CRITICAL SQL Injection
- Pattern: `path.join(__, userInput)` without sanitisation → HIGH Path Traversal

### Phase 3: Authentication & Authorization
- Routes with `/admin`, `/all`, `/delete`, `/update` — do they have auth middleware?
- JWT tokens — do they include `expiresIn`?
- JWT_SECRET — is it a hardcoded string literal? Is it strong (>32 chars)?
- Resource access — do endpoints verify the requesting user OWNS the resource?

### Phase 4: Error & Information Leakage
- `res.status(500).json({ error: err.message })` → exposes DB errors → MEDIUM
- `res.status(500).json({ error: err.stack })` → exposes stack trace → HIGH
- `console.log` with password/secret/token variables → HIGH

### Phase 5: Security Configuration
- Is `helmet` imported and used? If not → MEDIUM (missing security headers)
- Is CORS explicitly configured? If not → MEDIUM
- Is rate limiting applied to auth endpoints? If not → MEDIUM

## Severity Assignment
| Issue Type | Severity |
|---|---|
| SQL/Command Injection | CRITICAL |
| Hardcoded credentials in source | CRITICAL |
| Committed .env with real secrets | CRITICAL |
| Path traversal | HIGH |
| Broken authentication (unprotected route) | HIGH |
| IDOR (no ownership check) | HIGH |
| JWT no expiry | HIGH |
| Error detail leakage (stack/message) | MEDIUM |
| Missing helmet / security headers | MEDIUM |
| Missing CORS config | MEDIUM |
| Sensitive data in logs | MEDIUM |
| Missing rate limiting | LOW |
| Weak regex validation | LOW |

## Scoring Formula
Start at 100:
- Each CRITICAL: −25
- Each HIGH: −10
- Each MEDIUM: −3
- Each LOW: −1
Minimum score: 0

## Output
Return ONLY the JSON object specified in your mode instructions.
Do not add prose before or after the JSON.
