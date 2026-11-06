# 검증 기록

## 범위와 환경

이 기록은 형식, 실제 도구 동작, 독립 사례, 설치를 구분한다. 기준은 [validation-plan.md](validation-plan.md) 및 구현 전 workflow explore 기록에 정했다. 원본: cursor/plugins `2776ddd2355d6d6c8747d3964600f28daf62f049`. macOS **26.6.2 (25G83), arm64**, Node **24.14.1**, Java **17.0.19**, Python **3.15.2**, skills CLI **1.7.6**, TLC **1.7.4**에서 실행했다. OS 버전은 `sw_vers` 실제 출력 기준이다.

TLC JAR는 사용자의 명시적 허가 후 `/tmp/state-chart-tla2tools-1.7.4.jar`에만 내려받았다. `shasum -a 256` 결과는 `936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88`. 기존 Java를 사용했다. 시스템 프로그램 설치, 개인 전역 스킬 변경, 실제 서비스 변경, 유료 API, 배포, push/merge는 하지 않았다. agent-flow 프로젝트 hook과 로컬 architecture 계약은 프로젝트 설정으로 생성했다.

## A — 작성 품질

| 검사 | 결과 | 근거 / 제한 |
|---|---|---|
| work-to-skill generic 형식 | pass | `python3 /Users/namdoo/Developer/Aiproject/work-skills/skills/work-to-skill/scripts/check_skill.py skills/state-chart --host generic`: `ok` |
| 원자료 대조 | pass | 원본 실행기·투영·테스트·fixture·MIT와 대조. 독립 reviewer가 exit 1을 incomplete로 오해하게 하는 문서 결함을 발견했고 수정 후 source-only 재검토 승인 |
| 라이선스 | pass | 저장소와 설치 스킬 내부에 Lauren Tan의 전체 MIT 고지, 출처·기준 커밋 보존 |
| standalone 설치 | pass | 임시 프로젝트에서 실제 skills CLI가 state-chart를 발견해 Codex용 디렉터리에 복사. 설치본으로 TLC 실행 |
| 호스트 자동 선택 | unverified | 수동 제공/명시적 설치만 확인. Codex의 자동 스킬 선택이나 대화 실행 성공을 증명하지 않음 |

`work-to-skill`의 SKILL.md, references/validation.md, scripts/check_skill.py를 실제 읽고, 입력·권한 확정 → 원자료/판단/미확인 분리 → 최소 패키지 → 사전 기준 → 형식과 동작을 분리한 평가를 적용했다. README만 읽은 것이 아니며 생성 스킬의 실행 의존성으로 넣지 않았다.

설치 명령(실제 실행):

```sh
# cwd: /tmp/state-chart-install.ChIBAs
env DISABLE_TELEMETRY=1 npm_config_cache=/tmp/state-chart-npm-cache \
  npx --yes skills add /Users/namdoo/.agent-flow/worktrees/state-chart-0e01293024d5/feat-create-reusable-state-chart-skill-preserving-pinned-b37c24 \
  --skill state-chart -a codex --copy -y
```

출력: `Selected 1 skill: state-chart`, `Installation complete`, `./.agents/skills/state-chart`. 원격 `npx skills add chonamdoo/state-chart --skill state-chart`는 **unverified**: 이번 변경은 게시하지 않았다. 전역 설치는 **not applicable**: 요청한 검증 범위가 프로젝트 설치다.

## B — 실제 도구와 원본 비교

초기 실행 위치는 `skills/state-chart/scripts`였다. 독립 리뷰 후 개발 도구와 fixture를 저장소 루트의 `test/`, `package.json`, `tsconfig.json`으로 옮겼으므로 현재 명령은 **저장소 루트**에서 실행한다. 설치본에는 개발 의존성과 평가 로그를 넣지 않는다.

```sh
TLA2TOOLS=/tmp/state-chart-tla2tools-1.7.4.jar npm test
node --test --test-name-pattern='launcher reached through' test/cli.test.ts
npm run test:render
npm run test:fuzz
```

첫 전체 실행은 292개 중 291 pass, 1 fail, skip 0이었다. 실패는 macOS `/var` → `/private/var` 임시 경로 alias 때문에 테스트 자체의 상대 symlink가 잘못 계산된 사례다. 테스트 경로를 `fs.realpathSync`로 정규화했고 해당 회귀 검사 1개가 pass, 이어 전체 292개 pass, fail/skip 0을 확인했다. 실제 launcher 로직은 변경하지 않았다. 패키지 분리 중 동작이 아닌 소스 배치·import graph를 고정하는 검사 5개를 제거했으며 의미 회귀 검사는 유지했다.

