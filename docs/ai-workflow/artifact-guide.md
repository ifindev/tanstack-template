# Artifact Guide

## Project-level artifacts

| Artifact | Purpose | Owner |
|---|---|---|
| `docs/specs/_overview.md` | Project identity, sources, current phase, known constraints | Human |
| `docs/specs/_context-block.md` | Compact implementation context for every session | Human + agent |
| `docs/specs/_decisions.md` | Append-only material decision history | Human + agent |
| `docs/specs/discovery.md` | Approved problem, outcomes, scope, and constraints | Human |
| `docs/specs/feature-map.md` | Capabilities, access, dependencies, and slices | Human |
| `docs/tasks/_index.md` | Current executable work state | Human + agent |
| `docs/client-comms/` | Approval and change evidence | Human |

## Epic-level artifacts

Use `docs/specs/<epic>/`:

- `_epic.md` — outcome, scope, actors, dependencies, and acceptance evidence.
- `data-model.md` — domain and persistence contract when relevant.
- `flow-<name>.md` — one independently testable journey.
- `api.md` — boundary contracts; despite the filename, it may describe RPC, events, jobs, or webhooks.

Not every epic requires every artifact. Omit irrelevant documents deliberately and record why in `_epic.md`.

## Status vocabulary

Specifications:

- `DRAFT`
- `IN_REVIEW`
- `APPROVED`
- `LOCKED`
- `SUPERSEDED`

Tasks:

- `backlog`
- `ready`
- `doing`
- `blocked`
- `done`
- `cancelled`

Only humans lock scope or accept material risk. Agents may recommend status changes and make routine task-state updates when instructed.

## Traceability

Use stable identifiers:

- requirements: `REQ-001`
- assumptions: `ASM-001`
- decisions: `DEC-001`
- risks: `RSK-001`
- change requests: `CR-001`
- tasks: `TASK-001`

Add IDs when the project is complex enough to benefit. Do not add bureaucracy to a tiny, low-risk change merely to satisfy the template.
