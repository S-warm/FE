import { resultPageScreenshotUrl } from "@/mocks/mock-assets"
import type { ApiHeatmapAgeGroup } from "@/types/api/common/enums"
import type { SimulationOverviewAgeBand } from "@/types/api/simulation/simulation-overview.response"

export type ResultMasterPageId = "login" | "main" | "signup" | "payment"
export type ResultMasterSeverity = "critical" | "moderate" | "minor"
export type ResultMasterCategory = "접근성" | "사용성" | "시각요소"
export type ResultMasterSubCategory =
  | "라벨링"
  | "대체텍스트"
  | "시인성"
  | "가독성"
  | "정보과부하"
  | "피드백"
  | "흐름"
  | "포커스"

export interface ResultMasterPage {
  id: ResultMasterPageId
  name: string
  url: string
  screenshotUrl: string
}

export interface ResultMasterAgeProfile {
  ageBand: SimulationOverviewAgeBand
  age: number
  sessions: number
  successRate: number
  avgDurationMs: number
  avgActions: number
  avgDeclareFailure: number
}

export interface ResultMasterHeatmapCluster {
  x: number
  y: number
  count: number
  ageBand: ApiHeatmapAgeGroup
  blockRate: number
  repeatCount: number
}

export interface ResultMasterIssue {
  id: string
  pageId: ResultMasterPageId
  category: ResultMasterCategory
  subCategory: ResultMasterSubCategory
  severity: ResultMasterSeverity
  title: string
  selector: string
  wcag: string
  failCount: number
  description: string
  tags: string[]
  targetHtml: string
  expectedBenefitLabel: string
  expectedBenefitDelta: string
  reportedPersona: string
  prioritySummary: string
  personaAges: number[]
  sessionIds: string[]
  heatmapClusters: ResultMasterHeatmapCluster[]
  beforeCode: string
  afterCode: string
  impactSummary: string
  changeSummaryTitle: string
  changeSummaryBody: string
  wcagSummary: string
  wcagGuidance: string
}

interface IssueSeedInput {
  id: string
  pageId: ResultMasterPageId
  category: ResultMasterCategory
  subCategory: ResultMasterSubCategory
  severity: ResultMasterSeverity
  title: string
  selector: string
  wcag: string
  failCount: number
  ageDistribution: Record<number, number>
  description: string
  tags: string[]
  targetHtml: string
  expectedBenefitLabel: string
  expectedBenefitDelta: string
  reportedPersona: string
  prioritySummary: string
  heatmapClusters: ResultMasterHeatmapCluster[]
  beforeCode: string
  afterCode: string
  impactSummary: string
  changeSummaryBody: string
  wcagSummary: string
  wcagGuidance: string
}

function clampCoordinate(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(3))
}

function hashSeed(value: string) {
  return Array.from(value).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 17), 0)
}

function buildSessionIds(issueId: string, count: number) {
  const seed = hashSeed(issueId)
  return Array.from({ length: count }, (_, index) => {
    const next = (seed + (index + 1) * 2654435761) >>> 0
    return `AI-sess_${next.toString(16).padStart(8, "0").slice(-8)}`
  })
}

function buildPersonaAges(distribution: Record<number, number>) {
  return Object.entries(distribution)
    .sort(([left], [right]) => Number(left) - Number(right))
    .flatMap(([age, count]) => Array.from({ length: count }, () => Number(age)))
}

function createIssue(input: IssueSeedInput): ResultMasterIssue {
  const personaAges = buildPersonaAges(input.ageDistribution)
  return {
    ...input,
    personaAges,
    sessionIds: buildSessionIds(input.id, input.failCount),
    heatmapClusters: input.heatmapClusters.map((cluster) => ({
      ...cluster,
      x: clampCoordinate(cluster.x),
      y: clampCoordinate(cluster.y),
    })),
    changeSummaryTitle: "무엇이 바뀌나요?",
  }
}

export const resultScenarioSummary = {
  title: "A-Mall 구매 여정",
  totalSessions: 1000,
  successCount: 280,
  successRate: 28,
  avgDurationMs: 252000,
  avgDurationSeconds: 252,
  dropOffCount: 720,
} as const

export const resultMasterPages: ResultMasterPage[] = [
  { id: "login", name: "로그인 페이지", url: "/login", screenshotUrl: resultPageScreenshotUrl },
  { id: "main", name: "메인 페이지", url: "/", screenshotUrl: resultPageScreenshotUrl },
  { id: "signup", name: "회원가입 페이지", url: "/signup", screenshotUrl: resultPageScreenshotUrl },
  { id: "payment", name: "결제 페이지", url: "/checkout", screenshotUrl: resultPageScreenshotUrl },
]

