---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-20
goal_version: 1bb8091f7307
gtm_route: toy
engine: N/A
maturity_stage: wizard-sandbox
acceptance:
  - id: A-1
    hint: "Submitting a non-URL or empty value shows an inline error; no short link is created.\n"
    high_impact: false
  - id: PKG-HEALTH
    hint: "clean env 에서 프로젝트 표준 빌드+테스트 명령이 우회 없이 통과하고 패키지가 정상 빌드·실행된다 (python: `make test` 또는 `uv run pytest` — PYTHONPATH 우회 금지; node: package.json `packageManager` 기준 PM 으로 lockfile clean install+build+test, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test` 또는 `npm ci && npm run build && npm test`). 패키지명·레이아웃이 제품과 정합한다 — pyproject `name`·`packages`(python) 또는 package.json `name`(node)이 제품명이고, 템플릿 잔재(`python-service-template`·`src/app` 패키지·`nextjs-service-template` 등)가 남지 않는다."
    high_impact: true
---

# 기획서 — url-shortener

> 목표 SoT (제품 repo 루트). lean 목표를 scraps 가 작성. evaluator 가 goal_ref 로 읽음.

## 목표 (1줄)

Invalid input is rejected with a clear inline message (no silent failure / no broken link).

## 빌드 맥락 (lean WHY)

- 배경: URL shortener is live on Vercel. D1 (shorten), D2 (copy), D3 (history + click count) are all verified. D4 adds inline validation so invalid input shows a clear error and no short link is created — the final dimension before the north-star objective converges.
- 검증 가정(leap-of-faith): Client-side + server-side URL validation without auth is sufficient to prevent silent failures and broken links for non-technical daily use.
- 범위 밖 (이번 cycle 안 만듦):
  - User accounts / auth
  - Custom vanity domains
  - Analytics dashboards beyond a per-link click count
  - D1-shorten — already met (do not re-implement)
  - D2-copy — already met (do not re-implement)
  - D3-history — already met (do not re-implement)

## 해야할 일

**파트 1 — 공유 검증 계약 (shared contract)** `[A-1]`

`src/app/validators.py` 에 다음 서명을 정의한다:

```
validate_url(value: str) -> tuple[bool, str]
```

반환값은 `(is_valid, error_message)` 쌍이다. 유효하면 `(True, "")`, 무효면 `(False, 사람이 읽을 수 있는 한국어 오류 문구)`. 이 계약을 뷰·핸들러·템플릿 파트가 공통으로 참조한다.

---

**파트 2 — 검증 로직 구현** `[A-1]`

`src/app/validators.py` 내부에서 표준 라이브러리 `urllib.parse.urlparse` 만으로 `validate_url`을 구현한다. 검사 항목: ① `value.strip()`이 빈 문자열이면 "URL을 입력해 주세요." 반환, ② scheme이 `http` 또는 `https`가 아니면 "http:// 또는 https://로 시작하는 URL을 입력해 주세요." 반환, ③ netloc(호스트)이 없으면 "유효한 도메인이 포함된 URL을 입력해 주세요." 반환. 세 조건을 모두 통과해야 `True` 반환.

---

**파트 3 — 뷰·핸들러 통합** `[A-1]`

`src/app/views.py` (또는 해당 프로젝트의 요청 처리 진입점)에서 단축 URL 생성 로직 **호출 전에** `validate_url(raw_input)`을 실행한다. `is_valid is False`이면 단축 URL 생성을 **건너뛰고** `error_message`를 템플릿 컨텍스트 변수 `error`로 넘겨 현재 폼을 재렌더링한다. `is_valid is True`일 때만 단축 URL 생성 함수를 호출한다. 이 조건 분기가 "단축 링크 미생성" 보장의 유일한 관문이다.

---

**파트 4 — 인라인 오류 표시 템플릿** `[A-1]`

`src/app/templates/index.html` (또는 폼을 렌더링하는 템플릿)에서 입력 필드 바로 아래에 `error` 변수를 인라인으로 출력하는 영역을 추가한다. `error`가 비어 있으면 해당 요소가 숨겨지거나(빈 문자열 조건 분기) 렌더링되지 않아야 한다. 리다이렉트·alert·별도 페이지 없이 동일 폼 안에서 오류가 표시되어야 한다.

---

**파트 5 — 표준 라이브러리 전용 제약 확인 (constraint check)** `[A-1]`

`src/app/` 하위 모든 `.py` 파일을 표준 라이브러리 `ast` 모듈로 파싱하여 `import` 및 `from … import` 구문을 추출하는 정적 분석 스크립트를 `tools/check_stdlib_only.py`에 둔다. 추출된 최상위 모듈 이름 목록을 `sys.stdlib_module_names`(Python 3.10+) 또는 동등한 수단과 대조해, 서드파티 패키지가 단 하나라도 발견되면 비-0 exit code와 해당 모듈 이름을 출력한다. 코딩 플래너는 이 스크립트를 오라클로 활용하여 "모든 import가 stdlib에 속함"을 기계적으로 검증한다.

