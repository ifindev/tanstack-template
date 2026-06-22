---
name: workflow-intake
description: Turn raw stakeholder notes, transcripts, screenshots, or an early product idea into a reviewable discovery specification. Use at project inception or when requirements are materially unclear; interrogate gaps before drafting and never silently invent business rules.
---

# Workflow Intake

Transform unstructured input into `docs/specs/discovery.md`.

1. Read `AGENTS.md`, `docs/specs/_overview.md`, and all supplied source material.
2. Separate statements into confirmed facts, interpretations, assumptions, contradictions, and open questions.
3. Ask one focused batch of questions covering:
   - outcomes and success measures;
   - actors, permissions, ownership, and approvals;
   - entities, lifecycles, migration, and retention;
   - primary flows, failures, exceptions, and time-based behavior;
   - integrations and external dependencies;
   - operational, security, privacy, accessibility, performance, and compliance constraints;
   - delivery constraints and explicit exclusions.
4. Do not draft the final discovery document while high-impact questions remain unanswered. If the user chooses to proceed, preserve each gap as an explicit assumption with an owner and validation date.
5. Draft with `assets/discovery-template.md`. Cite source evidence by repository path or stable URL where available.
6. Run the discovery review gate from `docs/ai-workflow/review-gates.md`.

Never convert an inferred feature into committed scope without labeling it. Never mark the document locked; only a human may record stakeholder approval.
