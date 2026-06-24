---
name: execute-task
description: Implement one story from the project's tracker board. Loads the project brief, the story's epic, and the story file; flips the story status in trackers; writes code scoped to the story; runs verification; flips the story to done. Use after the project-brief and feature-epic skills have produced the spec set.
---

# Execute One Story

## When to use

Invoke explicitly with `/execute-task` or `$execute-task`. Run it when:

- The project brief, epic, and story files exist for the work you want to do.
- You want the agent to implement exactly one page-level story end-to-end.

Do not invoke before the spec exists. If the story file is missing, run `feature-epic create` or `feature-epic add-story` first.

## Modes

- `next` — Read `docs/trackers.md`; pick the first `- [ ]` story in document order across all epics; build that.
- `<id>-<slug>/<NN>-<story-slug>` — Build the named story explicitly (e.g. `0001-cars/02-create`). Use when you want to skip ahead or rebuild.

## Inputs

The skill reads, in order:
1. `AGENTS.md` — application architecture reference (stack, module pattern, conventions)
2. `docs/project-brief.md` — project altitude truth
3. `docs/trackers.md` — board state, to pick a story (in `next` mode) and to flip checkboxes
4. `docs/features/<id>-<slug>/_epic.md` — feature context (shared components, build order, shared module files)
5. `docs/features/<id>-<slug>/<NN>-<story-slug>.md` — the construction doc for this story

## Process

1. Resolve the target story (from `next` or the explicit argument). If the story file does not exist, stop and ask the user to draft it via `feature-epic` first.
2. Read all inputs listed above. Confirm dependencies named in the story's Dependencies / Prereqs section exist. If a prereq is missing, stop and identify it.
3. Confirm the working tree can be changed safely. Preserve unrelated user changes.
4. Mark the story in progress in `docs/trackers.md`:
   - Flip its line from `- [ ] [<NN>-<slug>](...)` to `- [-] [<NN>-<slug>](...)`
   - Set the Summary line: `- **Now building**: [<link to story>]`
5. Inspect existing code patterns before editing. Follow the repository's architecture (ViewModel pattern, kebab-case files, PascalCase component exports, tRPC module structure, RBAC enforcement points) as documented in `AGENTS.md` and `docs/guides/`.
6. Implement the story's Tasks list. Stay within the story's scope:
   - Reversible incidental edits required to complete the task are allowed.
   - Unrelated cleanup is not in scope.
   - Reuse components and helpers named in the story's Components on Page / Frontend Wiring sections rather than creating new ones.
7. Classify ambiguity as you go:
   - **Local implementation detail with no contract impact**: use repository precedent and record the choice in your final handoff.
   - **Product, authorization, data-shape, security, public-contract, or destructive choice**: stop and request a decision from the user.
   - **Contradiction between brief / epic / story**: stop and identify the conflicting sources.
8. Run the story's verification: any unit tests listed in Tasks, the manual test description, plus proportionate regression checks (type check, lint, relevant existing tests).
9. On completion, update `docs/trackers.md`:
   - Flip the story line from `- [-]` to `- [x]`
   - Clear the `- **Now building**` line in the Summary
   - Decrement Pending by 1, increment Done by 1
10. Return a concise handoff: outcome, changed files, verification evidence, decisions, deviations, and remaining risks.

## Output

- Code changes scoped to the story's Tasks list
- Modified `docs/trackers.md` (checkbox state + Summary counts)
- Verification evidence (test output, type check, lint result) in the handoff

## Conventions

- **One story at a time**. Do not start a second story while one is `- [-]` in trackers.
- **No unrelated cleanup**. If you notice a separate issue, mention it in the handoff and let the user decide whether to spawn a separate task.
- **Definition of done**: every Task in the story's checklist has evidence. Tests pass. The flow described in User Flow works end-to-end (manual or automated).
- **Spec is the source of truth**. If the implementation diverges from the spec, either update the spec via `feature-epic add-story` / direct edit (if the spec was wrong) or revise the implementation (if the spec was right). Never let implementation silently become the spec.

## Stop conditions

Halt and ask the user when:
- The story file does not exist
- A dependency in Prereqs is missing
- A material ambiguity affects product behavior, authorization, data shape, security, public contract, or destructive operations
- The brief, epic, or story contradict each other
- A required external resource (S3 credentials, third-party API, etc.) is not configured

When stopping, name the blocker precisely and the options.
