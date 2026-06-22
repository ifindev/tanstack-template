---
name: grilling
description: Relentlessly interview the user to stress-test and sharpen a plan, design, architecture, specification, or proposed change before implementation. Use when the user asks to be grilled, challenged, interrogated, or questioned deeply; when important decisions remain unresolved; or when a plan needs its assumptions, dependencies, tradeoffs, failure modes, and scope boundaries exposed one decision at a time.
---

# Grilling

Interrogate the plan until the user and agent share a precise, defensible understanding.

1. Read the relevant repository context and inspect the codebase before asking anything that existing evidence can answer.
2. Reframe the plan and identify its highest-impact unresolved decision. Distinguish confirmed facts, assumptions, inferences, decisions, contradictions, and open questions.
3. Ask exactly one focused question at a time. Do not bundle independent questions.
4. With each question:
   - explain briefly why the decision matters;
   - provide a recommended answer and its main tradeoff;
   - name materially different alternatives when they are credible;
   - wait for the user's answer before continuing.
5. Follow dependencies between decisions. Resolve upstream choices before asking downstream implementation questions.
6. Challenge vague language, unsupported certainty, hidden scope, missing ownership, and untested happy-path assumptions directly.
7. Cover the branches that materially affect the outcome, including:
   - goals, users, and success criteria;
   - scope, exclusions, and priorities;
   - workflows, states, failures, and edge cases;
   - authorization, security, privacy, and destructive behavior;
   - data ownership, lifecycle, migration, and retention;
   - interfaces, dependencies, operations, observability, and rollout;
   - validation, acceptance evidence, and reversibility.
8. Do not implement, silently decide, or manufacture product behavior during the session. If the user authorizes an assumption, record it explicitly.
9. When the material branches are resolved, summarize the agreed decisions, remaining assumptions, open risks, and the next artifact or action. Do not claim shared understanding while consequential ambiguity remains.
