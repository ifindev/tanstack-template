---
name: epic-and-flow
description: Write an epic specification and complete user or system flow specifications from approved discovery, feature, and data-model artifacts. Use during detailed planning to define behavior, states, permissions, validation, accessibility, observability, and edge cases before implementation.
---

# Epic and Flow Specification

Produce `docs/specs/<epic>/_epic.md` and one `flow-<name>.md` per distinct journey.

1. Bound the epic by outcome, included behavior, exclusions, dependencies, actors, and acceptance evidence.
2. Split flows by independently testable journey, not by screen count.
3. For each flow define trigger, preconditions, happy path, alternate paths, failures, recovery, permissions, state transitions, and postconditions.
4. For user interfaces, define layout intent, content, interactions, responsive behavior, keyboard/accessibility requirements, loading, empty, partial, stale, offline, error, submitting, success, and permission states.
5. For background or integration flows, define retries, idempotency, timeout, observability, replay, and operator recovery.
6. State validation behavior precisely. Use exact copy only when product copy has been approved; otherwise mark copy as provisional.
7. Reference the data model instead of duplicating it.
8. Use the templates in `assets/`, then run the epic-and-flow gate.

Do not prescribe hidden-versus-disabled behavior universally; choose based on security, discoverability, and product policy, and document the decision.
