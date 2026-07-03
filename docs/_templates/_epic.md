# <id> — <Feature Name> (Epic)

> Mid-altitude doc indexing a feature's stories. Created and updated by the
> `feature-epic` skill. See [`docs/_examples/features/0001-cars/_epic.md`](../_examples/features/0001-cars/_epic.md)
> for a filled-in reference.

## Goal

<one-paragraph statement of what this feature delivers>

## Pages & Stories

| Story | Route | File |
|---|---|---|
| 01-<slug> | `<route>` | [01-<slug>.md](./01-<slug>.md) |

## Entities Touched

- `<Entity>` (primary)
- `<Entity>` (created/edited inline)

Schemas live in `src/modules/<module>/schema.ts`. Service functions in `service.ts`. tRPC procedures in `router.ts`.

## Shared Components

Components reused across multiple stories in this epic. Story-local components stay inside their story's main file.

- `<file-name>.tsx` (`<ComponentName>`) — used by stories <01, 02>

## Shared Module Files

- `src/modules/<module>/schema.ts` — Zod schemas
- `src/modules/<module>/service.ts` — service functions
- `src/modules/<module>/router.ts` — tRPC router with role guards

## Build Order

1. Schema + migration
2. Service layer + unit tests
3. tRPC router with role guards
4. Story 01-<slug>
5. Story 02-<slug>

## Related

- [PRD](../../prd.md)
- [Trackers](../../trackers.md)

## Open Questions

- <still ambiguous, will be decided in a story spec>
