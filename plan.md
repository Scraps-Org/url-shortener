---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-18
goal_version: def77c1057ca
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

**파트 0 — 공유 계약 (Shared Contract)**
모든 파트가 참조하는 데이터 모델을 `src/app/models.py`에 정의한다. `Link` dataclass(또는 NamedTuple)로 `id: int`, `short_code: str`, `long_url: str`, `created_at: str`, `click_count: int` 필드를 포함한다. 스토리지 계층이 구현해야 할 함수 시그니처도 이 파일에 명세한다: `create_link(long_url: str) -> Link`, `get_all_links() -> list[Link]`, `get_link(short_code: str) -> Link | None`, `increment_click(short_code: str) -> None`. (A-1)

**파트 1 — 스토리지 레이어 (`src/app/storage.py`)**
stdlib의 `sqlite3`만 사용해 SQLite 파일 DB를 관리한다. `init_db(db_path: str) -> None`으로 `links` 테이블(`id`, `short_code UNIQUE`, `long_url`, `created_at`, `click_count INTEGER DEFAULT 0`)을 생성한다. 파트 0의 시그니처를 그대로 구현하되, `increment_click`은 `UPDATE … SET click_count = click_count + 1`로 원자적으로 갱신한다. `create_link`는 충돌 없는 6자 영숫자 `short_code`를 `secrets` 모듈(stdlib)로 생성한다. (A-1)

**파트 2 — HTTP 핸들러 / 라우터 (`src/app/server.py`)**
`http.server.BaseHTTPRequestHandler` 상속 클래스로 세 가지 경로를 처리한다.
- `GET /` → 파트 3의 렌더러를 호출해 링크 목록 HTML 반환.
- `POST /shorten` (body: `url=<long_url>`) → `create_link` 호출 후 `/`로 redirect.
- `GET /{short_code}` → `get_link` 호출, 존재하면 `increment_click` 후 `302` redirect, 없으면 `404`.
모든 DB 접근은 파트 1 함수만 사용한다. (A-1)

**파트 3 — HTML 렌더러 (`src/app/templates.py`)**
외부 템플릿 엔진 없이 Python f-string으로 HTML 문자열을 생성하는 순수 함수 `render_link_list(links: list[Link]) -> str`을 구현한다. 출력 결과에는 `short_code`, `long_url`, `click_count` 열을 가진 `<table>`이 포함되어야 하고, 링크 생성 폼(`<form method="post" action="/shorten">`)도 함께 렌더링한다. (A-1)

**파트 4 — 진입점 (`src/app/main.py`)**
`init_db()`를 호출한 뒤 `http.server.HTTPServer`를 기본 포트(예: 8000)로 시작한다. DB 경로는 환경변수 `DB_PATH`(기본값 `links.db`)로 주입받는다.

**파트 5 — 구조적 제약 검증 (`src/app/check_imports.py`)**
`ast` 모듈로 `src/app/` 내 모든 `.py` 파일의 import 구문을 정적 분석하여, `stdlib` 외 외부 패키지가 임포트되지 않음을 단언하는 스크립트를 작성한다. 허용 목록은 `sys.stdlib_module_names`(Python 3.10+) 또는 하드코딩된 stdlib 집합으로 비교한다. 위반 발견 시 위반 모듈명과 파일명을 출력하고 비-0 exit code로 종료한다. 이 파트는 평가 oracle이 기계적으로 실행할 수 있어야 한다. (stdlib-only 구조 제약)

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
