export type WcagSeverity = "critical" | "moderate" | "minor"

export interface WcagIssueDistribution {
  severity: WcagSeverity
  label: string
  description: string
  count: number
}

export interface WcagDetailIssue {
  id: string
  issueNo: number
  title: string
  severity: WcagSeverity
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
  wcagLabel: string
  passedTests: number
  totalTests: number
  foundIssues: number
  distribution: WcagIssueDistribution[]
  details: WcagDetailIssue[]
}

export interface WcagResultMock {
  pageResults: WcagPageResult[]
}

export const wcagResultMock: WcagResultMock = {
  pageResults: [
    {
      pageId: "login",
      pageName: "로그인 페이지",
      complianceScore: 38,
      scoreInterpretation: "텍스트 대비와 폼 구조에서 기준 미달이 많아 실제 사용성이 낮은 상태입니다.",
      wcagLabel: "AA 준수",
      passedTests: 3,
      totalTests: 10,
      foundIssues: 4,
      distribution: [
        { severity: "critical", label: "Critical", description: "즉각 조치 필요", count: 2 },
        { severity: "moderate", label: "Moderate", description: "우선순위 높음", count: 1 },
        { severity: "minor", label: "Minor", description: "권장 수정 사항", count: 1 },
      ],
      details: [
        {
          id: "login-wcag-1",
          issueNo: 1,
          title: "텍스트 대비율 미달",
          severity: "critical",
          summary: "보조 설명과 레이블 텍스트가 저시력 사용자에게 충분히 읽히지 않습니다.",
          description:
            "텍스트와 배경의 밝기 차이가 약해서 글씨가 흐릿하게 보입니다.",
          guidance: "레이블과 보조 텍스트 색상을 올리고 배경 명도를 조정해 최소 대비율을 만족시키세요.",
          selector: "label.form-label, p.helper-text",
          criterion: "1.4.3 Contrast (Minimum)",
        },
        {
          id: "login-wcag-2",
          issueNo: 2,
          title: "필수 입력 구조 전달 부족",
          severity: "critical",
          summary: "필수 입력 여부가 시각적으로만 보여 스크린리더 사용자가 맥락을 잃을 수 있습니다.",
          description:
            "필수 입력 항목이 시각적 표시에만 의존하고 있어 보조기기 사용자가 필수 여부를 제대로 파악하지 못합니다.",
          guidance: "aria-required와 명시적 레이블 연결을 추가해 필수 입력 구조를 전달하세요.",
          selector: "input[required], label.required",
          criterion: "1.3.1 Info and Relationships",
        },
        {
          id: "login-wcag-3",
          issueNo: 3,
          title: "오류 메시지 위치 분리",
          severity: "moderate",
          summary: "오류 안내가 입력 컨텍스트에서 떨어져 보여 수정 지점을 바로 찾기 어렵습니다.",
          description:
            "포커스 및 오류 메시지의 노출 위치가 입력 컨텍스트와 멀리 떨어져 있어 사용자가 변경점을 놓칠 수 있습니다.",
          guidance: "각 입력 필드 하단에 오류 메시지를 고정하고, aria-describedby로 연결하세요.",
          selector: "div.error-message",
          criterion: "3.3.1 Error Identification",
        },
        {
          id: "login-wcag-4",
          issueNo: 4,
          title: "비밀번호 보기 버튼 포커스 약함",
          severity: "minor",
          summary: "포커스 이동은 가능하지만 현재 위치를 인지하기 어렵습니다.",
          description:
            "비밀번호 보기 버튼의 포커스 표시가 약해 키보드 사용자가 현재 상호작용 위치를 놓칠 수 있습니다.",
          guidance: "버튼 포커스 링과 배경 강조를 추가해 현재 위치를 또렷하게 보여주세요.",
          selector: "button[data-testid='toggle-password']",
          criterion: "2.4.7 Focus Visible",
        },
      ],
    },
    {
      pageId: "main",
      pageName: "메인 페이지",
      complianceScore: 57,
      scoreInterpretation: "주요 CTA는 보이지만 시각 계층과 대체 텍스트 구성이 아쉬워 탐색성이 흔들리는 상태입니다.",
      wcagLabel: "AA 준수",
      passedTests: 5,
      totalTests: 10,
      foundIssues: 3,
      distribution: [
        { severity: "critical", label: "Critical", description: "즉각 조치 필요", count: 1 },
        { severity: "moderate", label: "Moderate", description: "우선순위 높음", count: 1 },
        { severity: "minor", label: "Minor", description: "권장 수정 사항", count: 1 },
      ],
      details: [
        {
          id: "main-wcag-1",
          issueNo: 1,
          title: "히어로 CTA 대비 부족",
          severity: "critical",
          summary: "첫 화면 핵심 행동 버튼이 배경과 충분히 분리되지 않습니다.",
          description:
            "히어로 영역의 CTA가 배경과 명도 차이가 낮아 핵심 행동이 즉시 인지되지 않을 수 있습니다.",
          guidance: "CTA 버튼 배경/텍스트 대비를 높이고 주변 장식 요소의 시각 강도를 낮추세요.",
          selector: "a[data-cta='primary']",
          criterion: "1.4.3 Contrast (Minimum)",
        },
        {
          id: "main-wcag-2",
          issueNo: 2,
          title: "프로젝트 카드 보조 정보 가독성 약함",
          severity: "moderate",
          summary: "최근 프로젝트 메타 텍스트가 작고 연해 정보 구분이 어렵습니다.",
          description:
            "카드 보조 정보가 작은 글자 크기와 낮은 대비로 표시되어 날짜/상태 정보를 빠르게 읽기 어렵습니다.",
          guidance: "보조 정보 글자 크기와 색 대비를 한 단계 올려 정보 계층을 분명히 하세요.",
          selector: "aside .project-card-meta",
          criterion: "1.4.4 Resize Text",
        },
        {
          id: "main-wcag-3",
          issueNo: 3,
          title: "장식 이미지 대체 설명 불충분",
          severity: "minor",
          summary: "시각 장식과 의미 이미지의 구분이 모호해 대체 텍스트 전략이 약합니다.",
          description:
            "일부 이미지가 장식인지 의미 전달용인지 구분되지 않아 보조기기 사용 시 맥락 전달이 약해질 수 있습니다.",
          guidance: "장식 이미지는 빈 alt를 사용하고, 의미 이미지는 목적 중심 alt로 정리하세요.",
          selector: "img.hero, img.project-preview",
          criterion: "1.1.1 Non-text Content",
        },
      ],
    },
    {
      pageId: "signup",
      pageName: "회원가입 페이지",
      complianceScore: 46,
      scoreInterpretation: "입력 가이드와 오류 피드백이 늦게 드러나 회원가입 흐름의 이해 가능성이 떨어지는 상태입니다.",
      wcagLabel: "AA 준수",
      passedTests: 4,
      totalTests: 10,
      foundIssues: 3,
      distribution: [
        { severity: "critical", label: "Critical", description: "즉각 조치 필요", count: 1 },
        { severity: "moderate", label: "Moderate", description: "우선순위 높음", count: 2 },
        { severity: "minor", label: "Minor", description: "권장 수정 사항", count: 0 },
      ],
      details: [
        {
          id: "signup-wcag-1",
          issueNo: 1,
          title: "필수 입력 정보 구조 미전달",
          severity: "critical",
          summary: "필수 항목 여부를 보조기기가 정확히 파악하지 못합니다.",
          description:
            "필수 입력 여부가 시각적으로만 구분되어 스크린리더 환경에서 폼 구조 이해가 어려워집니다.",
          guidance: "필수 항목을 aria-required와 연결 레이블로 명시하고, 그룹 설명을 추가하세요.",
          selector: "form .required",
          criterion: "1.3.1 Info and Relationships",
        },
        {
          id: "signup-wcag-2",
          issueNo: 2,
          title: "비밀번호 조건 안내 노출 지연",
          severity: "moderate",
          summary: "조건 안내가 늦어 반복 입력을 유도하고 오류 복구를 늦춥니다.",
          description:
            "비밀번호 규칙 안내가 제출 시점에만 노출되어 사용자가 사전에 조건을 알기 어렵습니다.",
          guidance: "입력 시작 시점에 비밀번호 규칙을 노출하고 조건 충족 여부를 실시간 표시하세요.",
          selector: "p.password-hint",
          criterion: "3.3.2 Labels or Instructions",
        },
        {
          id: "signup-wcag-3",
          issueNo: 3,
          title: "인증번호 흐름 포커스 이동 불안정",
          severity: "moderate",
          summary: "입력 칸 이동 흐름이 끊겨 인증 완료 시간이 늘어납니다.",
          description:
            "OTP 입력 시 자동 포커스 이동이 안정적이지 않아 사용자가 입력 상태를 다시 확인해야 합니다.",
          guidance: "한 자리 입력 후 다음 칸으로 포커스를 이동하고, 삭제 시 이전 칸 복귀를 지원하세요.",
          selector: "input[data-otp]",
          criterion: "2.4.3 Focus Order",
        },
      ],
    },
    {
      pageId: "payment",
      pageName: "결제 페이지",
      complianceScore: 51,
      scoreInterpretation: "상태 피드백과 정보 강조가 부족해 결제 직전 단계에서 확신을 주지 못하는 상태입니다.",
      wcagLabel: "AA 준수",
      passedTests: 5,
      totalTests: 10,
      foundIssues: 4,
      distribution: [
        { severity: "critical", label: "Critical", description: "즉각 조치 필요", count: 1 },
        { severity: "moderate", label: "Moderate", description: "우선순위 높음", count: 2 },
        { severity: "minor", label: "Minor", description: "권장 수정 사항", count: 1 },
      ],
      details: [
        {
          id: "payment-wcag-1",
          issueNo: 1,
          title: "비활성 버튼 이유 미표시",
          severity: "critical",
          summary: "진행이 막힌 이유를 알 수 없어 결제 이탈을 바로 유발할 수 있습니다.",
          description:
            "쿠폰 적용 버튼이 비활성 상태일 때 원인 설명이 없어 사용자가 다음 행동을 판단하지 못합니다.",
          guidance: "비활성 조건을 버튼 인접 영역에 텍스트로 노출하고, 충족 시점 변화를 즉시 알려주세요.",
          selector: "button#apply-coupon",
          criterion: "3.3.1 Error Identification",
        },
        {
          id: "payment-wcag-2",
          issueNo: 2,
          title: "최종 결제 금액 강조 약함",
          severity: "moderate",
          summary: "핵심 비용 정보를 놓치기 쉬워 결제 확신이 떨어집니다.",
          description:
            "최종 결제 금액이 주변 텍스트와 비슷한 시각 강도로 노출되어 중요한 정보가 묻힙니다.",
          guidance: "총 결제 금액은 크기, 굵기, 여백을 한 단계 올려 시각적 우선순위를 확보하세요.",
          selector: "div.total-price",
          criterion: "1.4.8 Visual Presentation",
        },
        {
          id: "payment-wcag-3",
          issueNo: 3,
          title: "외부 결제창 이동 안내 부족",
          severity: "moderate",
          summary: "새 창/새 흐름 전환 맥락이 부족해 사용자가 실패로 오해할 수 있습니다.",
          description:
            "외부 결제창 이동 시 로딩/전환 안내가 부족해 사용자가 흐름 종료로 오인할 수 있습니다.",
          guidance: "외부 결제창 이동 전 안내 문구와 로딩 상태를 분명히 노출하세요.",
          selector: "a[data-provider='payment']",
          criterion: "3.2.2 On Input",
        },
        {
          id: "payment-wcag-4",
          issueNo: 4,
          title: "약관 체크 포커스 표시 약함",
          severity: "minor",
          summary: "체크박스 포커스 상태가 약해 키보드 사용 시 현재 위치가 흐려집니다.",
          description:
            "약관 동의 체크박스의 포커스 표시가 약해 키보드 네비게이션 중 현재 위치를 놓치기 쉽습니다.",
          guidance: "체크박스 포커스 링과 라벨 강조를 추가해 현재 위치를 분명히 보여주세요.",
          selector: "input[type='checkbox']",
          criterion: "2.4.7 Focus Visible",
        },
      ],
    },
  ],
}
