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
        beforeCode: `<button class="submit" onclick="submitForm()">제출</button>`,
        afterCode: `<button class="submit" type="submit">제출</button>`,
        impactSummary: "+ 180명의 사용자가 이제 키보드로 제출 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "버튼에 `type=\"submit\"`을 명시해 폼 제출 동작을 표준화하고, 키보드 네비게이션 및 보조기기 호환성을 개선합니다.",
      },
      {
        id: "fix-login-3",
        title: "오류 메시지 노출 시간이 짧음",
        severity: "low",
        impactedUsers: { count: 156 },
        beforeCode: `setTimeout(() => setError(null), 2000)`,
        afterCode: `setTimeout(() => setError(null), 6000)`,
        impactSummary: "+ 156명의 사용자가 오류 메시지를 충분히 확인 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "오류 메시지 유지 시간을 2초에서 6초로 늘려 사용자에게 피드백을 제공하는 시간을 확보합니다.",
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
        beforeCode: `<label class="required">이메일</label>`,
        afterCode: `<label class="required">이메일<span class="sr-only"> (필수)</span></label>`,
        impactSummary: "+ 164명의 사용자가 필수 입력을 더 명확히 인지 가능",
        changeSummaryTitle: "무엇이 변경되었나요?",
        changeSummaryBody:
          "시각적 표시 외에도 스크린리더가 읽을 수 있도록 숨김 텍스트를 추가해 폼 접근성을 개선합니다.",
      },
    ],
  },
]

export const defaultAiFixPageId = aiFixPagesMock[0]?.id ?? "login"
export const defaultAiFixId = aiFixPagesMock[0]?.fixes[0]?.id ?? "fix-login-1"

