---
product: "url-shortener"
owner: lean-startup-agent
status: active
updated: 2026-06-15
goal_version: ce9e53d6d412
acceptance:
  - id: A-1
    hint: "단축 저장이 모듈 전역 Map 이 아니라 storage 인터페이스 뒤 — in-memory 구현 + serverless 영속 구현(@vercel/kv|@upstash/redis|@vercel/postgres) 둘 다 존재 (인터페이스·구현 단위 테스트)"
    high_impact: true
  - id: A-2
    hint: "pnpm test 가 in-memory 구현으로 라이브 DB 없이 통과 — 기존 shorten/redirect/stats/홈 + storage 추상화 테스트 전부 green"
    high_impact: true
  - id: A-3
    hint: "next.config 의 output:standalone 이 process.env.VERCEL 조건부(Vercel=기본 타깃·그 외=standalone) + Dockerfile 유지 + 추가 영속 의존성이 pnpm-lock 반영돼 pnpm install --frozen-lockfile && pnpm build 통과"
    high_impact: true
  - id: A-4
    hint: "영속 구현 선택이 런타임 env 기반(env 있으면 영속·없으면 in-memory), 자격증명 하드코딩 없음, .env.example 에 키 명시"
    high_impact: false
  - id: PKG-HEALTH
    hint: "clean env 에서 프로젝트 표준 빌드+테스트 명령이 우회 없이 통과하고 패키지가 정상 빌드·실행된다 (python: `make test` 또는 `uv run pytest` — PYTHONPATH 우회 금지; node: package.json `packageManager` 기준 PM 으로 lockfile clean install+build+test, 예 `pnpm i --frozen-lockfile && pnpm build && pnpm test` 또는 `npm ci && npm run build && npm test`). 패키지명·레이아웃이 제품과 정합한다 — pyproject `name`·`packages`(python) 또는 package.json `name`(node)이 제품명이고, 템플릿 잔재(`python-service-template`·`src/app` 패키지·`nextjs-service-template` 등)가 남지 않는다."
    high_impact: true
---

# 기획서 — url-shortener

> 목표 SoT (제품 repo 루트). lean 목표를 scraps 가 작성. evaluator 가 goal_ref 로 읽음.

## 목표 (1줄)

url-shortener 에 serverless 영속 저장 + Vercel 배포 호환을 추가하되 Docker self-host 도 유지 (publish 준비)

## 해야할 일

기존 url-shortener(main) 에 영속성 + Vercel 호환 추가 — Docker 는 유지(개발/self-host).
- src/lib/store.ts 모듈 전역 Map 을 storage 인터페이스 뒤로: (a) in-memory 구현(테스트·로컬) + (b) env 로 선택되는 serverless 영속 구현(@vercel/kv | @upstash/redis | @vercel/postgres 중 HTTP 기반·네이티브 의존성 없는 것 하나)
- 런타임 선택: 영속 백엔드 env(REST URL·TOKEN) 존재 시 영속, 없으면 in-memory (자격증명 하드코딩 금지)
- next.config: output:'standalone' 을 제거하지 말고 env 조건부로 — process.env.VERCEL 있으면(Vercel 빌드) 기본 타깃, 없으면 standalone 유지(Docker self-host). Dockerfile 그대로 둔다.
- 추가 의존성을 package.json + pnpm-lock.yaml 반영 (frozen install 통과)
- .env.example 에 영속 백엔드 env 키 + Vercel 배포 노트
- 기존 동작·테스트(shorten/redirect/stats/홈) 회귀 0

## 수용기준 힌트 (성공의 모습)

frontmatter `acceptance` 와 1:1. evaluator 가 게이트에서 판단형 기준(P1)으로 도출.

- A-1: 단축 저장이 모듈 전역 Map 이 아니라 storage 인터페이스 뒤 — in-memory 구현 + serverless 영속 구현(@vercel/kv|@upstash/redis|@vercel/postgres) 둘 다 존재 (인터페이스·구현 단위 테스트)
- A-2: pnpm test 가 in-memory 구현으로 라이브 DB 없이 통과 — 기존 shorten/redirect/stats/홈 + storage 추상화 테스트 전부 green
- A-3: next.config 의 output:standalone 이 process.env.VERCEL 조건부(Vercel=기본 타깃·그 외=standalone) + Dockerfile 유지 + 추가 영속 의존성이 pnpm-lock 반영돼 pnpm install --frozen-lockfile && pnpm build 통과
- A-4: 영속 구현 선택이 런타임 env 기반(env 있으면 영속·없으면 in-memory), 자격증명 하드코딩 없음, .env.example 에 키 명시
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
