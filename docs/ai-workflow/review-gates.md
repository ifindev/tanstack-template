# Review Gates

A gate is a decision backed by evidence, not a ceremonial checklist.

## Gate 0 — Bootstrap ready

- Project overview identifies the problem, stakeholders, sources, and known constraints.
- Repository-specific architecture and verification commands are discoverable.
- Missing setup information is explicit.

## Gate 1 — Discovery approved

- Outcomes and success signals are understandable.
- Actors, ownership, permissions, and critical workflows are covered.
- Included and excluded scope is explicit.
- Constraints, integrations, migration, and quality attributes are addressed.
- Contradictions are resolved.
- Material assumptions have owners and validation dates.
- Approval evidence is recorded before status becomes `LOCKED`.

## Gate 2 — Capability plan approved

- Every capability traces to evidence or is labeled inferred.
- Actor access and data visibility are explicit.
- Dependencies contain no unresolved cycle.
- Delivery slices produce demonstrable outcomes.
- External lead times and high-risk unknowns are visible.
- Out-of-scope work has not leaked into the plan.

## Gate 3 — Detailed specifications approved

- Data lifecycle and invariants are complete where relevant.
- Flows cover alternate, failure, recovery, permission, and accessibility behavior.
- Boundary contracts are complete and compatible.
- Cross-artifact terminology and state transitions agree.
- Security, privacy, operations, and observability are proportionate to risk.
- No material decision is deferred to implementation.

## Gate 4 — Task plan execution-ready

- Tasks are atomic, dependency-aware, and independently verifiable.
- Each task references approved source specifications.
- Definitions of done are observable.
- Verification covers happy paths, failures, permissions, and regressions.
- Stop conditions protect against scope invention.
- No task implements an unresolved material assumption.

## Gate 5 — Task complete

- Every definition-of-done item has evidence.
- Relevant automated and manual checks passed.
- Deviations and new decisions are recorded.
- Documentation and task board agree with implementation.
- Residual risks have owners.

## Gate 6 — Delivery ready

- Delivered behavior reconciles with locked scope and approved changes.
- Release, migration, rollback, observability, and support are ready.
- Security, privacy, accessibility, performance, and compatibility evidence matches project risk.
- Known issues are accepted by an authorized human.
- Stakeholder acceptance evidence is prepared or recorded.

## Failure policy

Use `FAIL` when a required criterion lacks evidence. Use `CONDITIONAL PASS` only when the remaining risk is explicit, owned, time-bounded, and accepted by an authorized human.

Repeated implementation failure is a diagnostic signal, not proof that the prompt needs more force. Recheck the task, spec, architecture, and environment before retrying.
