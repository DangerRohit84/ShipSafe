# 🚢 ShipSafe — AI-Powered Release Readiness System

> **One number. One decision. Zero Friday fear.**
>
> ShipSafe gives every release a Release Readiness Score (0–100) with a clear
> 🔴 RED / 🟢 GREEN verdict — powered by four IBM Bob custom modes working as a
> coordinated AI team.

---

## The Problem

Every software team knows the fear of a Friday release. The code looks ready — but
no one is *fully sure* it is safe to ship. Long reports with hundreds of warnings
give no clear answer. CTOs and release captains either delay (lost revenue) or guess
(production incident).

**SonarQube gives lists. Snyk gives lists. ShipSafe gives a decision.**

---

## How It Works

```
You: "Run ShipSafe scan"  →  🎖️ Captain Mode
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
             🔒 Security   🔍 Quality  🧪 Test
               Agent        Agent      Agent
               (×0.40)      (×0.35)   (×0.25)
                    │          │          │
                    └──────────┼──────────┘
                               ▼
                    Release Readiness Score
                       38 🔴 → 92 🟢
                    (auto-fix applied)
                               ▼
                    📊 HTML Release Report
```

### The Four IBM Bob Modes

| Mode | Role | Tool Groups |
|---|---|---|
| `🎖️ captain` | Orchestrates agents, calculates score, applies fixes, generates report | read, edit, execute, mcp, skill, subagent |
| `🔒 security-agent` | OWASP Top 10 scan, secret detection, injection analysis | read, execute, mcp, skill |
| `🔍 quality-agent` | Complexity, dead code, error handling, structure | read, skill |
| `🧪 test-agent` | Coverage analysis, critical path detection, missing test identification | read, execute, skill |

### The Scoring Formula

```
Release Score = (security × 0.40) + (quality × 0.35) + (test × 0.25)

score ≥ 80  →  🟢 GREEN  — Safe to ship
score 70–79 →  🟡 YELLOW — Ship with documented risk
score < 70  →  🔴 RED    — Do not ship
```

---

## Live Demo: 38 🔴 → 92 🟢 in Under 2 Minutes

The `demo-app/` folder contains a realistic Node.js Express e-commerce API with
intentionally planted vulnerabilities — the same mistakes real teams make before
releasing on a Friday.

**BEFORE (score: 38 🔴 DO NOT SHIP)**
- SQL injection in login endpoint (username/password string concatenation)
- Hardcoded `JWT_SECRET = 'supersecret123'` in source
- Production DB password logged to console on startup
- Path traversal vulnerability (`/api/products/image?file=../../etc/passwd`)
- JWT tokens issued with no expiry
- IDOR: any user can read any order
- Cyclomatic complexity 14 in product search function
- Dead code: `calculateDiscount()` never called
- Test coverage: 12% (1 meaningless test)

**AFTER (score: 92 🟢 SAFE TO SHIP)**

ShipSafe auto-fixed in seconds:
- ✅ JWT_SECRET → `process.env.JWT_SECRET`
- ✅ DB_PASSWORD removed from console.log
- ✅ JWT expiry added (`expiresIn: '1h'`)
- ✅ All `err.message` leaks → `'Internal server error'`
- ✅ `.env` added to `.gitignore`
- ✅ 15 critical security tests auto-generated

Remaining (4 manual items, ~3 hours):
- SQL injection in products/orders (needs parameterized queries)
- Path traversal fix
- IDOR ownership check
- Complexity refactor

---

## Setup & Usage

### 1. Prerequisites
- IBM Bob 2.0 IDE
- Node.js 18+

### 2. Open this project in IBM Bob
```
Open the `shipsafe/` folder in IBM Bob IDE
```

### 3. Install MCP Server dependencies
```bash
cd mcp-server
npm install
```

### 4. The MCP server is auto-registered
Bob reads `.bob/mcp.json` and starts `shipsafe` MCP server automatically.
It provides 5 tools to the agents:
- `run_tests` — executes test suite, returns coverage JSON
- `scan_secrets` — detects hardcoded credentials
- `check_complexity` — measures cyclomatic complexity
- `audit_deps` — runs npm audit
- `list_source_files` — discovers all project files

