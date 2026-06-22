---
name: create-pr
description: Inspect the current branch, synthesize an evidence-based pull request title and body, push the branch, and create a GitHub pull request. Use only when the user explicitly asks to create or open a PR, push and open a PR, ship the branch, or invokes $create-pr.
---

# Create Pull Request

Create one detailed GitHub pull request from the current branch. Do not commit unrelated changes as part of this workflow; use `$commit` first when local changes still need commits.

## 1. Validate state

Determine the branch, remote, and base branch:

```bash
git status --short
git branch --show-current
git remote -v
git symbolic-ref refs/remotes/origin/HEAD
```

Use the remote default branch when available; otherwise verify whether `main` or `master` exists.

Stop and report clearly when:

- the current branch is empty, detached, or the default branch;
- the repository has no `origin`;
- the branch has no commits ahead of the base;
- an open PR already exists for the branch.

Check an existing PR with the available GitHub integration or:

```bash
gh pr list --head <branch> --state open
```

If one exists, return its URL and do not create a duplicate.

## 2. Inspect the complete branch

Run:

```bash
git log <base>..HEAD --format="%H %s"
git diff <base>...HEAD --name-status
git diff <base>...HEAD --stat
```

Inspect each branch commit with `git show --stat <sha>` and inspect the actual diff where needed. Derive the PR from the entire branch, not only the latest commit.

If meaningful uncommitted changes remain, report them and stop unless the user explicitly confirms that the PR should exclude them.

## 3. Draft the PR

Create an imperative conventional title under 70 characters:

```text
<type>(<scope>): <whole-branch outcome>
```

Draft a body with:

```markdown
## Summary

<What the branch delivers and why>

## Changes

### <Area>

- <Concrete change>

## Impact

- **Files modified**: <count and areas>
- **New files**: <notable additions or None>
- **Deleted files**: <notable deletions or None>
- **Dependencies**: <changes or None>
- **Breaking changes**: <details or None>

## Testing

- <Actual verification evidence>
```

Every statement must come from commits, diffs, task evidence, or verification output. Do not invent tests or claim checks passed without evidence.

## 4. Push

Push with upstream tracking:

```bash
git push -u origin <branch>
```

If the push fails, report the exact error and stop.

## 5. Create the PR

Prefer the connected GitHub capability when available; otherwise use:

```bash
gh pr create --title "<title>" --body "<body>" --base "<base>"
```

Do not use `--fill`. Create a ready PR unless the user asks for a draft or the branch is explicitly unfinished.

## 6. Report

Return the PR URL, title, branch-to-base direction, changed-file count, and whether it is draft or ready.
