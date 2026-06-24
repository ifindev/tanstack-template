---
name: project-brief
description: Create or update the project brief at docs/project-brief.md — the single living document at project altitude covering Product, Roles, Features, RBAC matrix, Data Model, Routes, Tech, and Open Questions. Use at project inception to draft the brief from raw ideas, or whenever a new feature, entity, role, or route is introduced post-MVP.
---

# Project Brief

## When to use

Invoke explicitly with `/project-brief` or `$project-brief`. Run it when:

- Starting a new project — `docs/project-brief.md` is empty or absent. Use `create` mode.
- A new feature, entity, role, or route is being introduced after the MVP. Use `update` mode.
- The user wants to refine product framing, roles, or scope of an existing brief.

Do not invoke for story-level detail (that's `feature-epic`) or implementation (that's `execute-task`).

## Modes

- `create` — Draft a new project brief from a description of the project.
- `update` — Modify specific sections of an existing brief (add a Features row, add an entity, expand RBAC, etc.) without rewriting unaffected sections.

## Inputs

The user provides:
- A conversational description of the project (in any language) — for `create` mode.
- A description of the change (new feature, entity, role, etc.) — for `update` mode.

The skill reads:
- `docs/project-brief.md` (if it exists)
- `docs/_templates/project-brief.md` (structure)
- `docs/_examples/project-brief.md` (tone, depth, format reference)

## Process — `create` mode

1. Confirm `docs/project-brief.md` is empty or absent. If a populated brief exists, refuse and tell the user to use `update` mode, unless they explicitly ask to overwrite.
2. Read the user's description carefully. Identify what is stated explicitly vs. implied.
3. Draft the brief following `docs/_templates/project-brief.md`:
   - Fill in Product, Roles, Features, RBAC Matrix, Data Model, Routes, Tech, Open Questions
   - For unstated common stuff, suggest reasonable defaults marked `(suggested)`:
     - Standard CRUD per resource
     - Email-password auth with role on User unless told otherwise
     - Standard RBAC: Admin = full, others scoped to their resources
     - Local Docker + production Coolify (template default) unless told otherwise
4. Identify genuine ambiguity — gaps that cannot be resolved with reasonable defaults. Ask the user targeted questions, **one or two at a time**, not exhaustively. Examples of genuine ambiguity:
   - Scope boundaries the user didn't specify
   - Whether a customer-facing portal exists
   - Payment integration in MVP or post-MVP
   - Multi-tenant requirements
5. Write the brief to `docs/project-brief.md`.
6. Show the user a summary of what was drafted: which sections came from their description, which are suggestions, which are still open questions.
7. Initialize `docs/trackers.md` with an empty Summary block if it doesn't exist.

## Process — `update` mode

1. Read existing `docs/project-brief.md`.
2. Take the user's change description. Identify which sections it affects:
   - **Features table**: new feature → new row with `[<feature-name>](./features/<id>-<slug>/_epic.md)` link
   - **RBAC Matrix**: new resource → new row; new role access → modify existing row
   - **Data Model**: new entity → new section with table; modified entity → update existing table
   - **Routes**: new route → new row in Routes table
   - **Roles**: new role → new bullet
   - **Open Questions**: outstanding decisions
3. Propose the diff in conversation form: "Adding to brief: ...". Get user confirmation (default Y).
4. Apply the changes. Edit only the affected sections; preserve all other prose verbatim.
5. If the update added a new Features row, chain prompt at the end:
   > "Brief updated. Draft epic for `<XXXX-slug>` now? [Y/n/later]"
   - If `Y`: transition into `feature-epic create` logic inline.
   - If `n` / `later`: exit. The user can run `feature-epic create <id>-<slug>` later.

## Output

- `docs/project-brief.md` (created or modified)
- `docs/trackers.md` (initialized to empty Summary on `create`, untouched on `update`)

## Conventions

- **Language**: Output prose follows the user's prompt language. If the user writes in Indonesian, write the brief in Indonesian. Code identifiers (entity names, field names, enum values, types, file names, component names) always English.
- **Naming**: kebab-case for file paths and routes; PascalCase for entity and component names; camelCase for field names.
- **Data model**: tables with `Field | Type | Constraints | Notes` columns; types use Postgres SQL (`VARCHAR(n)`, `DECIMAL(10,2)`, `TIMESTAMPTZ`, etc.) since the stack is Postgres + Prisma.
- **Suggestions**: anything inferred rather than stated is marked `(suggested)` so the user can review.
- **Feature links**: Features table entries link to `./features/<id>-<slug>/_epic.md` — the link will resolve once `feature-epic` creates that file. A pre-creation link is fine.
- **No rewrites in update mode**: never reformat or restructure sections the user didn't ask to change.

## Chain

- `update` → `feature-epic create` (with Y/n/later confirmation gate when a new Features row is added)
- This skill does not chain to `execute-task` — that's a deliberate boundary.

## Stop conditions

Halt and ask the user when:
- The description contradicts an existing brief section and the resolution is non-trivial
- A proposed change would invalidate existing data model invariants
- The new feature requires a role that doesn't exist yet and the role's permissions are unclear
- Scope ambiguity affects multiple sections and a single targeted question won't resolve it

When stopping, name the conflict precisely and the options.
