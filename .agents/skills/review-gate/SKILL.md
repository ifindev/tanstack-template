---
name: review-gate
description: Evaluate a workflow artifact or implementation against the repository's explicit gate criteria and return pass, conditional pass, or fail with evidence and required corrections. Use between workflow phases, before locking specs, before execution, and before delivery.
---

# Review Gate

Review; do not silently repair unless the user also asks for edits.

1. Identify the gate and artifacts under review from `docs/ai-workflow/review-gates.md`.
2. Verify prerequisites and artifact status.
3. Check traceability from source evidence to decisions, specifications, tasks, implementation, and tests as applicable.
4. Separate:
   - blocking defects;
   - non-blocking risks;
   - unresolved assumptions;
   - optional improvements.
5. Validate internal consistency, scope boundaries, authorization, data implications, failure handling, quality attributes, and verification evidence.
6. Return one result:
   - `PASS`: all required criteria have evidence;
   - `CONDITIONAL PASS`: only explicitly accepted, owned, time-bounded risks remain;
   - `FAIL`: a blocking criterion is unmet.
7. Use `assets/gate-report-template.md`. Name exact files and headings that need correction.

Absence of evidence is not evidence of completion. Do not pass a gate because the artifact “looks comprehensive.”
