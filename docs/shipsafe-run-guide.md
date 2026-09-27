# ShipSafe — Hackathon Run Guide
## IBM Bob 2.0 Hackathon · September 25–27, 2026
## Minute-by-minute execution plan for the 48-hour build window

---

## BEFORE THE HACKATHON (Do these NOW, before Sept 25)

- [ ] Push this entire `shipsafe/` folder to a **public GitHub repo**
      `git init && git add . && git commit -m "ShipSafe initial commit" && git push`
- [ ] Confirm the repo is publicly accessible (open in incognito)
- [ ] Install Node.js 18+ on your machine
- [ ] Install IBM Bob 2.0 IDE (check your hackathon invitation email)
- [ ] Watch the Bob 2.0 tutorial: custom modes + subagents (15 min)
- [ ] Read your two submission statements once more (they are ready to paste)
- [ ] Download OBS Studio or QuickTime for screen recording your demo video

---

## KICKOFF: SEPT 25 · 8:30 PM IST

**First 30 minutes (8:30–9:00 PM IST):**
- Watch the kickoff stream
- Register on lablab.ai if not already done
- Confirm you have IBM Bob 2.0 access

---

## HOUR 1 (9:00–10:00 PM IST) — Setup and First Scan

### Step 1: Open ShipSafe in IBM Bob (5 min)
1. Open IBM Bob IDE
2. File → Open Folder → select the `shipsafe/` folder
3. Confirm you see the 4 modes in the mode selector:
   - 🎖️ ShipSafe Captain
   - 🔒 ShipSafe Security Agent
   - 🔍 ShipSafe Quality Agent
   - 🧪 ShipSafe Test Agent

### Step 2: Install dependencies (5 min)
Open IBM Bob terminal (or your system terminal in shipsafe/):
```bash
npm run setup
```
This runs `npm install` in both `mcp-server/` and `demo-app/`.

### Step 3: Verify MCP server starts (2 min)
```bash
npm run mcp:start
```
You should see: `ShipSafe MCP Server running on stdio`
Press Ctrl+C to stop — Bob will start it automatically.

### Step 4: Run your FIRST scan (the BEFORE scan) (20 min)
1. Select mode: **🎖️ ShipSafe Captain**
2. Type in Bob chat:
   ```
   Run ShipSafe scan on ./demo-app
   ```
3. Watch the three subagents spawn — this is your demo money shot
4. **TAKE SCREENSHOTS NOW** — you need session summary screenshots for submission
5. Wait for the HTML report artifact to appear
6. Screenshot the report showing **38 🔴 DO NOT SHIP**

### Step 5: Save your BEFORE screenshots
Create a folder: `shipsafe/docs/session-screenshots/`
Save:
- Screenshot of Captain spawning Security Agent subagent
- Screenshot of Captain spawning Quality Agent subagent
- Screenshot of Captain spawning Test Agent subagent
- Screenshot of final score: 38 RED
- Screenshot of the HTML release report

---

## HOUR 2 (10:00–11:00 PM IST) — Auto-Fix and AFTER Scan

### Step 6: Run auto-fix (5 min)
In Bob chat (still in Captain mode):
```
Apply all auto-fixes to ./demo-app
```
OR directly:
```bash
npm run demo:fix
npm run demo:tests
```

### Step 7: Run your SECOND scan (the AFTER scan) (20 min)
In Bob chat:
```
Re-run ShipSafe scan on ./demo-app after fixes
```
Wait for new HTML report showing **92 🟢 SAFE TO SHIP**

### Step 8: Save your AFTER screenshots
- Screenshot of Captain spawning all three agents (second run)
- Screenshot of score: 92 GREEN
- Screenshot of Before/After comparison (38 → 92)
- Screenshot of the auto-fixes applied section

---

## HOUR 3–4 (11:00 PM – 1:00 AM IST) — Record Demo Video

### The 3-Minute Video (MOST IMPORTANT DELIVERABLE)

**Setup your screen before recording:**
- IBM Bob IDE open, Captain mode selected
- `demo-app/src/routes/users.js` open in the editor (shows the SQL injection)
- Terminal visible at the bottom
- Font size: make text readable on 1080p

**Recording sequence:**
1. Reset demo to BEFORE state: `npm run demo:reset`
2. Start screen recording (OBS or QuickTime)
3. Follow [`docs/demo-script.md`](demo-script.md) EXACTLY — it is timed to 3 minutes
4. Key moments to capture clearly:
   - Score: **38** appearing (pause 2 seconds)
   - Three subagents spawning in parallel
   - Auto-fix applying (show the diff in the editor)
   - Score: **92** appearing (pause 2 seconds)
   - The HTML report artifact final view

