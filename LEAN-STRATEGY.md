---
# 기계 goal contract (allocator goal_input.py primary 파싱 — Notion SCRAPS-GOAL fallback)
product: url-shortener
owner: lean-startup-agent
goal_version: 20260620
status: active
dimension_id: D1-shorten
objective: >
  User can paste any valid URL and receive a working short link.
acceptance:
  - id: A-1
    hint: ShortenForm accepts a full URL and returns a short link that redirects to the original.
    high_impact: false
background: >
  nextjs eval 루프 검증용 테스트 제품 (Projects Test DB). D1-shorten은 objective의
  최우선 차원 — URL 단축이 동작해야 나머지 차원(copy·history·validation)의 기반이 됨.
  SCR-610 gate 전환(merge-confirmed shipped)으로 met 집합 재계산 → D1부터 재시작.
scope_out:
  - User accounts / auth.
  - Custom vanity domains.
  - Analytics dashboards beyond a per-link click count.
  - D2-copy
  - D3-history
  - D4-validation
assumption: >
  A working short link requires only a database write + redirect; no auth or analytics
  needed for the core shorten path.
constraints:
  nda: false
  data_sensitivity: none
  redaction_note: ""
maturity_stage: wizard-sandbox
gtm_route: toy
engine: N/A
---

# Lean Strategy — url-shortener
Last updated: 2026-06-20 (lean-startup `/lean-strategy-push` rev 3)
Source: `products/url-shortener/objective.yaml` · Build Cycles DB · lean-objective-cycle

> frontmatter = allocator 기계 입력(tight). 아래 본문 = 사람·coder 열람용(서사+진행). allocator는 frontmatter만 소비.

## 검증 중인 가설

eval 전용 테스트 제품 — 활성 HYP 없음.

## 현재 목표 (D1-shorten)

- **목표**: User can paste any valid URL and receive a working short link.
- **수용기준**: ShortenForm accepts a full URL and returns a short link that redirects to the original.
- **현재 dimension**: D1-shorten (최상단 — objective 최우선 차원)
- **비고**: SCR-610(merge-confirmed shipped gate) 전환으로 met 집합 재계산. 기존 product_verdict=pass 기록은 브랜치 green 확인이며 dimension met ≠ (gateway status:shipped 필요). D1부터 순차 재시작.

## North-star objective 진행

| 차원 | id | 상태 |
|---|---|---|
| URL 단축 | D1-shorten | ⏳ pending → **현재 목표** |
| 링크 복사 | D2-copy | ⏳ pending |
| 히스토리 + 클릭수 | D3-history | ⏳ pending |
| 잘못된 입력 거절 | D4-validation | ⏳ pending |

> met 판정 = Build Cycles `status: shipped` (SCR-610). 현재 schema에 shipped 값 미존재(SCR-609 prereq 미완료) → 전 차원 pending.

## 빌드 진행 (build cycles)

- **BC#56** · eval-url-shortener-22a465c7e085 · `dispatched` — product_verdict: **inconclusive** (D4-validation, PR/metrics 없어 signal 검증 불가)
- **BC#55** · eval-url-shortener-29ebe145e005 · `verdict` — product_verdict: **pass**
- **BC#40** · eval-url-shortener-9d68a7a31f50 · `verdict` — product_verdict: pass / final_verdict: not-achieved
- **BC#38** · eval-url-shortener-a4f28b475792 · `derdict` — product_verdict: **pass** / final_verdict: achieved

## 접근 방향

- **MVP 패턴**: Wizard of Oz (Ries Ch.6) — Next.js ShortenForm에서 URL 입력 → `/api/shorten` 서버액션 → DB 저장 + 단축 코드 반환 → 리다이렉트 검증.
- **피해야 할 anti-pattern**: scope_out 항목(auth·custom domain·analytics dashboard) 구현, D2·D3·D4 ahead-of-time 구현.

## 최근 인사이트 (30d)

(eval 제품 — 인터뷰 패턴 없음)

## Cross-link

- url-shortener Projects DB row: https://www.notion.so/37fff5099be2810ab12bc97f63b13209
- BC#56 Build Cycle: https://app.notion.com/p/eval-url-shortener-22a465c7e085-385ff5099be2815fafe9fb6c3661828d
- 배포 런북: https://app.notion.com/p/url-shortener-Vercel-2026-06-15-380ff5099be281969b38d14b302dd765

---
<!-- LEAN-STRATEGY-META rev=3 lean_startup_commit=20260620 generated_at=2026-06-20T13:09:16Z source_pages=3 -->
