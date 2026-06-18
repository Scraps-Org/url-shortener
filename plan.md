---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-18
goal_version: dd242c49c44c
gtm_route: toy
engine: N/A
maturity_stage: wizard-sandbox
acceptance:
  - id: A-1
    hint: "A list/table view shows created short links with a per-link click count that increments on redirect.\n"
    high_impact: false
  - id: PKG-HEALTH
    hint: "clean env 에서 프로젝트 표준 빌드+테스트 명령이 우회 없이 통과하고 패키지가 정상 빌드·실행된다 (python: `make test` 또는 `uv run pytest` — PYTHONPATH 우회 금지; node: package.json `packageManager` 기준 PM 으로 lockfile clean install+build+test, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test` 또는 `npm ci && npm run build && npm test`). 패키지명·레이아웃이 제품과 정합한다 — pyproject `name`·`packages`(python) 또는 package.json `name`(node)이 제품명이고, 템플릿 잔재(`python-service-template`·`src/app` 패키지·`nextjs-service-template` 등)가 남지 않는다."
    high_impact: true
---

# 기획서 — url-shortener

> 목표 SoT (제품 repo 루트). lean 목표를 scraps 가 작성. evaluator 가 goal_ref 로 읽음.

## 목표 (1줄)

User can see the links they created and how many times each was clicked.

## 빌드 맥락 (lean WHY)

- 배경: URL shortener is live on Vercel. D1 (shorten) and D2 (copy) are verified (PR #23, eval-url-shortener-a4f28b475792, product_verdict=pass). D3 adds history and click-count visibility — the remaining gap before the north-star objective is satisfied.
- 검증 가정(leap-of-faith): Displaying created links + click counts on the same page the user lands on is sufficient for non-technical daily use without requiring auth or accounts.
- 범위 밖 (이번 cycle 안 만듦):
  - User accounts / auth
  - Custom vanity domains
  - Analytics dashboards beyond a per-link click count
  - D1 shorten — already met (do not re-implement)
  - D2 copy button — already met (do not re-implement)

## 해야할 일

**파트 1 — 공유 계약: 데이터 모델 (`src/app/models.py`)**
`ShortLink` dataclass를 정의한다: `short_code: str`, `original_url: str`, `created_at: str` (ISO-8601), `click_count: int`. 이 타입이 모든 하위 파트의 공통 단위이다. [A-1]

**파트 2 — 저장소 계약 및 구현 (`src/app/store.py`)**
파트 1의 `ShortLink`를 임포트한다. `threading.Lock`으로 보호되는 인메모리 딕셔너리(`dict[str, ShortLink]`)를 상태로 갖는다. 외부로 노출하는 함수 시그니처:
- `create_link(original_url: str) -> ShortLink` — 고유한 `short_code`(6자 `secrets.token_urlsafe(4)`)를 생성하고 click_count=0으로 저장 후 반환.
- `get_link(short_code: str) -> ShortLink | None` — 코드로 조회.
- `increment_click(short_code: str) -> None` — click_count를 1 증가 (lock 내에서).
- `list_links() -> list[ShortLink]` — 전체 링크를 `created_at` 내림차순으로 반환. [A-1]

**파트 3 — HTTP 라우팅 및 핸들러 (`src/app/server.py`)**
표준 라이브러리 `http.server.BaseHTTPRequestHandler`를 서브클래스로 구현한다. 처리 경로:
- `POST /links` — 폼 바디에서 `original_url`을 파싱하고 `store.create_link()`를 호출한 뒤 목록 페이지로 `303 See Other` 리디렉트.
- `GET /<short_code>` — `store.get_link()`로 조회 → 없으면 404, 있으면 `store.increment_click()`을 호출한 뒤 `301` 또는 `302`로 원래 URL로 리디렉트. [A-1]
- `GET /` — `store.list_links()`를 호출하고 `views.render_index()`(파트 4)로 생성한 HTML을 반환. [A-1]

**파트 4 — HTML 렌더링 (`src/app/views.py`)**
파트 1의 `ShortLink`를 임포트한다. `render_index(links: list[ShortLink]) -> str` 함수 하나를 노출한다. 반환값은 완전한 HTML 문자열로, 링크 생성 폼(original_url 입력 + 제출 버튼)과 `short_code`, `original_url`, `click_count`, `created_at` 컬럼을 가진 `<table>`을 포함한다. f-string 또는 `str.format`만 사용하며 외부 템플릿 엔진 없이 작성한다. [A-1]

**파트 5 — 진입점 (`src/app/main.py`)**
`http.server.HTTPServer`를 `(HOST, PORT)`로 생성하고 파트 3의 핸들러 클래스를 전달한 뒤 `serve_forever()`를 호출한다. HOST/PORT는 모듈 상단 상수로 명시한다. 의존 순서: `models` → `store` → `views` → `server` → `main`.

**파트 6 — 구조적 제약 검증 (표준 라이브러리 전용)**
`src/` 하위 모든 `.py` 파일에 대해 표준 라이브러리 `ast` 모듈로 임포트 노드(`ast.Import`, `ast.ImportFrom`)를 순회하고, `sys.stdlib_module_names`(Python 3.10+) 또는 수동 화이트리스트와 대조하여 서드파티 패키지가 없음을 정적으로 검증하는 스크립트를 `src/check_stdlib_only.py`에 작성한다. 이 스크립트는 위반 발견 시 비-0 종료 코드와 위반 모듈명을 출력해야 한다. 코딩 플래너가 이 스크립트를 실행하는 오라클 테스트를 작성한다.

## 수용기준 힌트 (성공의 모습)

frontmatter `acceptance` 와 1:1. evaluator 가 게이트에서 판단형 기준(P1)으로 도출.

- A-1: A list/table view shows created short links with a per-link click count that increments on redirect.

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