최종 구조에서 같은 `TLA2TOOLS=... npm test`를 저장소 루트에서 재실행: **287 pass, 0 fail, 0 skipped**, 117.46초. [전체 출력](evidence/tests-final.txt). 테스트 수 감소 5개는 위 소스 배치 검사 제거 때문이며 failing test를 숨긴 것이 아니다. `agent-flow architecture-lint --profile generic`은 exit 0이지만 `architecture contract absent`로 **n/a**를 출력했다. 로컬 contract는 별도 독립 reviewer의 소스 검토로 확인하며 이 명령을 lint pass로 계산하지 않는다.

최종 패키지를 새 임시 프로젝트에 다시 설치하고 guarded AuthorizationB를 실제 TLC로 실행해 exit 0, 5 states / 13 steps, 세 규칙 holds를 확인했다. 설치본에 test 디렉터리가 없음을 확인했다. [정확한 명령과 결과](evidence/final-install-smoke.json), [최종 설치본 산출물](evidence/final-installed-smoke/). `work-to-skill` 형식 검사도 `ok`로 다시 통과했다.

| 검사 | 결과 | 근거 / 제한 |
|---|---|---|
| 명시적 도구·설치 금지 | pass | missing/relative/nonexistent/directory JAR, missing Java, explicit override, PATH fallback 및 설치 trap 회귀 검사 통과 |
| 기존 의미 회귀 | pass | 첫 실행에서 다른 291개 통과: invariant/deadlock/temporal, constraints, VIEW/SYMMETRY, partial runs, chart budget, signals/cleanup, 병렬 보수적 fallback 포함 |
| 원본 대 설치본 직접 비교 | pass | 아래 5개 입력의 종료 코드·보고서·Mermaid 동일 |
| 선택적 렌더링 | unverified | `npm run test:render`: 1 pass, 73 skipped, 0 fail. Pele/Mermaid/JSDOM 미설치. 이미지 시각 확인 안 함 |
| 선택적 fuzz | unverified | `npm run test:fuzz` exit 1, `ERR_MODULE_NOT_FOUND: fast-check`. 검사 진입 실패이며 모델 반례나 성공으로 취급하지 않음. 자동 설치하지 않음 |

동일한 원본 corpus 모델을 원본 launcher와 격리 설치본 launcher에 각각 넣었다. 공통 환경은 `TLA2TOOLS=/tmp/state-chart-tla2tools-1.7.4.jar`, 인자는 `SPEC.tla --out FRESH_DIR`다. 구체 입력은 `pstack/skills/statechart/scripts/test/corpus/CASE/CASE.tla`이며 각각 옆의 기본 cfg를 사용했다.

| CASE | 원본 exit | 설치본 exit | report.md / chart.mmd |
|---|---:|---:|---|
| Counter | 0 | 0 | 바이트 동일 |
| CounterDeadlock | 1 | 1 | 바이트 동일 |
| CounterLoop | 1 | 1 | 바이트 동일 |
| CounterInitPastHolds | 0 | 0 | 바이트 동일 |
| CounterFan | 1 | 1 | 바이트 동일 |

[evidence/upstream-comparison.json](evidence/upstream-comparison.json)과 [원본·설치본 산출물](evidence/comparison/)에 보고서/상태도/TLC 로그를 보존했다. 원시 TLC 로그의 임시 경로·시간은 비결정적이므로 바이트 동일 대상으로 삼지 않았다. 실행 코어 차이는 prerequisite 처리이고, 문서 차이는 설치·표현 제한·권한 경계다.

## C — 독립 새 사례와 실제 코드

**pass**. 별도 executor에게 복사된 스킬과 원시 합성 요구사항만 제공했다. 원본 저장소, work-to-skill, 작성 대화, 평가 정답은 주지 않았다. OMP task subagent의 별도 컨텍스트이며 다른 제품 호스트 검증은 아니다. 작성·조정에 사용하지 않은 authorization 사례다.

요구사항: 준비 뒤 취소될 수 있으며 실행 시점에도 권한이 있어야 한다. 구현 A는 `prepared`만 검사하고, B는 `prepared && authorized`를 검사한다. 완료는 terminal이라는 입력 조건을 유지했다.

