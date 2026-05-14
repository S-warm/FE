export type WcagSeverity = "Critical" | "Moderate" | "Minor"
export type WcagLabel = "AAA" | "AA" | "A" | "미달"

export interface WcagViolation {
  wcagIssueId: string
  title: string
  severity: WcagSeverity
  description: string
  html: string
  wcag_criteria: string
}

export interface WcagUrlResult {
  score: number
  wcagLabel: WcagLabel
  distribution: {
    Critical: number
    Moderate: number
    Minor: number
  }
  violations: WcagViolation[]
}

export interface WcagData {
  urls: {
    [url: string]: WcagUrlResult
  }
}

export const wcagMockData: WcagData = {
  urls: {
    "https://a-mall.com/login": {
      score: 50,
      wcagLabel: "미달",
      distribution: {
        Critical: 2,
        Moderate: 2,
        Minor: 1,
      },
      violations: [
        {
          wcagIssueId: "ea323eb9-a74b-92de-43d6-3cf79beece6e",
          title: "텍스트 대비율 미달",
          severity: "Critical" as const,
          description: "로그인 버튼의 전경(#5B6B8A)과 배경(#E8EEF7) 대비비가 1.18:1로 WCAG 2.1 AA 정상 텍스트 기준 4.5:1을 미달합니다.",
          html: "<button class=\"login-submit\">로그인</button>",
          wcag_criteria: "1.4.3",
        },
        {
          wcagIssueId: "274d183c-7583-5ef5-5473-f6a8714e1353",
          title: "필수 입력 구조 전달 부족",
          severity: "Critical" as const,
          description: "입력 필드에 aria-required 속성이 없어 스크린리더가 필수 여부를 안내하지 못합니다.",
          html: "<input type=\"text\" placeholder=\"아이디\" />",
          wcag_criteria: "1.3.1",
        },
        {
          wcagIssueId: "5e526b9b-994b-e1fe-03cb-d307dddc5860",
          title: "오류 메시지 위치 분리",
          severity: "Moderate" as const,
          description: "로그인 실패 시 오류 메시지가 폼 상단에만 표시되어 입력 필드와 시각·구조적으로 분리되어 있습니다.",
          html: "<div class=\"error-banner\" role=\"alert\">아이디 또는 비밀번호가 일치하지 않습니다</div>",
          wcag_criteria: "3.3.1",
        },
        {
          wcagIssueId: "0fdf920d-4c12-b2d6-0d9e-beabeae2603d",
          title: "Placeholder 텍스트 대비 부족",
          severity: "Moderate" as const,
          description: "Placeholder 텍스트(#CBD5E1)와 배경(#FFFFFF) 대비비가 2.1:1로 비텍스트 기준 3:1을 미달합니다.",
          html: "<input placeholder=\"아이디를 입력하세요\" />",
          wcag_criteria: "1.4.11",
        },
        {
          wcagIssueId: "684936b6-846c-5aae-23b1-6aeb6a5941f5",
          title: "비밀번호 보기 버튼 포커스 약함",
          severity: "Minor" as const,
          description: "비밀번호 표시 토글 버튼의 키보드 포커스 outline이 dotted 1px로 시각적 대비가 낮습니다.",
          html: "<button class=\"password-toggle\">",
          wcag_criteria: "2.4.7",
        },
      ],
    },
    "https://a-mall.com/signup": {
      score: 30,
      wcagLabel: "미달",
      distribution: {
        Critical: 2,
        Moderate: 3,
        Minor: 2,
      },
      violations: [
        {
          wcagIssueId: "05bd2fe5-1757-311e-45f3-ab81dc55b0b2",
          title: "필수 입력 정보 구조 미전달",
          severity: "Critical" as const,
          description: "필수 항목이 빨간 asterisk만으로 구분되며 aria-required 및 텍스트 라벨이 없습니다.",
          html: "<label>이메일 <span style=\"color:red\">*</span></label>",
          wcag_criteria: "1.3.1, 1.4.1",
        },
        {
          wcagIssueId: "793121f2-82fd-04a3-0ccb-9a7b4b15f04c",
          title: "인증번호 흐름 포커스 이동 불안정",
          severity: "Critical" as const,
          description: "분할된 인증번호 입력 박스에서 자동 포커스 이동이 일부 환경에서 동작하지 않습니다.",
          html: "<input class=\"otp-digit\" maxlength=\"1\" />",
          wcag_criteria: "2.4.3",
        },
        {
          wcagIssueId: "4a4e1bda-53f4-4a44-1c92-9f42c8d57666",
          title: "비밀번호 조건 안내 노출 지연",
          severity: "Moderate" as const,
          description: "비밀번호 규칙이 포커스 시에만 표시되어 입력 전 사전 인지가 불가능합니다.",
          html: "<div class=\"password-hint\" data-show-on=\"focus\">",
          wcag_criteria: "3.3.2",
        },
        {
          wcagIssueId: "d9b19290-d4a7-7b6d-5f2a-cc2c8d0b6831",
          title: "약관 체크박스 라벨 클릭 영역 부재",
          severity: "Moderate" as const,
          description: "체크박스와 인접 텍스트가 단일 클릭 영역으로 묶이지 않아 접근성이 저하됩니다.",
          html: "<input type=\"checkbox\" id=\"agree-marketing\" />",
          wcag_criteria: "2.5.5",
        },
        {
          wcagIssueId: "a3c0559e-b10b-8a6a-50c7-86d244a0157f",
          title: "실시간 검증 부재",
          severity: "Moderate" as const,
          description: "이메일 형식 오류가 blur 시점이 아닌 제출 후에만 표시됩니다.",
          html: "<input type=\"email\" name=\"email\" />",
          wcag_criteria: "3.3.1",
        },
        {
          wcagIssueId: "f430c737-60b9-339d-4f43-29e4f8975080",
          title: "생년월일 형식 안내 부족",
          severity: "Minor" as const,
          description: "Placeholder만으로 형식을 안내하여 화면 외부에서는 형식을 알 수 없습니다.",
          html: "<input name=\"birth\" placeholder=\"1990-01-01\" />",
          wcag_criteria: "3.3.2",
        },
        {
          wcagIssueId: "37996703-7b44-af3e-a134-46f42badc675",
          title: "기본 체크 옵션 명시성 부족",
          severity: "Minor" as const,
          description: "마케팅 동의 등 선택 항목의 기본 체크 여부가 시각적으로 명확하지 않습니다.",
          html: "<input type=\"checkbox\" id=\"agree-marketing\" />",
          wcag_criteria: "3.3.4",
        },
      ],
    },
    "https://a-mall.com/main": {
      score: 40,
      wcagLabel: "미달",
      distribution: {
        Critical: 2,
        Moderate: 3,
        Minor: 1,
      },
      violations: [
        {
          wcagIssueId: "dd384543-2506-6db5-0c4e-125472dc4493",
          title: "히어로 CTA 대비 부족",
          severity: "Critical" as const,
          description: "히어로 영역 CTA 전경(#475569)과 배경(#E5E7EB) 대비비가 3.20:1로 텍스트 기준 4.5:1을 미달합니다.",
          html: "<a data-cta=\"primary\" class=\"hero-cta\">쇼핑 시작하기</a>",
          wcag_criteria: "1.4.3",
        },
        {
          wcagIssueId: "5dfb6b6d-d227-85d2-297e-b6b24e3f4f37",
          title: "카테고리 메뉴 호버 의존",
          severity: "Critical" as const,
          description: "메인 카테고리 메뉴가 마우스 호버로만 열려 키보드·터치 사용자가 접근할 수 없습니다.",
          html: "<nav class=\"category-menu\" data-trigger=\"hover\">",
          wcag_criteria: "2.1.1",
        },
        {
          wcagIssueId: "250dd124-09e9-e094-e7a3-90ed86fb7c0f",
          title: "상품 카드 보조 정보 가독성 약함",
          severity: "Moderate" as const,
          description: "상품 카드의 가격·리뷰가 14px·#94A3B8로 표기되어 가독 기준에 못 미칩니다.",
          html: "<span class=\"product-price\">29,800원</span>",
          wcag_criteria: "1.4.4",
        },
        {
          wcagIssueId: "039031ed-4fcc-6011-f562-609a1289a1a2",
          title: "배너 슬라이드 일시 정지 미지원",
          severity: "Moderate" as const,
          description: "히어로 슬라이드가 3초 간격 자동 전환되며 일시 정지 컨트롤이 없습니다.",
          html: "<div class=\"hero-slider\" data-interval=\"3000\">",
          wcag_criteria: "2.2.2",
        },
        {
          wcagIssueId: "8ef176e6-84c2-579a-abb6-c1d35b4313ed",
          title: "검색창 접근 단계 다중화",
          severity: "Moderate" as const,
          description: "검색이 아이콘 토글로만 노출되어 1차 시선에서 접근이 어렵습니다.",
          html: "<button class=\"header-search-toggle\">",
          wcag_criteria: "2.4.5",
        },
        {
          wcagIssueId: "e1962e1a-f757-4fb5-b18e-abba0bbc6877",
          title: "장식 이미지 대체 설명 불충분",
          severity: "Minor" as const,
          description: "히어로 배너 이미지에 빈 alt 속성이 있으나 인접 텍스트로 의미가 전달되지 않습니다.",
          html: "<img src=\"/banner.jpg\" alt=\"\" />",
          wcag_criteria: "1.1.1",
        },
      ],
    },
    "https://a-mall.com/product/12847": {
      score: 40,
      wcagLabel: "미달",
      distribution: {
        Critical: 1,
        Moderate: 3,
        Minor: 2,
      },
      violations: [
        {
          wcagIssueId: "98213dc6-7caa-35b3-c786-c5c71f46f294",
          title: "장바구니 담기 버튼 위치 비표준",
          severity: "Critical" as const,
          description: "주요 행동 버튼이 페이지 하단에 위치하여 콘텐츠 순서·키보드 탐색 순서가 비논리적입니다.",
          html: "<button class=\"add-to-cart bottom-floating\">장바구니 담기</button>",
          wcag_criteria: "1.3.2",
        },
        {
          wcagIssueId: "b6a10c07-c682-80ca-f2bf-377db58a8446",
          title: "옵션 선택 드롭다운 터치 영역 부족",
          severity: "Moderate" as const,
          description: "사이즈·색상 선택 드롭다운이 28x28px로 WCAG 권장 44x44px 미달입니다.",
          html: "<select class=\"option-selector\" name=\"size\">",
          wcag_criteria: "2.5.5",
        },
        {
          wcagIssueId: "dc4ee346-9aa7-735c-66e1-18f4f4e51947",
          title: "리뷰 별점 색상 의존",
          severity: "Moderate" as const,
          description: "리뷰 별점이 노란·회색만으로 구분되며 텍스트 점수가 인접 표기되지 않습니다.",
          html: "<div class=\"star-rating\" data-score=\"4.2\">",
          wcag_criteria: "1.4.1",
        },
        {
          wcagIssueId: "79ddc719-cab1-d120-663b-4809756ae8c8",
          title: "이미지 확대 버튼 인지 어려움",
          severity: "Moderate" as const,
          description: "확대 버튼이 14x14px 모서리 배치로 발견이 어렵고 키보드 포커스 표시도 약합니다.",
          html: "<button class=\"image-zoom\" aria-label=\"확대\">",
          wcag_criteria: "2.4.7",
        },
        {
          wcagIssueId: "6ad2ca96-64ff-cf66-5f75-d389782aa436",
          title: "재고 표시 가독성 부족",
          severity: "Minor" as const,
          description: "'재고 N개 남음' 문구가 12px로 매우 작게 표기됩니다.",
          html: "<span class=\"stock-warning\">재고 3개 남음</span>",
          wcag_criteria: "1.4.4",
        },
        {
          wcagIssueId: "6b72db31-b65e-96dc-5e63-d740e7f9eeb1",
          title: "상품 정보 헤딩 위계 누락",
          severity: "Minor" as const,
          description: "상품명이 h1 없이 div로 표기되어 스크린리더 헤딩 탐색이 어렵습니다.",
          html: "<div class=\"product-title\">스마트 향초 디퓨저</div>",
          wcag_criteria: "1.3.1",
        },
      ],
    },
    "https://a-mall.com/cart": {
      score: 40,
      wcagLabel: "미달",
      distribution: {
        Critical: 2,
        Moderate: 3,
        Minor: 1,
      },
      violations: [
        {
          wcagIssueId: "2dc9100b-cfe1-980e-6990-dbb7de6619ec",
          title: "수량 변경 버튼 터치 영역 미달",
          severity: "Critical" as const,
          description: "+/- 버튼이 22x22px로 WCAG 권장 44x44px를 크게 미달합니다.",
          html: "<button class=\"qty-btn qty-decrease\">-</button>",
          wcag_criteria: "2.5.5",
        },
        {
          wcagIssueId: "68c4b955-6fce-fe8b-5293-6ab95367f8ff",
          title: "삭제 동작 확인 단계 부재",
          severity: "Critical" as const,
          description: "휴지통 아이콘 클릭만으로 즉시 삭제되어 의도치 않은 삭제 시 되돌릴 수 없습니다.",
          html: "<button class=\"cart-item-delete\" aria-label=\"삭제\">",
          wcag_criteria: "3.3.4",
        },
        {
          wcagIssueId: "804ba02f-861a-d1c7-e522-85b67bf30a49",
          title: "비활성 주문 버튼 사유 미표시",
          severity: "Moderate" as const,
          description: "주문하기 버튼 비활성화 사유가 aria-describedby 등으로 안내되지 않습니다.",
          html: "<button class=\"order-submit\" disabled>주문하기</button>",
          wcag_criteria: "3.3.1",
        },
        {
          wcagIssueId: "755469cc-7494-1972-25e0-bc9abb83424c",
          title: "쿠폰 영역 발견 가능성 부족",
          severity: "Moderate" as const,
          description: "쿠폰 적용 메뉴가 아코디언 내부에 숨겨져 시각·키보드 탐색에서 발견이 어렵습니다.",
          html: "<details class=\"coupon-accordion\">",
          wcag_criteria: "2.4.5",
        },
        {
          wcagIssueId: "f908a3d9-1060-0e58-a6b6-006da41c8af2",
          title: "총 금액 시각 위계 부재",
          severity: "Moderate" as const,
          description: "총 금액이 다른 텍스트와 동일 크기·색상으로 표기됩니다.",
          html: "<p class=\"cart-total\">총 금액 89,400원</p>",
          wcag_criteria: "1.3.1",
        },
        {
          wcagIssueId: "2ffcd9ac-6455-e49c-41d3-189cdac97916",
          title: "삭제 아이콘 텍스트 라벨 부재",
          severity: "Minor" as const,
          description: "휴지통 아이콘에 visible text 라벨이 없어 시각적 의미 전달이 부족합니다.",
          html: "<button class=\"cart-item-delete\" aria-label=\"삭제\">",
          wcag_criteria: "1.1.1",
        },
      ],
    },
    "https://a-mall.com/search": {
      score: 42,
      wcagLabel: "미달",
      distribution: {
        Critical: 3,
        Moderate: 3,
        Minor: 2,
      },
      violations: [
        {
          wcagIssueId: "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
          title: "검색 결과 카드 구분 부족",
          severity: "Critical" as const,
          description: "검색 결과 카드 간 시각적 경계가 약하여 개별 항목 식별이 어렵습니다. 카드 간 구분선이 1px·#E5E7EB로 명도 차이가 불충분합니다.",
          html: "<div class=\"search-result-card\" role=\"article\">",
          wcag_criteria: "1.4.1",
        },
        {
          wcagIssueId: "b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7",
          title: "검색창 포커스 표시 약함",
          severity: "Critical" as const,
          description: "검색 입력 필드의 포커스 outline이 1px로 인지성이 낮습니다. 60대 이상 페르소나의 64%가 포커스 상태를 인식하지 못했습니다.",
          html: "<input type=\"search\" class=\"search-input\" placeholder=\"상품명 입력\" aria-label=\"상품 검색\" />",
          wcag_criteria: "2.4.7",
        },
        {
          wcagIssueId: "c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8",
          title: "검색 결과 정렬 옵션 접근성 부족",
          severity: "Critical" as const,
          description: "검색 결과 정렬 버튼이 아이콘만으로 표시되어 스크린리더 사용자가 기능을 파악할 수 없습니다.",
          html: "<button class=\"sort-toggle\" aria-label=\"정렬\">",
          wcag_criteria: "1.1.1",
        },
        {
          wcagIssueId: "d3e4f5g6-h7i8-50j0-k1l2-m3n4o5p6q7r8",
          title: "필터 선택 토글 대비 부족",
          severity: "Moderate" as const,
          description: "필터 체크박스 선택 상태 표시가 색상만으로 구분되며 대비비가 2.5:1입니다.",
          html: "<input type=\"checkbox\" class=\"filter-checkbox\" id=\"category-filter-1\" />",
          wcag_criteria: "1.4.1",
        },
        {
          wcagIssueId: "e4f5g6h7-i8j9-51k1-l2m3-n4o5p6q7r8s9",
          title: "페이지네이션 버튼 터치 영역 미달",
          severity: "Moderate" as const,
          description: "페이지 숫자 버튼이 20x20px로 WCAG 권장 44x44px를 미달합니다.",
          html: "<button class=\"pagination-btn\" aria-label=\"2페이지\">2</button>",
          wcag_criteria: "2.5.5",
        },
        {
          wcagIssueId: "f5g6h7i8-j9k0-52l2-m3n4-o5p6q7r8s9t0",
          title: "검색 필터 라벨 설명 부족",
          severity: "Moderate" as const,
          description: "필터 라벨의 설명 텍스트가 부족하여 사용자가 각 필터의 용도를 파악하기 어렵습니다.",
          html: "<label for=\"price-filter\" id=\"price-filter-label\">가격</label>",
          wcag_criteria: "3.3.2",
        },
        {
          wcagIssueId: "g6h7i8j9-k0l1-53m3-n4o5-p6q7r8s9t0u1",
          title: "검색결과 없음 메시지 위치",
          severity: "Minor" as const,
          description: "검색 결과가 없을 때 메시지가 페이지 중앙에 표시되어 스크린리더 사용자가 놓칠 수 있습니다.",
          html: "<div class=\"no-results-message\" role=\"status\" aria-live=\"polite\">검색 결과가 없습니다</div>",
          wcag_criteria: "1.3.1",
        },
        {
          wcagIssueId: "h7i8j9k0-l1m2-54n4-o5p6-q7r8s9t0u1v2",
          title: "필터 접기·펼치기 상태 미표시",
          severity: "Minor" as const,
          description: "필터 아코디언의 펼침/접힘 상태가 시각적·구조적으로 명확하지 않습니다.",
          html: "<button class=\"filter-toggle\" aria-expanded=\"false\">카테고리</button>",
          wcag_criteria: "4.1.2",
        },
      ],
    },
  }
}

