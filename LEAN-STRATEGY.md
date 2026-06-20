---
# 기계 goal contract (allocator goal_input.py primary 파싱 — Notion SCRAPS-GOAL fallback)
product: url-shortener
owner: lean-startup-agent
goal_version: 20260620
status: active
dimension_id: D2-copy
objective: >
  User can copy the short link in one action.
acceptance:
  - id: A-1
    hint: >
      A copy control next to the result copies the short link to the clipboard.
    high_impact: false
background: >
  URL shortener live on Vercel (Next.js). BC-57 targeted D1-shorten:
  final_verdict=achieved, product_verdict=pass (2026-06-20). D2-copy sequenced
  as next pending dimension — copy-to-clipboard is the key usability gate after
  the shorten flow works.
scope_out:
  - User accounts / auth.
  - Custom vanity domains.
  - Analytics dashboards beyond a per-link click count.
  - D1-shorten (ShortenForm shorten flow — effectively achieved, BC-57 final_verdict=achieved)
assumption: >
  A non-technical user needs a one-action copy control to rely on the app daily;
  manual text selection is a friction point that prevents repeat use.
constraints:
  nda: false
  data_sensitivity: none
  redaction_note: ""
maturity_stage: wizard-sandbox
gtm_route: toy
engine: "N/A"
---

# Lean Strategy — url-shortener
Last updated: 2026-06-20 (lean-startup `/lean-strategy-push` rev 4)
Source: scraps Notion lean-validation (Build Cycles · Projects · objective-cycle sequencing)

> frontmatter = allocator 기계 입력(tight). 아래 본문 = 사람·coder 열람용(서사+진행). allocator는 frontmatter만 소비.

## 검증 중인 가설

이 제품에 연결된 검증 가설 없음 (eval 전용 루프 — 실제 제품 무영향).

## 현재 목표 (D2-copy)

- **겨냥 차원**: D2-copy — "User can copy the short link in one action."
- **acceptance signal**: A copy control next to the result copies the short link to the clipboard.
- **시퀀싱 근거**: objective-cycle 판정(2026-06-20) — BC-57(D1-shorten) `final_verdict=achieved` + `product_verdict=pass` 기록. D1-shorten 사실상 완료; lean 전략 재량으로 yaml 파일 순서 #2 차원 D2-copy로 전진. (`status: shipped` SCR-609 prereq 미구현으로 공식 met 집합은 여전히 빔 — 스키마 prereq 해결 전까지 이 전략 재량 시퀀싱 유지.)

## 빌드 진행 (build cycles)

| BC | correlation_id | status | final_verdict | product_verdict | dimension_id |
|----|---|---|---|---|---|
| BC-57 | eval-url-shortener-e3a98c80d074 | verdict | achieved | **pass** (2026-06-20 기록) | D1-shorten |
| BC-56 | eval-url-shortener-22a465c7e085 | verdict | achieved | inconclusive (2026-06-20 기록) | D4-validation |
| BC-55 | eval-url-shortener-29ebe145e005 | verdict | achieved | pass | — |
| BC-40 | eval-url-shortener-9d68a7a31f50 | verdict | not-achieved | pass | — |
| BC-38 | eval-url-shortener-a4f28b475792 | verdict | achieved | pass | — |

> ⚠️ **SCR-609/610 prereq 갭**: gateway의 `status=shipped` 마커 (PR 머지 확인) 미구현 → met 집합 공식 비어 있음. lean 전략 재량으로 시퀀싱 중 — yonggony(lean Notion 스키마 소유자) prereq ③ 해결 시 자동 수렴 가능.

## 최근 진행·열린 액션

- D1-shorten cycle (BC-57): `final_verdict=achieved` + `product_verdict=pass` → D2-copy 전진
- D4-validation cycle (BC-56): `final_verdict=achieved` + `product_verdict=inconclusive` (PR 데이터 부재 → D4 signal 직접 검증 불가)
- 다음 사이클 예정: D2-copy (현재 frontmatter `dimension_id`로 할당)

## 접근 방향

- **다음 우선순위 차원**: D2-copy — 클립보드 복사 버튼/컨트롤 구현 (단축 결과 옆)
- **추천 MVP 패턴**: Concierge MVP (Ries Ch.6) → 이미 Vercel 배포됨; D2-copy는 UI 컨트롤 1개 추가이므로 직접 구현 후 clipboard API 동작 검증으로 빠른 피드백
- **피해야 할 anti-pattern**: scope_out 침범(auth·vanity domain·분석 대시보드); `shipped` 없이 `final_verdict=achieved`만으로 차원 수렴 선언; D3/D4 사전 구현 → 지금은 D2-copy 단일 신호에 집중

## 최근 인사이트 (30d)

이 제품 관련 인터뷰·패턴 없음 (eval 전용 루프).

## 의사결정 로그

(이 제품 관련 macro 결정 없음 — eval 전용 루프)

## 최근 회의

(해당 없음)

## Cross-link

- url-shortener Projects DB row: https://www.notion.so/37fff5099be2810ab12bc97f63b13209
- BC-57 Build Cycle: https://app.notion.com/p/eval-url-shortener-e3a98c80d074-385ff5099be28188856dc70fc1ce23d4
- BC-56 Build Cycle: https://app.notion.com/p/eval-url-shortener-22a465c7e085-385ff5099be2815fafe9fb6c3661828d
- 배포 런북: https://app.notion.com/p/url-shortener-Vercel-2026-06-15-380ff5099be281969b38d14b302dd765

---
<!-- LEAN-STRATEGY-META rev=4 lean_startup_commit=20260620 generated_at=2026-06-20T00:00:00Z source_pages=3 -->
