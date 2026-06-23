---
name: rename-template
description: Rebrand this TanStack template to a new app name. Updates the README title, the package.json name, and removes the stale clone URL from the landing page. Only surface mentions of the template are touched — framework references to TanStack Start, Prisma, etc. are preserved. Use only when the user explicitly asks to rename the template, rebrand the project, give the repo a new app name, or invokes $rename-template.
---

# Rename Template

Rebrand this repository from the current template slug to the project name the user supplies. The rename is surface-only: README title, `package.json` name, and the clone URL on the landing page. Do not touch framework references (TanStack Start, Prisma, better-auth, etc.) and do not strip template scaffolding (AI workflow docs, guides) unless the user explicitly requests it.

## 1. Resolve the new name

The user supplies a project name in any form (e.g. `rent car`, `Rent Car`, `RentCar`, `rent-car`). Derive two forms:

- **kebab-case** — lowercase, words joined by `-`, alphanumeric and `-` only. Used in `package.json`. Examples: `Rent Car` → `rent-car`, `RentCarApp` → `rent-car-app`.
- **Title Case** — each word capitalized, joined by a single space. Used in the README title. Examples: `rent car` → `Rent Car`, `rent-car` → `Rent Car`.

If the input is empty, ambiguous, or contains nothing alphanumeric, ask the user to restate the name. Never invent a name.

## 2. Read the current template name

Read `package.json` and capture the existing `name` value. Treat that string as the search target for the rest of the skill — do not hardcode `tanstack-template`, since the repo may have already been renamed once.

If the current name already matches the requested kebab-case form, stop and tell the user there is nothing to do.

## 3. Scan for references

Search the working tree for the current package name:

```bash
grep -rn "<current-name>" --include="*.json" --include="*.md" --include="*.ts" --include="*.tsx" .
```

Also locate the README title line so it is included in the plan:

```bash
grep -n "^# TanStack Start" README.md
```

Note any hits outside the three known targets (`package.json`, `README.md`, `src/routes/index.tsx`) — they go in the plan too.

## 4. Propose a rename plan

Print every change the skill intends to make, in this shape, and stop for explicit approval:

```text
Rename Plan: <current-name> → <new-kebab>
  package.json            "name": "<current-name>" → "name": "<new-kebab>"
  README.md (title)       # TanStack Start Full-Stack Template → # <Title Case>
  src/routes/index.tsx    delete line: { text: "$ git clone github.com/<owner>/<current-name>.git my-app" },
  <any other hits>        <exact replacement>
```

Wait for the user to approve, ask to amend, or reject. Do not edit anything before approval.

## 5. Apply the rename

Use the Edit tool with exact, unique strings for each change — never a blanket recursive replace.

- **`package.json`** — replace only the `"name": "<current-name>"` field. Leave version, scripts, dependencies untouched.
- **`README.md`** — replace the first-level title `# TanStack Start Full-Stack Template` with `# <Title Case>`. Leave the body (tagline, AI workflow section, stack list) intact unless the user opted into a deeper rename.
- **`src/routes/index.tsx`** — delete the entire array entry line containing the clone command (including its trailing comma). The surrounding `terminalLines` array stays valid.
- **Any other hits** from step 3 — apply the exact replacement shown in the plan.

## 6. Verify

Run, in this order, and report any failure:

```bash
grep -rn "<current-name>" --include="*.json" --include="*.md" --include="*.ts" --include="*.tsx" .
pnpm tsc
```

The grep should return no results. `pnpm tsc` should pass (the `index.tsx` edit removes one array entry — the type stays the same).

## 7. Report

Return:

- the new kebab-case and Title Case names,
- the list of files that changed,
- any references the user should still update by hand outside this skill's scope (e.g. git remote URL, deployment configs, CI secrets, docker-compose project name, Sentry/GA env values).
