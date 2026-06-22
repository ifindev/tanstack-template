---
name: api-spec
description: Derive a complete interface contract for an epic from its flows and data model, covering HTTP, RPC, events, webhooks, jobs, or SDK calls. Use before implementation when components or systems cross a boundary and consumers need stable request, response, error, authorization, and side-effect behavior.
---

# Interface Specification

Produce `docs/specs/<epic>/api.md`. “API” includes any boundary contract, not only REST.

1. Read flows, data model, context conventions, decisions, and existing contracts.
2. Identify each consumer-provider interaction required by the flows.
3. Choose the repository's established interface style. Do not invent REST endpoints in an RPC, event-driven, or server-function codebase.
4. Specify operation name, authorization, inputs, outputs, errors, side effects, idempotency, pagination or streaming, ordering, consistency, rate limits, and compatibility expectations.
5. Use complete schemas or link to canonical typed schemas. Do not use ellipses for required behavior.
6. Document role- or tenant-based filtering separately from permission denial.
7. Cover retries, duplicate delivery, timeout, and signature verification for external callbacks or asynchronous messages.
8. Identify contract tests and consumer-impact risks.
9. Use `assets/interface-template.md`, then run the interface gate.

Do not change an existing public contract silently. Record a compatibility or migration plan.
