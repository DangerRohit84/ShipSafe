# ShipSafe — IBM Bob Usage Statement
## IBM Bob 2.0 Hackathon Submission

---

IBM Bob 2.0 is not peripheral to ShipSafe — it IS ShipSafe. Every core capability
of the system is a direct expression of IBM Bob's most advanced features working
together.

**Custom Modes (4 modes built):** ShipSafe's multi-agent architecture is implemented
as four IBM Bob custom modes in `.bob/custom_modes.yaml`. The Captain mode has full
tool access (read, edit, execute, mcp, skill, subagent) with `customInstructions`
encoding the scoring formula, auto-fix rules, and report protocol. The three
specialist modes have precisely scoped permissions: Security and Test agents have
`execute` access to run analysis commands; the Quality agent is read-only for safe
code review. This is Bob's custom mode system used exactly as designed: specialized
roles with controlled capabilities.

**Skills (4 skills with supporting files):** Each specialist agent activates a
dedicated skill on startup. The `security-scan` skill loads an OWASP Top 10 checklist
and a pattern library of dangerous code constructs. The `quality-scan` skill loads
complexity thresholds and a production-risk code smell catalogue. The `test-coverage`
skill loads coverage scoring rules and a catalogue of 14 critical test scenarios that
must exist before any release. The `captain` skill loads the authoritative weighted
scoring formula. Each skill includes multiple supporting reference files Bob reads
automatically, making agents deeply knowledgeable without user configuration.

**Subagents:** The Captain's most powerful action is spawning all three specialist
agents as parallel IBM Bob subagents. Security, Quality, and Test all run
simultaneously in isolated context windows, then return structured JSON reports to
the Captain for synthesis. This is true multi-agent parallelism — mirroring how a
real engineering team runs checks in parallel and reports to the release authority.

**MCP Server (custom-built):** ShipSafe includes a purpose-built Model Context
Protocol server registered in `.bob/mcp.json`. It exposes five static analysis tools
to all agents: `run_tests` (executes jest and parses coverage JSON), `scan_secrets`
(detects hardcoded credentials), `check_complexity` (measures cyclomatic complexity),
`audit_deps` (runs npm audit), and `list_source_files` (discovers project structure).
Agents call these tools directly during scans, extending Bob's built-in capabilities
with domain-specific analysis.

**Agent Mode (file editing and command execution):** The Captain uses IBM Bob's write
tools (`apply_diff`, `search_and_replace`) to apply auto-fixes directly to source
files — replacing hardcoded secrets, patching error leakage, adding JWT expiry. It
uses `execute_command` to run `autofix.js` and `generate-tests.js`, which apply
programmatic fixes and generate missing test cases. This demonstrates Bob operating
as an active development partner, not just an advisor.

**Artifact Generation:** The Captain uses `create_html_artifact` to produce the
ShipSafe Release Report — a self-contained HTML document with a score gauge, verdict
banner, findings table, auto-fix log, and manual action items. This artifact is
shareable directly from Bob's chat, making the release decision immediately
communicable to any stakeholder without leaving the IDE.

Every part of ShipSafe — scanning, scoring, fixing, and reporting — is IBM Bob 2.0
working as a full AI development lifecycle partner across the entire release workflow.
