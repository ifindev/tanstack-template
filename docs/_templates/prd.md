# <Project Name> — PRD

> Living document at project altitude. Updated by the `prd` skill in
> `create` or `update` mode. See [`docs/_examples/prd.md`](../_examples/prd.md)
> for a filled-in reference.

## Product

**What it is**: <one-paragraph summary of the product>

**Primary users**: <who uses it; bullet list>

**Problems solved**:
- <problem 1>
- <problem 2>

**Success metrics**:
- <how we know it worked>

## Goals

- <business or product outcome 1>
- <user outcome 1>

## Non-Goals

- <explicitly excluded behavior, audience, market, or use case>
- <another meaningful boundary>

## Roles

- **<Role>** — <one-paragraph description: who they are, what they primarily do>
- **<Role>** — <...>

## User Journeys

| User | Journey | Success Criteria |
|---|---|---|
| <role> | <what they need to accomplish> | <observable end state> |

## MVP Scope

| Feature | MVP | Later |
|---|---|---|
| <feature> | <included now> | <deferred> |

## Features

| # | Feature | Roles | One-liner |
|---|---|---|---|
| 0001 | [<feature name>](./features/0001-<slug>/_epic.md) | <roles> | <one-line behavior> |

## RBAC Matrix

| Resource | View | Create | Edit | Delete/Archive |
|---|---|---|---|---|
| <Resource> | <roles> | <roles> | <roles> | <roles> |

## Data Model

### <Entity>

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `VARCHAR(30)` | PK | CUID |
| `<field>` | `<DB type>` | <NOT NULL / UNIQUE / FK / DEFAULT> | <business rule / format> |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | |
| `updatedAt` | `TIMESTAMPTZ` | NOT NULL | auto-update on row change |

**Relations**: <belongs to / has many ...>
**Invariants**: <business rules that span fields or rows>

## Routes

| Route | Feature | Roles |
|---|---|---|
| `/` | <feature> | <roles> |

## Tech

**Stack**
- <framework, language, ORM, etc.>

**Infrastructure**
- <database, cache, storage, email, observability>

**Conventions**
- <architecture pattern, naming, RBAC enforcement points>

**Non-functional**
- <single/multi-tenant, concurrency target, latency budgets, file size limits, browser support>

## Open Questions
- <still ambiguous after intake>
