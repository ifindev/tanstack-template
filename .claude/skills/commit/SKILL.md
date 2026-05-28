---
description: Analyze all git changes, create atomic conventional commits, and push the finished branch to origin. Use when asked to commit, run /commit, or told to "commit all changes".
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git add *) Bash(git commit *) Bash(git log *) Bash(git rev-parse *) Bash(git push *)
---

# Atomic Commit Workflow

## Current git state
```!
git status --short
```

## Full diff
```!
git diff HEAD
```

## Recent commits (style reference)
```!
git log --oneline -5
```

---

You are now performing an atomic commit workflow. Follow all 7 steps exactly.

## Step 1 — List every changed file

From the injected `git status --short` above, produce a flat list of every changed path. Include:
- Modified tracked files (`M`, ` M`)
- Staged changes (`M `, `A `, `D `, `R `)
- Untracked new files (`??`)
- Deleted files (`D`, ` D`)

## Step 2 — Categorize each file

For each file, assign a **type** and a **scope**:

**Type** (pick one):
- `feat` — new behavior or new file with user-facing functionality
- `fix` — corrects a bug
- `refactor` — restructures without changing behavior
- `style` — visual/CSS/Tailwind changes only, no logic change
- `test` — test files with no corresponding source change
- `docs` — markdown, README, guides, AGENTS.md, CLAUDE.md
- `chore` — config, build, tooling, lock files, auto-generated files
- `perf` — measurable performance improvements

**Scope** (derive from file path):

| Path pattern | Scope |
|---|---|
| `src/modules/<name>/` | `<name>` |
| `src/components/<name>/` | `<name>` (use `ui` for `components/ui/`) |
| `src/routes/(auth)/` | `auth` |
| `src/routes/_authed/<name>` | `<name>` |
| `src/routes/api/` | `api` |
| `src/routes/` root files (`__root`, `index`, `_authed.tsx`) | `routes` |
| `src/shared/<name>/` | `<name>` |
| `src/lib/` | `lib` |
| `src/hooks/` | `hooks` |
| `prisma/` | `db` |
| `docs/`, `*.md` at root | `docs` |
| `package.json`, lock files | `deps` |
| Other root config (`tsconfig`, `biome.json`, `vite.config`, etc.) | `config` |
| `src/routeTree.gen.ts` | `routes` (type: `chore`) |

For projects not matching the above patterns, derive scope from the nearest meaningful directory name.

## Step 3 — Plan atomic commit groups

Apply these grouping rules **in priority order**:

1. Any `*.test.ts` / `*.test.tsx` goes in the same commit as the source file it tests
2. `schema.ts` + `service.ts` in the same module directory go together (same data contract)
3. Default: **one file per commit**
4. Hard maximum: **3 files per commit**
5. Never group files from different modules or scopes
6. Auto-generated files (`routeTree.gen.ts`, `pnpm-lock.yaml`) go in standalone `chore` commits — always last

**Before executing any commits**, print the full plan as a numbered table:

```
Commit Plan:
  #1  feat(chat)     src/modules/chat/schema.ts + src/modules/chat/service.ts
  #2  feat(chat)     src/modules/chat/router.ts + src/modules/chat/router.test.ts
  #3  feat(chat)     src/components/chat/message-list.tsx
  #4  chore(routes)  src/routeTree.gen.ts
```

Do not proceed on blanket approval alone. The workflow must pause here and wait for the user to explicitly confirm the proposed commit plan, because the user may want a more or less atomic grouping than the default plan.

## Step 4 — Execute commits in order

Only begin this step after the user explicitly confirms the commit plan.

For each planned commit:

**1. Stage only the files for this commit** — never `git add .` or `git add -A`:
```bash
git add src/modules/chat/schema.ts src/modules/chat/service.ts
```

**2. Commit with a multi-line message using a heredoc**:
```bash
git commit -m "$(cat <<'EOF'
feat(chat): add conversation schema and service layer

- define ConversationInput and MessageInput Zod schemas
- implement createConversation, listConversations, deleteConversation services
- services take plain arguments with no tRPC context dependency
EOF
)"
```

**Commit message rules**:
- Subject: `<type>(<scope>): <imperative verb> <what>` — 72 characters max
- Blank line after subject
- Body: 2–4 bullet points describing the specific changes
- No `Co-Authored-By` lines
- Never use `--no-verify`
- Never amend existing commits

**3. Verify** each commit landed: check `git log --oneline -1` after each one.

## Step 5 — Handle edge cases

- **New untracked files** (`??`): stage with `git add <explicit-path>`
- **Deleted files** (`D`): stage deletions with `git add <path>`
- **Renamed files** (`R`): check `git diff --name-status HEAD` for `R` entries; stage both the deletion and the new path explicitly
- **Auto-generated files** (`routeTree.gen.ts`): always a standalone `chore(<scope>): regenerate <name>` commit with no body bullets — just a single line subject
- **Files spanning multiple modules** (e.g., a shared config updated for a specific feature): scope to the driving feature

## Step 6 — Push the branch to origin

Local commits are not the endpoint. After the final commit, always push the current branch to the `origin` remote.

1. Resolve the current branch name:
```bash
git rev-parse --abbrev-ref HEAD
```
2. Try a normal push to `origin` for that branch:
```bash
git push origin <current-branch>
```
3. If that push fails because the branch has not been published yet, push again with upstream tracking:
```bash
git push --set-upstream origin <current-branch>
```

Do not skip this step. The workflow is only complete once the branch has been pushed successfully.

## Step 7 — Report summary

After all commits and the push complete, print:

```
Done. Commits created and pushed:

  abc1234  feat(chat): add conversation schema and service layer
  def5678  feat(chat): wire chat router and add router tests
  ghi9012  feat(chat): add message list component
  jkl3456  chore(routes): regenerate route tree

4 commits total.
Pushed to origin/<current-branch>.
```
