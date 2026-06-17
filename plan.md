---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-17
goal_version: d560f99ea01a
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

**Part 1 — 공유 데이터 계약 (`src/app/models.py`)** ·서비스A-1

`dataclasses.dataclass`로 `Link`를 정의한다: 필드는 `short_code: str`, `original_url: str`, `click_count: int`, `created_at: str`(ISO-8601). 이 타입이 스토리지·핸들러·렌더러가 교환하는 유일한 단위이므로, 다른 파일은 이 모듈만 임포트하면 된다.

---

**Part 2 — 영속 계층 (`src/app/store.py`)** · A-1

표준 라이브러리 `sqlite3`를 사용해 `links` 테이블(칼럼: `short_code TEXT PK`, `original_url TEXT`, `click_count INTEGER DEFAULT 0`, `created_at TEXT`)을 관리한다.  
공개 인터페이스:
- `init_db(db_path: str) -> None` — 테이블이 없으면 생성.
- `get_all_links(db_path: str) -> list[Link]` — 생성일 내림차순 정렬.
- `get_link(db_path: str, short_code: str) -> Link | None`
- `increment_click(db_path: str, short_code: str) -> None` — `UPDATE … SET click_count = click_count + 1`.
- `add_link(db_path: str, link: Link) -> None` — 링크 최초 저장(생성 흐름에서 호출).

`db_path`는 환경변수 `DB_PATH`에서 읽고 기본값은 `links.db`.

---

**Part 3 — 리다이렉트 핸들러 (`src/app/handlers.py`)** · A-1

`GET /<short_code>` 요청을 처리한다. `get_link`로 레코드를 조회한 후, 존재하면 `increment_click`을 호출하고 302 응답 + `Location: <original_url>` 헤더를 반환한다. 레코드가 없으면 404를 반환한다. **리다이렉트 전에 카운트를 증가**시켜야 A-1의 "클릭 시 카운트 증가" 조건을 충족한다.

---

**Part 4 — 링크 목록 핸들러 (`src/app/handlers.py`)** · A-1

`GET /` (또는 `GET /links`) 요청을 처리한다. `get_all_links`를 호출해 `Link` 목록을 얻고, Part 5의 `render_links_table`에 넘겨 HTML을 생성한 뒤 200 응답으로 반환한다. `Content-Type: text/html; charset=utf-8`.

---

**Part 5 — HTML 테이블 렌더러 (`src/app/render.py`)** · A-1

`render_links_table(links: list[Link]) -> str` 한 함수만 노출한다. f-string으로 HTML을 직접 생성한다(템플릿 엔진 불필요). 출력은 `<table>`로, 각 행에 단축 코드, 원본 URL(클릭 가능 `<a>`), 클릭 수, 생성 일시를 열로 가진다. 링크가 없으면 "등록된 링크가 없습니다" 메시지를 반환한다.

---

**Part 6 — HTTP 서버 진입점 (`src/app/server.py`)** · A-1

`http.server.BaseHTTPRequestHandler`를 서브클래스화해 `do_GET`에서 경로를 파싱한다: `/` → Part 4 핸들러, `/<short_code>` → Part 3 핸들러. `http.server.HTTPServer`로 서버를 초기화하고 실행 전 `init_db`를 호출한다. 포트는 환경변수 `PORT`(기본 8000)에서 읽는다.

---

**Part 7 — 표준 라이브러리 전용 제약 검증 (`src/app/_check_imports.py`)** · 구조적 제약

`ast` 모듈로 `src/app/*.py` 파일 전체를 파싱해 모든 `import` 및 `from … import` 구문을 수집한다. 수집한 최상위 모듈 이름을 `sys.stdlib_module_names`(Python 3.10+) 또는 하드코딩된 stdlib 목록과 대조해, 외부 패키지가 단 하나라도 발견되면 목록과 함께 오류를 출력하고 비정상 종료(`sys.exit(1)`)한다. 이 스크립트를 실행하면 CI/평가자가 의존성 위반을 기계적으로 확인할 수 있다. (테스트 파일을 제외한 `src/app/` 디렉터리만 스캔한다.)

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
