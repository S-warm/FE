/**
 * 목업 히트맵 데이터
 * 실제 서버 데이터 대신 테스트용으로 사용합니다.
 */

export interface ErrorPoint {
  issueId: string
  url: string
  x: number // 0.0 ~ 1.0 ratio
  y: number // 0.0 ~ 1.0 ratio
  ageBand: string
  count: number
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  errorType: string
}

export const MOCK_HEATMAP_DATA = {
  // Page 1: Category Page
  "page-main": {
    pageId: "page-main",
    pageName: "메인 페이지",
    pageUrl: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
    screenshotUrl: "/mock-images/heatmap-1.png",
    coordinateMode: "ratio" as const,
    errorPoints: [
      // 상단 네비게이션
      {
        issueId: "issue_001",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
        x: 0.051,
        y: 0.13,
        ageBand: "20s",
        count: 3,
        severity: "LOW",
        errorType: "사용성/클릭 영역 불명확",
      },
      {
        issueId: "issue_001",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
        x: 0.051,
        y: 0.13,
        ageBand: "50s",
        count: 1,
        severity: "LOW",
        errorType: "사용성/클릭 영역 불명확",
      },
      // 검색창
      {
        issueId: "issue_002",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
        x: 0.35,
        y: 0.15,
        ageBand: "30s",
        count: 2,
        severity: "MEDIUM",
        errorType: "색상대비 부족",
      },
      // 왼쪽 카테고리 메뉴
      {
        issueId: "issue_003",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
        x: 0.08,
        y: 0.35,
        ageBand: "60s",
        count: 2,
        severity: "MEDIUM",
        errorType: "텍스트 크기 너무 작음",
      },
      // 상품 이미지 영역
      {
        issueId: "issue_004",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
        x: 0.4,
        y: 0.35,
        ageBand: "40s",
        count: 1,
        severity: "LOW",
        errorType: "이미지 로딩 실패",
      },
      // 상품 카드 - 가격 영역
      {
        issueId: "issue_005",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
        x: 0.42,
        y: 0.52,
        ageBand: "70s",
        count: 3,
        severity: "HIGH",
        errorType: "텍스트 색상 접근성 부족",
      },
      // 하단 페이지네이션
      {
        issueId: "issue_006",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/",
        x: 0.5,
        y: 0.92,
        ageBand: "20s",
        count: 1,
        severity: "MEDIUM",
        errorType: "버튼 크기 너무 작음",
      },
    ],
  },

  // Page 2: Product Detail Page
  "page-product-detail": {
    pageId: "page-product-detail",
    pageName: "상품 상세 페이지",
    pageUrl: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
    screenshotUrl: "/mock-images/heatmap-2.png",
    coordinateMode: "ratio" as const,
    errorPoints: [
      // 상단 상품명
      {
        issueId: "issue_010",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
        x: 0.35,
        y: 0.08,
        ageBand: "40s",
        count: 1,
        severity: "LOW",
        errorType: "제목 가독성 낮음",
      },
      // 메인 이미지
      {
        issueId: "issue_011",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
        x: 0.25,
        y: 0.35,
        ageBand: "50s",
        count: 2,
        severity: "MEDIUM",
        errorType: "이미지 확대 버튼 불명확",
      },
      // 우측 상세 정보
      {
        issueId: "issue_012",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
        x: 0.68,
        y: 0.25,
        ageBand: "60s",
        count: 3,
        severity: "HIGH",
        errorType: "가격 정보 색상 부족",
      },
      // 별점 영역
      {
        issueId: "issue_013",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
        x: 0.65,
        y: 0.35,
        ageBand: "30s",
        count: 1,
        severity: "LOW",
        errorType: "별 아이콘 의미 불명확",
      },
      // 수량 선택 영역
      {
        issueId: "issue_014",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
        x: 0.68,
        y: 0.48,
        ageBand: "70s",
        count: 2,
        severity: "MEDIUM",
        errorType: "선택 UI 너무 작음",
      },
      // 장바구니 버튼
      {
        issueId: "issue_015",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
        x: 0.68,
        y: 0.58,
        ageBand: "50s",
        count: 4,
        severity: "MEDIUM",
        errorType: "버튼 색상 대비 약함",
      },
      // 상품 설명 텍스트
      {
        issueId: "issue_016",
        url: "http://muun-shop-demo.s3-website.ap-northeast-2.amazonaws.com/product.html",
        x: 0.4,
        y: 0.75,
        ageBand: "60s",
        count: 2,
        severity: "MEDIUM",
        errorType: "긴 텍스트 줄간격 부족",
      },
    ],
  },
} as const

export type PageId = keyof typeof MOCK_HEATMAP_DATA

export function getMockHeatmapData(pageId: PageId) {
  return MOCK_HEATMAP_DATA[pageId]
}

export function getAllMockHeatmapPages() {
  return Object.values(MOCK_HEATMAP_DATA)
}
