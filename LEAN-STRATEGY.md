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
    hint: >
      ShortenForm accepts a full URL and returns a short link that redirects to the original.
    high_impact: false
background: >
  URL shortener is live on Vercel (Next.js). Latest cycle BC-56 targeted D4-validation
  (final_verdict=achieved, product_verdict=inconclusive — PR data insufficient for signal
  verification). Gateway status=shipped (SCR-609 prereq) not yet in Build Cycles → met set
  empty per lean SoT; D1-shorten sequenced as first pending dimension per north-star objective.
scope_out:
  - User accounts / auth.
  - Custom vanity domains.
  - Analytics dashboards beyond a per-link click count.
assumption: >
  A non-technical user can rely on the app daily if the core
  paste-and-get-short-link flow works reliably end-to-end.
constraints:
  nda: false
  data_sensitivity: none
  redaction_note: ""
maturity_stage: wizard-sandbox
gtm_route: toy
engine: "N/A"
---

# Lean Strategy — url-shortener
Last updated: 2026-06-20 (lean-startup `/lean-strategy-push` rev 3)
Source: scraps Notion lean-validation (Build Cycles · Projects · objective-cycle sequencing)

> frontmatter = allocator 기계 입력(tight). 아래 본문 = 사람·coder 열람용(서사+진행). allocator는 frontmatter만 소비.

## 검증 중인 가설

이 제품에 연결된 검증 가설 없음 (eval 전용 루프 — 실제 제품 무영향).

## 현재 목표 (D1-shorten)

- **겨냥 차원**: D1-shorten — "User can paste any valid URL and receive a working short link."
- **acceptance signal**: ShortenForm accepts a full URL and returns a short link that redirects to the original.
- **시퀀싱 근거**: objective-cycle 판정(2026-06-20) — Build Cycles `status: shipped` (SCR-609) 미구현으로 met 집합 비어 있음; yaml 파일 순서(= 우선순위) 기준 D1-shorten이 첫 번째 pending 차원.

## 빌드 진행 (build cycles)

| BC | correlation_id | status | final_verdict | product_verdict | dimension_id |
|----|---|---|---|---|---|
| BC-56 | eval-url-shortener-22a465c7e085 | verdict | achieved | **inconclusive** (2026-06-20 기록) | D4-validation |
| BC-55 | eval-url-shortener-29ebe145e005 | verdict | achieved | pass | — |
| BC-40 | eval-url-shortener-9d68a7a31f50 | verdict | not-achieved | pass | — |
| BC-39 | eval-url-shortener-e2b3f7626248 | verdict | not-achieved | — | — |
| BC-38 | eval-url-shortener-a4f28b475792 | verdict | achieved | pass | — |

> ⚠️ **SCR-609 prereq 갭**: gateway가 PR 머지 시 `status=shipped` 마커를 Build Cycles에 쓰는 기능이 미구현. met 집합이 항상 비어 수렴 불가 상태 — yonggony(lean Notion 스키마 소유자) prereq ③ 해결 필요.

## 최근 진행·열린 액션

- D4-validation cycle (BC-56): `final_verdict=achieved` (게이트웨이 기술 green) → lean `product_verdict=inconclusive` (PR 본문 데이터 부재로 D4 signal 직접 검증 불가)
- 다음 사이클 예정: D1-shorten (현재 frontmatter dimension_id로 할당됨)

## 접근 방향

- **다음 우선순위 차원**: D1-shorten (yaml 파일 순서 #1 — `status: shipped` prereq 해결 전까지 수렴 불가이므로 이 차원부터 명시적 검증)
- **추천 MVP 패턴**: Smoke Test MVP (Ries Ch.6) — 이미 Vercel 배포됨; 실 사용자에게 단축 링크 생성 흐름을 노출해 클릭-to-redirect 동작 검증
- **피해야 할 anti-pattern**: scope_out 침범(auth·vanity domain·분석 대시보드); `shipped` 없는 `final_verdict=achieved`만으로 차원 수렴 선언; PR 데이터 없는 `pass` 판정

## 최근 인사이트 (30d)

이 제품 관련 인터뷰·패턴 없음 (eval 전용 루프).

## 의사결정 로그

(이 제품 관련 macro 결정 없음 — eval 전용 루프)

## 최근 회의

(해당 없음)

## Cross-link

- url-shortener Projects DB row: https://www.notion.so/37fff5099be2810ab12bc97f63b13209
- BC-56 Build Cycle: https://app.notion.com/p/eval-url-shortener-22a465c7e085-385ff5099be2815fafe9fb6c3661828d
- BC-55 Build Cycle: https://app.notion.com/p/eval-url-shortener-29ebe145e005-385ff5099be281809e47f1db7cea188f
- 배포 런북: https://app.notion.com/p/url-shortener-Vercel-2026-06-15-380ff5099be281969b38d14b302dd765

---
<!-- LEAN-STRATEGY-META rev=3 lean_startup_commit=20260620 generated_at=2026-06-20T09:00:00Z source_pages=3 -->
