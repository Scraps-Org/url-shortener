---
# 기계 goal contract (allocator goal_input.py primary 파싱 — Notion SCRAPS-GOAL fallback)
product: url-shortener
owner: lean-startup-agent
goal_version: 20260620
status: active
dimension_id: D3-history
objective: >
  User can see the links they created and how many times each was clicked.
acceptance:
  - id: A-1
    hint: >
      A list/table view shows created short links with a per-link click count that increments on redirect.
    high_impact: false
background: >
  URL shortener live on Vercel (Next.js). BC-58 targeted D2-copy:
  product_verdict=pass (2026-06-20). D3-history sequenced as next pending
  dimension — link history + per-link click counts complete the daily-use loop
  for non-technical users.
scope_out:
  - User accounts / auth.
  - Custom vanity domains.
  - Analytics dashboards beyond a per-link click count.
  - D1-shorten (effectively achieved, BC-57 final_verdict=achieved, product_verdict=pass)
  - D2-copy (effectively achieved, BC-58 product_verdict=pass — pending status=shipped gateway)
assumption: >
  A non-technical user who can see their created links and click counts trusts
  the app enough to use it daily without needing account features.
constraints:
  nda: false
  data_sensitivity: none
  redaction_note: ""
maturity_stage: wizard-sandbox
gtm_route: toy
engine: "N/A"
---

# Lean Strategy — url-shortener
Last updated: 2026-06-20 (lean-startup `/lean-strategy-push` rev 5)
Source: scraps Notion lean-validation (Build Cycles · Projects · objective-cycle sequencing)

> frontmatter = allocator 기계 입력(tight). 아래 본문 = 사람·coder 열람용(서사+진행). allocator는 frontmatter만 소비.

## 검증 중인 가설

이 제품에 연결된 검증 가설 없음 (eval 전용 루프 — 실제 제품 무영향).

## 현재 목표 (D3-history)

- **겨냥 차원**: D3-history — "User can see the links they created and how many times each was clicked."
- **acceptance signal**: A list/table view shows created short links with a per-link click count that increments on redirect.
- **시퀀싱 근거**: objective-cycle 판정(2026-06-20) — BC-58(D2-copy) `final_verdict=achieved` + `product_verdict=pass` 기록. D1·D2 사실상 완료; lean 전략 재량으로 yaml 파일 순서 #3 차원 D3-history로 전진. (`status: shipped` SCR-609 prereq 미구현으로 공식 met 집합은 여전히 빔 — 스키마 prereq 해결 시 자동 수렴 가능.)

## 빌드 진행 (build cycles)

| BC | correlation_id | status | final_verdict | product_verdict | dimension_id |
|----|---|---|---|---|---|
| BC-58 | eval-url-shortener-d83b836c5e2e | verdict | achieved | **pass** (2026-06-20 기록) | D2-copy |
| BC-57 | eval-url-shortener-e3a98c80d074 | verdict | achieved | pass (2026-06-20 기록) | D1-shorten |
| BC-56 | eval-url-shortener-22a465c7e085 | verdict | achieved | inconclusive | D4-validation |
| BC-55 | eval-url-shortener-29ebe145e005 | verdict | achieved | pass | — |
| BC-40 | eval-url-shortener-9d68a7a31f50 | verdict | not-achieved | pass | — |
| BC-38 | eval-url-shortener-a4f28b475792 | verdict | achieved | pass | — |

> ⚠️ **SCR-609/610 prereq 갭**: gateway의 `status=shipped` 마커 (PR 머지 확인) 미구현 → met 집합 공식 비어 있음. lean 전략 재량으로 시퀀싱 중 — yonggony(lean Notion 스키마 소유자) prereq ③ 해결 시 자동 수렴 가능.

## 최근 진행·열린 액션

- D2-copy cycle (BC-58): `final_verdict=achieved` + `product_verdict=pass` → D3-history 전진
- D1-shorten cycle (BC-57): `final_verdict=achieved` + `product_verdict=pass`
- D4-validation cycle (BC-56): `final_verdict=achieved` + `product_verdict=inconclusive` (PR 데이터 부재 → D4 signal 직접 검증 불가)
- 다음 사이클 예정: D3-history (현재 frontmatter `dimension_id`로 할당)

## 접근 방향

- **다음 우선순위 차원**: D3-history — 생성된 단축 링크 목록 + 각 링크별 클릭 수 표시 구현
- **추천 MVP 패턴**: Concierge MVP (Ries Ch.6) → 이미 Vercel 배포됨; D3-history는 링크 리스트 뷰 + 리다이렉트 시 클릭 카운트 증가 로직 구현으로 빠른 피드백
- **피해야 할 anti-pattern**: scope_out 침범(auth·vanity domain·고급 분석 대시보드); `shipped` 없이 `final_verdict=achieved`만으로 차원 수렴 선언; D4 재시도 선제 투입 → D3-history 단일 신호에 집중

## 최근 인사이트 (30d)

이 제품 관련 인터뷰·패턴 없음 (eval 전용 루프).

## 의사결정 로그

(이 제품 관련 macro 결정 없음 — eval 전용 루프)

## 최근 회의

(해당 없음)

## Cross-link

- url-shortener Projects DB row: https://www.notion.so/37fff5099be2810ab12bc97f63b13209
- BC-58 Build Cycle: https://app.notion.com/p/eval-url-shortener-d83b836c5e2e-385ff5099be28118b8a8e764f348fe51
- BC-57 Build Cycle: https://app.notion.com/p/eval-url-shortener-e3a98c80d074-385ff5099be28188856dc70fc1ce23d4
- 배포 런북: https://app.notion.com/p/url-shortener-Vercel-2026-06-15-380ff5099be281969b38d14b302dd765

---
<!-- LEAN-STRATEGY-META rev=5 lean_startup_commit=20260620 generated_at=2026-06-20T00:00:00Z source_pages=4 -->
