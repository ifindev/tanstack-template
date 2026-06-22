---
name: feature-mapping
description: Convert an approved discovery specification into a capability map, actor-access matrix, dependency graph, delivery slices, and build waves. Use after discovery approval and before detailed data, interface, or task planning.
---

# Feature Mapping

Produce `docs/specs/feature-map.md` from approved discovery evidence.

1. Extract outcomes, capabilities, actors, constraints, and exclusions.
2. Identify enabling capabilities only when logically required. Label each as `inferred` until a human accepts it.
3. Define feature boundaries around user or business outcomes, not technical layers.
4. Map actor access with precise verbs and ownership boundaries. Distinguish hidden UI, blocked action, filtered data, and approval requirements.
5. Build dependencies from data ownership, workflow prerequisites, external readiness, and testability.
6. Detect cycles and resolve them by splitting capabilities or creating a thin foundation slice.
7. Propose vertical delivery slices and waves. Prefer independently demonstrable increments over “all backend, then all frontend.”
8. Capture unknown dependencies and external lead times as risks.
9. Use `assets/feature-map-template.md`, then run the feature-map gate.

Do not assume authentication, dashboards, admin panels, exports, or notifications are universally required. Propose them only when evidence or a necessary system invariant supports them.
