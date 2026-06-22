---
name: execute-task
description: Implement exactly one approved task from the repository task board, including context loading, scoped changes, verification, evidence, and task-state updates. Use for build sessions after planning is approved; stop on material spec gaps or unauthorized scope expansion.
---

# Execute One Task

1. Read, in order: `AGENTS.md`, `docs/specs/_context-block.md`, `docs/specs/_decisions.md`, `docs/tasks/_index.md`, the task file, and every `spec_refs` entry.
2. Confirm all dependencies are done and the working tree can be changed safely. Preserve unrelated user changes.
3. Mark the task `doing` and record `started_at` only when beginning implementation.
4. Inspect existing patterns before editing. Follow the repository's architecture and verification commands.
5. Implement only the task scope. Reversible incidental edits required to complete the task are allowed; unrelated cleanup is not.
6. Classify ambiguity:
   - local implementation detail with no contract impact: use repository precedent and record it;
   - product, authorization, data, security, public-contract, or destructive choice: stop and request a decision;
   - contradiction between artifacts: stop and identify the conflicting sources.
7. Run the task verification plan plus proportionate regression checks.
8. Record commands, results, deviations, and residual risks in the task notes.
9. Do not mark done until every definition-of-done item has evidence. A human may require an additional review gate.
10. Update `_index.md` consistently.

Return a concise handoff: outcome, changed files, verification evidence, decisions, deviations, and remaining risks.
