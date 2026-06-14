---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-14
goal_version: 0a540d3868b4
acceptance:
  - id: A-1
    hint: "POST /api/shorten - 유효 URL 에 6자 코드 반환, 무효 URL 은 400 (vitest 핸들러)"
    high_impact: true
  - id: A-2
    hint: "GET /[code] - 원본으로 302 redirect, 미존재 코드는 404"
    high_impact: true
  - id: A-3
    hint: "단축 코드 충돌 없이 유일 (생성 로직 단위 테스트)"
    high_impact: false
  - id: A-4
    hint: "GET /api/stats/[code] - 클릭 수 반환, redirect 시 증가 (카운트 로직 테스트)"
    high_impact: false
  - id: A-5
    hint: "홈(/) 이 단축 입력 폼 렌더 (컴포넌트/렌더 테스트)"
    high_impact: false
  - id: PKG-HEALTH
    hint: "clean env 에서 프로젝트 표준 빌드+테스트 명령이 우회 없이 통과하고 패키지가 정상 빌드·실행된다 (python: `make test` 또는 `uv run pytest` — PYTHONPATH 우회 금지; node: package.json `packageManager` 기준 PM 으로 lockfile clean install+build+test, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test` 또는 `npm ci && npm run build && npm test`). 패키지명·레이아웃이 제품과 정합한다 — pyproject `name`·`packages`(python) 또는 package.json `name`(node)이 제품명이고, 템플릿 잔재(`python-service-template`·`src/app` 패키지·`nextjs-service-template` 등)가 남지 않는다."
    high_impact: true
---

# 기획서 — url-shortener

> 목표 SoT (제품 repo 루트). lean 목표를 scraps 가 작성. evaluator 가 goal_ref 로 읽음.

## 목표 (1줄)

URL을 짧은 코드로 단축하고 코드로 원본에 리다이렉트하며 클릭 수를 집계하는 웹앱

## 해야할 일

Next.js(App Router, TypeScript) + in-memory store(데모 — DB 불요).
- 코드 생성: 6자 base62 랜덤 + 충돌 회피
- API: POST /api/shorten {url}->{code} (URL 검증), GET /api/stats/[code]->{clicks}
- 라우트: GET /[code] -> 302 redirect + 클릭 카운트++, 미존재 -> 404
- 홈(/): 단축 폼 + 결과 표시
- vitest 단위(코드생성·검증·카운트) + 라우트 핸들러 테스트
- (재검증4) planner graceful degradation(SCR-516) 후 첫 완주 확인

## 수용기준 힌트 (성공의 모습)

frontmatter `acceptance` 와 1:1. evaluator 가 게이트에서 판단형 기준(P1)으로 도출.

- A-1: POST /api/shorten - 유효 URL 에 6자 코드 반환, 무효 URL 은 400 (vitest 핸들러)
- A-2: GET /[code] - 원본으로 302 redirect, 미존재 코드는 404
- A-3: 단축 코드 충돌 없이 유일 (생성 로직 단위 테스트)
- A-4: GET /api/stats/[code] - 클릭 수 반환, redirect 시 증가 (카운트 로직 테스트)
- A-5: 홈(/) 이 단축 입력 폼 렌더 (컴포넌트/렌더 테스트)
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
