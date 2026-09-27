# ShipSafe — Demo Video Script
## 3 Minutes Maximum · Must show solution in action for ≥ 90 seconds

---

## PRE-DEMO SETUP (before recording)
- Open IBM Bob IDE with `shipsafe/` as workspace
- Open `demo-app/src/routes/users.js` in editor (visible in background)
- Mode selector set to 🎖️ ShipSafe Captain
- Terminal visible at bottom
- Screen resolution: 1920×1080, font size large enough to read code

---

## [0:00–0:25] — HOOK (The Problem)

**[Show: Split screen — left: endless SonarQube/ESLint report · right: slack messages "is it safe to ship?"]**

**NARRATE:**
> "It's Friday 4pm. Your team just finished a sprint. The release window is in
> 30 minutes. Your CI passed. But someone asks — is it actually safe to ship?
> You open SonarQube. 847 warnings. You check the security scan. 23 findings.
> You have no idea what any of this means for your production system.
> That's the problem ShipSafe solves."

**[Show: ShipSafe logo — "One number. One decision."]**

---

## [0:25–0:45] — THE BEFORE STATE

**[Show: IBM Bob IDE · demo-app/src/routes/users.js open in editor]**

**NARRATE:**
> "This is a real Node.js e-commerce API with the exact vulnerabilities teams
> ship by accident every week."

**[Scroll slowly through users.js — pause on line 15 (SQL injection)]**

**NARRATE:**
> "SQL injection here — user input directly in the query string.
> Hardcoded JWT secret here. Password logged to the console on startup.
> Path traversal in the products route. JWT tokens that never expire.
> Any user can read any other user's orders.
> And test coverage? Twelve percent — with one test that asserts nothing."

---

## [0:45–1:05] — STARTING THE SCAN

**[Show: IBM Bob chat · Captain mode selected · type the prompt]**

**TYPE in Bob chat:**
```
Run ShipSafe scan on ./demo-app
```

**[Show: Bob response beginning — Captain announcing subagent spawning]**

**NARRATE:**
> "I switch to Captain Mode in IBM Bob and type three words.
> The Captain immediately spawns three specialist AI agents in parallel —
> a Security Agent, a Quality Agent, and a Test Agent.
> Each is a custom IBM Bob mode with its own skills and tools.
> Each runs simultaneously, just like a real engineering team."

**[Show: Three subagent spawns visible in Bob's chat — brief moment of parallel activity]**

---

## [1:05–1:35] — THE VERDICT: 38 RED

**[Show: Captain's output — score calculation visible step by step]**

**NARRATE:**
> "The Security Agent finds three CRITICAL vulnerabilities.
> The Quality Agent finds complexity 14, dead code, and missing error handling.
> The Test Agent confirms twelve percent coverage with no security tests.
> Captain applies the weighted formula:
> Security forty percent, Quality thirty-five, Tests twenty-five."

**[Show: Score calculation in Captain's output: (20×0.40) + (55×0.35) + (8×0.25) = 38]**

**NARRATE:**
> "Release Readiness Score: **38 out of 100.**"

**[Show: HTML artifact appearing — dark report with massive red 38 and "DO NOT SHIP" banner]**

**NARRATE:**
> "DO NOT SHIP. Anyone — any CTO, any PM, any junior developer — understands
> this in five seconds. No report to interpret. Just: do not ship."

---

## [1:35–1:55] — AUTO-FIX IN ACTION

**[Show: Bob chat · Captain announces auto-fix phase]**

**NARRATE:**
> "But ShipSafe doesn't just report — it fixes."

**[Show: Captain applying fixes in Bob chat — file diffs appearing]**

**NARRATE:**
> "The Captain applies six safe, mechanical fixes automatically.
> Hardcoded JWT secret becomes an environment variable.
> The password disappears from the console log.
> JWT tokens now expire in one hour.
> Error messages no longer leak database details.
> Fifteen critical security tests are generated — covering SQL injection,
> path traversal, auth bypass, negative amounts."

**[Show: users.js before/after diff — JWT_SECRET fix visible]**

---

## [1:55–2:20] — THE VERDICT: 92 GREEN

**[Show: Captain running re-scan, then final score]**

**NARRATE:**
> "Captain rescans with fixes applied."

**[Show: New score calculation: (76×0.40) + (85×0.35) + (80×0.25) = 92]**

**NARRATE:**
> "Release Readiness Score: **92 out of 100.** GREEN. Safe to ship."

**[Show: HTML artifact updating — green 92, "SAFE TO SHIP" banner, before/after 38→92]**

**NARRATE:**
> "The report shows exactly what was auto-fixed and the four remaining items
> with estimated fix times and IBM Bob guidance commands.
> From fear to confidence in under two minutes."

---

## [2:20–2:45] — THE ARCHITECTURE

**[Show: architecture diagram or custom_modes.yaml in Bob]**

**NARRATE:**
> "ShipSafe uses every advanced IBM Bob 2.0 feature:
> Four custom modes. Four skills with reference libraries.
> A custom-built MCP server with five static analysis tools.
> Parallel subagents. File editing. Command execution.
> And a shareable HTML release report — generated right in Bob's chat."

---

## [2:45–3:00] — CLOSE

**[Show: Final HTML report full-screen — 38 → 92 · RED → GREEN]**

**NARRATE:**
> "SonarQube gives you 847 warnings. Snyk gives you a list.
> ShipSafe gives you an answer.
> ShipSafe — One number. One decision. Zero Friday fear.
> Built on IBM Bob 2.0."

**[End card: ShipSafe logo + IBM Bob 2.0 Hackathon]**

---

## RECORDING TIPS
- Record in one take if possible — judges can see edit cuts
- Keep narration calm and confident, not rushed
- Pause 1 second after showing each key number (38, 92) — let it land
- Make sure Bob's chat text is readable at video resolution
- Export at 1080p H.264, keep under 200MB for upload
- Subtitle optional but recommended for international judges
