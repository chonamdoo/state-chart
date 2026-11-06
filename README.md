# state-chart

제품 흐름, 프로토콜, 서비스의 상태 변화를 TLA+로 모델링하고 TLC로 규칙을 검사하는 에이전트 스킬입니다. 결과는 Mermaid 상태도와 규칙별 반례 경로로 제공합니다. 원본의 모델 검사와 투영 의미를 유지하되, 실행 중 도구를 자동 설치하는 동작은 제거했습니다.

상태도는 모델을 설명합니다. 실제 코드의 정확성을 보장하지 않으며, 코드에 관한 반례는 테스트나 실제 재현으로 별도 확인해야 합니다.

## 스킬 설치

아래 명령은 사용자가 설치를 선택할 때 프로젝트 폴더에서 직접 실행하는 예시입니다. 이 문서는 저장소의 게시 완료나 설치 성공을 의미하지 않습니다. 원격 저장소에 접근할 수 있어야 합니다.

```sh
npx skills add chonamdoo/state-chart --skill state-chart
```

Codex만 대상으로 지정하려면 다음 명령을 사용합니다.

```sh
npx skills add chonamdoo/state-chart --skill state-chart -a codex
```

기본 범위는 현재 프로젝트입니다. 여러 프로젝트에서 쓰는 전역 설치를 사용자가 원할 때만 `-g`를 추가합니다.

```sh
npx skills add chonamdoo/state-chart --skill state-chart -a codex -g
```

