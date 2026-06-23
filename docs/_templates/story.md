# <epic-id> / <story-id> — <Story Title>

> Construction doc for one page-level story. Created and updated by the
> `feature-epic` skill. See [`docs/_examples/features/0001-cars/02-create.md`](../_examples/features/0001-cars/02-create.md)
> for a filled-in reference.

- Epic: [<epic-id>](./epic.md)
- Brief: [project-brief](../../project-brief.md)

## Page

- **Route**: `<route path>`
- **Layout**: `<route layout>` (e.g. `_authed`)
- **Roles**: <roles allowed on this page>
- **Title**: <browser tab + page header>

## Dependencies / Prereqs

- <prior story or module file that must exist>
- <shared helper / hook>

## User Flow

1. <step>
2. <step>
3. On success: <terminal state>
4. On error: <terminal state>

## Components on Page

Under `src/components/<feature>/`:

- `<file-name>.tsx` (`<ComponentName>`) — <one-line responsibility; full responsibility lives inside the file>

Reused from elsewhere (do not recreate):
- `<file-name>.tsx` (`<ComponentName>`) — <where it lives, who else uses it>

> Prefer flat single-file components. Only split into sub-components when the
> piece is reused across pages, or the file passes ~300 lines.

## Validations

Schema in `src/modules/<module>/schema.ts` as `<schemaName>`.

| Field | Rule |
|---|---|
| `<field>` | <constraint> |

## UI States

- **Initial**: <what renders on first load>
- **Loading**: <skeleton, spinner, etc.>
- **Empty**: <copy + CTA>
- **Error**: <where the error renders + recovery>
- **Submitting**: <button state, form interactivity>
- **Success**: <toast, navigation, etc.>

## Copy

| Key | Text |
|---|---|
| page.title | <text> |
| btn.primary | <text> |
| err.<field>.<rule> | <text> |

## API

- **Procedure**: `<module>.<action>` (`<query|mutation>`)
- **Auth**: `<protectedProcedure>` + role check `<roles>`
- **Input**: `<schemaName>` from `src/modules/<module>/schema.ts`
- **Output**: `<shape>`
- **Side effects**: <DB writes, file uploads, emails — in transaction or not>
- **Failure modes**: <expected error codes>

## Frontend Wiring

- **Route file**: `src/routes/<path>/<page>.tsx`
- **View Model**: `src/routes/<path>/-<page>.view-model.ts`
  - Hooks used (`useForm`, `trpc.*.useMutation`, etc.)
  - Navigation / cache invalidation on success
- **Components** (new in this story): `src/components/<feature>/<file-name>.tsx`
- **Schemas** (added in epic prereq or here): `<schemaName>` in `src/modules/<module>/schema.ts`

## Tasks

- [ ] <atomic task>
- [ ] <atomic task>
- [ ] Unit tests: <coverage>
- [ ] Manual test: <flow>

## Open Questions

- <decisions deferred to implementation or post-MVP>
