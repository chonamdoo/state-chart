---
name: state-chart
description: Check a TLA+ model of a stateful product flow, protocol, or service and draw a Mermaid statechart with rule-specific counterexample paths. Use to explain a bug through states, check invariants or temporal properties, or project a model into flat, hierarchical, or parallel views. Not a general diagram renderer or a proof of production-code correctness.
---

# State chart

Show how a system moves between states in the reader's words. The reader decides whether the behavior is right; TLC checks the specified model, not the reader's intent or the implementation.

## Prepare and run

Read [execution.md](references/execution.md) before running: it defines prerequisites, trusted inputs, output files, and checking limits. Use the resources in this skill directory, not another installed skill. No `render-platform`, `work-to-skill`, package installation, or global configuration change is required at runtime.

Work in a scratch folder outside the target repository. Write a TLA+ spec, its config, and a trusted view module. With an already provisioned Node.js (22.18+ on the 22.x line, or 23.6+; recommend 24), Java 11+ and TLC 1.7.4:

```sh
TLA2TOOLS=/absolute/path/to/tla2tools.jar JAVA=/absolute/path/to/java \
  /absolute/path/to/state-chart/scripts/statechart SPEC.tla \
  --config SPEC.cfg --view view.mjs --out result
```

Resolve the skill directory from the loaded skill, and substitute real absolute paths. `JAVA` is optional when the intended `java` is on `PATH`; `TLA2TOOLS` must be explicit and absolute. If prerequisites are unavailable, report the affected checks as **not checked**, identify what is missing, and retain the model and proposed chart as unverified. Never install tools, download a JAR, modify shell profiles, or edit agent/global configuration as a side effect of using this skill.

## Write the model and rules

- Start from the actual requirements and, when modeling code, the relevant code paths. State assumptions, constants, abstractions, and omitted behavior.
- Express each reader-agreed state rule as an `INVARIANT`. A rule can concern a screen, result, stored value, or message. Add a model variable if a rule needs one. Never weaken a rule to make it hold.
- Express temporal requirements as `PROPERTY`, preserving the intended fairness and stuttering semantics. A property with no `[]`, `<>`, or `~>` is checked only initially; use `INVARIANT` to require it in every state.
- Write `Next` as a disjunction of named actions, such as `YouPressPlay \/ YouPressStop`; otherwise TLC names every step `Next`.
- A state with no outgoing step breaks `NoDeadlock`, even if it is an intended end state. If an invariant or property already uses that name, the deadlock rule is `CHECK_DEADLOCK`. Model a legitimate terminal self-loop, for example `Done == phase \in {"paid", "failed"} /\ UNCHANGED vars`, include it in `Next`, and label it in `step()`. Do not hide an unintended deadlock by adding arbitrary self-loops or disabling the check.
- Keep constants small or add justified `CONSTRAINT` bounds. The first check has no automatic state cap; it can run indefinitely on an unbounded model. Disclose every bound when interpreting results.

## Choose a view

A view is executable JavaScript/TypeScript loaded with the privileges of the invoking process. Review it and its imports before execution; it is not sandboxed.

Export `state(vars)` to select the projection:

- String: flat states, e.g. `export const state = v => v.paid ? "Paid" : "Paying";`.
- Array: parent states, e.g. `export const state = v => v.main.split(".");`.
- Object: parallel regions, e.g. `export const state = v => ({ Playback: v.playback, Volume: v.volume });`.

Label what the reader sees or cares about, such as “Paying” or “Lease held, write pending”, rather than variable names. TLA+ sequences arrive as objects with one-based keys (`v.pc[1]`); sets arrive as arrays.

Optional exports:

- `step(action, from, to)` returns a reader-facing arrow label, or `null` to hide a step. Name the event, not the code or TLA+ action. Give actions with the same chart outcome the same label so they share an arrow.
- `group(vars)` returns a phase name; `colors` maps group names to color classes. A projected state whose model states belong to different groups gets no group color.
- `title` supplies the chart title.

