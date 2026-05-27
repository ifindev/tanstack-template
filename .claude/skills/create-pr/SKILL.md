---
description: Push the current branch to origin and create a detailed GitHub PR targeting main. Use when asked to push and open a PR, create a pull request, or ship a branch.
disable-model-invocation: true
allowed-tools: Bash(git push *) Bash(git branch *) Bash(git log *) Bash(git diff *) Bash(git status *) Bash(gh pr *)
---

# Create PR Workflow

## Current branch
```!
git branch --show-current
```

## Commits on this branch not in main
```!
git log main..HEAD --oneline
```

## Files changed vs main
```!
git diff main...HEAD --name-status
```

## Diff stat
```!
git diff main...HEAD --stat
```

---

You are now performing a push-and-PR workflow. Follow all 6 steps exactly.

## Step 1 — Validate state

Before doing anything else:

- If the current branch is `main` or `master`: print an error and stop — never open a PR from the default branch.
- If `git log main..HEAD` is empty (no commits ahead of main): print an error and stop.
- If a PR for this branch already exists (`gh pr list --head <branch> --state open`): report the existing PR URL and stop.

## Step 2 — Read all branch commits in detail

Run:
```bash
git log main..HEAD --format="%H %s"
```

For each commit SHA returned, run:
```bash
git show --stat <sha>
```

Build a complete picture of:
- Which modules/features were touched (derive from file paths)
- What types of changes were made (`feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`)
- The cumulative effect across the whole branch

## Step 3 — Synthesize PR title and description

### Title rules
- One concise imperative sentence summarising what the whole branch delivers
- Derived from the dominant theme across all commits — not just the last one
- Format: `<type>(<scope>): <what the branch delivers>` — 70 characters max
- The `type` and `scope` should reflect the majority of commits on the branch
- Examples:
  - `feat(chat): implement markdown rendering for AI messages`
  - `refactor(auth): extract service layer and add test coverage`
  - `fix(api): resolve race condition in streaming endpoint`

### Description format
Write a full Markdown PR body using this exact structure:

```markdown
## Summary
<2–3 sentences explaining what this PR delivers and the motivation behind it>

## Changes

### <Module or area name (e.g. Chat, Auth, API, Components)>
- <specific thing implemented or changed — be concrete>
- <another specific change>

### <Another module if applicable>
- <specific change>

## Impact
- **Files modified**: <N files across X modules>
- **New files**: <list notable additions, or "None">
- **Deleted files**: <list notable deletions, or "None">
- **Dependencies**: <note package.json / lock file changes, or "None">
- **Breaking changes**: <describe any, or "None">

## Testing
- <how the changes were tested — test files added, manual testing done, etc.>
```

Every field must be derived from the actual diff and commit log. No generic placeholder text.

## Step 4 — Push the branch

```bash
git push -u origin <current-branch-name>
```

If push fails (rejected, no upstream, permission error): print the exact error and stop. Do not attempt PR creation.

## Step 5 — Create the PR

```bash
gh pr create \
  --title "<synthesized title from Step 3>" \
  --body "$(cat <<'EOF'
<full Markdown description from Step 3>
EOF
)" \
  --base main
```

Do not use `--fill` — it would overwrite the synthesized description with the last commit message.

## Step 6 — Report

After the PR is created, print:

```
PR created successfully.

  URL:    https://github.com/<owner>/<repo>/pull/<number>
  Title:  <title>
  Branch: <current-branch> → main
  Files:  <N> changed
```
