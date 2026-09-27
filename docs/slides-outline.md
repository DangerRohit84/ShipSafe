# ShipSafe — Slide Deck Outline
## IBM Bob 2.0 Hackathon Presentation · 8 Slides

---

## SLIDE 1 — Title Slide
**Headline:** ShipSafe
**Subline:** One number. One decision. Zero Friday fear.
**Visual:** Dark background, ShipSafe logo, large 🔴 38 → 🟢 92 transition graphic
**Bottom:** IBM Bob 2.0 Hackathon · September 2026

---

## SLIDE 2 — The Problem (30 seconds to read)
**Headline:** Every team fears the Friday release
**Three columns:**
- 😰 **The Symptom** — 847 SonarQube warnings. 23 Snyk findings. What does it mean?
- ⏰ **The Cost** — Delay = lost revenue. Guess = production incident at 2am.
- 🎯 **The Gap** — Every tool gives lists. Nobody gives a decision.

**Quote (large, bold):**
> "SonarQube gives you 847 warnings. ShipSafe gives you an answer."

---

## SLIDE 3 — The Solution
**Headline:** ShipSafe — AI Release Captain
**Visual:** The 4-agent architecture diagram
```
          🎖️ Captain Mode
         /       |        \
  🔒 Security  🔍 Quality  🧪 Tests
    (×0.40)    (×0.35)    (×0.25)
         \       |        /
    Release Readiness Score
         38 🔴 → 92 🟢
```
**One-liner:** Four IBM Bob custom modes. One decision.

---

## SLIDE 4 — How It Works (The Formula)
**Headline:** Transparent. Explainable. Defensible.
**Formula box (large):**
```
Release Score = (Security × 0.40) + (Quality × 0.35) + (Tests × 0.25)

score ≥ 80  →  🟢 GREEN  — Safe to ship
score 70–79 →  🟡 YELLOW — Ship with documented risk
score  < 70 →  🔴 RED    — Do not ship
```
**Below:** "Not a black box. Every point is explained. Every deduction is shown."

---

## SLIDE 5 — IBM Bob Features Used
**Headline:** Built on every IBM Bob 2.0 advanced feature
**6-cell grid:**
| Feature | Usage |
|---|---|
| 🧩 **Custom Modes** | 4 specialized modes with scoped tool access |
| 📚 **Skills** | 4 skills with OWASP checklist, complexity thresholds, critical path catalogue |
| 🤖 **Subagents** | Captain spawns 3 agents in parallel — true multi-agent AI |
| 🔌 **MCP Server** | Custom-built: 5 static analysis tools (run_tests, scan_secrets, check_complexity…) |
| ✏️ **Auto-Fix** | Bob writes fixes directly to source files |
| 📊 **Artifacts** | Beautiful HTML release report generated in Bob's chat |

---

## SLIDE 6 — The Live Demo
**Headline:** 38 🔴 → 92 🟢 in under 2 minutes
**Two-column:**

LEFT — BEFORE:
- SQL injection (users.js:15)
- Hardcoded JWT_SECRET
- DB password in console.log
- Path traversal
- JWT no expiry
- 12% test coverage
- **Score: 38 🔴 DO NOT SHIP**

RIGHT — AFTER:
- ✅ SQL → parameterized queries
- ✅ Secret → process.env
- ✅ console.log removed
- ✅ Path traversal fixed
- ✅ JWT expiry added
- ✅ 15 security tests generated
- **Score: 92 🟢 SAFE TO SHIP**

---

## SLIDE 7 — Business Value
**Headline:** Real pain. Real companies. Real savings.
**Three stats:**
- ⏱️ **3 hours** → typical manual pre-release security review time
- ⚡ **2 minutes** → ShipSafe scan + fix time
- 💰 **$12,000** → average cost of a production security incident (and that's the low end)

**Comparison table:**
| | SonarQube | Snyk | **ShipSafe** |
|---|---|---|---|
| Gives a decision | ❌ | ❌ | ✅ |
| Auto-fixes code | ❌ | ❌ | ✅ |
| Multi-agent AI team | ❌ | ❌ | ✅ |
| Inside your IDE | ❌ | ❌ | ✅ |
| Generates missing tests | ❌ | ❌ | ✅ |

---

## SLIDE 8 — Close
**Headline:** ShipSafe
**Large:** One number. One decision. Zero Friday fear.
**Visual:** Final HTML report showing 92 🟢 SAFE TO SHIP
**Bottom row:**
- 🏗️ Built with IBM Bob 2.0
- 🔗 github.com/[your-repo]
- 🏆 IBM Bob 2.0 Hackathon · September 2026

---

## PRESENTATION TIPS
- Each slide should take ~30 seconds — 8 slides = ~4 minutes with transitions
- Slide 6 is your strongest — spend the most time here
- If presenting live, have the HTML report open in a browser tab and switch to it on Slide 6
- Use dark theme (matching the ShipSafe report) for visual consistency
- Font recommendation: Inter or system-ui, large sizes, high contrast
