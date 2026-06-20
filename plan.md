---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-20
goal_version: 57b8d10858a8
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

**Part 1 — 공유 계약 (Validation contract)** `src/app/validation.py`

`ValidationResult`를 `ok: bool`과 `error: str | None` 두 필드를 가진 `NamedTuple`로 정의한다. 함께 `validate_url(raw: str) -> ValidationResult` 시그니처를 선언한다. 이 타입과 함수 시그니처가 하위 모든 파트의 유일한 계약이 된다 — 핸들러와 템플릿은 이 계약만을 참조한다. (A-1)

**Part 2 — 검증 로직 구현** `src/app/validation.py` (Part 1과 동일 파일, 함수 본문)

`validate_url` 내부에서 다음 두 가지를 순서대로 확인한다: ① `raw.strip()`이 빈 문자열이면 `ValidationResult(ok=False, error="URL을 입력하세요")`를 반환한다. ② `urllib.parse.urlparse`(표준 라이브러리)로 파싱 후 `scheme`이 `http` 또는 `https`가 아니거나 `netloc`이 비어 있으면 `ValidationResult(ok=False, error="올바른 URL 형식이 아닙니다")`를 반환한다. 위 검사를 모두 통과하면 `ValidationResult(ok=True, error=None)`을 반환한다. (A-1)

**Part 3 — 요청 핸들러 가드** `src/app/handler.py`

단축 링크 생성 엔드포인트의 최상단에서 `validate_url(raw)`를 호출한다. `result.ok`가 `False`이면 링크 생성 로직을 전혀 실행하지 않고 즉시 `result.error`를 담은 응답을 반환한다 — 사이드이펙트(DB 기록, 리다이렉트 등) 없음을 코드 구조로 보장한다. `result.ok`가 `True`인 경우에만 기존 생성 로직으로 진행한다. (A-1)

**Part 4 — 인라인 에러 표시** `src/app/templates/index.html`

폼 템플릿은 선택적 컨텍스트 변수 `error`를 받는다. `error`가 설정된 경우 입력 필드 바로 아래에 인라인 `<span class="error">` 요소로 렌더링한다 — 별도 페이지 이동 없음, 빈 링크 없음. 에러가 없는 정상 경우에는 해당 요소를 표시하지 않는다. (A-1)

**Part 5 — 표준 라이브러리 제약 확인** (정적 분석)

`src/app/validation.py`와 `src/app/handler.py`를 대상으로 `ast` 모듈로 모든 `import` 및 `from … import` 문을 수집한 뒤, `sys.stdlib_module_names`(Python 3.10+) 또는 동등한 stdlib 목록과 대조하여 비표준 패키지가 없음을 단언한다. 분석 결과(import 목록)를 출력하여 기계 판독 가능한 증거로 남긴다. (A-1 구조적 제약)

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
