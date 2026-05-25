# WCAG API 응답 형식 - 긴급 수정 요청

**상황:** 현재 백엔드에서 보내는 flat format은 **페이지 정보가 완전히 없어서 불가능합니다.**

---

## 문제점: 현재 flat format

```json
{
  "score": 98,
  "wcagLabel": "AAA",
  "distributionCritical": 1,
  "distributionModerate": 0,
  "distributionMinor": 0,
  "issues": [
    {
      "wcagIssueId": "92a0c5b4-8d79-4639-aa76-6e82de6e4abe",
      "title": "색상 대비 부족",
      "severity": "Critical",
      "description": "...",
      "html": "<p class=\"d\">편안한 실루엣</p>",
      "wcagCriteria": "1.4.3"
    }
  ]
}
```

**문제:**
- ❌ 이 에러가 **어느 페이지에서** 발견됐는지 알 수 없음
- ❌ 여러 페이지를 테스트했을 때 **어느 페이지의 에러인지 분류 불가능**
- ❌ 각 issue에 `pageUrl` 정보가 없음
- ❌ **이 형식으로는 페이지별 표시 불가능**

---

## 필수 수정: pages[] format으로 변경

```json
{
  "pages": [
    {
      "order": 1,
      "pageUrl": "https://example.com/page1",
      "pageName": "Home Page",
      "score": 98,
      "wcagLabel": "AAA",
      "totalIssueCount": 1,
      "distribution": {
        "critical": 1,
        "moderate": 0,
        "minor": 0
      },
      "issues": [
        {
          "wcagIssueId": "92a0c5b4-8d79-4639-aa76-6e82de6e4abe",
          "title": "색상 대비 부족",
          "severity": "Critical",
          "description": "...",
          "html": "<p class=\"d\">편안한 실루엣</p>",
          "wcagCriteria": "1.4.3"
        }
      ]
    },
    {
      "order": 2,
      "pageUrl": "https://example.com/page2",
      "pageName": "Product Page",
      "score": 85,
      "wcagLabel": "AA",
      "totalIssueCount": 3,
      "distribution": {
        "critical": 0,
        "moderate": 2,
        "minor": 1
      },
      "issues": [...]
    }
  ]
}
```

**이제 가능해지는 것:**
- ✅ 각 페이지별로 score, 에러 개수 다름
- ✅ 어느 페이지에서 어떤 에러가 발견됐는지 명확
- ✅ FE에서 페이지별로 표시 가능
- ✅ 좌측 사이드바에서 페이지 선택 가능

---

## 필수 필드

### pages 배열의 각 객체
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `order` | number | ✅ | 페이지 순서 (1, 2, 3...) |
| `pageUrl` | string | ✅ | **테스트한 페이지의 전체 URL** |
| `pageName` | string | ⚠️ | 페이지 표시명 (선택사항, pageUrl에서 자동 생성 가능) |
| `score` | number | ✅ | 이 페이지의 WCAG 점수 (0-100) |
| `wcagLabel` | string | ✅ | WCAG 레벨 ("A", "AA", "AAA") |
| `totalIssueCount` | number | ⚠️ | 이 페이지의 총 이슈 개수 |
| `distribution` | object | ✅ | `{ critical: n, moderate: n, minor: n }` |
| `issues` | array | ✅ | **이 페이지에서만 발견된 이슈들** |

---

## 왜 pages[] 형식이어야 하는가

### 예시: 3개 페이지 테스트
```
홈페이지 (/) → 5개 이슈, 점수 85점
상품페이지 (/products) → 2개 이슈, 점수 92점
연락처 (/contact) → 0개 이슈, 점수 98점
```

**flat format (현재):** 모든 이슈가 섞여서 옴
```json
{
  "score": 85,  // 어느 페이지의 점수?
  "issues": [ ...모든 이슈 7개 섞여서... ]
}
```

**pages[] format (필요):** 페이지별로 명확하게 구분
```json
{
  "pages": [
    { "pageUrl": "/", "score": 85, "issues": [...5개] },
    { "pageUrl": "/products", "score": 92, "issues": [...2개] },
    { "pageUrl": "/contact", "score": 98, "issues": [...0개] }
  ]
}
```

---

## 참고: 다른 페이지들은 이미 이 형식으로 받고 있습니다

### Issues 페이지 (주요이슈)
```json
{
  "pages": [
    {
      "pageId": "...",
      "pageUrl": "https://...",
      "pageName": "...",
      "issues": [...]
    }
  ]
}
```

### Heatmap 페이지 (히트맵)
```json
{
  "pages": [
    {
      "pageUrl": "https://...",
      "errorPoints": [...]
    }
  ]
}
```

**WCAG도 동일한 pages[] 형식으로 변경해야 합니다.**

---

## 변경 요청 요약

| 항목 | 현재 | 필요 |
|------|------|------|
| **응답 형식** | flat (aggregate) | pages[] (per-page) |
| **페이지 정보** | ❌ 없음 | ✅ 필수 |
| **각 이슈의 페이지** | ❌ 불명 | ✅ 명확 |
| **FE 페이지 표시** | ❌ 불가능 | ✅ 가능 |

---

## 체크리스트

백엔드에서 수정할 때 확인하세요:

- [ ] `/api/simulations/{simulationId}/wcag` 응답을 `pages[]` 배열로 변경
- [ ] 테스트한 각 페이지마다 페이지 객체 생성
- [ ] 각 페이지마다 `pageUrl` (전체 URL) 포함
- [ ] 각 페이지의 에러만 해당 `issues` 배열에 포함
- [ ] 각 페이지의 `score`, `distribution` 계산 정확
- [ ] 테스트: 2개 이상 페이지에서 다양한 에러 발생하는 케이스로 검증

---

## FE 상태

✅ **FE는 이미 준비됨**
- ResultWcagPage: pages[] 지원 완벽
- 좌측 사이드바: 페이지 선택 기능 준비됨
- Adapter: pages[] 파싱 완벽

**백엔드만 변경하면 즉시 작동합니다.**

---

**이 수정이 필수입니다. flat format으로는 구현 불가능합니다.**
