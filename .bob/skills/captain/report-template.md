# Release Report — Output Template Reference
# Used by Captain Mode when calling create_html_artifact

## Required Sections (in this order)

1. **Header** — ShipSafe logo + project name + scan timestamp + "IBM Bob 2.0"
2. **Verdict Banner** — RED/YELLOW/GREEN with icon, title, one-line description
3. **Score Cards Row** — Release Score (large) | Security | Quality | Tests (with weights)
4. **Formula Box** — Show the calculation: (sec×0.40) + (qual×0.35) + (test×0.25) = SCORE
5. **Before/After Comparison** — Only show if auto-fixes were applied; show delta points
6. **AFTER Verdict Banner** — If fixes applied, show the GREEN state too
7. **Findings Table** — Columns: ID | Severity | Agent | Finding | Location | Status
   - Sort: CRITICAL first, then HIGH, MEDIUM, LOW
   - Status values: Auto-Fixed (green) | Auto-Generated (green) | Manual (orange)
8. **Auto-Fixes Applied** — List every fix with ✅ icon, fix name, detail, file:line
9. **Manual Action Required** — Numbered list with severity, estimated time, Bob guidance command
10. **Footer** — "Made with IBM Bob 2.0 · ShipSafe v1.0"

## Visual Design Rules
- Dark theme: bg #0f1117, surface #161b27, borders #1e293b
- RED = #ef4444, YELLOW = #f59e0b, GREEN = #22c55e, BLUE accent = #60a5fa
- Font: system-ui stack
- Score numbers: font-weight 900, large (48px for main, 36px for agents)
- Findings table: monospace font for file refs, badge pills for severity

## Severity Badge Colors
- CRITICAL: bg #3f0f0f, text #ef4444
- HIGH: bg #3f1f0f, text #f97316
- MEDIUM: bg #3f320f, text #eab308
- LOW/Fixed: bg #052e16, text #22c55e

## create_html_artifact Call
- id: "shipsafe-release-report"
- title: "ShipSafe Release Report — [project name]"
- description: "Score: [N]/100 · [🔴 RED/🟡 YELLOW/🟢 GREEN] · [N] findings · [N] auto-fixed"
