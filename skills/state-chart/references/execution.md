# Execution, prerequisites, and limits

## Provisioning is a user action

The skill does not install Node.js, Java, TLC, renderers, or other skills. The following setup is for a user who chooses to provision their environment, not an instruction for an agent to install software during a state-chart task.

- **Node.js:** 22.18+ on the 22.x line, or 23.6+ for default native TypeScript stripping; recommend Node 24. Put the selected `node` on `PATH`. See [Node downloads](https://nodejs.org/en/download) and [TypeScript support](https://nodejs.org/api/typescript.html). The separate `skills` installer currently requires Node 22.20+, so Node 24 also avoids that difference.
- **Java:** Java 11+; Java 17 is the selected verification environment for this package, not evidence by itself that TLC ran. Obtain Java manually from a trusted provider such as [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=17). Set `JAVA` to the intended executable (prefer its absolute path), or make `java` available on `PATH`.
- **TLC:** use the `tla2tools.jar` asset from the pinned [TLA+ tools 1.7.4 release](https://github.com/tlaplus/tlaplus/releases/tag/v1.7.4), [direct asset](https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar). Its pinned SHA-256 is `936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88`. After downloading it manually, compare its checksum using `shasum -a 256 /absolute/path/to/tla2tools.jar` (macOS) or `sha256sum /absolute/path/to/tla2tools.jar` (Linux). Set `TLA2TOOLS` to that readable file's absolute path. The launcher does not download or authenticate the JAR for you.

The launcher is a POSIX shell script and the TLC runner uses POSIX process behavior. Use a POSIX environment on macOS/Linux; native Windows support is not established. A working Node version alone does not establish platform support. Models, view modules and their imports, JARs, and the Java executable must be trusted: views execute arbitrary host code and this package is not a sandbox.

Use per-command environment variables instead of changing global configuration:

```sh
TLA2TOOLS=/absolute/path/to/tla2tools.jar JAVA=/absolute/path/to/java \
  /absolute/path/to/state-chart/scripts/statechart /absolute/path/to/Flow.tla \
  --config /absolute/path/to/Flow.cfg \
  --view /absolute/path/to/view.mjs --out /absolute/path/to/new-result
```

The command accepts `SPEC.tla [--config FILE] [--view FILE] [--out DIR]`. Supply explicit paths for reproducibility. Keep source models and outputs in a scratch directory outside the target code repository. Node and Java availability, skill installation, model checking, rendering, and actual-code replay are distinct claims; report each only when observed.

## Checks and outputs

The command checks the config as written with one TLC worker. When a rule breaks, it removes that rule from the checking config and reruns TLC until no remaining rule breaks. This is a checking strategy, not permission to weaken the reader's rules: retain and report every original rule.

The **first run has no automatic state cap**. After the first break, each rerun stops at **100,000 distinct states**. A cap or error leaves unresolved rules under **Rules not checked**, without chart marks. Such a rule can hold or break. To investigate it, use a separate checking configuration with already-broken rules removed, or reduce the model while preserving the rule's meaning and disclosing the new bounds. The cap module changes TLC variable ordering, so temporal counterexamples can differ from those of an uncapped run.

Expected artifacts include:

- `report.md`: state/step counts, drawing limitations, rule-specific counterexamples, rules that hold, and rules not checked.
- `chart.mmd`: Mermaid projection when available. The **500-state** budget counts TLC states on the original config, not the number of merged labels. Above it, draw only counterexample paths; with none, no chart is written. Rule checking still proceeds.
- `tlc.out`: TLC output for the original config. A repeated first warning can appear once here rather than twice in plain TLC output when Java uses `-XX:+UseParallelGC`; this is inherited output behavior, not evidence that a warning was resolved.
- `tlc-RULE.out`: rule-specific output when the chart does not show its counterexample; temporal property counterexamples are referenced here. Preserve these logs even when the chart cannot express a loop or path.

A successful drawing does not establish `holds`. CLI exit **0** means the first authoritative check passed; **1** means it found a counterexample, not an incomplete check. Both can publish completed artifacts. Exit **2** means an execution/checking error; interruption returns **130** (SIGINT) or **143** (SIGTERM), and a missing supported JavaScript runtime returns **127**. A later error can leave individual rules `not checked` even when the first verdict remains exit 1. Preserve each report outcome: neither a nonzero exit nor a partial drawing overrides an already established `holds` or `broken` result. Missing outputs never imply success. Explain an empty initial-state set as vacuity rather than useful assurance.

## Projection and bounded exploration

With `VIEW` or `SYMMETRY`, TLC counts equivalent states once and the chart draws their representative. An arrow may reach that representative rather than the exact successor; disclose this abstraction.

TLC checks state rules in a successor beyond `CONSTRAINT` or `ACTION_CONSTRAINT`, but does not explore that state further or check it for deadlock. If the shortest rule counterexample ends there, the chart includes that boundary state and its path; other states outside the bound are not drawn. A deadlock outside the bound is not shown.

TLC also checks rules after steps excluded by `ACTION_CONSTRAINT`, including when the successor can be reached another way. If a shortest counterexample ends with such a step, the chart includes it. With constraints or an incomplete drawing run, only the TLC-reported deadlock is marked; lack of an outgoing chart arrow alone does not prove a model deadlock.

Temporal properties concern behaviors, not merely bad states. Preserve the reported counterexample and its loop or forever-stuttering suffix; do not call it a shortest invariant path. A `PROPERTY` with no temporal operators is checked only on initial states, as the report warns.

## Optional maintainer checks

Regression tests, recorded fixtures, and optional renderer/fuzz development checks live in the source repository, outside the installed skill. They are not runtime prerequisites or proof that a particular model passed. Missing optional dependencies must be reported as skipped/unverified, not installed automatically. Integration verification evidence belongs in the parent project's verification record.
