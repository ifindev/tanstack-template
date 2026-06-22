# AI-POWERED SOFTWARE DEVELOPMENT WORKFLOW
### A Standard Operating Procedure for Building Client Software with AI Coding Agents

---

> **Purpose:** The single, canonical workflow for building client software with AI coding agents (Claude Code, Codex, and others). It runs end-to-end: intake → planning → documentation → task tracking → execution → delivery. Everything lives in one reusable full-stack template repository — the application code, the agent skills, and the project documentation evolve together.
>
> **Core principle:** Your bottleneck is no longer writing code. It is knowing exactly what to build before the AI touches anything.

---

## TABLE OF CONTENTS

1. [The Core Problem & Mental Model Shift](#1-the-core-problem--mental-model-shift)
2. [System Overview: Three Layers](#2-system-overview-three-layers)
3. [The Template Repository: One Repo for Everything](#3-the-template-repository-one-repo-for-everything)
4. [Repository & Folder Structure](#4-repository--folder-structure)
5. [Starting a New Project](#5-starting-a-new-project)
6. [Layer 1: Intake & Discovery](#6-layer-1-intake--discovery)
7. [Layer 2: Planning](#7-layer-2-planning)
8. [Layer 3: Task Tracking & Execution](#8-layer-3-task-tracking--execution)
9. [The Execution Loop](#9-the-execution-loop)
10. [Document Templates](#10-document-templates)
11. [The Skills](#11-the-skills)
12. [Full End-to-End Worked Example: Toko Batik](#12-full-end-to-end-worked-example-toko-batik)
13. [API-First vs UI-First Decision Guide](#13-api-first-vs-ui-first-decision-guide)
14. [Review Gates & Change Requests](#14-review-gates--change-requests)
15. [Decisions Log: Purpose and Usage](#15-decisions-log-purpose-and-usage)
16. [Evolving the Template & Skills Over Time](#16-evolving-the-template--skills-over-time)
17. [Quick Reference Card](#17-quick-reference-card)

---

## 1. THE CORE PROBLEM & MENTAL MODEL SHIFT

### What a solo developer faces with multiple client projects

When a client explains what they want built, the raw information is always:
- **Incomplete** — they don't know what they don't know
- **Ambiguous** — words like "manage," "handle," or "track" mean different things
- **Optimistic** — they underestimate complexity and edge cases
- **Unstructured** — brain-dump order, not specification order

When a human developer receives this, they fill the gaps using years of domain and technical judgment. **When an AI coding agent receives this, it fills the gaps with plausible-sounding assumptions that may be completely wrong for your specific context.** No judgment. No domain knowledge. Just pattern-matching to what "usually" makes sense.

The result: AI confidently builds the wrong thing. You spend more time correcting and re-prompting than if you had written it yourself.

### The real bottleneck has shifted

```
Traditional development
  Requirements -> [CAN I BUILD THIS?] -> Code -> Delivery
  Bottleneck: coding ability and speed

AI-assisted development
  Requirements -> [DO I KNOW WHAT TO BUILD?] -> AI Codes -> Delivery
  Bottleneck: requirement clarity and spec quality
```

Your job is no longer primarily writing code. It is **eliminating ambiguity before the AI touches anything.**

Every hour spent on discovery, specs, and data modeling tends to save far more time than it costs downstream — because the alternative is AI-generated code that built the wrong thing correctly, then has to be unwound. The exact ratio varies by project; the direction does not.

### This is not Agile. It is an AI Coding Workflow.

Agile was designed for teams with ongoing human communication. You are a solo developer with AI agents that have no memory, no judgment about your specific business context, and no ability to fill in what you did not say.

**Keep from Agile:**
- Short cycles: build one thing, verify it, move to the next
- Working software over comprehensive planning
- Revisit requirements as you learn

**Drop:**
- Sprints, velocity tracking, standups — overhead when solo
- Story points — irrelevant when AI does the coding
- Gherkin / BDD syntax — built for QA automation teams, adds overhead without proportional value

**Add (Agile does not cover these):**
- Spec documents detailed enough for a stateless AI agent
- A persistent decisions log (the agent has no memory between sessions)
- A task tracker the agent can read and update
- A set of skills and templates that standardize every output

### The spec quality bar

> A spec is ready when you could hand it to a capable AI with zero knowledge of your business and it would build the right thing without asking any questions.

Not "good enough for a human developer." Good enough for an AI that will not use judgment to fill gaps — only pattern-matching assumptions.

---

## 2. SYSTEM OVERVIEW: THREE LAYERS

The workflow runs in three sequential layers. Each has a clear input, a defined process, and a specific output. Human review gates sit between every layer transition.

```
LAYER 1 — INTAKE & DISCOVERY
  In:  Raw client requirements
  Out: Locked Discovery Document (client-confirmed)
  Skill: intake
        |
   [GATE: client confirms in writing]
        v
LAYER 2 — PLANNING
  In:  Locked Discovery Document
  Out: Feature map, data models, epic/flow specs,
       API specs, task files
  Skills: feature-mapping, data-modeling,
          epic-and-flow, api-spec, task-generation
        |
   [GATE: review task list + priorities]
        v
LAYER 3 — EXECUTION
  In:  Task files + spec docs + project context
  Out: Working software, one task at a time
  Skill: execution
  Loop: scan -> select -> load -> build ->
        verify -> mark done -> repeat
```

Each layer contains a workflow, skills (SKILL.md files that drive AI output), templates (the output format the AI fills in), and human review gates.

Everything — skills, templates, and project outputs — lives in one repository. The next section explains how.

---

## 3. THE TEMPLATE REPOSITORY: ONE REPO FOR EVERYTHING

### The model

There is no separate "harness" repository to copy from. Instead, you maintain **one reusable full-stack template repository**. It contains:

- the application starter code (`src/`),
- the agent skills (`.claude/skills/`),
- the orchestration files (`AGENTS.md`, `CLAUDE.md`, `README.md`),
- the documentation scaffold (`docs/`).

To start a new client project you create a new repo *from this template* (GitHub template repo, `degit`, or a plain copy). The skills and conventions come with it. You improve the template after every project, and the next project inherits those improvements automatically — no copying skills around, no drift between a "harness" and the code.

### Why everything in one repo

- **The agent reads everything in place.** Skills, conventions, specs, and source live side by side. The agent never needs files that aren't in the working tree.
- **One thing to version.** The workflow, the conventions, and the code evolve in lockstep. A change to a skill is committed next to the code change that motivated it.
- **No copy step, no drift.** A separate harness inevitably drifts from the project it was copied into. One repo cannot drift from itself.

Project-specific outputs (the filled specs, tasks, and decisions) live in `docs/` and are committed per project. Reusable assets (skills, templates, orchestration files, starter code) are the parts you carry forward and refine in the template.

### The orchestration files

Three files at the repo root tell agents and humans how to operate.

**`AGENTS.md`** — the canonical, agent-agnostic instruction file. Read by Codex and other agents directly, and by Claude Code via `CLAUDE.md`. It describes the three layers, the order of work, which skill to use when, and the universal rules. It is template-level and changes rarely.

**`CLAUDE.md`** — a thin pointer for Claude Code. Claude Code also auto-discovers the skills under `.claude/skills/`, so this file mainly directs the agent to read `AGENTS.md` and the project context first.

**`README.md`** — the human guide: what the template is, how to start a project, the workflow at a glance, and where everything lives.

Starter contents for all three are in [Section 10](#10-document-templates).

### Skills follow the Agent Skills format

Each skill is a directory under `.claude/skills/` containing a `SKILL.md` file. `SKILL.md` has YAML frontmatter with a `name` and a `description`; the body holds the instructions. A skill may bundle reference files (for example, its output template) alongside `SKILL.md`. Claude Code auto-discovers these skills; any other agent can read the same files by path. Full skill contents are in [Section 11](#11-the-skills).

Skill naming rules (from the Agent Skills spec): `name` is lowercase letters, numbers, and hyphens only, up to 64 characters, and must match its directory. `description` states both what the skill does and when to use it.

---

## 4. REPOSITORY & FOLDER STRUCTURE

The full template repository. Project outputs accumulate under `docs/` as you work.

```
fullstack-template/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── .claude/
│   └── skills/
│       ├── intake/
│       │   ├── SKILL.md
│       │   └── discovery-template.md
│       ├── feature-mapping/
│       │   └── SKILL.md
│       ├── data-modeling/
│       │   ├── SKILL.md
│       │   └── data-model-template.md
│       ├── epic-and-flow/
│       │   ├── SKILL.md
│       │   ├── epic-template.md
│       │   └── flow-template.md
│       ├── api-spec/
│       │   ├── SKILL.md
│       │   └── api-template.md
│       ├── task-generation/
│       │   ├── SKILL.md
│       │   ├── task-template.md
│       │   └── index-template.md
│       └── execution/
│           └── SKILL.md
├── docs/
│   ├── client-comms/
│   ├── specs/
│   │   ├── _overview.md
│   │   ├── _context-block.md
│   │   ├── _decisions.md
│   │   ├── discovery.md
│   │   ├── feature-map.md
│   │   └── product-management/
│   │       ├── _epic.md
│   │       ├── data-model.md
│   │       ├── api.md
│   │       ├── flow-list.md
│   │       └── flow-add-edit.md
│   └── tasks/
│       ├── _index.md
│       ├── TASK-001.md
│       └── TASK-002.md
└── src/
```

Notes on the layout:

- `.claude/skills/` — reusable skills, auto-discovered by Claude Code, readable by path from any agent.
- Each skill folder bundles its output template (for example `data-model-template.md`) next to `SKILL.md`.
- `docs/specs/` — project-wide files prefixed with `_`, then one folder per epic.
- `docs/tasks/` — the task board (`_index.md`) plus one file per task.
- `docs/client-comms/` — screenshots, emails, and written confirmations.
- `src/` — the application starter code that ships with the template.

### Naming conventions

- Epic folders — kebab-case — `product-management/`
- Flow files — `flow-<noun>.md` — `flow-add-edit.md`
- Task files — `TASK-<NNN>.md` — `TASK-042.md`
- Epic spec — `_epic.md`
- Project-wide files — underscore prefix — `_overview.md`, `_decisions.md`
- API spec — `api.md` inside each epic folder
- Data model — `data-model.md` inside each epic folder
- Skill folders — lowercase-hyphen, matching the skill `name` — `data-modeling/`
- Git branch — `task/TASK-<NNN>-slug` — `task/TASK-008-product-api`

---

## 5. STARTING A NEW PROJECT

### Step 1: Create the project from the template

Use your template repo to seed a new one (GitHub "Use this template", `degit`, or a copy), then initialize git.

```bash
npx degit your-org/fullstack-template toko-batik-system
cd toko-batik-system
git init && git add . && git commit -m "chore: init from template"
```

The skills, orchestration files, starter code, and a blank `docs/` scaffold all come with it. There is nothing to copy.

### Step 2: Fill in `docs/specs/_overview.md`

This is the agent's baseline context. Fill in what you know now, even if rough.

```
# Project Overview: <Project Name>
Client:  <name>
Started: YYYY-MM-DD
Status:  Discovery

What this system does
  <1-2 sentences, rough is fine>

Stack (mark confirmed vs tentative)
  Frontend: <e.g. Next.js 14 App Router>  TENTATIVE
  Database: <e.g. PostgreSQL>             TENTATIVE
  Auth:     <e.g. database sessions>      TENTATIVE
  Hosting:  <e.g. client VPS>             CONFIRMED

Roles (from first conversation)
  <Role 1>: <one line>
  <Role 2>: <one line>

Notes
  <anything important from the first conversation>
```

### Step 3: Run the intake skill

Open an agent session and point it at the intake skill with your raw notes.

```
Use the intake skill (.claude/skills/intake/SKILL.md).

Here are my raw notes from the client conversation:
<paste your notes>

Follow the skill. Do not produce the document yet — ask the
clarifying questions first.
```

Answer the questions, then ask it to write `docs/specs/discovery.md` from the bundled template.

### Step 4: Review, send, and lock

Review the draft yourself, correct anything inaccurate, then send it to the client. **Do not start Layer 2 until you have written confirmation.** Save the confirmation in `docs/client-comms/`, set the document status to `CLIENT-CONFIRMED`, and record the date.

### Step 5: Plan, then execute

Run the planning skills in order (Section 7), reviewing at each gate. Then run the execution loop (Section 9). Task IDs are sequential across the whole project, starting at `TASK-001` — never reuse or skip an ID; mark cancelled tasks as cancelled rather than deleting them.

### Step 6: Grow `_context-block.md` as you go

`docs/specs/_context-block.md` starts sparse and fills in during planning as technical decisions are made. By the time execution begins it should be complete. It is the session memory for the stateless agent and is read at the start of every execution session.

---

## 6. LAYER 1: INTAKE & DISCOVERY

### Purpose

Transform an unstructured client conversation into a structured, client-confirmed Discovery Document that serves as the contract baseline for the entire project.

### Workflow

```
Client conversation (freeform, messy)
        |
        v
Paste raw notes into an agent session
        |
        v
Run the intake skill — interrogate first,
do NOT produce the document yet
        |
        v
Agent asks clarifying questions (7 categories)
        |
        v
You answer (may need a follow-up call)
        |
        v
Agent writes the Discovery Document
        |
        v
[YOU REVIEW for accuracy + completeness]
        |
        v
Send to client -> written confirmation -> LOCKED
        |
        v
Layer 2 begins
```

**Hard rule:** do not begin Layer 2 until you have written client confirmation. This is your scope baseline. Any feature not in the document is out of scope and subject to a change request (Section 14).

### The 7 AskMeQuestions categories

The intake skill covers all seven before producing any output.

**1. Roles & access**
- Who are all the people who use this system? Name every distinct role.
- For each role: what can they create, read, update, delete?
- Can any role manage other users or change another user's access?
- Are there actions that need approval from a different role first?
- Are there role hierarchies (e.g. a manager seeing several branches)?

**2. Data & entities**
- List every distinct "thing" the system manages.
- For each: what is its full lifecycle (created -> ... -> archived)?
- What exists on paper, in Excel, or another system that this replaces?
- Is there existing data to import or migrate at launch?
- Any entities with ownership rules (e.g. "kasir sees only own orders")?

**3. Flows**
- Walk through the single most important thing the system does, step by step.
- What happens at each step if something goes wrong?
- Any time-based triggers (e.g. "remind if unpaid after 3 days")?
- Any multi-step approval or workflow processes?
- Any batch operations (e.g. "mark all overdue at end of day")?

**4. Integrations**
- Payment? Which provider?
- Notifications: WhatsApp, email (which provider?), SMS, push?
- Auth: username/password, or social login?
- Any connection to an existing external system?
- Any export needed (PDF reports, Excel)?

**5. Constraints**
- Hard deadline?
- Web only, or mobile app too?
- Must it work offline at any point?
- What language(s) must the UI support?
- Where is it hosted?
- Budget constraints affecting technology choices?

**6. Non-functional**
- Roughly how many concurrent users?
- Largest dataset (e.g. "5,000 products", "200 transactions/day")?
- Legal or compliance requirements?
- Speed expectations (e.g. "POS responds under 1 second")?
- Uptime expectations?

**7. Explicit exclusions**
- What did the client mention that is NOT being built this phase?
- What is phase 2 vs phase 1?
- What should never be assumed included without confirmation?
- Any competitor features the client specifically does NOT want?

---

## 7. LAYER 2: PLANNING

### Purpose

Transform the locked Discovery Document into a complete set of spec documents and task files that leave no meaningful decisions for the agent to make during execution.

### Workflow

```
Locked Discovery Document
        |
        v
Run feature-mapping skill
        |
        v
feature-map.md
(features + role matrix + dependency graph + waves)
        |
   [GATE: review]
        v
Per epic (epics can run in parallel after the gate):
        |
        v
Run data-modeling skill -> data-model.md
        |
   [GATE: MOST CRITICAL — types, rules, relationships]
        v
Run epic-and-flow skill   ||  Run api-spec skill
-> _epic.md + flow-*.md    ||  -> api.md
(api-spec depends on the flow files)
        |
        v
Run task-generation skill -> TASK-*.md + _index.md
        |
   [GATE: review task order + definitions of done]
        v
Execution begins
```

### Feature mapping output

The feature map answers: what exists, who can access it, and in what order it must be built.

**Role access matrix** (rendered as a real table; this is body content, not a code block):

| ID | Feature | Admin | Kasir | Epic Folder |
|----|---------|-------|-------|-------------|
| F01 | Auth & User Management | Full | Self-service only | /auth |
| F02 | Category Management | Full CRUD | No access | /category-management |
| F03 | Supplier Management | Full CRUD | No access | /supplier-management |
| F04 | Customer Management | Full CRUD | Create + view any | /customer-management |
| F05 | Product Management | Full CRUD | View only | /product-management |
| F06 | Stock Management | Full CRUD | View + receive | /stock-management |
| F07 | Sales / POS | Full | Full | /sales-pos |
| F08 | Custom Order Management | Full | Create + view own | /custom-orders |
| F09 | Reports & Dashboard | Full | No access | /reports |

**Dependency graph:**

```
F01 Auth & Users
   |  (everything depends on auth — build first)
   v
F02 Category  ─┐
F03 Supplier   ├─ independent of each other (parallel)
F04 Customer  ─┘
   |
   v
F05 Product   (needs F02)
   |
   v
F06 Stock     (needs F05)
   |
   v
F07 POS       ─┐ (both need F04, F05, F06)
F08 Custom    ─┘ (parallel with each other)
   |
   v
F09 Reports   (needs F07 + F08)
```

**Build waves:**

| Wave | Features | Parallel? | Gate before starting |
|------|----------|-----------|----------------------|
| 1 | F01 Auth | No — sequential | Nothing |
| 2 | F02, F03, F04 | Yes — all three | Wave 1 fully done |
| 3a | F05 Product | No | F02 done |
| 3b | F06 Stock | No | F05 done |
| 4 | F07 + F08 | Yes | Wave 3b done |
| 5 | F09 Reports | No | Wave 4 done |

### Data modeling: non-negotiable rules

Enforced by the data-modeling skill:

- Every table has `id` (uuid PK, `gen_random_uuid()`), `created_at` (timestamptz, `now()`), `updated_at` (timestamptz, `now()`), `created_by` (uuid FK to users, not null).
- Tables edited by users also have `updated_by` (uuid FK to users, nullable).
- Soft delete only: `is_active` boolean or `deleted_at` timestamptz nullable. Never hard delete core entities.
- Money: `decimal(12,2)` always. Never float, never integer.
- Fractional quantities (meters, weight): `decimal(10,2)`. Whole counts: `integer`.
- Status fields: ENUM with every value listed and described. Never free-text varchar.
- Every FK documents its cascade behavior: RESTRICT, CASCADE, or SET NULL.
- Many-to-many uses an explicit junction table with its own id and timestamps.
- Every non-obvious invariant is written in plain English (for example: "`stock_qty` changes only via StockMovement records", "`price_at_sale` is a snapshot and never updates").

**Why the data-model gate is the most critical:** a wrong data model discovered after most of the system is built means rebuilding migrations, API response shapes, and UI data mapping. The data model is the foundation. Careful review here is the single highest-leverage time you spend on the project.

### What each Layer 2 artifact covers

- `_epic.md` — scope, role matrix for the epic, list of flows, dependencies, explicit out-of-scope.
- `data-model.md` — every table, field, enum, relationship (with cascade), validation rule, and business rule.
- `flow-*.md` — one per user journey: layout, every element, all states, role variants, validation with exact error text, URL persistence, edge cases.
- `api.md` — every endpoint: method, path, role, params, request and response shapes, error responses, side effects.
- `TASK-*.md` — one per atomic buildable unit: what to build, spec references, a verifiable definition of done.

---

## 8. LAYER 3: TASK TRACKING & EXECUTION

### Task file structure

Each task is a markdown file with YAML frontmatter (machine-readable) and a body (human- and agent-readable).

```
---
id: TASK-008
epic: product-management
type: api          # foundation | api | ui | integration | fix
status: doing      # backlog | doing | done | blocked
depends_on: [TASK-001, TASK-007]
spec_refs:
  - docs/specs/product-management/api.md
  - docs/specs/product-management/data-model.md
started_at: 2025-01-18
completed_at:
---

# TASK-008: Product Management — All API Endpoints

## What to Build
2-5 sentences. Specific. Reference the spec files; do not
duplicate them. An agent reading only this should know the
output of the task.

## Context
Anything not in the spec files: a pattern to follow from a
completed task, a relevant decision from _decisions.md, a known
codebase constraint, which existing utilities to use.

## Definition of Done
- specific, manually verifiable item
- role access verified (what each role sees)
- all states render: loading, empty-no-data, empty-no-results, error
- happy path tested end to end
- at least 2 error or edge cases tested
- API tasks: 401 and 403 verified in Postman/Bruno
- UI tasks: tested on tablet viewport

## Notes
Filled in during/after build: decisions made, deviations from
spec, anything the next dependent task should know.
```

### Task types

- `foundation` — project setup, auth, shared utilities, DB setup; things everything depends on.
- `api` — endpoints for one resource or a closely related group.
- `ui` — one complete user-facing flow (list, form, detail).
- `integration` — a third-party service (WhatsApp, payment, storage).
- `fix` — a correction created after a verification failure.

### Task index file

`docs/tasks/_index.md` is the board. It is the first thing the agent reads at session start and the first thing you check when choosing what to work on. Represented as one line per task so it stays readable on any width.

```
# Task Board: <Project Name>
Last updated: YYYY-MM-DD

Summary
  Total 0 | Done 0 | Doing 0 | Backlog-ready 0 | Blocked 0

## DOING
- TASK-008 — Product Management API — product-management — api
  — started 2025-01-18

## BACKLOG (ready — all depends_on done)
- TASK-009 — Product list page UI — product-management — ui
  — depends: TASK-008
- TASK-010 — Category management CRUD — category-management
  — api+ui — depends: TASK-001

## BLOCKED
- TASK-015 — Sales / POS screen — sales-pos
  — blocked by: TASK-008, TASK-013

## DONE
- TASK-001 — Auth + role-based access — auth — 2025-01-15
- TASK-002 — User management CRUD — auth — 2025-01-16
- TASK-003 — DB migration: core tables — foundation — 2025-01-16
```

### Standard task order within an epic

1. Database migration task (if new tables) — type `foundation`
2. API task(s) — type `api`
3. UI task(s), one per flow file — type `ui`
4. Integration task (if any) — type `integration`

DB migration must finish before the API is built; the API must finish before the UI is built against it.

---

## 9. THE EXECUTION LOOP

### What happens in every session

```
Session start
  |
  +- Agent reads AGENTS.md (workflow + rules)
  +- Agent reads docs/specs/_context-block.md (project memory)
  +- Agent reads docs/tasks/_index.md (current state)
  +- Agent finds backlog tasks whose depends_on are all done
  |
  v
You confirm which task to build
  |
  v
Agent reads docs/tasks/TASK-NNN.md + all spec_refs
  |
  v
Agent builds on branch task/TASK-NNN-slug
  |
  v
Agent outputs a build summary
  |
  v
You verify against the Definition of Done
  |
  +- All pass -> mark done, merge branch, update index, next
  +- Fails    -> diagnose (see "Verification failure loop")
```

### The execution prompt structure

```
Use the execution skill (.claude/skills/execution/SKILL.md).

Read, in order:
  1. AGENTS.md
  2. docs/specs/_context-block.md
  3. docs/tasks/_index.md
  4. docs/tasks/TASK-NNN.md
  5. each file listed in that task's spec_refs

Then build exactly what TASK-NNN describes.

Rules:
  - Follow every convention in _context-block.md.
  - Do not add features not in the task or spec_refs.
  - Do not refactor code outside the task scope.
  - Do not change existing API response shapes without flagging.
  - Spec does not cover it?
      trivial visual detail   -> use judgment, match patterns
      functional/data choice  -> STOP and flag
      data-model change       -> STOP immediately

After building, output:
  1. what was built
  2. files created or modified
  3. decisions made not in the spec
  4. deviations from spec and why
  5. suggested manual tests beyond the DoD
```

### Git & branch conventions

One task = one branch = one reviewable unit of work.

```
Per task:
  1. git checkout -b task/TASK-NNN-slug   (from integration branch)
  2. Agent builds only what TASK-NNN describes
  3. Commits reference the task ID:
       feat(TASK-008): product CRUD endpoints
       fix(TASK-008): handle SKU conflict with 409
  4. You verify the Definition of Done on this branch
  5. Merge into the integration branch only after DoD passes
  6. Delete the task branch
```

- Never let one session span two tasks. Finish, end the session, start fresh.
- Commit at the end of a verified task, not mid-build. A half-built failing task is discarded by abandoning the branch.
- The integration branch is always known-good. Only verified tasks land there.

### Parallel execution mechanics

Parallelism is only safe **across independent epics**, never within one epic (within an epic, UI depends on API depends on the migration — a strict sequence).

```
Option A — separate branches, one working tree (simplest)
  Each session works on its own task branch.
  Risk: two sessions editing the same shared file conflict on merge.
  Mitigation: keep shared registration files thin; have each epic
  register itself in its own module.

Option B — git worktrees (cleaner isolation)
  git worktree add ../proj-supplier task/TASK-011-supplier-api
  git worktree add ../proj-customer task/TASK-013-customer-api
  Two agents never touch the same files on disk.
  Merge each branch back in dependency order when its DoD passes.
```

Honest caveat: parallelism adds merge overhead and splits your attention across two verification streams. For a solo developer it is often faster overall to run waves sequentially. Use parallel sessions only when an epic is genuinely large and independent.

### Verification failure loop

When the Definition of Done does not fully pass, diagnose the failure type rather than re-prompting "fix it".

```
DoD item fails
  |
  +- Implementation bug (spec was clear, code is wrong)
  |    -> re-prompt with the SPECIFIC failing items only:
  |       "DoD items 3 and 7 failed: <observed behavior>. Fix only these."
  |
  +- Spec gap (the spec never said what to do here)
  |    -> STOP building. Fix the spec file. Re-run from the corrected spec.
  |       Record the clarification in _decisions.md.
  |
  +- Spec wrong (the spec said X but X is wrong for the business)
       -> Fix the spec, check whether completed tasks depend on the wrong
          assumption, and create fix tasks for them if needed.
```

**The two-failure rule:** if the same task fails verification twice after targeted re-prompting, the problem is almost always the spec, not the agent. Stop re-prompting. Re-read the spec as if you were the agent with zero context, find the ambiguity, fix it, then rebuild.

### What "atomic" means for a task

A task is atomic when it can be built and verified in one session without clarification, has a clear done state that does not bleed into the next task, and does not require partially building something that only works once another task is also done.

Right-sized: "all API endpoints for /api/products"; "the product list page (all columns, filters, states, role variants)"; "the image upload integration".

Too large: "build product management" (an entire epic); "build the backend" (an entire layer).

Too small: "add a border to the table header"; "change the button color".

If add and edit forms are nearly identical, make them one task and note the differences. If substantially different, split them.

### The context block

`docs/specs/_context-block.md` is the project memory for the stateless agent. Read at the start of every session. It grows through Layer 2 as decisions are made.

```
# Project Context Block: <Project Name>

What this project is
  <2-3 sentences>

Tech stack
  Frontend / Backend / Database+ORM / Auth / File storage /
  Styling / Forms / HTTP client

Key file locations
  API routes / page components / shared components /
  DB client / auth utilities / shared types

Roles in code
  <role>: how role is stored and accessed
  API role check: <exact function call>
  UI role check: ALWAYS hide restricted elements, never just disable

API response conventions
  list:        { data: [...], meta: { total, page, limit, total_pages } }
  single:      { data: { ... } }
  created:     { data: { ... } }  (201)
  warnings:    { data: { ... }, warnings: ["..."] }
  validation:  { code: "VALIDATION_ERROR", errors: { field: ["msg"] } }
  not found:   { code: "NOT_FOUND", message } (404)
  forbidden:   { code: "FORBIDDEN", message } (403)

UI conventions
  loading -> skeletons, not full-page spinners
  currency -> store decimal(12,2) IDR, show "Rp 450.000"
  datetime -> store UTC, show Asia/Jakarta
  soft delete -> is_active, never delete core records
  UI language -> <Bahasa Indonesia / English / bilingual>

Git conventions
  one task = one branch = one verified merge
  branch task/TASK-NNN-slug  ;  commit type(TASK-NNN): summary

Completed epics
  [x] Auth & Users (TASK-001..002)
  [ ] Product Management (in progress)

Key decisions (full log: docs/specs/_decisions.md)
  - <one line each, 3-7 bullets>
```

---

## 10. DOCUMENT TEMPLATES

These are the starter contents of the orchestration files and the per-skill templates. All structured content is shown as wrap-tolerant lists rather than pipe tables, so it stays readable on any viewport. The agent fills in the placeholders.

### AGENTS.md (repo root)

```
# Agent Operating Guide

This repository is a client software project built with the
AI Coding Workflow. Read this file and docs/specs/_context-block.md
before doing anything.

## The workflow (three layers)
  Layer 1 Intake     -> docs/specs/discovery.md (locked, client-confirmed)
  Layer 2 Planning   -> feature map, data models, specs, tasks
  Layer 3 Execution  -> build one task at a time, verify, merge

## Skills (in .claude/skills/<name>/SKILL.md)
  intake           raw notes -> Discovery Document
  feature-mapping  Discovery -> feature map + waves
  data-modeling    feature map -> data-model.md per epic
  epic-and-flow    -> _epic.md + flow-*.md per epic
  api-spec         flows + data model -> api.md per epic
  task-generation  specs -> TASK-*.md + _index.md
  execution        load context + build one task

## Universal rules
  - Build only what the current task and its spec_refs describe.
  - One task per session, on its own branch task/TASK-NNN-slug.
  - Restricted UI elements are HIDDEN, never just disabled.
  - Soft delete only; never hard delete core entities.
  - Money is decimal, never float.
  - If the spec does not cover a functional or data decision: STOP and flag.
  - Any data-model change: STOP immediately.
  - Follow every convention in docs/specs/_context-block.md.

## Where things live
  docs/specs/   filled specs (project output)
  docs/tasks/   task board + task files
  docs/client-comms/  client confirmations
  src/          application code
```

### CLAUDE.md (repo root)

```
# Claude Code Entry Point

This project follows the AI Coding Workflow defined in AGENTS.md.

Before any work:
  1. Read AGENTS.md
  2. Read docs/specs/_context-block.md
  3. Read docs/tasks/_index.md

Skills are auto-discovered from .claude/skills/. Use the skill that
matches the current phase; see AGENTS.md for the mapping.

(Optional: import AGENTS.md directly with `@AGENTS.md`.)
```

### README.md (repo root)

```
# <Template Name> — Full-Stack Template + AI Coding Workflow

A reusable full-stack starter that also carries the AI Coding
Workflow: skills, conventions, and a docs scaffold for taking a
client project from raw requirements to delivery.

## Start a project
  1. Create a new repo from this template.
  2. Fill docs/specs/_overview.md.
  3. Run the intake skill -> docs/specs/discovery.md.
  4. Get written client confirmation; lock the document.
  5. Run the planning skills in order (see AGENTS.md).
  6. Run the execution loop, one task at a time.

## Workflow at a glance
  Intake -> Planning -> Execution, with a human review gate
  between layers. See AGENTS.md for the full map.

## Where things live
  AGENTS.md            agent operating guide
  .claude/skills/      the skills
  docs/specs/          specs and decisions
  docs/tasks/          task board + tasks
  src/                 application code

## Improve the template
  After each delivery, fold lessons back into the skills and
  conventions so the next project inherits them.
```

### discovery-template.md (in the intake skill)

```
# Discovery Document: <Project Name>
Version: 1.0
Date:    YYYY-MM-DD
Status:  DRAFT | CLIENT-CONFIRMED | LOCKED
By:      <your name>

## Project Summary
<2-3 sentences: what, for whom, why>

## Roles
- <Role 1> — <description> — approx <N> users
    Can:    <every action this role can do>
    Cannot: <explicit restrictions>
- <Role 2> — <description> — approx <N> users
    Can:    <...>
    Cannot: <...>

## Core Entities
- <Entity> — <one line>. Lifecycle: <created -> ... -> archived>

## Key Flows (high level)
1. <Flow> — <1-2 paragraph plain-English description>
2. <Flow> — <...>

## Integrations
- <Integration> — Confirmed | Likely | Out of scope — <notes>

## Explicit Out of Scope
- <item confirmed not in this delivery>
- <phase 2 item>

## Open Questions  (must be empty before locking)
- <question and who answers it>

## Client Confirmation
- Sent on: ____
- Confirmed on: ____
- Method: (email / WhatsApp / meeting notes / signed PDF)
- Confirmed by: <name and role>
- File: docs/client-comms/<filename>

## Change Log (after lock)
- YYYY-MM-DD — <change> — requested by <who>
  — impact <...> — new tasks <TASK-NNN ...>
```

### epic-template.md (in the epic-and-flow skill)

```
# Epic: <Feature Name>

## Purpose
<2-3 sentences: why this exists, for which role>

## Scope — Included
- <item>

## Out of Scope (this epic)
- <item>

## Role Access
- <Action 1> — <Role 1>: Full — <Role 2>: No access
- <Action 2> — <Role 1>: Full — <Role 2>: View only

## Dependencies
- <specific: "requires products table + POST /api/products">

## Flows in This Epic
- flow-<name>.md — <what journey it covers>

## API Spec     -> api.md
## Data Model   -> data-model.md

## Notes
<architecturally interesting or client-specific rules>
```

### flow-template.md (in the epic-and-flow skill)

```
# Flow: <Flow Name>

## Route
<url path>

## Role Access
<who can reach it; what happens if the wrong role navigates here>

## Layout
<page structure: header, content, sidebar>

## Elements
<for each input/select/button/column/badge/link:
 what it is, its options, what happens when used>

## States (cover every one)
- Loading — skeletons for content areas
- Empty (no data) — icon, heading, description, optional CTA
- Empty (filters matched nothing) — different copy + reset action
- Error — message + retry
- Submitting (forms) — button state; can the user cancel?
- Success — redirect / toast / inline
- Warning — success with caveats

## Role Variants
<how the page differs per role; restricted = HIDDEN, not disabled;
 wrong role on a restricted route -> redirect to a safe page>

## Validation (forms)
- <field> — <rule> — error text: "<exact message>"

## URL Persistence
<which of search/filters/sort/page live in query params>

## Edge Cases
- <required dependency missing? e.g. no categories yet>
- <acting on a record in a terminal state?>
- <dependency deleted between load and submit?>
```

### api-template.md (in the api-spec skill)

```
# API: <Epic Name>

## Auth
All endpoints require a valid session.
Missing token -> 401 UNAUTHORIZED. Wrong role -> 403 FORBIDDEN.

## <METHOD> /api/<resource>
<one line>. Role: <who is permitted>

Query params (GET):
- page — integer — optional — default 1
- limit — integer — optional — default 20, max 100
- <param> — <type> — optional — <notes>

Request body (POST/PUT):
- <field> — <type> — <required?> — <notes>

Response <status>:
- shape (one field per line):
    data: object with fields <...>
    meta: { total, page, limit, total_pages }   (lists only)

Side effects:
- <everything else that happens: stock change, notification, etc.>

Error responses:
- 400 VALIDATION_ERROR — body fails validation
- 401 UNAUTHORIZED — no session
- 403 FORBIDDEN — role not permitted
- 404 NOT_FOUND — resource missing
- 409 <CODE> — <specific conflict>

Validation error body:
- code: "VALIDATION_ERROR"
- errors: { <field>: ["<message>"] }
```

### data-model-template.md (in the data-modeling skill)

```
# Data Model: <Epic Name>

## Table: <table_name>
Fields (one per line — name, type, null?, notes):
- id — uuid — not null — PK, default gen_random_uuid()
- <field> — <type> — null?/not null — <notes>
- created_by — uuid — not null — FK -> users.id
- updated_by — uuid — nullable — FK -> users.id
- created_at — timestamptz — not null — default now()
- updated_at — timestamptz — not null — default now()

## Enums
- <field>:
    <value_one> — <when it applies>
    <value_two> — <when it applies>
    (note any progression: pending -> in_progress -> done)

## Business Rules
- <plain-English invariant>
- <snapshot fields, mechanism-only updates, etc.>

## Relationships
- <table>.<field>_id -> <other>.id — RESTRICT | CASCADE | SET NULL

## Validation Rules
- <field> — <rule>

## Indexes
- <name> — <fields> — UNIQUE | INDEX — <reason>
```

### task-template.md (in the task-generation skill)

```
---
id: TASK-NNN
epic: <epic-folder>
type: foundation | api | ui | integration | fix
status: backlog
depends_on: []
spec_refs:
  - docs/specs/<epic>/<file>.md
started_at:
completed_at:
---

# TASK-NNN: <specific title>

## What to Build
<2-5 sentences; reference spec files, do not duplicate them>

## Context
<patterns to follow, relevant decisions, codebase constraints,
 which existing components/utilities to use>

## Definition of Done
- <specific, verifiable item>
- role access verified (what each role sees)
- all states render (loading, empty-no-data, empty-no-results, error)
- happy path tested end to end
- at least 2 error/edge cases tested
- UI: tested on tablet viewport
- API: 401 and 403 verified in Postman/Bruno

## Notes
<filled after build: decisions, deviations, notes for the next task>
```

### index-template.md (in the task-generation skill)

```
# Task Board: <Project Name>
Last updated: YYYY-MM-DD

Summary
  Total 0 | Done 0 | Doing 0 | Backlog-ready 0 | Blocked 0

## DOING
- (none yet)

## BACKLOG (ready — all depends_on done)
- (none yet)

## BLOCKED
- (none yet)

## DONE
- (none yet)
```

### _decisions.md (project file, lives in docs/specs/)

```
# Decisions Log: <Project Name>

Record decisions that could have gone another way, that a future
session might assume differently, that the client influenced, or
that affect more than one feature. Skip trivial spec-following.

## YYYY-MM-DD — <decision title>
- Decision: <what was decided>
- Reason: <why>
- Alternatives: <what else was considered and rejected>
- Impact: <what parts of the system this affects>
- Confirmed by: <self / client — date + method>
```

---

## 11. THE SKILLS

Each skill is a directory under `.claude/skills/` with a `SKILL.md` (YAML frontmatter plus instructions) and, where useful, a bundled template. The `description` is what drives a skill to trigger, so it states both what the skill does and when to use it. The bodies below avoid inner code fences so they render cleanly.

### .claude/skills/intake/SKILL.md

```
---
name: intake
description: Turn raw, unstructured client notes into a complete,
  client-ready Discovery Document. Use at the very start of a
  project, when the user pastes notes from a client conversation
  or asks to capture or formalize requirements. Interrogates for
  gaps before writing anything.
---

# Intake & Discovery

CRITICAL: do not produce the document on the first pass. Interrogate first.

Step 1 — Read the raw notes. Note what is stated, implied, missing, or ambiguous.

Step 2 — Ask clarifying questions across all 7 categories in one message,
grouped by category. Be specific ("can the kasir edit prices, or only read
them?" not "who uses this?"). Categories:
  1 Roles & access — roles, permissions, restrictions, approvals, ownership
  2 Data & entities — managed objects, lifecycles, data to migrate
  3 Flows — key workflows step by step, failure paths, time triggers
  4 Integrations — payment, notifications, auth, external systems, exports
  5 Constraints — deadline, devices, offline, languages, hosting
  6 Non-functional — concurrency, data volume, compliance, performance
  7 Explicit exclusions — phase 2, never-assume-included items
Do not move on until every category is answered. Follow up on partial answers.

Step 3 — Write the Discovery Document using ./discovery-template.md and save it
to docs/specs/discovery.md. The Open Questions section must be empty; keep any
unanswered item there rather than assuming.

Step 4 — Flag before finishing: implicit features clearly required (auth,
user management), unusually complex or high-risk requirements, and integrations
with significant cost or time implications.
```

### .claude/skills/feature-mapping/SKILL.md

```
---
name: feature-mapping
description: Turn a locked Discovery Document into a feature map —
  a feature list with a role-access matrix, a dependency graph,
  and build waves. Use after the Discovery Document is
  client-confirmed and before any data modeling or building.
---

# Feature Mapping

Input: docs/specs/discovery.md (locked).
Output: docs/specs/feature-map.md — feature list + role matrix +
dependency graph + build waves.

Step 1 — Extract explicit features the client described.

Step 2 — Add implicit features and label them "(implicit)". Always required:
auth (login/logout/session), user/account management, a dashboard. Often
forgotten: file upload handling, notification dispatch, data export (PDF/Excel),
CSV import for existing data.

Step 3 — Build the role-access matrix. Per feature, per role, one of:
Full CRUD, Full, View only, Create + view own, No access.

Step 4 — Map dependencies. A depends on B if it holds a FK to B's records,
needs B's data or UI to function, or cannot be tested without B working.

Step 5 — Assign waves. Wave 1 = no dependencies (auth is always Wave 1).
Wave N = all dependencies in earlier waves. Same wave = no mutual dependency.

Validate before output: auth is Wave 1; no circular dependencies; every role
covered for every feature; phase-2 items marked out of scope; implicit features
included and labeled.
```

### .claude/skills/data-modeling/SKILL.md

```
---
name: data-modeling
description: Produce a complete, rigorous data model (data-model.md)
  for one epic from the feature map and Discovery Document. Use
  during planning, once per epic, before writing flow or API specs.
  Enforces non-negotiable schema rules (uuid PKs, audit columns,
  soft delete, decimal money, explicit enums, FK cascade behavior).
---

# Data Modeling

Input: docs/specs/feature-map.md, docs/specs/discovery.md, and the epic to model.
Output: docs/specs/<epic>/data-model.md using ./data-model-template.md.
Document cross-epic entities only as relationships.

Mandatory rules (enforce without exception):
  - Every table: id (uuid PK, gen_random_uuid()), created_at, updated_at
    (timestamptz, now()), created_by (uuid FK users, not null).
  - Editable tables also: updated_by (uuid FK users, nullable).
  - Soft delete only: is_active boolean OR deleted_at nullable; pick one and
    stay consistent. Never hard delete core entities.
  - Money: decimal(12,2). Fractional quantities: decimal(10,2). Counts: integer.
    Never float for money.
  - Status fields: ENUM with every value listed and described. Never varchar.
  - Every FK documents cascade: RESTRICT (default), CASCADE (true composition),
    SET NULL (optional relationship).
  - Many-to-many: explicit junction table with its own id and timestamps.
  - Write every non-obvious invariant in plain English. Flag snapshot fields and
    fields updated only by a specific mechanism.

Self-check before output: no floats for money; audit columns on every table;
every enum fully listed; every FK has cascade; soft-delete strategy consistent;
business rules in plain English; indexes noted for frequent filters/searches.
```

### .claude/skills/epic-and-flow/SKILL.md

```
---
name: epic-and-flow
description: Produce the epic spec (_epic.md) and one flow spec
  (flow-*.md) per user journey for an epic. Use during planning,
  per epic, after the data model is reviewed and before the API
  spec. Enforces that every flow covers all UI states, role
  variants, validation with exact error text, and edge cases.
---

# Epic & Flow Spec

Input: feature-map.md (the epic entry), docs/specs/<epic>/data-model.md
(must be complete), docs/specs/discovery.md.
Output: docs/specs/<epic>/_epic.md (from ./epic-template.md) and one
docs/specs/<epic>/flow-<name>.md (from ./flow-template.md) per journey.

_epic.md: explicit role matrix (every action, every role); specific
dependencies ("requires products table and POST /api/products").

Flows are distinct journeys: list/browse, add, edit (combine with add if nearly
identical and note differences), detail, a destructive-action modal, a wizard,
a status-change flow.

Every flow file must include: route; layout; every UI element and its behavior;
role variants (restricted elements HIDDEN, not disabled; restricted routes
redirect to a safe page); ALL states (loading, empty-no-data, empty-no-results,
error, submitting, success, warning); validation rules with exact error text in
the project UI language; URL persistence (search/filters/sort/page); edge cases
(missing dependency, terminal-state record, dependency deleted mid-edit).
```

### .claude/skills/api-spec/SKILL.md

```
---
name: api-spec
description: Produce the complete API specification (api.md) for an
  epic from its flow specs and data model. Use during planning, per
  epic, after the flows exist. Every endpoint gets method, path,
  role, params, request/response shapes, side effects, and all
  error responses — no placeholders.
---

# API Spec

Input: docs/specs/<epic>/flow-*.md, docs/specs/<epic>/data-model.md,
docs/specs/_context-block.md (response conventions).
Output: docs/specs/<epic>/api.md using ./api-template.md. Derive endpoints from
what the flows fetch, create, update, and delete.

Each endpoint documents: method + full path; one-line description; role
(all permitted roles); query params (GET) with type/required/default; request
body shape; success status + complete response body; side effects; every error
response (status + code + when); the full validation-error body.

Rules: response shapes are complete (no "..."); error codes SCREAMING_SNAKE_CASE
per _context-block.md; document role-based filtering vs blocking ("Admin: all
records. Kasir: only own."); flag snapshot fields; every list endpoint paginates
with page+limit and returns meta { total, page, limit, total_pages }; document
every side effect (stock change, notification, related-record updates).

Self-check: every flow has endpoints; every endpoint has all error cases;
shapes complete; role per endpoint; side effects on every state-changing call;
pagination on all lists; snapshot fields flagged; codes match _context-block.md.
```

### .claude/skills/task-generation/SKILL.md

```
---
name: task-generation
description: Break one epic's specs into atomic task files
  (TASK-*.md) and update the task board (_index.md). Use during
  planning, per epic, after the epic's data model, flows, and API
  spec are complete. Sets correct dependencies and verifiable
  definitions of done.
---

# Task Generation

Input: all specs for one epic (_epic.md, data-model.md, flow-*.md, api.md).
Output: TASK-NNN.md files in docs/tasks/ (from ./task-template.md) and an
updated docs/tasks/_index.md (from ./index-template.md).

Step 1 — Next ID: read _index.md, find the highest TASK number, continue from
there. IDs are sequential across the whole project.

Step 2 — Atomic tasks in order: (1) DB migration if new tables (foundation);
(2) API task(s), grouping CRUD for one resource (api); (3) one UI task per flow
file (ui); (4) integration task if any (integration).

Step 3 — depends_on: migration depends on earlier foundational tasks; API on its
migration; UI on its API; integration on its API. Check against the wave order.

Step 4 — spec_refs: exact paths from repo root, with section anchors when a task
covers only part of a file.

Step 5 — Definition of Done: specific and verifiable. UI tasks include all role
variants, all states, tablet viewport. API tasks include happy path, validation
shape, 401, 403, 404.

Step 6 — Update _index.md: add tasks to BACKLOG, mark ready vs blocked, update
the summary counts.
```

### .claude/skills/execution/SKILL.md

```
---
name: execution
description: Load all project context and build exactly one task to
  its definition of done. Use at the start of every build session
  in Layer 3, after planning is complete and tasks exist. Works on
  one branch, follows the spec, and stops to flag anything the spec
  does not cover.
---

# Execution

Session start, read in order: AGENTS.md; docs/specs/_context-block.md;
docs/tasks/_index.md. If no task is given, list backlog tasks whose depends_on
are all done and wait for selection. For the chosen task, read
docs/tasks/TASK-NNN.md and every file in spec_refs; if any depends_on is not
done, flag and stop.

Build: work on branch task/TASK-NNN-slug; touch only this task's scope; do not
start a second task in the session. Build exactly what the task and spec_refs
describe — no extra features, no out-of-scope refactors, no changes to existing
API response shapes without flagging.

When the spec is silent: trivial visual detail -> use judgment, match patterns;
functional or data decision -> STOP and ask; data-model change -> STOP
immediately. Do not assume a field or utility exists without checking.

After building, output: status; what was built; files created/modified;
decisions not in the spec; deviations and why; suggested tests beyond the DoD;
items to add to _decisions.md.

After the human verifies the DoD: set the task to done with completed_at; move it
to DONE in _index.md and update counts; add flagged decisions to _decisions.md;
fix any spec errors found; merge the verified branch and delete it.
```

---

## 12. FULL END-TO-END WORKED EXAMPLE: TOKO BATIK

A complete walkthrough applied to a real Indonesian traditional business.

### The raw client brief

> "Kami punya toko batik, perlu sistem untuk manage stok kain dan pakaian jadi. Ada pesanan custom juga dari pelanggan. Kasir kami perlu bisa buka POS untuk jual barang. Owner mau lihat laporan penjualan. Sekarang masih pakai Excel."

This is what you receive. Run the intake skill.

### Intake — questions and answers (excerpt)

Roles
- Q: Apakah kasir bisa mengubah harga produk? — A: Tidak, hanya owner.
- Q: Kasir bisa hapus transaksi yang sudah selesai? — A: Tidak boleh.
- Q: Ada role lain selain owner dan kasir? — A: Tidak, hanya 2.

Data & entities
- Q: Pesanan custom prosesnya bagaimana? Ada DP? — A: Ya, customer bayar DP dulu, lunas saat ambil.
- Q: Data Excel perlu di-import? — A: Kalau bisa, terutama produk dan pelanggan lama.

Flows
- Q: Kalau kasir salah input di POS, bisa dibatalkan? — A: Boleh sebelum konfirmasi pembayaran.

Integrations
- Q: Perlu notifikasi ke pelanggan? — A: WhatsApp kalau pesanan custom siap diambil.
- Q: Payment gateway? — A: Belum, fase 2. Kasir catat manual.

Constraints
- Q: Perlu akses dari HP? — A: Tablet untuk POS boleh; HP tidak wajib.
- Q: Hosting di mana? — A: VPS yang sudah ada.

### Resulting Discovery Document (excerpt)

```
# Discovery Document: Toko Batik Sekar Arum
Version 1.0 | 2025-01-15 | Status: CLIENT-CONFIRMED

Project Summary
  Web-based management system for a batik shop, replacing Excel.
  Product catalog, stock, POS sales, custom orders with DP, and
  owner reporting. Web on desktop + tablet. ~5 concurrent users.

Roles
  Admin (Owner) — full access — 1-2 users
    Can: everything incl. pricing, reports, users, import
  Kasir (Staff) — POS, stock view, own custom orders — 2 users
    Can: POS sales, view stock, create + view own custom orders, add customers
    Cannot: edit prices, delete records, view reports, manage users,
            see other kasir's custom orders

Core Entities
  Product, Category, Supplier, Customer, StockMovement,
  SalesTransaction, CustomOrder

Key Flows
  1 POS Sale — select products, set qty, record payment
    (cash/transfer/QRIS); save; deduct stock; cancel only before payment
  2 Custom Order — create with customer, item, motif, total, DP;
    status pending -> in_progress -> ready -> delivered;
    WhatsApp on "ready"
  3 Stock Receiving — admin records supplier, product, qty, buy price;
    stock up; movement logged
  4 Owner Reports — sales totals, top products, low stock, open orders

Integrations
  WhatsApp via Fonnte API — Confirmed (client has account)
  Payment gateway — Out of scope (phase 2), manual recording
  CSV import (products + customers) — Confirmed (phase 1)

Explicit Out of Scope
  Online storefront; payment gateway; native mobile app;
  accounting integration; barcode scanning (phase 2)

Client Confirmation
  Sent 2025-01-15; confirmed by Ibu Sari (owner) 2025-01-16 via WhatsApp;
  file docs/client-comms/konfirmasi-2025-01-16.png
```

### Feature map (body table — renders fine)

| ID | Feature | Admin | Kasir | Wave |
|----|---------|-------|-------|------|
| F01 | Auth & User Management | Full | Self-service | 1 |
| F02 | Category Management | Full CRUD | No access | 2 |
| F03 | Supplier Management | Full CRUD | No access | 2 |
| F04 | Customer Management | Full CRUD | Create + view any | 2 |
| F05 | Product Management | Full CRUD | View only | 3 |
| F06 | Stock Management | Full CRUD | View + receive | 4 |
| F07 | Sales / POS | Full | Full | 5 |
| F08 | Custom Order Management | Full | Create + view own | 5 |
| F09 | WhatsApp Notification (implicit) | — | — | 5 |
| F10 | CSV Import (implicit) | Full | No access | 3 |
| F11 | Reports & Dashboard | Full | No access | 6 |

F09 and F10 were added by the feature-mapping skill as implicit features the client did not name.

### Sample data model: products (fence-friendly list)

```
# Data Model: Product Management

## Table: products
- id — uuid — not null — PK, default gen_random_uuid()
- name — varchar(100) — not null
- category_id — uuid — not null — FK -> categories.id
- sku — varchar(50) — not null — unique; auto or manual
- description — text — nullable
- type — enum — not null — see enums below
- unit — varchar(20) — not null — meter, pcs, lembar
- price_buy — decimal(12,2) — not null — > 0
- price_sell — decimal(12,2) — not null — > 0
- stock_qty — decimal(10,2) — not null — default 0; via StockMovement only
- min_stock — decimal(10,2) — not null — default 5; low-stock threshold
- images — jsonb — nullable — array of {url, order}, max 5
- is_active — boolean — not null — default true (soft delete)
- created_by — uuid — not null — FK -> users.id
- updated_by — uuid — nullable — FK -> users.id
- created_at — timestamptz — not null — default now()
- updated_at — timestamptz — not null — default now()

## Enums
- type:
    kain_meteran — fabric sold by the meter
    pakaian_jadi — finished garments
    bahan_baku — raw production materials

## Business Rules
- stock_qty changes only as a side effect of a StockMovement record,
  never via the product edit form or product API.
- Deactivating hides a product from kasir and POS; admin can still
  find it with the is_active=false filter. Records are never deleted.
- price_sell may be below price_buy: warn, but do not block save.
- SKU cannot change after creation.
- Auto SKU format: <CATEGORY_CODE>-<YYMMDD>-<4 digits>, e.g. BTK-250118-3847

## Relationships
- products.category_id -> categories.id — RESTRICT
- products.created_by -> users.id — RESTRICT
- stock_movements.product_id -> products.id — RESTRICT
- sales_items.product_id -> products.id — RESTRICT
- custom_order_items.product_id -> products.id — RESTRICT

## Validation Rules
- name — required, 2-100 chars
- category_id — required, must exist
- sku — required, unique, max 50, alphanumeric + dash
- type — required, one of the enum values
- unit — required, max 20
- price_buy / price_sell — required, > 0, max 2 decimals
- min_stock — required, >= 0, default 5
- images — optional, max 5, jpg/png, 2MB each

## Indexes
- products_sku_unique — sku — UNIQUE — uniqueness
- products_category_idx — category_id — INDEX — frequent filter
- products_active_idx — is_active — INDEX — frequent filter
```

### Sample flow spec: product list page (fence-friendly)

```
# Flow: Product List Page

## Route
/products

## Role Access
Admin: all columns incl. Status; Add/Edit/Deactivate actions.
Kasir: active products only; no action column; no status filter.

## Layout
Header "Produk" (left) + "Tambah Produk" (right, admin only).
Filter bar. Results count. Table. Pagination.

## Filter Bar (apply on change, 300ms debounce; reflected in URL)
- Search — text — name + SKU, case-insensitive
- Kategori — select — from GET /api/categories + "Semua"
- Tipe — select — kain_meteran / pakaian_jadi / bahan_baku + "Semua"
- Stok — select — Semua / Stok Rendah / Stok Normal
- Status — select — Aktif / Tidak Aktif / Semua — ADMIN ONLY

## Table Columns
- Thumbnail — not sortable — first image 40x40, placeholder if none
- Nama — sortable — name; SKU in small gray text below
- Kategori — not sortable
- Tipe — not sortable — badge
- Stok — sortable — number + unit; red + icon if below min_stock
- Harga Jual — sortable — "Rp 450.000"
- Status — not sortable — ADMIN ONLY — Aktif/Tidak Aktif badge
- Aksi — not sortable — ADMIN ONLY — see row actions
Default sort: created_at descending.

## Row Actions (admin only; column hidden for kasir)
- Lihat -> /products/:id
- Edit -> /products/:id/edit
- Nonaktifkan -> confirmation modal (when active)
- Aktifkan -> immediate, toast, no modal (when inactive)

## Deactivate Modal
Title "Nonaktifkan Produk?"
Body "Produk <nama> tidak akan muncul di POS dan tidak bisa
dipilih untuk pesanan baru."
If API returns warnings, show each in a yellow box.
Buttons: Batal (close) | Nonaktifkan (red, calls deactivate endpoint)

## States
- Loading — 5 skeleton rows; filter bar renders immediately
- Empty no products (admin) — "Belum ada produk" + "Tambah Produk"
- Empty no products (kasir) — same heading, no button,
  "Hubungi admin untuk menambahkan produk"
- Empty filters matched nothing — "Produk tidak ditemukan" +
  "Reset Filter"
- Error — "Gagal memuat data produk" + "Coba Lagi"

## URL
/products?page=1&search=mega&category_id=..&type=..&stock_status=low&is_active=true
When filters change, reset to page 1.
```

### Sample API spec: product management (fence-friendly)

```
# API: Product Management

## Auth
Valid session required. Missing -> 401. Wrong role -> 403.

## GET /api/products
Role: Admin (all incl. inactive), Kasir (active only).
Query params:
- page — integer — default 1
- limit — integer — default 20, max 100
- search — string — name + SKU
- category_id — uuid
- type — string — enum value
- stock_status — string — "low" = stock_qty < min_stock
- is_active — boolean — default true — admin only; kasir forced true
Response 200:
- data: list of products with id, name, sku,
  category {id,name}, type, unit, price_sell, stock_qty,
  min_stock, is_low_stock (computed), is_active, thumbnail_url
- meta: { total, page, limit, total_pages }

## POST /api/products
Role: Admin only.
Request body:
- name, category_id, sku (optional -> auto), type, unit,
  description (optional), price_buy, price_sell, min_stock,
  images (temp tokens from POST /api/uploads/temp)
Response 201: full product object.
Side effects: none; stock_qty starts at 0.
Errors: 400 VALIDATION_ERROR; 403 FORBIDDEN (kasir);
409 SKU_CONFLICT (sku exists).

## POST /api/products/:id/deactivate
Role: Admin only.
Response 200:
- data: { id, is_active: false }
- warnings: e.g. ["Produk memiliki 2 pesanan custom aktif"]
Side effects: sets is_active=false; does not delete; does not
cancel custom orders.
```

### Sample task files

```
---
id: TASK-001
epic: auth
type: foundation
status: done
depends_on: []
spec_refs:
  - docs/specs/auth/_epic.md
  - docs/specs/auth/data-model.md
started_at: 2025-01-15
completed_at: 2025-01-15
---

# TASK-001: Auth System + Role-Based Access

## What to Build
Authentication with database-backed sessions. Two roles in the
session: admin and kasir. Login page, protected layout, and
requireRole() / checkRole() utilities.

## Definition of Done
- login page at /login (email + password)
- success -> /dashboard; failure -> generic error
- session role returns "admin" or "kasir"
- protected routes redirect to /login when no session
- requireRole(req, ['admin']) returns 403 for kasir
- logout clears session, redirects to /login
- sessions table exists in schema

## Notes
Database sessions chosen over stateless tokens so the owner can
force-logout staff — see _decisions.md 2025-01-15.
```

```
---
id: TASK-008
epic: product-management
type: api
status: doing
depends_on: [TASK-001, TASK-007]
spec_refs:
  - docs/specs/product-management/api.md
  - docs/specs/product-management/data-model.md
started_at: 2025-01-18
completed_at:
---

# TASK-008: Product Management — All API Endpoints

## What to Build
All product endpoints from api.md: list, detail, create, update,
deactivate, and POST /api/uploads/temp for images.

## Context
- products schema created in TASK-007
- storage client in /lib/storage.ts (TASK-003)
- SKU auto format <CATEGORY_CODE>-<YYMMDD>-<4 digits> — _decisions.md 2025-01-17

## Definition of Done
- list: pagination + all filters; kasir forced is_active=true
- is_low_stock computed (stock_qty < min_stock)
- create: stock_qty starts at 0; auto SKU if omitted; 409 on conflict
- update: ignores sku if sent; warnings when deactivating with open orders
- deactivate: is_active=false, no delete
- uploads/temp: 2MB, jpg/png, returns token + preview_url
- validation errors use the standard shape
- 403 for kasir on admin-only; 401 with no session
- all verified in Bruno: happy paths + validation + auth failures

## Notes
```

---

## 13. API-FIRST VS UI-FIRST DECISION GUIDE

### The default

Build the API for a flow, test it manually, then build the UI against the real API immediately. No mock data layer — mocks add a layer to maintain and a gap between mock and real responses.

```
Per flow:
  1. Build API endpoints (type api)
  2. Test in Postman or Bruno (happy paths + error cases)
  3. Build UI against the real API (type ui)
  4. Verify end to end against the Definition of Done
```

### The one exception: client UI approval

If the client must sign off on UI/UX before the backend exists: build the UI with hardcoded data, present it, get written approval, then replace the data with real API calls in a follow-up task. State this explicitly in the task's Context:

```
## Context
UI-approval task only. Data is hardcoded for the demo.
TASK-NNN-api builds the real endpoints.
TASK-NNN-connect replaces hardcoded data with live calls.
```

### Why API and UI are always separate tasks

They build and verify independently; UI changes after review do not require rebuilding the API; each session has a smaller, cleaner context; verification is cleaner (API in Postman, UI in the browser).

---

## 14. REVIEW GATES & CHANGE REQUESTS

Mandatory checkpoints. The cost of skipping a gate is almost always higher than the time saved.

| Gate | Timing | Check | Risk if skipped |
|------|--------|-------|-----------------|
| 1 | After Discovery draft | Everything captured? Open Questions empty? | Wrong system from the start |
| 2 | Client confirms Discovery | Written confirmation saved | Scope disputes, unpaid changes |
| 3 | After feature map | All features incl. implicit? Wave order? No cycles? | Blocking dependency missed |
| 4 | After data model | Types, enums, cascades, rules, soft delete | Migration rework everywhere |
| 5 | After epic + flow specs | All states? Role variants? Edge cases? Error text? | Incomplete or wrong flows |
| 6 | After task generation | Order follows deps? DoD verifiable? Sizing? | Wasted sessions |
| 7 | After each task build | DoD fully passes? Deviations? Decisions logged? | Bug propagates downstream |
| 8 | Pre-delivery | Client UAT vs Discovery Document | Rework after delivery |

### Gate 4 specifics

Check explicitly: no floats for money or measurements; audit columns on every table; every enum fully listed and described; every FK has cascade behavior; soft-delete strategy consistent; snapshot fields identified; business rules written out (especially "this field is updated only by X"); no field that should be derived stored without explanation.

### Handling change requests after lock

The locked Discovery Document is your scope baseline. A change request is anything the client asks for that is not in it. Changes are normal — locking does not refuse them; it makes them visible and tracked so scope creep does not quietly consume unbilled time.

```
When a change comes in:
  1. Write it down — add a row to the Discovery "Change Log".
  2. Classify the impact:
       cosmetic / within an existing flow -> a small fix task
       new flow in an existing epic        -> new flow spec + tasks
       new entity or field                 -> data-model change (re-open Gate 4)
       new epic                            -> run the full Layer 2 chain for it
  3. Re-run only the affected planning skills — not the whole project.
  4. Check downstream: if the change touches an entity completed tasks
     depend on, create explicit fix tasks for them.
  5. Confirm cost/time with the client in writing before building
     anything beyond a trivial fix; save it in client-comms.
  6. Record the decision in _decisions.md if it changes an assumption.
```

The key habit: a change request not written into the Change Log did not happen, as far as the project record is concerned. Untracked verbal changes are where scope disputes come from.

---

## 15. DECISIONS LOG: PURPOSE AND USAGE

### What belongs

- Any decision that could have gone another way
- Anything a future session might assume differently
- Client-influenced decisions (formats, workflows, naming)
- Decisions discovered during build that were not planned
- Technical choices affecting more than one feature

### What does not

- Details that exactly follow the spec
- Trivial choices with only one sensible option

### When to update

During Layer 2 as decisions are made; during Layer 3 when a build reveals a gap; after client conversations that clarify or change requirements.

### Example log (excerpt)

```
# Decisions Log: Toko Batik Sekar Arum

## 2025-01-15 — Auth: database sessions over stateless tokens
- Decision: database-backed sessions.
- Reason: the owner must be able to force-logout staff; a stateless
  token cannot be invalidated server-side without a denylist.
- Alternatives: stateless token + denylist — rejected as overkill here.
- Impact: auth setup, middleware, all route protection.
- Confirmed by: self.

## 2025-01-17 — Currency: decimal IDR, never cents
- Decision: store currency as decimal(12,2) IDR directly
  (Rp 450.000 = 450000.00).
- Reason: IDR has no commonly used sub-unit; storing cents adds risk
  for no benefit.
- Impact: all money fields and display formatting.
- Confirmed by: self.

## 2025-01-20 — WhatsApp via Fonnte
- Decision: use the Fonnte API, not the official Meta Business API.
- Reason: client already has a Fonnte account; the official API needs
  Meta Business verification the client does not have.
- Impact: custom-order notifications, /lib/notifications.ts.
- Confirmed by: client (2025-01-20).
```

> The tools named in this example (Fonnte, database vs stateless sessions, etc.) are illustrative stand-ins for *the client's* choices in this scenario — examples of how to record a decision, not recommendations. Verify any tool's current capabilities, pricing, and requirements directly before committing a real project to it.

---

## 16. EVOLVING THE TEMPLATE & SKILLS OVER TIME

The template is a living system. After every delivery, fold what you learned back into it so the next project inherits the improvement.

### Post-project review

Skills
- Did intake miss a question that caused problems later?
- Did data-modeling enforce every rule it needed to?
- Did a flow get built wrong because the flow skill missed a state?
- Did the API spec skill miss something an endpoint needed?
- Were tasks too large or too small?
- Did the execution skill give enough context, or did sessions drift?

Templates
- Any section missing that you needed mid-project?
- Any section never used? (Remove it — unused sections are noise.)
- Does the context block capture everything the agent needs?
- Do tasks come out with definitions of done specific enough to verify?

Process
- Any gate you skipped and regretted?
- Any step you added that should be formalized?

### How to update

Edit the skill or template in the template repo, commit it next to the reason, and note it in the repo's CHANGELOG (or commit message). Because the template is one repo, the change ships with the next project automatically.

```
# from the template repo
git commit -am "skills(data-modeling): require jsonb fields to be documented"
git commit -am "skills(feature-mapping): add CSV import to implicit features"
```

### What not to over-engineer

Add a rule to the template only when the same issue could recur on a different project. One-off, client-specific requirements stay in that project's spec files, not in the reusable skills.

---

## 17. QUICK REFERENCE CARD

### The 7 documents every epic produces

- `_epic.md` — scope, role matrix, flow index, dependencies
- `data-model.md` — tables, fields, enums, rules, relationships
- `api.md` — every endpoint: method, params, request, response, errors
- `flow-<name>.md` — layout, elements, all states, role variants, validation
- `TASK-<NNN>.md` — what to build, spec refs, definition of done
- `_index.md` — board: backlog / doing / blocked / done
- `_decisions.md` — every meaningful decision with reason and impact

### Task status lifecycle

```
backlog
  | select it (all depends_on done); branch task/TASK-NNN-slug
  v
doing
  | DoD passes; merge branch
  v
done

dependency not done -> blocked (back to backlog when it finishes)
cancelled           -> mark cancelled in the file, never delete
fails verification twice after targeted re-prompts
                    -> the spec is the problem; fix the spec, then rebuild
```

### Spec quality checklist before handing any doc to the agent

Data model
- no float for money or measurements
- audit columns on every table
- every enum fully listed with descriptions
- every FK has cascade behavior
- soft-delete strategy defined
- business rules in plain English

Flow spec
- every UI element described
- all states: loading, empty-no-data, empty-no-results, error, success
- role differences explicit (hidden, not disabled)
- validation rules have exact error text
- edge cases listed

API spec
- every endpoint has all error responses
- response shapes complete (no placeholders)
- role access stated per endpoint
- side effects documented for every state-changing endpoint
- pagination on all list endpoints

### Session start checklist (every execution session)

```
1. Agent reads AGENTS.md
2. Agent reads docs/specs/_context-block.md
3. Agent reads docs/tasks/_index.md; find available tasks
4. Confirm all depends_on for the chosen task are done
5. Create branch task/TASK-NNN-slug
6. Load all spec_refs
7. Build with the execution skill
8. Verify the Definition of Done line by line
9. On pass: mark done, merge branch, update index, log decisions
```

### Full workflow at a glance

```
CLIENT BRIEF (raw)
  -> intake skill
  -> Discovery Document -> [GATE] -> client confirms -> LOCKED
  -> feature-mapping skill
  -> feature map + waves -> [GATE]
  -> per epic:
       data-modeling -> data-model.md -> [GATE: most critical]
       epic-and-flow + api-spec -> _epic.md, flow-*.md, api.md
       task-generation -> TASK-*.md + _index.md -> [GATE]
  -> EXECUTION LOOP (execution skill):
       read AGENTS + context + board
       select a ready task; branch it
       load task + spec_refs; build
       output build summary
       [GATE: verify DoD]
       pass -> mark done, merge, update index, next
       fail twice -> fix the spec, not the prompt
  -> all tasks done -> client UAT -> fixes as new tasks
  -> change requests at any point -> log, classify,
     re-run only the affected skills
  -> DELIVERED -> fold lessons back into the template
```

---

*Version 3.0 — single workflow, one repository.*
*Skills follow the Agent Skills format (.claude/skills/<name>/SKILL.md).*
*This document versions alongside the template. When the skills or conventions change, update it.*