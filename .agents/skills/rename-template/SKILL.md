---
name: rename-template
description: Rebrand this TanStack template to a new app name. Updates the README title, the package.json name, the Postgres database name across docker-compose / .env.example / env docs, and removes the stale clone URL from the landing page. Only surface mentions of the template are touched — framework references to TanStack Start, Prisma, etc. are preserved. Use only when the user explicitly asks to rename the template, rebrand the project, give the repo a new app name, or invokes $rename-template.
---

# Rename Template

Rebrand this repository from the current template slug to the project name the user supplies. The rename covers two layers of surface naming:

- **App slug** (kebab-case, e.g. `tanstack-template`) — used in `package.json`, README title, landing-page clone URL.
- **Postgres database name** (snake_case, e.g. `tanstack_template`) — used in `.env.example`, `docker-compose.yml`, and the env tables in `README.md` + `docs/guides/environment-setup.md`.

Do not touch framework references (TanStack Start, Prisma, better-auth, etc.) and do not strip template scaffolding (AI workflow docs, guides) unless the user explicitly requests it.

## 1. Resolve the new name

The user supplies a project name in any form (e.g. `rent car`, `Rent Car`, `RentCar`, `rent-car`). Derive three forms:

- **kebab-case** — lowercase, words joined by `-`, alphanumeric and `-` only. Used in `package.json`, landing-page clone URL. Examples: `Rent Car` → `rent-car`, `RentCarApp` → `rent-car-app`.
- **snake_case** — lowercase, words joined by `_`, alphanumeric and `_` only. Used as the Postgres database name. Derive from the kebab-case form: replace every `-` with `_`. Examples: `rent-car` → `rent_car`, `rent-car-app` → `rent_car_app`.
- **Title Case** — each word capitalized, joined by a single space. Used in the README title. Examples: `rent car` → `Rent Car`, `rent-car` → `Rent Car`.

If the input is empty, ambiguous, or contains nothing alphanumeric, ask the user to restate the name. Never invent a name.

## 2. Read the current template names

Read `package.json` and capture the existing `name` value — that's the current **kebab-case** form. Derive the current **snake_case** form by replacing `-` with `_` (so `tanstack-template` → `tanstack_template`).

Treat both strings as the search targets for the rest of the skill — do not hardcode `tanstack-template` / `tanstack_template`, since the repo may have already been renamed once.

If the current kebab-case name already matches the requested kebab-case form, stop and tell the user there is nothing to do.

## 3. Scan for references

Search the working tree for both current forms:

```bash
grep -rn "<current-kebab>" --include="*.json" --include="*.md" --include="*.ts" --include="*.tsx" --include="*.yml" --include="*.yaml" --include=".env*" .
grep -rn "<current-snake>" --include="*.json" --include="*.md" --include="*.ts" --include="*.tsx" --include="*.yml" --include="*.yaml" --include=".env*" .
```

Also locate the README title line so it is included in the plan:

```bash
grep -n "^# TanStack Start" README.md
```

Note any hits outside the known targets — they go in the plan too. Known targets are:

- **kebab-case**: `package.json`, `src/routes/index.tsx` (clone URL).
- **snake_case**: `.env.example`, `docker-compose.yml`, `README.md` (env table), `docs/guides/environment-setup.md` (env table).
- **README title**: top-level `# TanStack Start Full-Stack Template` heading.

`docker-compose.prod.yml` references the DB name through `${POSTGRES_DB}` — leave it alone.

## 4. Propose a rename plan

Print every change the skill intends to make, in this shape, and stop for explicit approval:

```text
Rename Plan
  kebab : <current-kebab> → <new-kebab>
  snake : <current-snake> → <new-snake>
  title : TanStack Start Full-Stack Template → <Title Case>

  package.json                              "name": "<current-kebab>" → "<new-kebab>"
  README.md (title)                         # TanStack Start Full-Stack Template → # <Title Case>
  README.md (env table)                     …/<current-snake> → …/<new-snake>
  .env.example                              …/<current-snake> → …/<new-snake>
  docker-compose.yml (POSTGRES_DB)          <current-snake> → <new-snake>
  docker-compose.yml (DATABASE_URL)         …/<current-snake> → …/<new-snake>
  docs/guides/environment-setup.md          …/<current-snake> → …/<new-snake>
  src/routes/index.tsx                      delete line: { text: "$ git clone github.com/<owner>/<current-kebab>.git my-app" },
  <any other hits>                          <exact replacement>
```

Wait for the user to approve, ask to amend, or reject. Do not edit anything before approval.

## 5. Apply the rename

Use the Edit tool with exact, unique strings for each change — never a blanket recursive replace.

- **`package.json`** — replace only the `"name": "<current-kebab>"` field. Leave version, scripts, dependencies untouched.
- **`README.md`** — two edits:
  - Replace the first-level title `# TanStack Start Full-Stack Template` with `# <Title Case>`. Leave the body (tagline, AI workflow section, stack list) intact unless the user opted into a deeper rename.
  - Replace `<current-snake>` with `<new-snake>` in the `DATABASE_URL` row of the env table.
- **`.env.example`** — replace `<current-snake>` with `<new-snake>` in the `DATABASE_URL` line.
- **`docker-compose.yml`** — replace `<current-snake>` with `<new-snake>` in both occurrences: the `POSTGRES_DB:` value and the `DATABASE_URL:` value under the `app` service.
- **`docs/guides/environment-setup.md`** — replace `<current-snake>` with `<new-snake>` in the env-table row for `DATABASE_URL`.
- **`src/routes/index.tsx`** — delete the entire array entry line containing the clone command (including its trailing comma). The surrounding `terminalLines` array stays valid.
- **Any other hits** from step 3 — apply the exact replacement shown in the plan.

## 6. Verify

Run, in this order, and report any failure:

```bash
grep -rn "<current-kebab>" --include="*.json" --include="*.md" --include="*.ts" --include="*.tsx" --include="*.yml" --include="*.yaml" --include=".env*" .
grep -rn "<current-snake>" --include="*.json" --include="*.md" --include="*.ts" --include="*.tsx" --include="*.yml" --include="*.yaml" --include=".env*" .
pnpm tsc
```

Both greps should return no results. `pnpm tsc` should pass (the `index.tsx` edit removes one array entry — the type stays the same).

## 7. Report

Return:

- the new kebab-case, snake_case, and Title Case names,
- the list of files that changed,
- a reminder that the live `.env` is not managed by this skill — the user must update `DATABASE_URL` there (and rerun `docker compose up -d` so the new `POSTGRES_DB` volume is provisioned) by hand,
- any references the user should still update outside this skill's scope (e.g. git remote URL, deployment configs, CI secrets, docker-compose project name, Sentry/GA env values).
