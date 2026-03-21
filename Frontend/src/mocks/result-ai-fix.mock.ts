export type AiFixSeverity = "high" | "medium" | "low"

export interface AiFixItem {
  id: string
  title: string
  severity: AiFixSeverity
  impactedUsers: {
    count: number
  }
  beforeCode: string
  afterCode: string
  impactSummary: string
  changeSummaryTitle: string
  changeSummaryBody: string
}

export interface AiFixPage {
  id: string
  name: string
  fixes: AiFixItem[]
}

export const aiFixPagesMock: AiFixPage[] = [
  {
    id: "login",
    name: "로그인 페이지",
    fixes: [
      {
        id: "fix-login-1",
        title: "입력 레이블이 낮은 대비율",
        severity: "high",
        impactedUsers: { count: 142 },
        beforeCode: `.form-label {\n  color: #999999;\n  font-size: 14px;\n  margin-bottom: 8px;\n}`,
        afterCode: `.form-label {\n  color: #334155;\n  font-size: 14px;\n  margin-bottom: 8px;\n  font-weight: 500;\n}`,
        impactSummary: "+ 142명의 사용자가 이제 레이블을 명확하게 읽을 수 있음",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "레이블 색상을 #999999에서 #334155로 변경하여 대비율을 달성하고 WCAG의 표준을 충족합니다.",
      },
      {
        id: "fix-login-2",
        title: "제출 버튼이 키보드로 접근 불가",
        severity: "medium",
        impactedUsers: { count: 180 },
        beforeCode: `.submit {\n  outline: none;\n}`,
        afterCode: `.submit:focus-visible {\n  outline: 3px solid rgba(47, 90, 232, 0.45);\n  outline-offset: 2px;\n}`,
        impactSummary: "+ 180명의 사용자가 이제 키보드로 제출 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "키보드 접근 시 포커스 링이 확실히 보이도록 `:focus-visible` 스타일을 추가해 접근성을 개선합니다.",
      },
      {
        id: "fix-login-3",
        title: "오류 메시지 노출 시간이 짧음",
        severity: "low",
        impactedUsers: { count: 156 },
        beforeCode: `.error-message {\n  opacity: 0;\n  transition: opacity 150ms ease-out;\n}`,
        afterCode: `.error-message {\n  opacity: 1;\n  transition: opacity 250ms ease-out;\n}`,
        impactSummary: "+ 156명의 사용자가 오류 메시지를 충분히 확인 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "오류 메시지의 노출 상태를 안정적으로 유지하고, 전환을 완만하게 만들어 피드백을 놓치지 않도록 개선합니다.",
      },
    ],
  },
  {
    id: "main",
    name: "메인 페이지",
    fixes: [
      {
        id: "fix-main-1",
        title: "CTA 버튼 가시성 개선",
        severity: "medium",
        impactedUsers: { count: 210 },
        beforeCode: `.cta {\n  background: #e5e7eb;\n  color: #475569;\n}`,
        afterCode: `.cta {\n  background: #2f5ae8;\n  color: #ffffff;\n}`,
        impactSummary: "+ 210명의 사용자가 CTA를 더 쉽게 인지 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "CTA 버튼의 배경/텍스트 대비를 강화해 시각적 우선순위를 높이고 클릭 유도력을 개선합니다.",
      },
      {
        id: "fix-main-2",
        title: "링크 텍스트의 대비가 낮음",
        severity: "low",
        impactedUsers: { count: 98 },
        beforeCode: `.link-muted {\n  color: #94a3b8;\n}`,
        afterCode: `.link-muted {\n  color: #475569;\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}`,
        impactSummary: "+ 98명의 사용자가 링크를 더 쉽게 인지 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "링크 컬러 대비를 강화하고 밑줄을 추가해 링크임을 명확히 인지할 수 있도록 개선합니다.",
      },
    ],
  },
  {
    id: "signup",
    name: "회원가입 페이지",
    fixes: [
      {
        id: "fix-signup-1",
        title: "필수 입력 표시의 접근성 개선",
        severity: "high",
        impactedUsers: { count: 164 },
        beforeCode: `.required::after {\n  content: \"*\";\n  color: #ef4444;\n}`,
        afterCode: `.required::after {\n  content: \"*\";\n  color: #ef4444;\n}\n\n.required {\n  font-weight: 600;\n}`,
        impactSummary: "+ 164명의 사용자가 필수 입력을 더 명확히 인지 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "필수 입력 레이블의 시각적 강조를 강화해 사용자가 필수 여부를 더 쉽게 구분할 수 있도록 개선합니다.",
      },
      {
        id: "fix-signup-2",
        title: "입력 필드의 클릭 영역/패딩 부족",
        severity: "medium",
        impactedUsers: { count: 140 },
        beforeCode: `.input {\n  padding: 8px 10px;\n}`,
        afterCode: `.input {\n  padding: 12px 12px;\n  border-radius: 12px;\n}`,
        impactSummary: "+ 140명의 사용자가 입력을 더 안정적으로 수행 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "입력 필드의 패딩과 라운드를 조정해 터치/클릭 안정성을 높이고 입력 경험을 개선합니다.",
      },
    ],
  },
  {
    id: "payment",
    name: "결제 페이지",
    fixes: [
      {
        id: "fix-payment-1",
        title: "최종 결제 금액의 강조가 약함",
        severity: "high",
        impactedUsers: { count: 178 },
        beforeCode: `.total-price {\n  color: #334155;\n  font-size: 16px;\n}`,
        afterCode: `.total-price {\n  color: #0f172a;\n  font-size: 20px;\n  font-weight: 700;\n}`,
        impactSummary: "+ 178명의 사용자가 최종 결제 금액을 더 쉽게 인지 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "핵심 정보(최종 결제 금액)의 폰트 크기/굵기/대비를 강화해 정보 계층을 명확히 합니다.",
      },
      {
        id: "fix-payment-2",
        title: "보조 안내 텍스트 대비 개선",
        severity: "low",
        impactedUsers: { count: 120 },
        beforeCode: `.helper-text {\n  color: #a3afc3;\n}`,
        afterCode: `.helper-text {\n  color: #66708e;\n}`,
        impactSummary: "+ 120명의 사용자가 안내 텍스트를 더 쉽게 읽을 수 있음",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "보조 텍스트 색상의 대비를 상향해 안내 문구의 가독성을 개선합니다.",
      },
    ],
  },
]

export const defaultAiFixPageId = aiFixPagesMock[0]?.id ?? "login"
export const defaultAiFixId = aiFixPagesMock[0]?.fixes[0]?.id ?? "fix-login-1"
