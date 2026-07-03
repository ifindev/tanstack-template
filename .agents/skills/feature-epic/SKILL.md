---
name: feature-epic
description: Draft a feature epic — the mid-altitude doc indexing a feature's pages plus one detailed story file per page — and keep docs/trackers.md in sync. Use to create the initial epic for a feature row from the PRD, or to add a new story to an existing epic (e.g. a post-MVP CRUD addition).
---

# Feature Epic

## When to use

Invoke explicitly with `/feature-epic` or `$feature-epic`. Run it when:

- A feature row exists in `docs/prd.md` and needs its epic + initial stories drafted. Use `create` mode.
- An existing epic needs a new story added (e.g. a new page or action that wasn't in the original epic). Use `add-story` mode.

Do not invoke without a corresponding row in the Features table of `docs/prd.md`. If the feature isn't in the PRD, run `prd update` first.

## Modes

- `create <id>-<slug>` — Draft the full epic folder: `_epic.md` plus one file per initial story. Append a new epic section to `docs/trackers.md` with all stories unchecked.
- `add-story <id>-<slug> <story-slug>` — Read existing epic, draft one new story file, update the epic's Pages & Stories table, append one line to that epic's section in `docs/trackers.md`.

## Inputs

The user provides:
- The feature id and slug — for example `0001-cars`. Must match a row in the PRD's Features table.
- A description of the feature and its initial stories — for `create` mode.
- A description of the new story — for `add-story` mode.

The skill reads:
- `docs/prd.md` (always)
- `docs/features/<id>-<slug>/_epic.md` (in `add-story` mode)
- `docs/_templates/_epic.md` and `docs/_templates/story.md` (structure)
- `docs/_examples/features/0001-cars/` (filled-in reference)

## Process — `create` mode

1. Read `docs/prd.md`. Confirm a Features table row exists for `<id>-<slug>`. If not, stop and tell the user to run `prd update` first.
2. Take the user's feature description. Identify the initial set of stories — typically one per page (list, create, edit, archive for a CRUD feature, plus any custom actions).
3. Ask targeted questions only for ambiguity (which interactions are in MVP, which actions are role-gated, any special UI states).
4. Draft `docs/features/<id>-<slug>/_epic.md` from `docs/_templates/_epic.md`:
   - Goal: one-paragraph statement
   - Pages & Stories: table linking each story file
   - Entities Touched: pulled from the PRD's Data Model
   - Shared Components: components reused across multiple stories
   - Shared Module Files: schema, service, router paths under `src/modules/<slug>/`
   - Build Order: numbered list, lowest-risk first
   - Related: links back to PRD and trackers
   - Open Questions
5. For each story, draft `docs/features/<id>-<slug>/<NN>-<story-slug>.md` from `docs/_templates/story.md`:
   - Page (route, layout, roles, title)
   - Dependencies / Prereqs
   - User Flow
   - Components on Page (flat by default — see Conventions)
   - Validations (table referencing schema name in `src/modules/<slug>/schema.ts`)
   - UI States (loading, empty, error, submitting, success — always check all)
   - Copy (centralized strings table)
   - API (procedure name, auth, input/output reference, side effects, failure modes)
   - Frontend Wiring (route file, view model, components, schemas — all file paths)
   - Tasks (atomic checkbox list)
   - Open Questions
6. Append a new section to `docs/trackers.md`:
   ```
   ## <id> — <Feature Name> · [epic](./features/<id>-<slug>/_epic.md)
   - [ ] [01-<slug>](./features/<id>-<slug>/01-<slug>.md) — <one-line title>
   - [ ] [02-<slug>](./features/<id>-<slug>/02-<slug>.md) — <one-line title>
   ```
7. Update the trackers Summary block: Total += N, Pending += N.
8. Show the user the file list and a one-line summary of each story.

## Process — `add-story` mode

1. Read `docs/prd.md` and `docs/features/<id>-<slug>/_epic.md`.
2. Determine the next story number by scanning existing files in the epic folder.
3. Take the user's story description. Determine if it impacts the PRD:
   - Introduces a new entity (e.g. an audit `ImportJob` row)
   - Adds a route that's not just a sub-path of the existing feature
   - Grants access to a role not listed for that resource
   - Changes a shared invariant
4. If PRD impact detected, prompt:
   > "This story introduces `<change>`. Update PRD first? [Y/n]"
   - `Y`: transition into `prd update` logic inline; apply PRD changes; then continue drafting story.
   - `n`: proceed without PRD change; user accepts the PRD will be out of date.
5. Ask targeted questions for ambiguity in the story (file size limits, error handling, rollback behavior, etc.).
6. Draft `docs/features/<id>-<slug>/<NN>-<story-slug>.md` from `docs/_templates/story.md`.
7. Update the Pages & Stories table in `_epic.md` to include the new story row.
8. Append a single line to that epic's section in `docs/trackers.md`:
   ```
   - [ ] [<NN>-<slug>](./features/<id>-<slug>/<NN>-<slug>.md) — <one-line title>
   ```
9. Update trackers Summary: Total += 1, Pending += 1.

## Output

- `create`:
  - `docs/features/<id>-<slug>/_epic.md`
  - `docs/features/<id>-<slug>/<NN>-<slug>.md` × N
  - Modified `docs/trackers.md`
- `add-story`:
  - `docs/features/<id>-<slug>/<NN>-<slug>.md`
  - Modified `docs/features/<id>-<slug>/_epic.md` (Pages & Stories table)
  - Modified `docs/trackers.md`

## Conventions

- **Language**: prose follows the user's prompt language; code identifiers always English.
- **File naming**: stories are `<NN>-<slug>.md` with two-digit numeric prefix (`01`, `02`, …) ordered by build sequence.
- **Component decomposition (important)**: prefer **flat single-file components**. One component file per coherent UI block. Only split into sub-components when (a) the piece is genuinely reused on another page, or (b) the file passes ~300 lines of code. Form sections, headers, action bars, footers, modals belong inside the parent component file by default — do not pre-split.
- **Component files**: kebab-case file name, PascalCase exported component, `function` declaration as default export.
- **Routes**: kebab-case URL paths; route file paths follow TanStack Router conventions.
- **Validation copy** lives in the story's Copy table (centralized, easy to find, easy to localize later).
- **API section**: reference the schema by name (`carCreateSchema` in `src/modules/cars/schema.ts`) — do not redefine it in the story.
- **Build Order in epic**: schema + migration first, then service + tests, then router with role guards, then stories in dependency order (read-only stories before write stories).

## Chain

- `add-story` → `prd update` (with Y/n confirmation gate when PRD impact detected)
- This skill does not chain to `execute-task` — the user explicitly invokes `execute-task` when ready to build.

## Stop conditions

Halt and ask when:
- The Features table in `docs/prd.md` has no matching row for `<id>-<slug>`
- The story description contradicts an entity invariant in the PRD
- The story would touch entities not listed in the PRD and the gap is non-trivial
- An RBAC implication is unclear (which role can take this action)
- A shared component would conflict with one already documented under another epic

When stopping, name the conflict precisely and the options.
