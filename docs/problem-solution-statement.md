# ShipSafe — Problem & Solution Statement
## IBM Bob 2.0 Hackathon Submission

---

## The Problem: Friday Release Fear

Every software team knows the moment. It is late Friday afternoon. The code is
written, the pull request is merged, and CI is green. But the Release Captain —
the person who must say yes or no — is not sure. The security scan produced 847
warnings. The test report says 61% coverage. What does any of that mean? Is it
safe to ship?

So teams do one of two things: delay the release and lose business value, or guess
and risk a production incident over the weekend. According to the State of DevOps
Report, release failures and deployment anxiety are the top sources of engineering
team stress. The root cause is not a lack of tools — teams already have SonarQube,
Snyk, and Jest. The root cause is that those tools give long lists and leave the
decision to humans who cannot interpret 847 warnings in 15 minutes.

## The Solution: ShipSafe

ShipSafe replaces the list with a decision.

It is an AI-powered release readiness system built on IBM Bob 2.0 that gives every
project a Release Readiness Score from 0 to 100 and a definitive RED or GREEN
verdict. Anyone — a CTO, a PM, a new developer — understands the answer in five
seconds.

ShipSafe works through a team of four IBM Bob custom modes. The 🔒 Security Agent
scans for OWASP Top 10 vulnerabilities: SQL injection, path traversal, hardcoded
secrets, broken authentication, and IDOR. The 🔍 Quality Agent measures cyclomatic
complexity, detects dead code, and checks error handling completeness. The 🧪 Test
Agent analyses not just coverage percentages but test completeness — whether the
right things are tested, including security rejection tests. The 🎖️ Captain Mode
orchestrates all three as parallel IBM Bob subagents, applies a transparent weighted
formula (Security 40%, Quality 35%, Tests 25%), and delivers the final verdict.

Critically, ShipSafe does not just report — it acts. After scanning, the Captain
automatically applies safe fixes: replacing hardcoded secrets with environment
variables, adding JWT token expiry, patching error detail leakage, updating
.gitignore, and generating 15 critical security test cases. Issues requiring human
judgment are listed with estimated fix times and IBM Bob guidance commands.

The live demonstration takes a real Node.js API from 38 (🔴 DO NOT SHIP) to 92
(🟢 SAFE TO SHIP) in under two minutes, producing a beautiful HTML release report
showing exactly what was fixed and what remains.

ShipSafe directly addresses the release and deployment workflow identified in the
hackathon challenge. Its target users are Release Captains, CTOs, and senior
engineers at any company that ships software. It is unique because no existing
tool — not SonarQube, not Snyk, not any CI gate — combines multi-agent analysis
with automatic remediation and a single human-readable verdict.
