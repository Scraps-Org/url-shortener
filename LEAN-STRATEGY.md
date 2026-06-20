---
# 기계 goal contract (allocator goal_input.py primary 파싱 — Notion SCRAPS-GOAL fallback)
product: url-shortener
owner: lean-startup-agent
goal_version: 20260620
status: active
dimension_id: D4-validation
objective: >
  Invalid input is rejected with a clear inline message (no silent failure / no broken link).
acceptance:
  - id: A-1
    hint: >
      Submitting a non-URL or empty value shows an inline error; no short link is created.
    high_impact: false
background: >
  URL shortener is live on Vercel. D1 (shorten), D2 (copy), D3 (history + click count)
  are all verified. D4 adds inline validation so invalid input shows a clear error and
  no short link is created — the final dimension before the north-star objective converges.
scope_out:
  - User accounts / auth
  - Custom vanity domains
  - Analytics dashboards beyond a per-link click count
  - D1-shorten — already met (do not re-implement)
  - D2-copy — already met (do not re-implement)
  - D3-history — already met (do not re-implement)
assumption: >
  Client-side + server-side URL validation without auth is sufficient to prevent silent
  failures and broken links for non-technical daily use.
constraints:
  nda: false
  data_sensitivity: none
  redaction_note: ""
maturity_stage: wizard-sandbox
gtm_route: toy
engine: N/A
---

# Lean Strategy — url-shortener
Last updated: 2026-06-20 (lean-startup `/lean-strategy-push` rev 2)
Source: `products/url-shortener/objective.yaml` · Build Cycles DB · lean-objective-cycle

> frontmatter = allocator 기계 입력(tight). 아래 본문 = 사람·coder 열람용(서사+진행). allocator는 frontmatter만 소비.

## 검증 중인 가설

이 제품은 eval 루프 검증용 테스트 제품 (실제 제품 무영향). 활성 HYP 없음.

## 현재 목표 (D4-validation)

- **목표**: Invalid input is rejected with a clear inline message (no silent failure / no broken link).
- **수용 기준**: Submitting a non-URL or empty value shows an inline error; no short link is created.
- **수렴까지 남은 차원**: D4-validation 1개 (이후 모든 차원 met → objective 수렴)

## North-star objective 진행 현황

| 차원 | id | 상태 |
|---|---|---|
| 단축 URL 생성 | D1-shorten | ✅ met (BC#38 · product_verdict=pass) |
| 한 번에 복사 | D2-copy | ✅ met (BC#38 · same cycle) |
| 히스토리·클릭수 | D3-history | ✅ met (BC#40 · product_verdict=pass) |
| 유효성 검사 메시지 | D4-validation | ⏳ pending ← **현재 목표** |

## 빌드 진행 (build cycles)

- **BC#40** · eval-url-shortener-9d68a7a31f50 · `verdict` — product_verdict: **pass** (D3-history: LinksTable + recordClick on redirect, build green)
- **BC#39** · eval-url-shortener-e2b3f7626248 · `verdict` — final_verdict: not-achieved (D3 이전 시도, product_verdict 미기록)
- **BC#38** · eval-url-shortener-a4f28b475792 · `verdict` — product_verdict: **pass** (D1+D2 충족, Vercel green)

## 접근 방향

- **MVP 패턴**: Wizard of Oz (Ries Ch.6) — Next.js ShortenForm에 client-side URL regex 검사 + 서버-side `isValidUrl()` 거부 응답 → inline error message 표시. 별도 백엔드 불필요.
- **제약**: No backend service beyond what Vercel hosts — 기존 `shorten()` 함수의 `isValidUrl()` 이미 존재, UI 레이어 연결이 핵심.
- **피해야 할 anti-pattern**: 계정·인증(scope_out), 클릭 분석 대시보드(scope_out), 이미 met된 D1·D2·D3 재구현.

## 의사결정 로그

(이 제품 관련 macro 결정 없음 — eval 전용 루프)

## 최근 회의

(해당 없음)

## Cross-link

- url-shortener Projects DB row: https://www.notion.so/37fff5099be2810ab12bc97f63b13209
- BC#40 Build Cycle: https://app.notion.com/p/eval-url-shortener-9d68a7a31f50-383ff5099be28120b14de37a659cd802
- BC#38 Build Cycle: https://app.notion.com/p/eval-url-shortener-a4f28b475792-381ff5099be281728319e28a7388f4ca
- 배포 런북: https://app.notion.com/p/url-shortener-Vercel-2026-06-15-380ff5099be281969b38d14b302dd765

---
<!-- LEAN-STRATEGY-META rev=2 lean_startup_commit=20260620 generated_at=2026-06-20T00:00:00Z source_pages=3 -->