// ============================================================================
// v2 호환성 변환 (result-wcag.mock.service 호환)
// ============================================================================

export type WcagSeverityV2 = "critical" | "moderate" | "minor"

export interface WcagIssueDistribution {
  severity: WcagSeverityV2
  label: string
  description: string
  count: number
}

export interface WcagDetailIssue {
  id: string
  issueNo: number
  title: string
  severity: WcagSeverityV2
  summary: string
  description: string
  guidance: string
  selector: string
  criterion: string
}

export interface WcagPageResult {
  pageId: string
  pageName: string
  complianceScore: number
  scoreInterpretation: string
  wcagLabel: WcagLabel
  passedTests: number
  totalTests: number
  foundIssues: number
  distribution: WcagIssueDistribution[]
  details: WcagDetailIssue[]
}

export interface WcagResultMockV2 {
  pageResults: WcagPageResult[]
}

// 백엔드 데이터를 v2 형식으로 변환
const convertToV2Format = (): WcagResultMockV2 => {
  const pageUrlMap: Record<string, { pageId: string; pageName: string }> = {
    "https://a-mall.com/login": { pageId: "login", pageName: "로그인 페이지" },
    "https://a-mall.com/signup": { pageId: "signup", pageName: "회원가입 페이지" },
    "https://a-mall.com/main": { pageId: "main", pageName: "메인 페이지" },
    "https://a-mall.com/search": { pageId: "search", pageName: "검색 페이지" },
    "https://a-mall.com/product/12847": { pageId: "product", pageName: "상품 상세 페이지" },
    "https://a-mall.com/cart": { pageId: "cart", pageName: "장바구니 페이지" },
  }

  return {
    pageResults: Object.entries(wcagMockData.urls).map(([url, data], index) => {
      const pageInfo = pageUrlMap[url] || { pageId: `page-${index}`, pageName: url }
      const violations = data.violations
      const totalTests = violations.length * 5 // 임의의 테스트 수
      const passedTests = Math.round(totalTests * (data.score / 100))

      return {
        pageId: pageInfo.pageId,
        pageName: pageInfo.pageName,
        complianceScore: data.score,
        scoreInterpretation: `준수점수 ${data.score}% - ${data.wcagLabel}`,
        wcagLabel: data.wcagLabel,
        passedTests,
        totalTests,
        foundIssues: violations.length,
        distribution: [
          {
            severity: "critical" as const,
            label: "Critical",
            description: "즉각 조치 필요",
            count: data.distribution.Critical,
          },
          {
            severity: "moderate" as const,
            label: "Moderate",
            description: "우선순위 높음",
            count: data.distribution.Moderate,
          },
          {
            severity: "minor" as const,
            label: "Minor",
            description: "권장 수정 사항",
            count: data.distribution.Minor,
          },
        ],
        details: violations.map((violation, vIndex) => ({
          id: violation.wcagIssueId,
          issueNo: vIndex + 1,
          title: violation.title,
          severity: (
            violation.severity === "Critical"
              ? "critical"
              : violation.severity === "Moderate"
                ? "moderate"
                : "minor"
          ) as WcagSeverityV2,
          summary: violation.description,
          description: violation.description,
          guidance: `WCAG 기준 ${violation.wcag_criteria} 준수 필요`,
          selector: violation.html,
          criterion: violation.wcag_criteria,
        })),
      }
    }),
  }
}

export const wcagResultMock = convertToV2Format()