### 5. Switch to Captain Mode and run
In Bob's mode selector, choose **🎖️ ShipSafe Captain**, then type:

```
Run ShipSafe scan on ./demo-app
```

Bob will:
1. Spawn Security, Quality, and Test agents as parallel subagents
2. Each agent scans the codebase using their skill + MCP tools
3. Captain collects JSON reports, applies scoring formula
4. Auto-fix engine runs: `node scripts/autofix.js --project ./demo-app`
5. Test generator runs: `node scripts/generate-tests.js --project ./demo-app`
6. HTML release report generated as an artifact in Bob's chat

---

## Project Structure

```
shipsafe/
├── .bob/
│   ├── custom_modes.yaml          # 4 Bob custom modes
│   ├── mcp.json                   # MCP server registration
│   ├── skills/
│   │   ├── security-scan/         # Security Agent skill + OWASP checklist
│   │   │   ├── SKILL.md
│   │   │   ├── owasp-checklist.md
│   │   │   └── semgrep-rules.md
│   │   ├── quality-scan/          # Quality Agent skill + thresholds
│   │   │   ├── SKILL.md
│   │   │   ├── complexity-thresholds.md
│   │   │   └── code-smells.md
│   │   ├── test-coverage/         # Test Agent skill + critical paths
│   │   │   ├── SKILL.md
│   │   │   ├── coverage-rules.md
│   │   │   └── critical-paths.md
│   │   └── captain/               # Captain orchestration + formula
│   │       ├── SKILL.md
│   │       └── scoring-formula.md
│   └── rules-captain/             # Captain mode rules
│
├── demo-app/                      # BEFORE state — vulnerable e-commerce API
│   ├── src/
│   │   ├── index.js               # Entry point (hardcoded secret, logs password)
│   │   └── routes/
│   │       ├── users.js           # SQL injection, plain-text passwords
│   │       ├── products.js        # Path traversal, high complexity, SQL injection
│   │       └── orders.js          # IDOR, no amount validation, dead code
│   ├── tests/
│   │   └── users.test.js          # 1 meaningless test, 12% coverage
│   └── package.json
│
├── mcp-server/                    # MCP server for Bob agents
│   ├── src/index.js               # 5 static analysis tools
│   └── package.json
│
├── scripts/
│   ├── autofix.js                 # Auto-fix engine
│   └── generate-tests.js          # Critical test generator
│
├── report-template/
│   └── release-report.html        # Sample final HTML report
│
└── docs/
    ├── problem-solution-statement.md
    ├── ibm-bob-usage-statement.md
    └── demo-script.md
```

---

## IBM Bob Features Used

| Feature | How ShipSafe Uses It |
|---|---|
| **Custom Modes** | 4 purpose-built modes with distinct roles, tool permissions, and instructions |
| **Skills** | 4 skills with supporting reference files (OWASP checklist, complexity thresholds, etc.) |
| **Subagents** | Captain spawns 3 specialist agents in parallel — true multi-agent AI teamwork |
| **MCP Server** | Custom-built MCP server exposes 5 static analysis tools to all agents |
| **Agent Mode** | Captain uses write tools to apply auto-fixes directly to source files |
| **create_html_artifact** | Generates beautiful, shareable release report in Bob's chat |
| **execute tool** | Agents run test suites, npm audit, and analysis scripts |

---

## Judging Criteria Alignment

| Criterion | ShipSafe Advantage |
|---|---|
| **Application of Technology** | Uses 6 Bob features: Custom Modes, Skills, Subagents, MCP, Artifacts, Execute |
| **Business Value** | Solves real pain for every dev team; replaces 3-hour manual release review |
| **Originality** | No tool gives ONE decision + auto-fix + AI team — not SonarQube, not Snyk |
| **Presentation** | 38→92 live demo in 2 minutes is unforgettable; report artifact is visually stunning |

---

## Team

Built for the IBM Bob 2.0 Hackathon · September 25–27, 2026
Prize Pool: $12,000 · [lablab.ai](https://lablab.ai/ai-hackathons/ibm-bob-2-hackathon)