## 수용기준 힌트 (성공의 모습)

frontmatter `acceptance` 와 1:1. evaluator 가 게이트에서 판단형 기준(P1)으로 도출.

- A-1: Submitting a non-URL or empty value shows an inline error; no short link is created.

- PKG-HEALTH: clean env 에서 프로젝트 표준 빌드+테스트 명령이 우회 없이 통과하고 패키지가 정상 빌드·실행된다 (python: `make test` 또는 `uv run pytest` — PYTHONPATH 우회 금지; node: package.json `packageManager` 기준 PM 으로 lockfile clean install+build+test, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test` 또는 `npm ci && npm run build && npm test`). 패키지명·레이아웃이 제품과 정합한다 — pyproject `name`·`packages`(python) 또는 package.json `name`(node)이 제품명이고, 템플릿 잔재(`python-service-template`·`src/app` 패키지·`nextjs-service-template` 등)가 남지 않는다.

## 코딩 가이드 (planner)

**분해 (큰 작업도 atomic task DAG 로):**
- acceptance 1개 ≈ atomic task 1개. 한 task = 한 변경 단위(파일-수준 allowed_paths, ≤12 파일·≤6 디렉토리). 넘으면 더 쪼갠다.
- **인터페이스-first**: 여러 부분이 한 계약(함수 시그니처/타입/API 스키마)을 공유하면, 계약+그 계약 테스트를 먼저 task-0 으로 두고 나머지 task 가 `depends_on` 으로 연결(병렬 가능).
- **예외처리는 별도 task 가 아니라 그 기능 task 안에** (구현+엣지케이스+테스트 = 한 atomic 단위).
- `depends_on` 은 정말 선행 산출물이 필요할 때만. 독립이면 평면(병렬)로.
- 한 goal 이 너무 크면(평면 분해 불가) thin/insufficient 반환 — goal 을 더 작은 1-PR 단위로 쪼개는 건 allocator/상위 책임.

**검증 기준(oracle = task 완료를 자동 판정하는 테스트):**
- 각 task 는 결정적 검증 커맨드를 갖는다 — 구현 전 red, 구현 후 green (negative-control 성립).
- **테스트 파일은 allowed_paths 에 넣지 않는다** (오라클 훼손 방지; context_hints 로만 참조).
- 정적 분석으로 표현 가능한 제약(의존성·import 구조·타입·스키마)은 테스트(예 `python -m pytest`, ast 검사)로 검증 채널을 만든다 — 산문 주장만 두면 평가서 '증거 없음'으로 미성취.
- 도메인별 oracle 예시: 순수 로직→단위 pytest; 웹 API→핸들러 단위·스키마·통합(testcontainer); 프론트→컴포넌트·스냅샷. 자동 검증 불가한 주관/런타임 품질만 사람·heavy 증거로(분리).

**패키징·레이아웃 (PKG-HEALTH — 템플릿 잔재 금지, stack 별):**
- **python**: 코드 `src/<product>/`, pyproject `name`·`[tool.hatch...]packages`·`pythonpath` 가 그 패키지와 정합. 템플릿 잔재(`src/app`·`python-service-template`) 잔존 금지.
- **node(nextjs/astro)**: package.json `name`=제품명. 코드는 템플릿 규약(`src/app`·`src/components` 등 Next.js 구조) 유지. `nextjs-service-template` 등 잔존 금지.
- 빌드/테스트 검증은 **프로젝트 표준 명령**(python `make test`; node = package.json `packageManager` 기준 PM, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test`)으로 — clean env(설치·빌드) 기준. ad-hoc 우회(`PYTHONPATH=.` 등)로 통과시키면 PKG-HEALTH 미충족(돌아가는 척 = false-complete).

**PKG-HEALTH 는 task 로 만들지 말 것 (SCR-520 — 엔진이 강제):**
- PKG-HEALTH 에 대한 **코더 task 를 만들지 않는다**. 엔진이 모든 task terminal + goal COMPLETED 후 통합 트리에서 clean build+test 를 1회 돌려 강제한다(통과해야 PR 제출, 실패면 미성취). 코더 task 로 두면 통합 앱이 이미 깨끗할 때 바꿀 게 없어 'no changes' 로 역설적 실패한다.
- **각 기능 task 는 그 자체로 lint·build clean**: unused var/import(예 빈 `catch (e)`) 금지 — node `next build` 는 전체 프로젝트에 ESLint 를 돌려 한 task 의 잔재가 통합 build 전체를 red 로 만든다(per-task 단위테스트는 통과해도). 통합 build 가 red 면 엔진 PKG-HEALTH 게이트가 미성취 처리.
