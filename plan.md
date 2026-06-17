---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-17
goal_version: 9ca8b6ed5c89
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

**Part 1 — 공유 계약: `Link` 데이터 모델 및 `LinkStore` 인터페이스** (`src/app/models.py`)

`Link` 데이터클래스(`short_code: str`, `original_url: str`, `owner_id: str`, `click_count: int`, `created_at: datetime`)를 정의한다. 동일 파일에 `LinkStore` 프로토콜(구상 클래스가 구현할 계약)을 두고 메서드 서명을 명시한다: `add(link: Link) -> None`, `get(short_code: str) -> Link | None`, `list_by_owner(owner_id: str) -> list[Link]`, `increment_clicks(short_code: str) -> None`. 이후 모든 파트는 이 계약에만 의존한다. (A-1)

**Part 2 — 스토리지 구현** (`src/app/storage.py`)

`InMemoryLinkStore`가 `LinkStore`를 구현한다. 내부 상태는 `dict[str, Link]`(short_code → Link)이며, `increment_clicks`는 `threading.Lock`으로 카운터를 원자적으로 증가시킨다. `list_by_owner`는 `owner_id`로 필터링 후 `created_at` 기준 정렬 리스트를 반환한다. (A-1)

**Part 3 — 리디렉트 핸들러** (`src/app/redirect.py`)

`http.server.BaseHTTPRequestHandler`를 상속한 `RedirectHandler`를 정의한다. `do_GET`에서 경로의 short_code를 추출하고 `store.increment_clicks(short_code)`를 호출한 뒤 `302` 응답으로 `original_url`로 리디렉트한다. short_code가 없으면 `404`를 반환한다. 스토어 인스턴스는 핸들러 클래스 속성으로 주입한다. (A-1 — 클릭 수 증가)

**Part 4 — 대시보드 뷰** (`src/app/dashboard.py`)

`DashboardHandler`가 `GET /dashboard`를 처리한다. `store.list_by_owner(owner_id)`를 호출하여 결과를 HTML `<table>`로 렌더링한다(컬럼: short_code, original_url, click_count, created_at). HTML 생성은 표준 라이브러리 문자열 포매팅만 사용하며 외부 템플릿 엔진을 쓰지 않는다. (A-1 — 리스트/테이블 뷰)

**Part 5 — 애플리케이션 진입점** (`src/app/main.py`)

`InMemoryLinkStore` 인스턴스를 생성하고 `RedirectHandler`·`DashboardHandler`의 클래스 속성에 주입한다. 두 핸들러를 하나의 `http.server.HTTPServer`에서 경로 prefix로 분기하는 라우팅 디스패처(`do_GET` 내 분기)를 구성한다. `if __name__ == "__main__"`에서 서버를 기동한다.

**Part 6 — 표준 라이브러리 제약 정적 검사** (`src/app/` 전체)

`ast` 모듈로 `src/app/` 내 모든 `.py` 파일을 파싱하여 `import` 및 `from … import` 노드를 수집한다. 각 최상위 모듈 이름을 `sys.stdlib_module_names`(Python 3.10+) 또는 수동 화이트리스트와 대조해 서드파티 모듈이 없음을 단언한다. 이 검사는 정적 분석(동작 테스트 아님)으로 수행하며 코딩 플래너가 테스트 파일로 구현한다. (A-1 전체의 구조 제약 근거)

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
