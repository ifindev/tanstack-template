---
name: change-management
description: Triage a new requirement, clarification, defect, or scope change against approved project artifacts, assess downstream impact, and update only the affected specifications and tasks. Use after discovery is locked or whenever implementation reveals that the agreed plan must change.
---

# Change Management

1. Capture the request verbatim with source, requester, date, urgency, and rationale.
2. Classify it as clarification, defect, compliance/security correction, scope change, technical change, or cancellation.
3. Compare it against approved discovery and specs. State whether it changes scope, acceptance, data, authorization, public contracts, operations, schedule, or cost.
4. Build an impact map covering affected artifacts, tasks, completed behavior, tests, migrations, integrations, documentation, and rollback.
5. For material changes, stop implementation until the human records approval evidence.
6. Reopen only the affected gates and rerun only the necessary planning skills.
7. Never rewrite history: append change records, supersede decisions explicitly, and create fix or migration tasks for completed work.
8. Use `assets/change-request-template.md` and update discovery change history plus `_decisions.md` when appropriate.

Emergency security or data-integrity fixes may be expedited, but still require a retrospective record and downstream reconciliation.
