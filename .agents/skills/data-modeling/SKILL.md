---
name: data-modeling
description: Design or review an epic's conceptual and persistence data model from approved requirements, including entities, fields, invariants, ownership, relationships, lifecycle, retention, indexes, and migration impact. Use before interfaces and implementation when data shape or state transitions matter.
---

# Data Modeling

Produce `docs/specs/<epic>/data-model.md`.

1. Read discovery, feature map, context block, decisions, and relevant existing schema.
2. Model domain concepts first; map them to the repository's actual database and ORM conventions second.
3. Document entities, value objects, identifiers, nullability, defaults, state transitions, ownership, audit needs, retention, deletion semantics, and sensitive-data classification.
4. For every relationship, document cardinality, optionality, ownership, and delete/update behavior.
5. State invariants in plain language and identify where each is enforced.
6. Document derived versus stored values, concurrency risks, idempotency needs, indexes, uniqueness, and migration/backfill strategy.
7. Reuse project policy from `_context-block.md`. Do not impose UUIDs, soft deletion, audit columns, SQL types, or naming conventions unless the project requires them.
8. Reconcile the proposal against the existing schema and flag breaking changes.
9. Use `assets/data-model-template.md`, then run the data-model gate.

Stop for human review before implementation if the proposal changes persisted data, retention, authorization boundaries, or externally consumed shapes.