설치 범위와 옵션은 [skills CLI 공식 문서](https://github.com/vercel-labs/skills#install-a-skill)를 따릅니다. 현재 설치 CLI는 Node.js 22.20 이상을 요구합니다. `npx`는 설치 CLI를 내려받아 실행할 수 있으므로 이 명령도 사용자가 직접 선택해야 합니다. **스킬을 설치해도 Java와 TLC는 설치되지 않습니다.** 스킬 실행이 다른 스킬을 설치하거나 전역 에이전트 설정을 바꾸지도 않습니다.

## 실행 준비

검사 전에 다음 도구를 사용자가 준비해야 합니다. 자동 다운로드나 설치는 없습니다.

| 도구 | 요구 조건 |
| --- | --- |
| Node.js | 22.x는 22.18 이상, 그 이후 계열은 23.6 이상. 설치 CLI까지 함께 사용할 때는 Node 24 권장 |
| Java | Java 11 이상. 검증용으로 선택한 환경은 Java 17이며, 버전 확인만으로 TLC 실행 성공을 뜻하지 않음 |
| TLC | `tla2tools.jar` 1.7.4. `TLA2TOOLS`에 읽을 수 있는 JAR의 절대 경로 지정 |
| 실행 환경 | POSIX 셸을 제공하는 macOS/Linux 환경. 네이티브 Windows 지원은 확인하지 않음 |

[Node.js 다운로드](https://nodejs.org/en/download), [Temurin Java 17](https://adoptium.net/temurin/releases/?version=17), [TLC 1.7.4 릴리스](https://github.com/tlaplus/tlaplus/releases/tag/v1.7.4)에서 수동으로 준비할 수 있습니다. TLC JAR의 고정 SHA-256은 다음과 같습니다.

```text
936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88
```

체크섬 확인 명령, 경로 설정, 실행 한계는 [실행 안내](skills/state-chart/references/execution.md)에 있습니다. `JAVA`에 원하는 Java 실행 파일을 지정하거나 해당 `java`를 `PATH`에 둡니다. Node도 `PATH`에서 찾습니다. view 모듈은 실행 권한을 가진 코드이므로 내용과 import를 신뢰할 수 있을 때만 사용해야 합니다.

## 사용 예시

Codex에서는 `$state-chart`로 명시적으로 호출하거나 `/skills`에서 선택합니다. 호스트의 자동 선택 동작은 별도 검증 대상입니다.

다음은 실제 제품 사례나 검증 결과가 아닌 합성 요청 예시입니다.

> state-chart로 결제 흐름을 검토해 주세요. 시작은 결제 대기이고, 승인 성공 시 결제 완료, 실패 시 결제 실패로 이동합니다. 완료된 결제는 다시 청구되지 않아야 합니다. 재시도와 중복 승인 이벤트를 포함해 모델링하고, 규칙별 검사 결과와 반례 경로를 보여 주세요. 실제 구현에서 재현하지 못한 반례는 모델 결과로 구분해 주세요.

에이전트는 합의된 규칙을 약하게 바꾸지 않고 모델과 설정, view를 작성합니다. 작업 파일은 대상 코드 저장소 밖의 임시 작업 폴더에 둡니다. 실행 형식은 다음과 같습니다. 경로는 실제 설치 위치로 바꿔야 합니다.

```sh
TLA2TOOLS=/absolute/path/to/tla2tools.jar JAVA=/absolute/path/to/java \
  /absolute/path/to/state-chart/scripts/statechart Payment.tla \
  --config Payment.cfg --view view.mjs --out payment-result
```

## 결과 읽기

- `report.md`: 규칙별 결과, 반례 경로, 탐색 규모와 제한을 기록합니다.
- `chart.mmd`: 상태도를 Mermaid 텍스트로 제공합니다. 500개 모델 상태를 넘으면 반례 경로만 그리며, 반례가 없으면 파일을 만들지 않습니다.
- `tlc.out`, 필요한 경우 `tlc-RULE.out`: 원래 설정과 규칙별 검사 출력을 보존합니다.

| 상태 | 의미 |
| --- | --- |
| `holds` | 선언한 모델, 상수, 제약, 추상화 범위에서 해당 검사가 완료됨. 무제한 시스템이나 실제 코드의 안전성을 보장하지 않음 |
| `broken` | TLC가 반례를 찾음. 상태 규칙은 최단 경로로 설명하고, 시간 속성은 반복 또는 영구 정지를 포함한 반례로 설명 |
| `not checked` | 도구 부재, 오류, 탐색 제한 등으로 검사를 완료하지 못함. 통과로 해석하면 안 됨 |

첫 검사는 자동 상태 수 제한이 없습니다. 모델이 무한하면 종료하지 않을 수 있습니다. 첫 위반 이후 재검사에는 100,000개 상태 제한이 있으며, 완료하지 못한 규칙은 `not checked`로 남습니다.

`breaks`와 `mayBreak`는 각각 투영된 상태 뒤의 모든 모델 상태 또는 일부 모델 상태에 위반이 있음을 나타냅니다. 여러 규칙의 색상 표시는 합산된 결과이므로, 모든 상태가 모든 규칙을 어긴다는 뜻이 아닙니다. 규칙별 보고서를 함께 읽어야 합니다. 병렬 상태도가 모델의 동작을 정확히 표현하지 못하면 부모 상태 방식으로 전환하고 이유를 보고합니다. 병렬 view에서 대괄호로 끝나는 사용자 정의 화살표 이름은 자동 조건 표시를 가릴 수 있어 사용하지 않습니다.

기본 산출물은 Mermaid 텍스트입니다. 이미지가 필요하면 이미 사용 가능한 렌더러만 사용자 허가 범위에서 사용합니다. `render-platform`이나 별도 렌더링 스킬은 필요하지 않으며, 렌더러를 자동 설치하지 않습니다. [렌더링 안내](skills/state-chart/references/render.md)에 선택적인 Pele 설정을 보존했습니다.

## 검증

저장소 루트에서 다음 명령으로 형식 검사와 실제 TLC 회귀 검사를 구분해 실행합니다. 형식 검사기의 경로는 별도로 준비한 `work-skills` 저장소 위치입니다. 설치된 스킬을 사용하는 데에는 필요하지 않습니다.

```sh
python3 /path/to/work-skills/skills/work-to-skill/scripts/check_skill.py \
  skills/state-chart --host generic
TLA2TOOLS=/absolute/path/to/tla2tools.jar npm test
```

TLC 환경변수가 없으면 일부 실제 모델 검사 테스트는 건너뜁니다. `npm run test:fuzz`는 별도 개발 의존성 `fast-check`, `npm run test:render`는 선택적 렌더러 의존성이 필요합니다. 이 명령들은 의존성을 자동 설치하지 않습니다.

실행 환경, 원본 비교, 독립 사례, 실패 수정 및 미검증 항목은 [검증 기록](docs/validation.md)에 구분합니다. 로컬 소스의 격리 프로젝트 설치는 실행했지만, 아직 게시하지 않은 변경을 GitHub 설치 명령으로 받을 수 있다고 주장하지 않습니다.

## 출처와 라이선스

설치되는 스킬 안의 [출처 및 변경 경계](skills/state-chart/references/provenance.md)에 고정한 원본과 의미 보존 범위를 기록했습니다. 원본의 MIT 고지와 Lauren Tan의 저작권 표시는 [스킬 LICENSE](skills/state-chart/LICENSE)에 있습니다. 저장소 라이선스는 [LICENSE](LICENSE)를 참고하세요.

스킬의 진입점은 [SKILL.md](skills/state-chart/SKILL.md)입니다. 형식·TLC 실행·코드 재현·호스트 자동 선택은 서로 다른 검증 단계이며, 확인한 범위만 검증 기록에 표시합니다.
