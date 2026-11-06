# Source and adaptation boundary

## Pinned source

This skill adapts `pstack/skills/statechart` from [cursor/plugins](https://github.com/cursor/plugins/tree/2776ddd2355d6d6c8747d3964600f28daf62f049/pstack/skills/statechart), pinned to commit **`2776ddd2355d6d6c8747d3964600f28daf62f049`**. The commit identifies the source version, not a claimed effective date or a test result.

Primary sources:

- [Original SKILL.md](https://github.com/cursor/plugins/blob/2776ddd2355d6d6c8747d3964600f28daf62f049/pstack/skills/statechart/SKILL.md): modeling, reader-facing views, simplification, checking limits, reporting, and actual-code replay.
- [Original scripts](https://github.com/cursor/plugins/tree/2776ddd2355d6d6c8747d3964600f28daf62f049/pstack/skills/statechart/scripts): executable modeling/checking/projection pipeline and source tests.
- [Original render.md](https://github.com/cursor/plugins/blob/2776ddd2355d6d6c8747d3964600f28daf62f049/pstack/skills/statechart/references/render.md): Pele 1.9.0 recipe, semantic classes, and optional light/dark CSS.
- [Upstream pstack MIT license](https://github.com/cursor/plugins/blob/2776ddd2355d6d6c8747d3964600f28daf62f049/pstack/LICENSE): Copyright (c) 2026 Lauren Tan. The notice is retained in this installable package's [LICENSE](../LICENSE).

## What is retained

The original TypeScript checker, model graph, view projection, Mermaid/report pipeline, and source tests are retained as the starting implementation. Retained semantics include:

- Reader-agreed invariants must not be weakened; temporal properties remain distinct from state rules.
- Named action disjunctions, intentional terminal self-loops, and collision-safe deadlock rule names.
- Flat, hierarchical, and parallel views; pure view callbacks; sequences as one-based objects and sets as arrays.
- All-versus-some aggregate violation marks, rule-specific evidence, parallel fidelity checks and hierarchical fallback, and preserved bug paths.
- Continued exploration after state-rule failures, constraint-boundary counterexamples, `VIEW`/`SYMMETRY` representatives, one-worker checks, and repeated checks after removing already-broken rules.
- An uncapped first check, the 100,000-state post-failure rerun cap, the 500-state chart budget, and explicit incomplete-check reporting.
- Temporal loops/stuttering and property logs, model omissions and hidden-step disclosure, and replay against real code.

## Intentional changes

- The installable skill is named `state-chart` and has a discovery description without `disable-model-invocation`. Discovery depends on the host and is not established merely by this metadata.
- Tool provisioning is explicit and user-controlled. Automatic mise/Java/TLC installation is removed; `TLA2TOOLS` identifies an absolute local JAR path, while `JAVA` or `PATH` selects Java. No global agent configuration is changed.
- The core deliverable is Mermaid plus the report. The original mandatory Pele installation is replaced with optional use of an already available, authorized renderer. Its CSS recipe is retained; no rendering-platform skill is required.
- Repository tests, recorded fixtures, optional development dependencies, and TypeScript configuration live outside the installable skill. Development checks do not install dependencies automatically. Five source-layout/import-graph assertions were removed; semantic behavior tests are retained. A macOS temporary-path alias in the relative-symlink test is normalized with realpath.
- Runtime prerequisites, trust boundaries, POSIX assumptions, and bounded result interpretation are made explicit. `work-to-skill` informed authoring only; it is not a runtime dependency.

The bracket-label restriction is a conservative authoring safeguard inferred from the pinned implementation and original warning: a custom step label ending in brackets suppresses inferred parallel-region guards. The runtime behavior is retained, not repaired or claimed safe. This adaptation prohibits all such custom suffixes in parallel views rather than only suffixes describing another region.

The multi-rule warning clarifies the retained aggregate marking behavior: a red projected state can combine concrete states violating different rules. It is not evidence that each named rule fails in every concrete state. The rule-specific report remains authoritative for attribution.

## Evidence boundary

Source inspection establishes provenance and the documented adaptation choices, not execution success. A detected Node or Java version does not establish that TLC ran; static file checks do not establish agent discovery, rendering, or correct use on a fresh case. Report each performed check separately with its actual environment and outcome. No installation or publication is implied by this package.

TLC is an external user-provisioned dependency, not a bundled component covered by this package's MIT notice. The pinned TLC release and SHA-256 are in [execution.md](execution.md). Installer syntax is sourced separately from the [skills CLI documentation](https://github.com/vercel-labs/skills#install-a-skill); installing this skill does not install Java or TLC.
