---
name: commit
description: Analyze all local Git changes, propose atomic conventional commit groups, wait for explicit approval, create the approved commits, and push the current branch to origin. Use only when the user explicitly asks to commit changes, commit all changes, or invokes $commit.
---

# Atomic Commit Workflow

Follow the repository's commit policy in `AGENTS.md`. This skill performs external Git mutations, so do not begin staging or committing until the user explicitly approves the written commit plan.

## 1. Inspect the repository

Run:

```bash
git status --short
git diff HEAD
git diff --cached
git log --oneline -5
```

List every modified, staged, untracked, deleted, and renamed path. Preserve unrelated user changes; do not assume every dirty file belongs in the requested commits.

## 2. Classify changes

Assign each path a conventional-commit type and repository scope. Use the scope rules in `AGENTS.md`; when no rule matches, derive the narrowest meaningful scope from the path and change intent.

Valid types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `perf`.

## 3. Propose atomic commits

Apply the repository's atomicity rules:

- keep a test with the source it tests;
- group tightly coupled schema and service files only when allowed;
- default to one file per commit;
- never mix unrelated scopes;
- keep generated files and lockfiles in standalone commits executed last;
- stage every path explicitly;
- never use `git add .`, `git add -A`, `--no-verify`, or amend.

Before any mutation, print:

```text
Commit Plan:
  #1  <type>(<scope>)  <paths>
  #2  <type>(<scope>)  <paths>
```

Include files intentionally excluded from the plan and why. Stop and wait for explicit user confirmation or requested regrouping.

## 4. Create approved commits

For each approved group:

1. Stage only its explicit paths with `git add <paths>`. For a rename, explicitly stage both old and new paths.
2. Verify the staged patch with `git diff --cached`.
3. Commit with:
   - subject `<type>(<scope>): <imperative description>` under 72 characters;
   - blank line;
   - two to four concrete body bullets, except simple generated-file commits may use only a subject;
   - no co-author trailer.
4. Verify with `git log --oneline -1`.

If a hook or commit fails, report the exact failure and stop. Do not bypass verification.

## 5. Push

Resolve the branch:

```bash
git rev-parse --abbrev-ref HEAD
```

Refuse to push from a detached HEAD. Push the current branch to `origin`; if no upstream exists, use `git push --set-upstream origin <branch>`.

If the user explicitly asked for local commits only, honor that narrower request and do not push.

## 6. Report

Return one line per created commit with short SHA and subject, the total count, the pushed remote branch, and any dirty paths left intentionally uncommitted.
