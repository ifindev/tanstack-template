---
name: task-generation
description: Convert approved epic, flow, data, and interface specifications into dependency-aware, atomic task files and a task board. Use after detailed planning and before implementation to create verifiable units of work without duplicating the specifications.
---

# Task Generation

Create `docs/tasks/TASK-NNN.md` files and update `docs/tasks/_index.md`.

1. Read all approved specs for the selected slice and inspect the repository enough to identify real integration points.
2. Continue from the highest existing task ID. Never reuse an ID; mark abandoned tasks `cancelled`.
3. Prefer vertical, independently verifiable tasks. Split by dependency or risk boundary, not automatically into database/API/UI layers.
4. Keep each task small enough for one focused agent session and one coherent review.
5. Set explicit dependencies and reject cycles.
6. Reference canonical specs by path and heading; do not copy their full content into tasks.
7. Write observable definitions of done covering behavior, authorization, failure modes, tests, documentation, and relevant quality attributes.
8. Add a verification plan with commands and manual evidence. Do not require a specific tool such as Postman unless the project uses it.
9. Record excluded work and stop conditions.
10. Use templates in `assets/`, then run the task-plan gate.

Do not create implementation tasks for unapproved assumptions or unresolved data-model decisions.
