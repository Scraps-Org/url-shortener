---
# 기계 goal contract (allocator goal_input.py primary 파싱 — Notion SCRAPS-GOAL fallback)
product: url-shortener
owner: lean-startup-agent
goal_version: 7811e65
status: active
objective: >
  User can see the links they created and how many times each was clicked.
acceptance:
  - id: A-1
    hint: >
      A list/table view shows created short links with a per-link click count
      that increments on redirect.
    high_impact: false
background: >
  URL shortener is live on Vercel. D1 (shorten) and D2 (copy) are verified
  (PR #23, eval-url-shortener-a4f28b475792, product_verdict=pass). D3 adds
  history and click-count visibility — the remaining gap before the north-star
  objective is satisfied.
scope_out:
  - User accounts / auth
  - Custom vanity domains
  - Analytics dashboards beyond a per-link click count
  - D1 shorten — already met (do not re-implement)
  - D2 copy button — already met (do not re-implement)
assumption: >
  Displaying created links + click counts on the same page the user lands on
  is sufficient for non-technical daily use without requiring auth or accounts.
constraints:
  nda: false
  data_sensitivity: none
  redaction_note: ""
maturity_stage: wizard-sandbox
gtm_route: toy
engine: N/A
---

# Lean Strategy — url-shortener
Last updated: 2026-06-17 (lean-startup `/lean-strategy-push` rev 1)
Source: `products/url-shortener/objective.yaml` · Build Cycles DB · lean-objective-cycle

> frontmatter = allocator 기계 입력(tight). 아래 본문 = 사람·coder 열람용(서사+진행). allocator는 frontmatter만 소비.

## 검증 중인 가설

이 제품은 eval 루프 검증용 테스트 제품 (실제 제품 무영향). 활성 HYP 없음.

## 현재 목표 (D3-history)

- **목표**: User can see the links they created and how many times each was clicked.
- **수용 기준**: A list/table view shows created short links with a per-link click count that increments on redirect.
- **다음 후보 (D4-validation)**: Invalid input is rejected with a clear inline message (no silent failure / no broken link).

## North-star objective 진행 현황

| 차원 | id | 상태 |
|---|---|---|
| 단축 URL 생성 | D1-shorten | ✅ met (PR #23, a4f28b) |
| 한 번에 복사 | D2-copy | ✅ met (same cycle) |
| 히스토리·클릭수 | D3-history | ⏳ pending ← **현재 목표** |
| 유효성 검사 메시지 | D4-validation | ⏳ pending |

## 빌드 진행 (build cycles)

- **BC-38** · eval-url-shortener-a4f28b475792 · `verdict` — product_verdict: **pass** (D1+D2 충족, Vercel green)
- **BC-37** · eval-url-shortener-8acd3badd89c · `dispatched` — D3 cycle 진행 중

## 접근 방향

- **MVP 패턴**: Wizard of Oz (Ries Ch.6) — Next.js 앱에 서버-side 클릭 카운터 + 링크 목록 페이지 추가. 별도 백엔드 서비스 없이 Vercel 호스팅 범위 내.
- **제약**: No backend service beyond what Vercel hosts — Vercel KV / Vercel Postgres 또는 기존 in-memory store 활용.
- **피해야 할 anti-pattern**: 계정·인증(scope_out) 먼저 빌드하거나, 클릭 분석 대시보드(scope_out) 선행.

## 의사결정 로그

(이 제품 관련 macro 결정 없음 — eval 전용 루프)

## 최근 회의

(해당 없음)

## Cross-link

- url-shortener Projects DB row: https://www.notion.so/37fff5099be2810ab12bc97f63b13209
- BC-38 Build Cycle: https://app.notion.com/p/eval-url-shortener-a4f28b475792-381ff5099be281728319e28a7388f4ca
- 배포 런북: https://app.notion.com/p/url-shortener-Vercel-2026-06-15-380ff5099be281969b38d14b302dd765

---
<!-- LEAN-STRATEGY-META rev=1 lean_startup_commit=7811e65 generated_at=2026-06-17T00:00:00Z source_pages=3 -->