- A: 실제 TLC exit 1, `ExecutionRequiresAuthorization` broken. `prepare → cancel → execute`의 3-action 반례.
- B: 실제 TLC exit 0, 같은 invariant holds. 두 모델 모두 TypeOK와 NoDeadlock holds.
- `node replay.mjs` exit 0: 원시 TLC trace를 파싱해 실제 합성 JavaScript 함수의 각 상태와 일치시켰고 A의 무권한 실행을 재현했다. B에서는 같은 경로를 차단했고 정상 실행, terminal, 준비 전 취소, 준비 전 실행도 확인했다.

[독립 실행 기록](evidence/heldout/EVIDENCE.md), [실행 명령](evidence/heldout/commands.json), [재현 결과](evidence/heldout/replay.stdout.json)에 모델·코드·원시 출력·가정·누락 전이를 보존했다. 모델은 하나의 operation, Boolean 상태, 원자적 호출만 포함한다. 실제 제품 코드·네트워크·thread·비원자적 check/use race의 정확성을 증명하지 않는다. 생산 코드와 연결되는 실제 입력은 없으므로 production 재현은 **not applicable**이고 합성 코드 재현과 혼동하지 않는다.

## 남는 한계

- `holds`는 모델/config의 유한 범위 결과다. 사용자 의도, 전체 코드, 모든 환경의 정확성 증명이 아니다.
- 첫 TLC 검사에는 시간·상태 자동 제한이 없다. 후속 100000-state bound와 500-state chart budget은 전체 실행 자원 sandbox가 아니다.
- 병렬 view의 bracket-ending custom label은 자동 guard를 숨길 수 있다. 원본 코어 동작을 유지하고 스킬이 해당 표현을 금지한다. mixed-rule mark는 규칙별 all/some 판정을 대신하지 않는다.
- view는 신뢰하는 실행 코드여야 한다. 모델과 코드 대응은 executor의 모델링 가정에 의존한다.
- Linux/Windows, Bun/Deno 실제 runtime, Codex 자동 호출, 이미지 렌더링, 선택적 fuzz는 확인 안 함. Node launcher의 대체 runtime 분기 fixture 검사는 해당 runtime의 실제 호환성 증명이 아니다.

## Workflow 상태

독립 Codex subprocess 4개(generalist, types, architecture-design, architecture-contract)가 수정 후 모두 approve했다. Claude provider probe는 unavailable로 제외했다. `development/20261106-035248`는 QA 단계의 **명령 관측 연결이 막혔다**. `agent-flow run-command -- ...`가 `this host session is not bound to an active worktree`로 exit 2를 반환했다. 안내대로 worktree에서 `agent-flow status`를 실행한 뒤 재시도해도 같았고, status는 `bindings=0, commands=0`, `hook_unproven`을 표시했다. 사용 가능한 CLI help에는 별도 수동 bind 명령이 없다. 관측 기록이나 session binding을 임의로 만들지 않았다.

같은 QA 사용자 경로를 일반 명령으로 실제 실행해 exit 0을 확인했다:

```sh
TLA2TOOLS=/tmp/state-chart-tla2tools-1.7.4.jar \
  skills/state-chart/scripts/statechart docs/evidence/heldout/AuthorizationB.tla \
  --view docs/evidence/heldout/view.mjs --out /tmp/state-chart-qa-20261106-035248
```

결과는 5 states / 13 steps, TypeOK·ExecutionRequiresAuthorization·NoDeadlock holds다. 이는 실제 동작 증거지만 agent-flow의 관측 gate 완료를 대신하지 않는다. QA artifact에는 `feedback-run-evidence: unavailable` 및 blocked를 기록한다. 따라서 **구현과 직접 실행 검증은 완료했지만 workflow 전체 완료는 아니다**.

초기 검증 시점 Git: `feat/create-reusable-state-chart-skill-preserving-pinned-b37c24`, HEAD `1e3e092d9275ba828c277053149465b87a3bda66`; 신규 파일은 미커밋 상태였으며 당시 commit/push/PR/merge는 하지 않았다. origin은 `https://github.com/chonamdoo/state-chart.git`.

이후 사용자가 머지·정리와 **차단 기록 보존 후 진행**을 명시적으로 승인했다. `agent-flow abort --root /Users/namdoo/Developer/Aiproject/state-chart --worktree feat-create-reusable-state-chart-skill-preserving-pinned-b37c24 --yes`로 run을 중단했고 `.git/agent-flow/`의 기록은 보존했다. 이 승인은 QA gate 통과나 미실행 검증의 성공을 의미하지 않는다. 게시 이후 commit/PR 상태는 Git 기록을 기준으로 한다.
