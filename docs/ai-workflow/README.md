# AI-Assisted Software Delivery Workflow

This repository ships with a lightweight, agent-driven workflow for taking a project idea from concept to working code with the help of Claude Code or Codex.

The harness is intentionally minimal — three skills, two layers of docs, one tracker file.

## The two-layer doc model

```
docs/
├── project-brief.md          ← high altitude: the project's living truth
├── trackers.md               ← board state for all stories
├── features/
│   ├── 0001-<slug>/
│   │   ├── epic.md           ← mid altitude: this feature's index + shared context
│   │   ├── 01-<slug>.md      ← low altitude: one page-level construction doc
│   │   ├── 02-<slug>.md
│   │   └── …
│   └── 0002-<slug>/
│       └── …
├── _templates/               ← empty starters
└── _examples/                ← filled car-rental example
```

**Layer 1 — Project Brief** (`docs/project-brief.md`): one living document at project altitude. Contains Product, Roles, Features (table with links to each epic), RBAC matrix, Data Model (DB-typed tables), Routes, Tech, Open Questions. Loaded every session. Updated when project structure changes (new feature, new entity, new role, new route) — not for every story tweak.

**Layer 2 — Feature Epic + Stories** (`docs/features/<id>-<slug>/`): one folder per feature. `epic.md` is the index plus shared context (shared components, shared module files, build order). Each story file is one page-level construction doc: Page, Dependencies, User Flow, Components on Page, Validations, UI States, Copy, API, Frontend Wiring, Tasks, Open Questions.

**Trackers MOC** (`docs/trackers.md`): board state. Grouped by epic. Checkbox states: `[ ]` pending, `[-]` in progress, `[x]` done. Summary block at the top with totals and `Now building`.

Per-session context cost: brief (~300 lines) + epic (~50) + one story (~150) ≈ 500 lines.

## The three skills

Canonical bodies live in `.agents/skills/`; Claude Code uses the same files via symlinks in `.claude/skills/`.

| Skill | Purpose | Modes |
|---|---|---|
| [`project-brief`](../../.agents/skills/project-brief/SKILL.md) | Draft or update `docs/project-brief.md` | `create`, `update` |
| [`feature-epic`](../../.agents/skills/feature-epic/SKILL.md) | Draft a feature epic + its stories; keep trackers in sync | `create <id>-<slug>`, `add-story <id>-<slug> <story>` |
| [`execute-task`](../../.agents/skills/execute-task/SKILL.md) | Implement exactly one story, end-to-end | `next`, `<id>-<slug>/<NN>-<story>` |

The skills compose with **confirmation gates** rather than separate manual invocations. When `project-brief update` adds a new feature row, it asks: *"Brief updated. Draft epic now? [Y/n/later]"*. When `feature-epic add-story` detects brief impact (new entity, new role, new route), it asks: *"Update brief first? [Y/n]"*. You stay in control of where the flow ends.

## Two flows

### Flow A — MVP from scratch

1. **Idea → brief**: invoke `/project-brief` and describe the project conversationally. The skill suggests reasonable defaults (auth, standard CRUD, RBAC defaults), asks targeted questions for genuine ambiguity, and writes `docs/project-brief.md`.
2. **Brief → epics**: for each feature row in the brief, invoke `/feature-epic create <id>-<slug>` (e.g. `0001-cars`). The skill drafts the epic plus initial stories and appends to `trackers.md`.
3. **Epics → code**: invoke `/execute-task next` (or name a specific story). The skill flips the story to `- [-]` in trackers, implements the Tasks list, runs verification, flips to `- [x]`.

### Flow B — Add a feature after MVP

1. **New feature → brief update**: invoke `/project-brief` and describe the new feature. The skill detects it adds a Features row, RBAC, new entities, new routes; proposes a diff; applies on confirm. Then asks: *"Draft epic for `<id>-<slug>` now? [Y/n/later]"*.
2. **If yes**: skill transitions inline into `feature-epic create`.
3. **Then code**: `/execute-task next` as usual.

### Flow C — Add a story to an existing feature

1. Invoke `/feature-epic add-story <id>-<slug> <story-slug>` and describe the story.
2. The skill checks if the new story affects the brief (new entity? new route not under the feature? new role access?). If yes, asks: *"Update brief first? [Y/n]"*.
3. Drafts the new story file, updates the epic's Pages & Stories table, appends one line to trackers.

## Conventions

### Language

Prose follows the user's prompt language — if you write in Indonesian, the brief is in Indonesian. **Code identifiers stay English in all cases.**

| Element | Language |
|---|---|
| Prose, headers, descriptions | User's language |
| Table cells with explanations | User's language |
| Entity names, field names, enum values | English |
| Types (`VARCHAR`, `DECIMAL`) | English |
| File names, route paths | English (kebab-case) |
| Component names | English (PascalCase) |
| User-facing copy (button labels, error messages) | User's language |

### Naming

- **Feature folders**: `<NNNN>-<kebab-slug>` — sequential prefix, no timestamps. Example: `0001-cars`, `0002-bookings`.
- **Story files**: `<NN>-<kebab-slug>.md` — two-digit prefix indicating build order within the epic. Example: `01-list.md`, `02-create.md`.
- **Component files**: kebab-case (`car-form.tsx`). Exported component: PascalCase (`CarForm`).
- **Route paths**: kebab-case (`/cars/new`, `/portal/bookings`).

### Data model

Entities in the brief use Postgres SQL types in a four-column table:

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `plate` | `VARCHAR(10)` | NOT NULL, UNIQUE | `^[A-Z0-9]{4,10}$` |

DB-level rules (NOT NULL, UNIQUE, FK, DEFAULT) go in Constraints. Business rules and formats go in Notes.

### Component decomposition

Prefer flat single-file components. One file per coherent UI block. Only split into sub-components when (a) reused on another page, or (b) the file passes ~300 lines. Form sections, headers, action bars, footers stay inside the parent component file by default.

## Examples

Filled-in references live in [`docs/_examples/`](../_examples/):

- [`project-brief.md`](../_examples/project-brief.md) — Car Rental System brief
- [`trackers.md`](../_examples/trackers.md) — board with mixed statuses
- [`features/0001-cars/epic.md`](../_examples/features/0001-cars/epic.md)
- [`features/0001-cars/01-list.md`](../_examples/features/0001-cars/01-list.md)
- [`features/0001-cars/02-create.md`](../_examples/features/0001-cars/02-create.md) — the detailed worked example
- [`features/0001-cars/03-edit.md`](../_examples/features/0001-cars/03-edit.md)
- [`features/0001-cars/04-archive.md`](../_examples/features/0001-cars/04-archive.md)
- [`features/0002-bookings/epic.md`](../_examples/features/0002-bookings/epic.md)

Empty starters live in [`docs/_templates/`](../_templates/).

## Shared skills

`.agents/skills/` is the canonical location; `.claude/skills/` mirrors it via symlinks.

When adding a new shared skill:

1. Create the real skill at `.agents/skills/<skill-name>/SKILL.md`.
2. Create the symlink: `ln -s ../../.agents/skills/<skill-name> .claude/skills/<skill-name>`.
3. Run `pnpm harness:validate` to confirm the symlink target and frontmatter.

## Utility skills

Outside the three-skill workflow, the repository keeps a small set of utility skills:

- `commit` — atomic conventional commits
- `create-pr` — open a GitHub PR with evidence
- `grill-me` / `grilling` — relentless one-question-at-a-time interrogation to sharpen a plan before invoking `project-brief`

These are orthogonal — invoke them when you want their specific behavior, not as part of the standard flow.