**Record 3 takes minimum. Use the best one.**

**Export settings:**
- Format: MP4
- Resolution: 1920×1080
- Max size: 200MB
- Under 3 minutes (judges will not watch more)

---

## HOUR 5–6 (1:00–3:00 AM IST) — Polish and Submission Prep

### Code quality sweep
- Make sure demo-app/ runs: `cd demo-app && npm start`
- Make sure tests run: `npm run demo:test-run`
- Commit all files to GitHub: `git add . && git commit -m "ShipSafe complete" && git push`
- Verify repo is public (open in incognito browser tab)

### Prepare submission screenshots folder
Your repo MUST include session screenshots. Create:
```
shipsafe/docs/session-screenshots/
├── 01-captain-before-scan.png
├── 02-security-agent-spawned.png
├── 03-quality-agent-spawned.png
├── 04-test-agent-spawned.png
├── 05-score-38-red.png
├── 06-report-before.png
├── 07-autofix-applied.png
├── 08-captain-after-scan.png
├── 09-score-92-green.png
└── 10-report-after.png
```
Commit these: `git add docs/session-screenshots/ && git commit -m "Add session screenshots" && git push`

---

## SUBMISSION DAY: SEPT 27 · DEADLINE 8:30 PM IST

### 4 hours before deadline (4:30 PM IST) — Final submission prep

**Everything you need for the submission form:**

#### Project Title
```
ShipSafe — AI-Powered Release Readiness System
```

#### Short Description
```
One number. One decision. Zero Friday fear. ShipSafe gives every release a 
Release Readiness Score (0–100) with a RED/GREEN verdict using 4 IBM Bob 
custom modes, parallel subagents, a custom MCP server, and auto-fix engine.
```

#### Long Description
→ Copy from [`docs/problem-solution-statement.md`](problem-solution-statement.md)

#### IBM Bob Usage Statement
→ Copy from [`docs/ibm-bob-usage-statement.md`](ibm-bob-usage-statement.md)

#### Technology & Category Tags
```
IBM Bob 2.0, Node.js, MCP, Multi-Agent AI, Security, Code Quality, 
Release Management, DevOps, OWASP
```

#### Code Repository
→ Your public GitHub repo URL

#### Demo Application Platform
```
IBM Bob 2.0 IDE
```

#### Application URL
→ Your GitHub repo URL (the running demo is inside Bob)

#### Cover Image
→ Screenshot of the 38→92 HTML report (the before/after comparison section)
   Size: at least 1280×720

#### Video Demonstration
→ Your best 3-minute take, exported as MP4

#### Slide Presentation
→ See [`docs/slides-outline.md`](slides-outline.md) — 8 slides, 5 minutes

---

## EMERGENCY PROCEDURES

### If MCP server won't start
Bob agents can still run without it — they use their skills directly.
Tell Bob: "The MCP server is unavailable. Use your skill reference files to scan manually."

### If subagents time out
Run agents one at a time:
1. Switch to Security Agent mode → "Scan ./demo-app for security vulnerabilities"
2. Switch to Quality Agent mode → "Scan ./demo-app for code quality issues"
3. Switch to Test Agent mode → "Analyse test coverage in ./demo-app"
4. Switch to Captain mode → "Combine these results: [paste the three JSON reports]"

### If score comes out different from 38/92
That is fine — the exact numbers are tunable. What matters is:
- BEFORE < 70 (RED) ✅
- AFTER > 80 (GREEN) ✅
- A meaningful delta of 40+ points ✅

### If you run out of Bob API credits
- Prioritize Captain + Security Agent (most impressive)
- Skip Quality Agent if needed
- The HTML report can be shown as a static file from `report-template/`

---

## CHECKLIST — DO NOT SUBMIT WITHOUT THESE

- [ ] Public GitHub repo with all code
- [ ] Session screenshots in repo (at least 5)
- [ ] Video: MP4, under 3 minutes, 90+ seconds showing solution in action
- [ ] Long description: 474 words (already written in docs/)
- [ ] IBM Bob usage statement: 484 words (already written in docs/)
- [ ] Cover image: the HTML report screenshot
- [ ] All form fields filled on lablab.ai
- [ ] Submitted BEFORE 8:30 PM IST September 27 ← hard deadline
