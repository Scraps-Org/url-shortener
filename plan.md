---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-17
goal_version: dfa5ca4fba91
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

**파트 0 — 공유 계약: 데이터 모델 (`src/app/models.py`)**
`ShortLink` dataclass를 정의한다: `code: str`, `original_url: str`, `created_at: str` (ISO-8601), `click_count: int`. 이 타입이 store · handler · renderer 전 계층의 공통 전달 객체가 된다. (A-1)

**파트 1 — 스토리지 (`src/app/store.py`)**
stdlib `sqlite3`로 `short_links` 테이블(`code TEXT PK`, `original_url TEXT`, `created_at TEXT`, `click_count INTEGER DEFAULT 0`)을 관리한다. 공개 함수: `init_db(path: str) -> None`, `save_link(code: str, original_url: str) -> ShortLink`, `get_link(code: str) -> ShortLink | None`, `list_links() -> list[ShortLink]`, `increment_click(code: str) -> None` — UPDATE를 원자적으로 수행해 동시 요청에서 카운트 유실을 방지한다. (A-1)

**파트 2 — 리디렉트 핸들러 (`src/app/handlers.py` 내 `handle_redirect`)**
`GET /<code>` 요청 수신 시 `get_link(code)`로 레코드를 조회하고, 존재하면 `increment_click(code)` 호출 후 `301 Location: original_url`로 응답한다. 미존재 코드는 `404`를 반환한다. 이 흐름이 클릭 카운트를 증가시키는 단일 경로다. (A-1)

**파트 3 — 목록 뷰 핸들러 (`src/app/handlers.py` 내 `handle_list`)**
`GET /links` 요청 수신 시 `list_links()`를 호출하고, stdlib `html` 모듈로 XSS-이스케이프된 HTML 테이블(`단축코드 | 원본 URL | 클릭 수 | 생성일`)을 `text/html`로 반환한다. 외부 템플릿 라이브러리 없이 `str.format` 또는 `io.StringIO`로 생성한다. (A-1)

**파트 4 — HTTP 서버 진입점 (`src/app/server.py`, `src/app/main.py`)**
`http.server.BaseHTTPRequestHandler`를 상속한 `AppHandler`를 `server.py`에 정의한다. `do_GET`은 경로를 파싱해 `/links` → `handle_list`, `/<code>` → `handle_redirect`로 분기한다. `main.py`는 `HTTPServer((host, port), AppHandler)`를 기동하고 `init_db`를 호출한다.

**파트 5 — 제약 검증 (stdlib 전용 import 정적 분석)**
`src/app/` 하위 모든 `.py` 파일을 `ast.parse`로 파싱해 `import` 및 `from … import` 노드에서 최상위 패키지명을 추출하고, Python stdlib 모듈 집합(`sys.stdlib_module_names` 또는 수동 화이트리스트)과 대조한다. 서드파티 패키지 이름이 단 하나라도 발견되면 검사를 실패시킨다. 이 정적 분석 결과가 "stdlib 전용" 주장의 기계적 증거로 제출된다.

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
