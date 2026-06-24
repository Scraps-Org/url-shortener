---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-20
goal_version: d83b836c5e2e
gtm_route: toy
engine: N/A
maturity_stage: wizard-sandbox
acceptance:
  - id: A-1
    hint: "A copy control next to the result copies the short link to the clipboard.\n"
    high_impact: false
  - id: PKG-HEALTH
    hint: "clean env 에서 프로젝트 표준 빌드+테스트 명령이 우회 없이 통과하고 패키지가 정상 빌드·실행된다 (python: `make test` 또는 `uv run pytest` — PYTHONPATH 우회 금지; node: package.json `packageManager` 기준 PM 으로 lockfile clean install+build+test, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test` 또는 `npm ci && npm run build && npm test`). 패키지명·레이아웃이 제품과 정합한다 — pyproject `name`·`packages`(python) 또는 package.json `name`(node)이 제품명이고, 템플릿 잔재(`python-service-template`·`src/app` 패키지·`nextjs-service-template` 등)가 남지 않는다."
    high_impact: true
---

# 기획서 — url-shortener

> 목표 SoT (제품 repo 루트). lean 목표를 scraps 가 작성. evaluator 가 goal_ref 로 읽음.

## 목표 (1줄)

User can copy the short link in one action.

## 빌드 맥락 (lean WHY)

- 배경: URL shortener live on Vercel (Next.js). BC-57 targeted D1-shorten: final_verdict=achieved, product_verdict=pass (2026-06-20). D2-copy sequenced as next pending dimension — copy-to-clipboard is the key usability gate after the shorten flow works.
- 검증 가정(leap-of-faith): A non-technical user needs a one-action copy control to rely on the app daily; manual text selection is a friction point that prevents repeat use.
- 범위 밖 (이번 cycle 안 만듦):
  - User accounts / auth.
  - Custom vanity domains.
  - Analytics dashboards beyond a per-link click count.
  - D1-shorten (ShortenForm shorten flow — effectively achieved, BC-57 final_verdict=achieved)

## 해야할 일

**Part 1 — 복사 컨트롤 및 클립보드 연동** (A-1)

결과 단축 링크가 렌더링되는 기존 파일(예: `src/app/result.py` 또는 해당 뷰/템플릿 파일) 내에 단축 링크 텍스트 바로 옆에 "복사" 버튼(또는 아이콘 클릭 영역)을 추가한다. 클릭 시 현재 단축 링크 값을 플랫폼 클립보드 API(`navigator.clipboard.writeText(shortLink)` 또는 동등한 표준 API)로 전달한다. 새 파일·모듈은 불필요하며 기존 결과 렌더링 지점에 인라인으로 삽입한다. 공유 계약: 함수 시그니처 `copyToClipboard(text: str) -> None` (또는 JS라면 `(text: string): Promise<void>`)을 해당 파일 상단에 명시해두고, 버튼 핸들러가 이를 호출하도록 연결한다. 외부 라이브러리 없이 표준 브라우저 API(또는 stdlib의 `tkinter`/`pyperclip` 미사용 — 표준 `subprocess`/`xclip` 래퍼 금지)만 사용한다.

**제약 검증 파트 — 표준 라이브러리 전용 확인** (A-1 구조 제약)

목표가 외부 의존성 없음을 암시하므로, 해당 파일의 import 목록을 정적 분석(`ast` 모듈로 import 노드 추출)하여 stdlib 외 모듈이 포함되지 않았음을 기계적으로 단언하는 검사 스크립트가 필요하다. 코딩 플래너가 이 검증 오라클을 작성한다. (범위 외: 복사 성공/실패 피드백 UI, 링크 만료 처리 — 본 슬라이스의 A-1은 클립보드 쓰기 동작 자체만 요구함.)

## 수용기준 힌트 (성공의 모습)

frontmatter `acceptance` 와 1:1. evaluator 가 게이트에서 판단형 기준(P1)으로 도출.

- A-1: A copy control next to the result copies the short link to the clipboard.

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