Functions must depend only on their arguments. `state()` and `group()` are called at most once per model state, and `step()` at most once per step; the chart and report reuse those answers.

In flat or hierarchical views, a conditional label may end with reader-facing brackets, such as `you press play [while the file loads]`. **In parallel views, never supply custom step labels ending in brackets.** The retained upstream implementation treats such a suffix as an existing condition and suppresses its inferred cross-region guard; this can hide a dependency even when the parallel fidelity check accepts the chart. Let the command append conditions such as `[when Offline]`. When an unshown value selects the outcome, name that outcome explicitly, such as “the roster read fails”.

Parallel regions are a projection, not independent machines by assumption. The command checks whether their starts and transitions match the model. If the projection introduces or loses behavior, or needs a condition that one “and” or “or” cannot express, it falls back to parent states and explains why in the report. Keep that fallback and explanation; do not force a misleading parallel drawing.

## Simplify without concealing bugs

Aim for about 20 arrows or fewer. Start with coarser labels for values that behave alike; omit irrelevant details such as a call in flight whose return changes nothing. Steps staying within one label are not drawn, so split the label when the reader needs to see them.

Keep every state and mark along a bug path. A merge from `breaks` to `mayBreak` conceals where a rule breaks. Do not merge states that break different rules. Only then consider `step() => null` for redundant resets or arrows, subject to all these conditions:

- Every chart state remains reachable from a start state.
- Every chart state with an outgoing model step retains an outgoing arrow.
- Hide all model steps represented by an arrow, or none; partial hiding narrows its apparent condition.
- Preserve bug paths and disclose all hidden steps in the hand-off.

## Interpret the evidence

Read `report.md` and TLC output, not only the drawing.

- **holds** means TLC completed the relevant check for this model and configuration, within the declared constants, constraints, abstraction, and assumptions. It is not an unbounded proof or a production guarantee.
- **broken** means TLC found a counterexample. State rules have shortest paths; temporal properties have counterexamples that need not be shortest and may loop or stutter forever. Preserve the repeating suffix and the `repeats` mark.
- **not checked** means checking was incomplete or unavailable, not that a rule holds. Explain missing prerequisites, errors, or the rerun cap and give the relevant output.

`breaks` means all concrete model states behind a projected state violate at least one marked rule; `mayBreak` means only some do. With multiple rules these are aggregate marks, not a claim that every model state violates every named rule. Use the rule-specific report and paths to say which state breaks which rule. In a regions chart, a region state is marked when every represented combination containing it can break a rule; if a violating combination has no such marked state, each state in that combination is marked. A region mark alone does not prove an individual local state is always faulty.

TLC continues past broken state rules for drawing, so preserve post-bug states. `VIEW`, `SYMMETRY`, constraints, reruns, and chart size can change what is shown; apply [execution.md](references/execution.md) when reporting these cases.

## Show and hand off

Show each available `chart.mmd` as a `mermaid` code block. Above the 500-model-state chart budget, only bug paths are drawn; if there are none, no `chart.mmd` is written. Still give the report and each rule's status. A missing chart is not a successful check.

When the user requests an image or text is too large, read [render.md](references/render.md). Rendering is optional and separate from checking; use only an already available renderer with the user's authorization. Preserve the Mermaid text and all marks if rendering fails.

Give the chart and Mermaid text to the decision-maker. Include a line per bug with the rule name, its reader-agreed meaning, and the report's numbered path; include temporal loops/stuttering. Also give per-rule statuses, assumptions and bounds, omissions and hidden steps, projection/fallback caveats, artifact locations, and the exact reproduction command with a fresh `--out` directory.

For a model of code, replay every counterexample against the actual code, one action per test step or live reproduction step. If the bug does not occur, treat the model as wrong until evidence establishes otherwise. If replay cannot run, report the model counterexample separately and explicitly mark implementation replay unverified; do not claim a reproduced code bug.

Source, retained semantics, and adaptation boundaries are in [provenance.md](references/provenance.md); the upstream MIT notice is in [LICENSE](LICENSE).