export const resultMasterAgeProfiles: ResultMasterAgeProfile[] = [
  { ageBand: "10대", age: 10, sessions: 128, successRate: 78, avgDurationMs: 220000, avgActions: 7.5, avgDeclareFailure: 0.4 },
  { ageBand: "20대", age: 20, sessions: 137, successRate: 62, avgDurationMs: 240000, avgActions: 8.2, avgDeclareFailure: 0.8 },
  { ageBand: "30대", age: 30, sessions: 143, successRate: 45, avgDurationMs: 265000, avgActions: 9.8, avgDeclareFailure: 1.3 },
  { ageBand: "40대", age: 40, sessions: 145, successRate: 18, avgDurationMs: 290000, avgActions: 11.4, avgDeclareFailure: 2.1 },
  { ageBand: "50대", age: 50, sessions: 149, successRate: 5, avgDurationMs: 310000, avgActions: 12.8, avgDeclareFailure: 2.9 },
  { ageBand: "60대", age: 60, sessions: 149, successRate: 0.5, avgDurationMs: 340000, avgActions: 14.1, avgDeclareFailure: 3.6 },
  { ageBand: "70대", age: 70, sessions: 149, successRate: 0, avgDurationMs: 360000, avgActions: 15, avgDeclareFailure: 4.2 },
]

