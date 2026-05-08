export type IssueCategory = "접근성" | "사용성" | "시각요소" | "기타"

export interface ResultIssue {
  id: string
  category: IssueCategory
  severity: "error" | "warning" | "info"
  title: string
  tags: string[]
  affectedUsers: {
    count: number
    percent: number
  }
  description: string
  selector: string
  expectedBenefit: {
    label: string
    delta: string
  }
}

export interface ResultIssuePage {
  id: string
  name: string
  issues: ResultIssue[]
  highlights: IssueCategory[]
}

export const resultIssuePages: ResultIssuePage[] = [
  {
    id: "login",
    name: "로그인 페이지",
    highlights: ["시각요소", "사용성", "접근성"],
    issues: [
      {
        id: "login-issue-1",
        category: "접근성",
        severity: "error",
        title: "제출 버튼에 키보드로 접근할 수 없음",
        tags: ["색상 대비 미흡"],
        affectedUsers: { count: 180, percent: 18 },
        description:
          "메인 폼 제출 버튼이 탭 네비게이션으로 접근할 수 없어, 키보드 네비게이션에 의존하는 사용자 18%가 차단됩니다.",
        selector: "button#submit-form",
        expectedBenefit: { label: "예상 효과 30% 상승", delta: "+3%" },
      },
      {
        id: "login-issue-2",
        category: "사용성",
        severity: "warning",
        title: "오류메시지가 너무 빨리 사라짐",
        tags: ["피드백 유지 필요"],
        affectedUsers: { count: 156, percent: 16 },
        description: "유효성 검사 오류 메시지가 2초 후에 사라져서 사용자가 중요한 피드백을 놓치게 됩니다.",
        selector: "div.error-message",
        expectedBenefit: { label: "예상 효과 20% 상승", delta: "+2%" },
      },
      {
        id: "login-issue-3",
        category: "사용성",
        severity: "warning",
        title: "비밀번호 보기 아이콘의 클릭 영역이 좁음",
        tags: ["터치 타깃"],
        affectedUsers: { count: 112, percent: 11 },
        description:
          "모바일 환경에서 아이콘 주변 여백이 좁아 오탭이 발생합니다. 터치 타깃을 44px 이상 확보하는 것이 좋습니다.",
        selector: "button[data-testid=\"toggle-password\"]",
        expectedBenefit: { label: "예상 효과 15% 상승", delta: "+1%" },
      },
      {
        id: "login-issue-4",
        category: "시각요소",
        severity: "info",
        title: "보조 설명 텍스트의 대비가 낮음",
        tags: ["가독성"],
        affectedUsers: { count: 92, percent: 9 },
        description: "버튼 하단 보조 텍스트가 배경과 명도 차이가 낮아 가독성이 떨어집니다.",
        selector: "p.helper-text",
        expectedBenefit: { label: "예상 효과 10% 상승", delta: "+1%" },
      },
    ],
  },
  {
    id: "main",
    name: "메인 페이지",
    highlights: ["시각요소", "기타"],
    issues: [
      {
        id: "main-issue-1",
        category: "시각요소",
        severity: "warning",
        title: "CTA 버튼 가시성이 낮음",
        tags: ["버튼 가시성"],
        affectedUsers: { count: 210, percent: 21 },
        description: "주요 CTA 버튼이 주변 요소와 대비가 낮아 시선이 분산됩니다.",
        selector: "a[data-cta=\"primary\"]",
        expectedBenefit: { label: "예상 효과 25% 상승", delta: "+2%" },
      },
      {
        id: "main-issue-2",
        category: "기타",
        severity: "info",
        title: "배너 영역에서 스크롤 점프 발생",
        tags: ["레이아웃 안정성"],
        affectedUsers: { count: 84, percent: 8 },
        description: "이미지 로딩 전후 레이아웃 변화로 스크롤 위치가 점프합니다.",
        selector: "section.hero-banner",
        expectedBenefit: { label: "예상 효과 10% 상승", delta: "+1%" },
      },
    ],
  },
  {
    id: "signup",
    name: "회원가입 페이지",
    highlights: ["접근성", "사용성"],
    issues: [
      {
        id: "signup-issue-1",
        category: "접근성",
        severity: "error",
        title: "필수 입력 표시가 스크린리더에 전달되지 않음",
        tags: ["폼 접근성"],
        affectedUsers: { count: 164, percent: 16 },
        description: "필수 입력 항목이 시각적으로만 표시되어 스크린리더 사용자가 필수 여부를 파악하기 어렵습니다.",
        selector: "label.required",
        expectedBenefit: { label: "예상 효과 25% 상승", delta: "+2%" },
      },
      {
        id: "signup-issue-2",
        category: "사용성",
        severity: "warning",
        title: "비밀번호 조건 안내가 늦게 노출됨",
        tags: ["실시간 가이드"],
        affectedUsers: { count: 140, percent: 14 },
        description: "비밀번호 규칙 안내가 제출 시점에만 노출되어 재입력 비용이 증가합니다.",
        selector: "p.password-hint",
        expectedBenefit: { label: "예상 효과 20% 상승", delta: "+2%" },
      },
      {
        id: "signup-issue-3",
        category: "사용성",
        severity: "info",
        title: "인증번호 입력의 자동 포커스 이동이 불안정",
        tags: ["입력 흐름"],
        affectedUsers: { count: 88, percent: 9 },
        description: "한 자리 입력 후 다음 칸으로 포커스가 이동하지 않아 입력 속도가 느려집니다.",
        selector: "input[data-otp]",
        expectedBenefit: { label: "예상 효과 10% 상승", delta: "+1%" },
      },
    ],
  },
  {
    id: "payment",
    name: "결제 페이지",
    highlights: ["시각요소", "기타", "사용성"],
    issues: [
      {
        id: "payment-issue-1",
        category: "사용성",
        severity: "error",
        title: "쿠폰 적용 버튼이 비활성 조건이 모호함",
        tags: ["상태 피드백"],
        affectedUsers: { count: 196, percent: 20 },
        description: "쿠폰 입력 후 버튼이 비활성인 이유가 표시되지 않아 사용자가 진행을 멈춥니다.",
        selector: "button#apply-coupon",
        expectedBenefit: { label: "예상 효과 30% 상승", delta: "+3%" },
      },
      {
        id: "payment-issue-2",
        category: "시각요소",
        severity: "warning",
        title: "결제 요약 금액의 강조가 약함",
        tags: ["정보 계층"],
        affectedUsers: { count: 178, percent: 18 },
        description: "최종 결제 금액이 주변 텍스트와 유사한 스타일이라 중요한 정보가 묻힙니다.",
        selector: "div.total-price",
        expectedBenefit: { label: "예상 효과 20% 상승", delta: "+2%" },
      },
      {
        id: "payment-issue-3",
        category: "기타",
        severity: "info",
        title: "외부 결제창 이동 시 로딩 안내 부족",
        tags: ["전환 안내"],
        affectedUsers: { count: 120, percent: 12 },
        description: "외부 결제창으로 이동할 때 로딩/전환 안내가 없어 이탈로 오인될 수 있습니다.",
        selector: "a[data-provider=\"payment\"]",
        expectedBenefit: { label: "예상 효과 15% 상승", delta: "+1%" },
      },
    ],
  },
]
