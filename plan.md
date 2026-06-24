---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-20
goal_version: e3a98c80d074
gtm_route: toy
engine: N/A
maturity_stage: wizard-sandbox
acceptance:
  - id: A-1
    hint: "ShortenForm accepts a full URL and returns a short link that redirects to the original.\n"
    high_impact: false
  - id: PKG-HEALTH
    hint: "clean env 에서 프로젝트 표준 빌드+테스트 명령이 우회 없이 통과하고 패키지가 정상 빌드·실행된다 (python: `make test` 또는 `uv run pytest` — PYTHONPATH 우회 금지; node: package.json `packageManager` 기준 PM 으로 lockfile clean install+build+test, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test` 또는 `npm ci && npm run build && npm test`). 패키지명·레이아웃이 제품과 정합한다 — pyproject `name`·`packages`(python) 또는 package.json `name`(node)이 제품명이고, 템플릿 잔재(`python-service-template`·`src/app` 패키지·`nextjs-service-template` 등)가 남지 않는다."
    high_impact: true
---

# 기획서 — url-shortener

> 목표 SoT (제품 repo 루트). lean 목표를 scraps 가 작성. evaluator 가 goal_ref 로 읽음.

## 목표 (1줄)

User can paste any valid URL and receive a working short link.

## 빌드 맥락 (lean WHY)

- 배경: URL shortener is live on Vercel (Next.js). Latest cycle BC-56 targeted D4-validation (final_verdict=achieved, product_verdict=inconclusive — PR data insufficient for signal verification). Gateway status=shipped (SCR-609 prereq) not yet in Build Cycles → met set empty per lean SoT; D1-shorten sequenced as first pending dimension per north-star objective.
- 검증 가정(leap-of-faith): A non-technical user can rely on the app daily if the core paste-and-get-short-link flow works reliably end-to-end.
- 범위 밖 (이번 cycle 안 만듦):
  - User accounts / auth.
  - Custom vanity domains.
  - Analytics dashboards beyond a per-link click count.

## 해야할 일

**공유 계약 (Shared contract — inline in `src/app/server.py`)**

모든 로직이 단일 파일에 존재하므로 계약을 파일 상단에 먼저 선언한다:
- `STORE: dict[str, str]` — 모듈 수준 인메모리 딕셔너리, 단축 코드 → 원본 URL
- `generate_code() -> str` — stdlib `secrets` 모듈로 6자리 URL-safe 영숫자 코드 반환
- HTTP 응답 형식: 단축 성공 시 JSON `{"short": "http://localhost:8000/<code>"}`, 리다이렉트 시 HTTP 301 + `Location` 헤더

---

**Part 1 — `src/app/server.py`** (A-1)

`http.server.BaseHTTPRequestHandler`를 상속한 단일 핸들러 클래스 `ShortenHandler`를 구현한다. 세 가지 라우트:

- `GET /` → URL 입력 필드와 제출 버튼을 가진 최소 HTML 폼(ShortenForm)을 반환.
- `POST /shorten` → `Content-Length`로 바디를 읽고 `urllib.parse.parse_qs`로 `url` 필드 추출 → `generate_code()`로 코드 생성 → `STORE`에 저장 → JSON 응답 반환.
- `GET /<code>` → `STORE` 조회 후 원본 URL로 301 리다이렉트; 없으면 404.

`if __name__ == "__main__"` 블록에서 `http.server.HTTPServer(("", 8000), ShortenHandler)` 기동. 별도 모듈·패키지 불필요.

---

**Part 2 — 제약 검사: stdlib-only import 정적 분석** (A-1 구조적 전제조건)

`src/app/server.py`의 소스를 `ast.parse`로 파싱하여 모든 `Import` 및 `ImportFrom` 노드를 추출하고, 각 최상위 모듈명이 `sys.stdlib_module_names`(Python 3.10+) 또는 `sys.builtin_module_names` 집합에 속하는지 단언한다. 외부 패키지가 단 하나라도 발견되면 실패. 코딩 플래너가 해당 정적 분석 오라클을 작성한다.

---

*범위 외(Out of scope for this slice):* 영속 저장소(DB/파일), 커스텀 단축 코드 입력, 충돌 처리, 만료 정책 — A-1이 요구하지 않으므로 제외.

## 수용기준 힌트 (성공의 모습)

frontmatter `acceptance` 와 1:1. evaluator 가 게이트에서 판단형 기준(P1)으로 도출.

- A-1: ShortenForm accepts a full URL and returns a short link that redirects to the original.

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