export const resultMasterIssues: ResultMasterIssue[] = [
  createIssue({
    id: "login-1",
    pageId: "login",
    category: "시각요소",
    subCategory: "시인성",
    severity: "critical",
    title: "입력 라벨 텍스트 대비 미달",
    selector: "label.input-label",
    wcag: "1.4.3",
    failCount: 332,
    ageDistribution: { 10: 6, 20: 14, 30: 30, 40: 48, 50: 84, 60: 76, 70: 74 },
    description:
      "라벨 대비가 낮아 고연령 사용자일수록 입력 의미를 재확인하는 시간이 길어집니다. 최소 대비비 기준을 넘지 못해 시야 축소와 반응 지연이 함께 나타납니다.",
    tags: ["라벨", "대비", "시인성"],
    targetHtml: '<label class="input-label" for="email">이메일 주소</label>',
    expectedBenefitLabel: "라벨 재탐색 감소",
    expectedBenefitDelta: "+4%",
    reportedPersona: "50대 이상 사용자에서 입력 전 머뭇거림이 반복적으로 관찰됨",
    prioritySummary: "최소 대비비와 유효 시야 비율이 동시에 불리하게 작동해 첫 단계 이탈을 빠르게 유발합니다.",
    heatmapClusters: [
      { x: 0.458, y: 0.382, count: 34, ageBand: "50대", blockRate: 71, repeatCount: 2.8 },
      { x: 0.516, y: 0.438, count: 28, ageBand: "60대", blockRate: 79, repeatCount: 3.2 },
      { x: 0.552, y: 0.492, count: 24, ageBand: "70대", blockRate: 83, repeatCount: 3.6 },
    ],
    beforeCode:
      `.input-label {\n  color: #94a3b8;\n  font-size: 13px;\n  font-weight: 400;\n}`,
    afterCode:
      `.input-label {\n  color: #1e293b;\n  font-size: 15px;\n  font-weight: 600;\n}`,
    impactSummary: "+266명의 사용자가 입력 항목을 더 빠르게 구분할 수 있습니다.",
    changeSummaryBody:
      "라벨 색상과 두께를 조정해 텍스트 대비를 높이고, 고연령 사용자도 필드 목적을 한 번에 인지할 수 있도록 개선합니다.",
    wcagSummary: "라벨 텍스트가 배경과 충분히 분리되지 않아 고연령 사용자에게 입력 시작점이 흐리게 보입니다.",
    wcagGuidance: "라벨 텍스트의 명도 대비를 높이고 본문 수준 이상의 굵기를 사용해 최소 대비비를 충족하세요.",
  }),
  createIssue({
    id: "login-2",
    pageId: "login",
    category: "접근성",
    subCategory: "라벨링",
    severity: "critical",
    title: "필수 입력 정보 구조 미전달",
    selector: "input[required]",
    wcag: "1.3.1",
    failCount: 286,
    ageDistribution: { 10: 18, 20: 34, 30: 58, 40: 72, 50: 56, 60: 30, 70: 18 },
    description:
      "필수 입력 여부가 시각적 표시에만 의존해 스크린리더와 키보드 사용자 모두 구조를 놓치기 쉽습니다. 오류 인식 전까지 되돌아오는 비용이 커져 재시도가 반복됩니다.",
    tags: ["필수값", "라벨링", "구조"],
    targetHtml: '<input id="password" name="password" type="password" required />',
    expectedBenefitLabel: "필수값 인지 개선",
    expectedBenefitDelta: "+3%",
    reportedPersona: "보조기기 사용자와 40대 이상 키보드 사용자에서 반복 오류가 확인됨",
    prioritySummary: "필수 구조가 전달되지 않아 한 번의 오류가 전체 로그인 완료 시간을 크게 지연시킵니다.",
    heatmapClusters: [
      { x: 0.487, y: 0.466, count: 26, ageBand: "30대", blockRate: 64, repeatCount: 2.6 },
      { x: 0.544, y: 0.538, count: 22, ageBand: "40대", blockRate: 69, repeatCount: 2.9 },
      { x: 0.431, y: 0.578, count: 18, ageBand: "50대", blockRate: 74, repeatCount: 3.1 },
    ],
    beforeCode:
      `<input id="password" name="password" type="password" required />`,
    afterCode:
      `<label for="password">비밀번호 <span aria-hidden="true">*</span></label>\n<input id="password" name="password" type="password" required aria-required="true" aria-describedby="password-required" />\n<p id="password-required">필수 입력 항목입니다.</p>`,
    impactSummary: "+214명의 사용자가 필수 입력 규칙을 더 쉽게 이해할 수 있습니다.",
    changeSummaryBody:
      "시각 표시만 있던 필수 입력 안내를 라벨, 설명, ARIA 속성으로 분리해 보조기기와 키보드 사용자 모두 같은 구조를 받도록 바꿉니다.",
    wcagSummary: "필수 입력 구조가 보조기기에 전달되지 않아 사용자가 누락 원인을 늦게 파악합니다.",
    wcagGuidance: "required 상태를 명시하고 라벨과 설명 문장을 연결해 입력 구조를 프로그램적으로 전달하세요.",
  }),
  createIssue({
    id: "login-3",
    pageId: "login",
    category: "사용성",
    subCategory: "피드백",
    severity: "moderate",
    title: "오류 메시지 위치 분리",
    selector: ".form-error",
    wcag: "3.3.1",
    failCount: 178,
    ageDistribution: { 10: 12, 20: 20, 30: 28, 40: 34, 50: 32, 60: 28, 70: 24 },
    description:
      "오류 메시지가 입력 필드와 떨어져 있어 사용자가 어떤 항목을 다시 봐야 하는지 즉시 연결하지 못합니다. 작업 기억 부담과 오류 인식 지연이 함께 발생합니다.",
    tags: ["오류메시지", "피드백", "폼"],
    targetHtml: '<p class="form-error">비밀번호를 다시 확인해 주세요.</p>',
    expectedBenefitLabel: "오류 복구 속도 향상",
    expectedBenefitDelta: "+2%",
    reportedPersona: "30대 이상 사용자가 동일 입력을 두 번 이상 반복하는 패턴이 많음",
    prioritySummary: "오류 위치가 멀어질수록 작업 기억 슬롯이 부족한 사용자의 재입력 비용이 급격히 커집니다.",
    heatmapClusters: [
      { x: 0.586, y: 0.612, count: 16, ageBand: "40대", blockRate: 52, repeatCount: 2.1 },
      { x: 0.428, y: 0.624, count: 12, ageBand: "50대", blockRate: 58, repeatCount: 2.4 },
    ],
    beforeCode:
      `.form-error {\n  margin-top: 24px;\n  color: #dc2626;\n}`,
    afterCode:
      `.field-group {\n  display: grid;\n  gap: 6px;\n}\n\n.form-error {\n  margin-top: 0;\n  color: #b91c1c;\n}`,
    impactSummary: "+125명의 사용자가 오류 원인을 더 빨리 찾아 수정할 수 있습니다.",
    changeSummaryBody:
      "오류 문구를 필드 바로 아래에 고정해 입력 맥락과 피드백을 함께 보이게 하고, 오류 복구 동선을 짧게 만듭니다.",
    wcagSummary: "오류 문구가 입력 필드와 분리되어 있어 사용자가 수정 대상을 다시 탐색해야 합니다.",
    wcagGuidance: "오류 메시지를 필드와 인접하게 배치하고 설명 연결을 추가해 복구 경로를 짧게 유지하세요.",
  }),
  createIssue({
    id: "login-4",
    pageId: "login",
    category: "접근성",
    subCategory: "포커스",
    severity: "minor",
    title: "비밀번호 보기 버튼 포커스 약함",
    selector: "button.toggle-password",
    wcag: "2.4.7",
    failCount: 74,
    ageDistribution: { 10: 4, 20: 8, 30: 18, 40: 20, 50: 14, 60: 6, 70: 4 },
    description:
      "키보드로 이동할 때 포커스 링이 거의 보이지 않아 비밀번호 표시 토글의 현재 위치를 놓치기 쉽습니다. 포커스 인지 실패는 반복 탭 이동으로 이어집니다.",
    tags: ["포커스", "키보드", "토글"],
    targetHtml: '<button class="toggle-password" type="button" aria-label="비밀번호 보기"></button>',
    expectedBenefitLabel: "키보드 탐색 안정화",
    expectedBenefitDelta: "+1%",
    reportedPersona: "30~50대 키보드 중심 사용자가 토글 버튼 위치를 자주 놓침",
    prioritySummary: "치명적 차단은 아니지만 포커스 가시성이 약해 조작 자신감을 떨어뜨립니다.",
    heatmapClusters: [
      { x: 0.594, y: 0.454, count: 10, ageBand: "40대", blockRate: 34, repeatCount: 1.6 },
    ],
    beforeCode:
      `.toggle-password:focus-visible {\n  outline: none;\n}`,
    afterCode:
      `.toggle-password:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n  border-radius: 8px;\n}`,
    impactSummary: "+47명의 사용자가 키보드 포커스 위치를 더 명확히 파악할 수 있습니다.",
    changeSummaryBody:
      "포커스 아웃라인과 오프셋을 추가해 키보드 탐색 시 토글 버튼 위치를 즉시 알아차릴 수 있도록 바꿉니다.",
    wcagSummary: "비밀번호 보기 버튼의 포커스 표시가 약해 현재 상호작용 위치를 알아차리기 어렵습니다.",
    wcagGuidance: "버튼 주변에 충분한 대비의 포커스 스타일을 적용해 키보드 포커스가 분명히 보이도록 하세요.",
  }),
  createIssue({
    id: "main-1",
    pageId: "main",
    category: "시각요소",
    subCategory: "시인성",
    severity: "critical",
    title: "히어로 CTA 대비 부족",
    selector: 'a[data-cta="primary"]',
    wcag: "1.4.3",
    failCount: 358,
    ageDistribution: { 10: 5, 20: 15, 30: 30, 40: 68, 50: 100, 60: 70, 70: 70 },
    description:
      "히어로 영역의 CTA가 배경 이미지와 충분히 분리되지 않아 고연령 사용자는 행동 유도를 거의 인식하지 못합니다. 최소 대비비와 시야 축소가 겹쳐 탐색 성공률이 크게 떨어집니다.",
    tags: ["CTA", "대비", "시인성"],
    targetHtml: '<a class="hero-cta" data-cta="primary" href="/products">지금 둘러보기</a>',
    expectedBenefitLabel: "주요 행동 인지 향상",
    expectedBenefitDelta: "+5%",
    reportedPersona: "50대 이상 사용자가 메인 진입 후 첫 행동 선택에서 가장 오래 머뭇거림",
    prioritySummary: "대비 부족은 메인 탐색 시작점을 흐리게 만들어 전체 퍼널 성공률을 직접 깎아냅니다.",
    heatmapClusters: [
      { x: 0.482, y: 0.476, count: 39, ageBand: "50대", blockRate: 78, repeatCount: 3.4 },
      { x: 0.536, y: 0.512, count: 33, ageBand: "60대", blockRate: 82, repeatCount: 3.8 },
      { x: 0.578, y: 0.494, count: 29, ageBand: "70대", blockRate: 86, repeatCount: 4.1 },
    ],
    beforeCode:
      `.hero-cta {\n  background: #dbe3f0;\n  color: #5b6472;\n  font-size: 14px;\n  padding: 8px 16px;\n}`,
    afterCode:
      `.hero-cta {\n  background: #1d4ed8;\n  color: #ffffff;\n  font-size: 16px;\n  font-weight: 700;\n  padding: 12px 24px;\n}`,
    impactSummary: "+286명의 사용자가 핵심 CTA를 더 빠르게 인지할 수 있습니다.",
    changeSummaryBody:
      "CTA의 배경색, 글자색, 크기, 두께를 함께 높여 배경 이미지 위에서도 명확한 행동 시작점으로 보이게 만듭니다.",
    wcagSummary: "히어로 CTA가 배경과 충분히 구분되지 않아 중요한 행동 유도가 시각적으로 묻힙니다.",
    wcagGuidance: "배경과 텍스트 대비를 높이고 CTA를 독립된 시각 계층으로 올려 첫 행동 유도를 명확히 하세요.",
  }),
  createIssue({
    id: "main-2",
    pageId: "main",
    category: "시각요소",
    subCategory: "가독성",
    severity: "moderate",
    title: "상품 카드 가격 정보 가독성 약함",
    selector: ".product-card .price",
    wcag: "1.4.4",
    failCount: 204,
    ageDistribution: { 10: 8, 20: 14, 30: 24, 40: 34, 50: 50, 60: 40, 70: 34 },
    description:
      "가격 텍스트의 크기와 대비가 낮아 비교 쇼핑 상황에서 숫자 정보를 빠르게 스캔하기 어렵습니다. 최소 폰트 요구치가 높은 연령대일수록 오류 선택이 늘어납니다.",
    tags: ["가격", "가독성", "카드"],
    targetHtml: '<p class="price">49,900원</p>',
    expectedBenefitLabel: "가격 비교 정확도 향상",
    expectedBenefitDelta: "+2%",
    reportedPersona: "50~70대 사용자가 가격 확인을 위해 카드 사이를 반복 왕복함",
    prioritySummary: "작은 가격 텍스트는 상품 비교 속도를 늦추고 장바구니 진입 의사결정을 방해합니다.",
    heatmapClusters: [
      { x: 0.284, y: 0.706, count: 18, ageBand: "50대", blockRate: 48, repeatCount: 2.2 },
      { x: 0.728, y: 0.742, count: 14, ageBand: "60대", blockRate: 54, repeatCount: 2.5 },
    ],
    beforeCode:
      `.product-card .price {\n  color: #94a3b8;\n  font-size: 12px;\n  font-weight: 400;\n}`,
    afterCode:
      `.product-card .price {\n  color: #0f172a;\n  font-size: 16px;\n  font-weight: 700;\n}`,
    impactSummary: "+151명의 사용자가 가격 정보를 더 또렷하게 읽을 수 있습니다.",
    changeSummaryBody:
      "가격 폰트 크기와 명도 대비를 올려 카드 비교 시 핵심 숫자 정보가 한눈에 들어오도록 정리합니다.",
    wcagSummary: "상품 카드 가격 정보가 작고 옅어 고연령 사용자가 빠르게 비교하기 어렵습니다.",
    wcagGuidance: "가격 텍스트 크기와 굵기를 올리고 대비를 강화해 확대 없이도 읽기 쉬운 상태를 만드세요.",
  }),
  createIssue({
    id: "main-3",
    pageId: "main",
    category: "접근성",
    subCategory: "대체텍스트",
    severity: "minor",
    title: "장식 이미지 대체 설명 불충분",
    selector: "img.decorative",
    wcag: "1.1.1",
    failCount: 68,
    ageDistribution: { 10: 6, 20: 10, 30: 14, 40: 16, 50: 10, 60: 7, 70: 5 },
    description:
      "장식 이미지에 의미 없는 대체 설명이 남아 있어 스크린리더 사용자가 본문 흐름을 불필요하게 끊깁니다. 정보 밀도가 높지 않아도 청취 피로가 누적됩니다.",
    tags: ["이미지", "대체텍스트", "스크린리더"],
    targetHtml: '<img class="decorative" src="/images/confetti.png" alt="장식 이미지" />',
    expectedBenefitLabel: "청취 흐름 개선",
    expectedBenefitDelta: "+1%",
    reportedPersona: "보조기기 사용자가 의미 없는 이미지 설명을 반복 청취함",
    prioritySummary: "차단 이슈는 아니지만 보조기기 흐름을 불필요하게 늘려 탐색 피로를 높입니다.",
    heatmapClusters: [
      { x: 0.818, y: 0.284, count: 8, ageBand: "30대", blockRate: 22, repeatCount: 1.3 },
    ],
    beforeCode:
      `<img class="decorative" src="/images/confetti.png" alt="장식 이미지" />`,
    afterCode:
      `<img class="decorative" src="/images/confetti.png" alt="" aria-hidden="true" />`,
    impactSummary: "+44명의 사용자가 스크린리더 탐색을 더 매끄럽게 이어갈 수 있습니다.",
    changeSummaryBody:
      "장식용 이미지를 보조기기 탐색에서 제외해 실제 정보와 무관한 읽기 노이즈를 줄입니다.",
    wcagSummary: "장식 이미지를 의미 있는 콘텐츠처럼 읽어 주어 보조기기 흐름이 길어집니다.",
    wcagGuidance: "장식 이미지는 빈 alt와 aria-hidden을 사용해 탐색 흐름에서 제외하세요.",
  }),
  createIssue({
    id: "signup-1",
    pageId: "signup",
    category: "사용성",
    subCategory: "정보과부하",
    severity: "critical",
    title: "필수 입력 정보 구조 미전달",
    selector: "form.signup",
    wcag: "1.3.1",
    failCount: 344,
    ageDistribution: { 10: 4, 20: 12, 30: 28, 40: 74, 50: 86, 60: 76, 70: 64 },
    description:
      "회원가입 폼이 필수 입력과 섹션 관계를 구조적으로 드러내지 않아 작업 기억 슬롯이 적은 사용자는 현재 단계와 남은 입력을 동시에 유지하기 어렵습니다.",
    tags: ["회원가입", "정보과부하", "구조"],
    targetHtml: '<form class="signup" novalidate></form>',
    expectedBenefitLabel: "입력 단계 인지 개선",
    expectedBenefitDelta: "+4%",
    reportedPersona: "40대 이상 사용자가 중간 단계에서 필수 입력 누락을 반복함",
    prioritySummary: "폼 구조가 한 번에 이해되지 않으면 회원가입 퍼널 전체가 무너지기 쉽습니다.",
    heatmapClusters: [
      { x: 0.458, y: 0.586, count: 36, ageBand: "40대", blockRate: 75, repeatCount: 3.3 },
      { x: 0.512, y: 0.648, count: 31, ageBand: "50대", blockRate: 79, repeatCount: 3.7 },
      { x: 0.554, y: 0.712, count: 27, ageBand: "60대", blockRate: 83, repeatCount: 4.0 },
    ],
    beforeCode:
      `<form class="signup">\n  <div class="field-row">\n    <input name="email" />\n    <input name="password" />\n  </div>\n</form>`,
    afterCode:
      `<form class="signup" aria-describedby="signup-required-guide">\n  <p id="signup-required-guide">별표가 있는 항목은 모두 필수 입력입니다.</p>\n  <fieldset>\n    <legend>계정 정보</legend>\n    <label for="signup-email">이메일 주소 *</label>\n    <input id="signup-email" name="email" required aria-required="true" />\n  </fieldset>\n</form>`,
    impactSummary: "+275명의 사용자가 회원가입 단계를 더 명확히 이해할 수 있습니다.",
    changeSummaryBody:
      "폼을 필드셋과 범례로 묶고 필수 입력 안내를 상단에 노출해, 복수 항목을 한 번에 처리할 때 필요한 인지 부담을 줄입니다.",
    wcagSummary: "회원가입 필수 정보의 관계가 구조적으로 드러나지 않아 입력 계획을 세우기 어렵습니다.",
    wcagGuidance: "필수 입력과 그룹 구조를 필드셋, 범례, 설명 문장으로 명확히 표현하세요.",
  }),
  createIssue({
    id: "signup-2",
    pageId: "signup",
    category: "사용성",
    subCategory: "피드백",
    severity: "moderate",
    title: "비밀번호 조건 안내 노출 지연",
    selector: ".password-rules",
    wcag: "3.3.2",
    failCount: 191,
    ageDistribution: { 10: 12, 20: 18, 30: 24, 40: 40, 50: 40, 60: 32, 70: 25 },
    description:
      "비밀번호 조건이 입력 후반에야 보이면 사용자는 이미 기억에서 규칙을 놓친 뒤입니다. 정보 유지 시간이 짧은 연령대일수록 재입력 횟수가 빠르게 늘어납니다.",
    tags: ["비밀번호", "가이드", "피드백"],
    targetHtml: '<p class="password-rules">영문, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.</p>',
    expectedBenefitLabel: "재입력 감소",
    expectedBenefitDelta: "+2%",
    reportedPersona: "50대 이상 사용자가 규칙을 다시 보기 위해 필드를 반복 이동함",
    prioritySummary: "규칙을 늦게 보여 주면 사용자는 기억에 의존하게 되고 오류 회복 비용이 커집니다.",
    heatmapClusters: [
      { x: 0.474, y: 0.624, count: 17, ageBand: "50대", blockRate: 47, repeatCount: 2.3 },
      { x: 0.562, y: 0.666, count: 14, ageBand: "60대", blockRate: 53, repeatCount: 2.6 },
    ],
    beforeCode:
      `.password-rules {\n  opacity: 0;\n  max-height: 0;\n  overflow: hidden;\n}\n\n.password-field:focus-within + .password-rules {\n  opacity: 1;\n  max-height: 80px;\n}`,
    afterCode:
      `.password-rules {\n  opacity: 1;\n  max-height: none;\n  color: #334155;\n}\n\n.password-rules strong {\n  font-weight: 700;\n}`,
    impactSummary: "+141명의 사용자가 비밀번호 규칙을 더 일찍 이해할 수 있습니다.",
    changeSummaryBody:
      "비밀번호 조건을 기본 노출 상태로 바꾸고 핵심 규칙을 강조해, 입력 전에 규칙을 읽고 계획할 수 있게 만듭니다.",
    wcagSummary: "비밀번호 규칙 안내가 늦게 노출되어 사용자가 조건을 기억에만 의존하게 됩니다.",
    wcagGuidance: "입력 시작 전부터 규칙을 보이게 하고 핵심 조건을 시각적으로 구분해 안내를 강화하세요.",
  }),
  createIssue({
    id: "signup-3",
    pageId: "signup",
    category: "접근성",
    subCategory: "포커스",
    severity: "moderate",
    title: "인증번호 흐름 포커스 이동 불안정",
    selector: 'input[name="otp"]',
    wcag: "2.4.3",
    failCount: 149,
    ageDistribution: { 10: 10, 20: 16, 30: 30, 40: 34, 50: 30, 60: 18, 70: 11 },
    description:
      "OTP 입력칸 사이의 포커스 이동이 일정하지 않아 사용자는 현재 몇 번째 칸에 있는지 다시 확인해야 합니다. 키보드와 저시력 사용자의 조작 자신감이 크게 떨어집니다.",
    tags: ["OTP", "포커스", "인증"],
    targetHtml: '<input name="otp" inputmode="numeric" maxlength="1" />',
    expectedBenefitLabel: "인증 입력 안정화",
    expectedBenefitDelta: "+2%",
    reportedPersona: "30~50대 사용자가 OTP 입력 중 포커스 위치를 자주 잃음",
    prioritySummary: "인증 단계의 작은 포커스 불안정도는 회원가입 포기율로 바로 연결됩니다.",
    heatmapClusters: [
      { x: 0.446, y: 0.704, count: 15, ageBand: "30대", blockRate: 44, repeatCount: 2.0 },
      { x: 0.554, y: 0.726, count: 12, ageBand: "40대", blockRate: 49, repeatCount: 2.3 },
    ],
    beforeCode:
      `input[name="otp"] {\n  width: 40px;\n}\n\ninput[name="otp"]:focus {\n  outline: none;\n}`,
    afterCode:
      `input[name="otp"] {\n  width: 48px;\n  text-align: center;\n}\n\ninput[name="otp"]:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}`,
    impactSummary: "+104명의 사용자가 인증 흐름을 더 안정적으로 완료할 수 있습니다.",
    changeSummaryBody:
      "OTP 입력칸 크기와 포커스 표시를 강화해 현재 칸을 분명히 보이게 하고, 다음 칸 이동을 예측 가능하게 만듭니다.",
    wcagSummary: "인증번호 입력 흐름의 포커스 이동이 불안정해 사용자가 현재 위치를 자주 잃습니다.",
    wcagGuidance: "포커스 순서를 예측 가능하게 유지하고 각 칸의 현재 위치가 분명히 보이도록 스타일을 강화하세요.",
  }),
  createIssue({
    id: "payment-1",
    pageId: "payment",
    category: "사용성",
    subCategory: "피드백",
    severity: "critical",
    title: "비활성 버튼 이유 미표시",
    selector: "button.pay-submit",
    wcag: "3.3.1",
    failCount: 319,
    ageDistribution: { 10: 8, 20: 18, 30: 38, 40: 66, 50: 82, 60: 62, 70: 45 },
    description:
      "결제 버튼이 비활성 상태인 이유가 드러나지 않아 사용자는 다음 행동을 추측해야 합니다. 오류 인식 성공률이 낮은 고연령층일수록 결제 직전 포기 가능성이 크게 높아집니다.",
    tags: ["결제", "비활성", "피드백"],
    targetHtml: '<button class="pay-submit" disabled>결제하기</button>',
    expectedBenefitLabel: "결제 포기 감소",
    expectedBenefitDelta: "+4%",
    reportedPersona: "40대 이상 사용자가 버튼을 여러 번 눌러 본 뒤 결제를 중단함",
    prioritySummary: "결제 완료 직전의 설명 부재는 가장 비싼 이탈을 만드는 전형적인 패턴입니다.",
    heatmapClusters: [
      { x: 0.462, y: 0.836, count: 34, ageBand: "40대", blockRate: 76, repeatCount: 3.1 },
      { x: 0.528, y: 0.874, count: 29, ageBand: "50대", blockRate: 81, repeatCount: 3.5 },
      { x: 0.586, y: 0.902, count: 24, ageBand: "60대", blockRate: 84, repeatCount: 3.9 },
    ],
    beforeCode:
      `<button class="pay-submit" disabled>결제하기</button>`,
    afterCode:
      `<button class="pay-submit" disabled aria-describedby="pay-submit-reason">결제하기</button>\n<p id="pay-submit-reason">약관 동의와 결제 수단 선택을 완료하면 버튼이 활성화됩니다.</p>`,
    impactSummary: "+255명의 사용자가 결제 차단 원인을 더 쉽게 이해할 수 있습니다.",
    changeSummaryBody:
      "비활성 버튼 아래에 즉시 이해 가능한 이유 문구를 연결해, 사용자가 다음 행동을 추측하지 않고 바로 수정할 수 있게 합니다.",
    wcagSummary: "결제 버튼 비활성 사유가 보이지 않아 사용자가 현재 막힌 원인을 이해하지 못합니다.",
    wcagGuidance: "비활성 조건을 버튼과 연결된 설명으로 노출하고, 충족 시점을 명확하게 안내하세요.",
  }),
  createIssue({
    id: "payment-2",
    pageId: "payment",
    category: "시각요소",
    subCategory: "시인성",
    severity: "moderate",
    title: "최종 결제 금액 강조 약함",
    selector: ".total-amount",
    wcag: "1.4.3",
    failCount: 187,
    ageDistribution: { 10: 6, 20: 12, 30: 20, 40: 34, 50: 48, 60: 36, 70: 31 },
    description:
      "최종 결제 금액이 주변 텍스트와 시각적으로 비슷해 다중 정보 처리 부담이 높은 사용자는 핵심 숫자를 다시 찾아야 합니다. 확인 시간이 길어질수록 결제 불안도 커집니다.",
    tags: ["금액", "강조", "결제"],
    targetHtml: '<strong class="total-amount">총 결제금액 128,400원</strong>',
    expectedBenefitLabel: "금액 확인 시간 단축",
    expectedBenefitDelta: "+2%",
    reportedPersona: "50대 이상 사용자가 총액과 할인 내역을 반복 비교함",
    prioritySummary: "결제 총액이 묻히면 결제 직전 확신이 떨어져 이탈로 이어질 수 있습니다.",
    heatmapClusters: [
      { x: 0.558, y: 0.812, count: 16, ageBand: "50대", blockRate: 45, repeatCount: 2.1 },
      { x: 0.612, y: 0.786, count: 12, ageBand: "60대", blockRate: 50, repeatCount: 2.4 },
    ],
    beforeCode:
      `.total-amount {\n  color: #475569;\n  font-size: 16px;\n  font-weight: 500;\n}`,
    afterCode:
      `.total-amount {\n  color: #0f172a;\n  font-size: 20px;\n  font-weight: 800;\n}`,
    impactSummary: "+136명의 사용자가 최종 결제 금액을 더 빠르게 확인할 수 있습니다.",
    changeSummaryBody:
      "총액의 폰트 크기와 굵기를 높여 결제 요약에서 가장 먼저 읽히는 시각 계층으로 끌어올립니다.",
    wcagSummary: "최종 결제 금액이 주변 정보와 시각적으로 비슷해 핵심 숫자가 묻힙니다.",
    wcagGuidance: "총 결제 금액은 더 큰 크기와 강한 대비를 사용해 요약 영역의 최상위 정보로 표현하세요.",
  }),
  createIssue({
    id: "payment-3",
    pageId: "payment",
    category: "사용성",
    subCategory: "흐름",
    severity: "moderate",
    title: "외부 결제창 이동 안내 부족",
    selector: "button.external-pg",
    wcag: "3.2.5",
    failCount: 171,
    ageDistribution: { 10: 10, 20: 16, 30: 24, 40: 36, 50: 34, 60: 28, 70: 23 },
    description:
      "외부 결제창으로 전환된다는 안내가 부족하면 사용자는 흐름이 끊겼다고 느끼고 뒤로 가기를 시도합니다. 방해 후 포기 전환 확률이 높은 연령대에서 특히 불리합니다.",
    tags: ["외부결제", "흐름", "안내"],
    targetHtml: '<button class="external-pg" type="button">카드사 앱에서 결제 계속하기</button>',
    expectedBenefitLabel: "전환 이탈 감소",
    expectedBenefitDelta: "+2%",
    reportedPersona: "40~70대 사용자가 외부 창 전환 순간 결제 중단을 자주 선택함",
    prioritySummary: "결제 수단 전환은 작은 불확실성만 있어도 포기로 이어지는 민감한 구간입니다.",
    heatmapClusters: [
      { x: 0.478, y: 0.886, count: 15, ageBand: "40대", blockRate: 43, repeatCount: 1.9 },
      { x: 0.542, y: 0.914, count: 11, ageBand: "50대", blockRate: 48, repeatCount: 2.2 },
    ],
    beforeCode:
      `<button class="external-pg" type="button">결제 계속</button>`,
    afterCode:
      `<p class="pg-transition-note">잠시 후 카드사 결제창으로 이동합니다. 결제 완료 후 현재 화면으로 돌아옵니다.</p>\n<button class="external-pg" type="button">카드사 앱에서 결제 계속하기</button>`,
    impactSummary: "+111명의 사용자가 외부 결제창 전환을 더 안심하고 진행할 수 있습니다.",
    changeSummaryBody:
      "전환 직전 안내 문구를 추가해 사용자가 무엇이 일어날지 예상할 수 있게 하고, 흐름 단절에 대한 불안을 낮춥니다.",
    wcagSummary: "외부 결제창 이동 안내가 약해 사용자가 흐름이 끊긴 것으로 오해하기 쉽습니다.",
    wcagGuidance: "전환 전과 후의 흐름을 짧은 문장으로 설명해 예기치 않은 화면 이동처럼 느껴지지 않게 하세요.",
  }),
  createIssue({
    id: "payment-4",
    pageId: "payment",
    category: "접근성",
    subCategory: "포커스",
    severity: "minor",
    title: "약관 체크 포커스 표시 약함",
    selector: "input.terms-check",
    wcag: "2.4.7",
    failCount: 82,
    ageDistribution: { 10: 4, 20: 8, 30: 18, 40: 22, 50: 16, 60: 8, 70: 6 },
    description:
      "약관 체크박스의 포커스 표시가 희미해 키보드 사용자가 현재 선택 위치를 한 번 더 확인하게 됩니다. 체크 누락은 결제 버튼 비활성과 결합해 혼란을 키웁니다.",
    tags: ["약관", "포커스", "체크박스"],
    targetHtml: '<input class="terms-check" type="checkbox" />',
    expectedBenefitLabel: "약관 체크 인지 개선",
    expectedBenefitDelta: "+1%",
    reportedPersona: "30~50대 키보드 사용자가 약관 체크 위치를 놓치는 경우가 반복됨",
    prioritySummary: "작은 포커스 약화가 결제 마지막 단계의 차단 요인과 결합해 체감 불편을 키웁니다.",
    heatmapClusters: [
      { x: 0.158, y: 0.888, count: 9, ageBand: "40대", blockRate: 31, repeatCount: 1.5 },
    ],
    beforeCode:
      `.terms-check:focus-visible {\n  outline: 1px solid #cbd5e1;\n}`,
    afterCode:
      `.terms-check:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 3px;\n  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);\n}`,
    impactSummary: "+55명의 사용자가 약관 체크 위치를 더 분명히 인지할 수 있습니다.",
    changeSummaryBody:
      "체크박스 포커스 테두리와 보조 그림자를 강화해 키보드 탐색 중 현재 위치를 확실하게 드러냅니다.",
    wcagSummary: "약관 체크박스의 포커스 표시가 약해 키보드 사용자가 현재 위치를 놓치기 쉽습니다.",
    wcagGuidance: "체크박스 포커스 스타일을 충분한 대비와 두께로 강화해 위치를 분명히 표시하세요.",
  }),
]

export const resultMasterPageHighlights: Record<ResultMasterPageId, ResultMasterCategory[]> = {
  login: ["시각요소", "접근성", "사용성"],
  main: ["시각요소", "접근성"],
  signup: ["사용성", "접근성"],
  payment: ["사용성", "시각요소", "접근성"],
}

export function getMasterPage(pageId: ResultMasterPageId) {
  return resultMasterPages.find((page) => page.id === pageId) ?? null
}

export function getMasterIssuesByPage(pageId: ResultMasterPageId) {
  return resultMasterIssues.filter((issue) => issue.pageId === pageId)
}

export function getMasterIssue(issueId: string) {
  return resultMasterIssues.find((issue) => issue.id === issueId) ?? null
}

export function getWeightedSuccessRate() {
  const totalSessions = resultMasterAgeProfiles.reduce((sum, profile) => sum + profile.sessions, 0)
  const weightedSuccess = resultMasterAgeProfiles.reduce(
    (sum, profile) => sum + profile.sessions * (profile.successRate / 100),
    0
  )
  return totalSessions > 0 ? weightedSuccess / totalSessions : 0
}
