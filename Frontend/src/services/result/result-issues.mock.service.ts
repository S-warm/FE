import { adaptIssuesResponseToViewModel } from "@/adapters/result/result-issues.adapter"
import { searchResultIssuesMock } from "@/mocks/result-search.mock"
import { demoIssues } from "@/mocks/uxswarm-demo.mock"
import { ApiServiceError } from "@/services/core/api-service-error"
import { SERVICE_CONFIG } from "@/services/core/service-config"
import { mockDelay } from "@/services/core/mock-delay"
import { requestJsonWithFallback } from "@/services/core/http-client"
import type { ResultIssuesService } from "@/services/result/result-issues.service"
import type {
  SimulationBusinessIssueDto,
  SimulationIssuesApiResponseDto,
  SimulationIssuesBusinessResponseDto,
} from "@/types/api/simulation/simulation-issues.response"

function toBusinessCategory(category: string) {
  if (category === "접근성" || category === "accessibility") return "접근성"
  if (category === "사용성" || category === "usability") return "사용성"
  if (category === "시각요소" || category === "visual") return "시각요소"
  return "기타"
}

function toBusinessSeverity(severity: string): SimulationBusinessIssueDto["severity"] {
  const normalized = severity.trim().toLowerCase()

  if (normalized === "critical") return "critical"
  if (normalized === "high") return "high"
  if (normalized === "medium") return "medium"
  if (normalized === "low") return "low"
  return "LOW"
}

function buildMockFallbackResponse(): SimulationIssuesBusinessResponseDto {
  const demoMappedIssues: SimulationBusinessIssueDto[] = demoIssues.slice(0, 3).map((issue, index) => ({
    issueId: issue.issueId,
    url: issue.url,
    category: toBusinessCategory(issue.category),
    subCategory: index === 0 ? "버튼 인지 실패" : index === 1 ? "입력 흐름 혼선" : "시선 분산",
    severity: toBusinessSeverity(issue.severity),
    title: issue.title,
    description: issue.description,
    targetHtml: issue.targetHtml,
    tags: [...issue.tags],
    fail_count: Math.max(4, issue.affectedUsersCount),
    fail_rate: Math.max(0.02, issue.affectedUsersPercent / 100),
    session_ids: [`demo-session-${index + 1}-a`, `demo-session-${index + 1}-b`],
    persona_ages: index === 0 ? ["70s", "70s"] : index === 1 ? ["50s", "60s"] : ["20s", "70s"],
    affected_personas:
      index === 0
        ? [
            { session_id: `demo-session-${index + 1}-a`, persona_age: "70s" },
            { session_id: `demo-session-${index + 1}-b`, persona_age: "70s" },
          ]
        : [
            { session_id: `demo-session-${index + 1}-a`, persona_age: index === 1 ? "50s" : "20s" },
            { session_id: `demo-session-${index + 1}-b`, persona_age: index === 1 ? "60s" : "70s" },
          ],
  }))

  const searchMappedIssues: SimulationBusinessIssueDto[] = searchResultIssuesMock.slice(0, 1).map((issue) => ({
    issueId: issue.issueId,
    url: issue.url,
    category: toBusinessCategory(issue.category),
    subCategory: "탐색 동선 누락",
    severity: toBusinessSeverity(issue.severity),
    title: issue.title,
    description: issue.description,
    targetHtml: issue.targetHtml,
    tags: [...issue.tags],
    fail_count: issue.affectedUsersCount,
    fail_rate: issue.affectedUsersPercent / 100,
    session_ids: ["search-session-a", "search-session-b", "search-session-c"],
    persona_ages: ["30s", "50s", "70s"],
    affected_personas: [
      { session_id: "search-session-a", persona_age: "30s" },
      { session_id: "search-session-b", persona_age: "50s" },
      { session_id: "search-session-c", persona_age: "70s" },
    ],
  }))

  const previewIssues: SimulationBusinessIssueDto[] = [
    {
      issueId: "preview-issue-1",
      url: "https://www.dbpia.co.kr/search/topSearch",
      pageName: "검색 결과",
      category: "사용성",
      subCategory: "시인성 부족",
      severity: "high",
      title: "검색 결과 필터 버튼 인식 실패",
      description:
        "70대 페르소나가 검색 결과 페이지에서 필터 버튼을 반복적으로 탐색하지 못하고 declare_failure 발생. 상단 tier 요소에 필터가 노출되지 않는 레이아웃 문제로 추정.",
      targetHtml: "검색 결과 상단의 필터/정렬 버튼 영역",
      tags: ["필터", "검색", "고령"],
      fail_count: 18,
      fail_rate: 0.06,
      session_ids: ["sess_abc123", "sess_def456"],
      persona_ages: ["70s", "70s"],
      affected_personas: [
        { session_id: "sess_abc123", persona_age: "70s" },
        { session_id: "sess_def456", persona_age: "70s" },
      ],
    },
    {
      issueId: "preview-issue-2",
      url: "https://www.dbpia.co.kr/journal/articleDetail",
      pageName: "논문 상세",
      category: "접근성",
      subCategory: "클릭 영역 불명확",
      severity: "medium",
      title: "논문 다운로드 버튼 클릭 영역 협소",
      description:
        "50대/70대 페르소나에서 다운로드 버튼 클릭 실패 반복. 버튼 텍스트는 상단 tier에서 인식되나 실제 클릭 타겟 영역이 좁아 오클릭이 발생한다.",
      targetHtml: "논문 상세 페이지 다운로드 버튼",
      tags: ["다운로드", "클릭영역"],
      fail_count: 9,
      fail_rate: 0.03,
      session_ids: ["sess_ghi789", "sess_jkl012"],
      persona_ages: ["50s", "70s"],
      affected_personas: [
        { session_id: "sess_ghi789", persona_age: "50s" },
        { session_id: "sess_jkl012", persona_age: "70s" },
      ],
    },
    {
      issueId: "preview-issue-3",
      url: "https://www.dbpia.co.kr/search/topSearch",
      pageName: "검색 결과",
      category: "시각요소",
      subCategory: "행동 유도 버튼 대비 부족",
      severity: "high",
      title: "정렬 버튼과 주변 텍스트의 명도 대비 부족",
      description:
        "20대와 50대 페르소나가 정렬 버튼을 일반 텍스트로 오인해 탐색 시간이 증가했다. CTA와 메타 정보가 동일 톤으로 배치된 영향으로 보인다.",
      targetHtml: "검색 결과 리스트 상단 정렬 버튼",
      tags: ["정렬", "대비", "CTA"],
      fail_count: 12,
      fail_rate: 0.11,
      session_ids: ["sess_sort_001", "sess_sort_002", "sess_sort_003"],
      persona_ages: ["20s", "50s", "50s"],
      affected_personas: [
        { session_id: "sess_sort_001", persona_age: "20s" },
        { session_id: "sess_sort_002", persona_age: "50s" },
        { session_id: "sess_sort_003", persona_age: "50s" },
      ],
    },
    {
      issueId: "preview-issue-4",
      url: "https://www.dbpia.co.kr/mypage/recent",
      pageName: "최근 본 문헌",
      category: "사용성",
      subCategory: "탐색 우선순위 혼선",
      severity: "low",
      title: "최근 본 문헌에서 재열람 버튼 우선순위가 낮음",
      description:
        "30대와 70대 페르소나가 다시 읽기 진입 경로를 찾는 동안 목록 메타 정보에 시선을 빼앗겼다. 재열람 CTA의 시각적 우선순위가 충분하지 않다.",
      targetHtml: "최근 본 문헌 카드의 다시 읽기 버튼",
      tags: ["마이페이지", "재열람", "우선순위"],
      fail_count: 5,
      fail_rate: 0.19,
      session_ids: ["sess_recent_001", "sess_recent_002"],
      persona_ages: ["30s", "70s"],
      affected_personas: [
        { session_id: "sess_recent_001", persona_age: "30s" },
        { session_id: "sess_recent_002", persona_age: "70s" },
      ],
    },
  ]

  const mergedIssues = [...previewIssues, ...demoMappedIssues, ...searchMappedIssues]

  return {
    total_issues: mergedIssues.length,
    issues: mergedIssues,
  }
}

function hasUsableIssuesPayload(raw: SimulationIssuesApiResponseDto) {
  if ("total_issues" in raw) {
    return Array.isArray(raw.issues) && raw.issues.length > 0
  }

  return Array.isArray(raw.pages) && raw.pages.some((page) => page.issues.length > 0)
}

const issuesPreviewResponse = buildMockFallbackResponse()

export const resultIssuesMockService: ResultIssuesService = {
  async getIssues(simulationId) {
    await mockDelay()
    return adaptIssuesResponseToViewModel(simulationId, issuesPreviewResponse)
  },
}

export const resultIssuesHttpService: ResultIssuesService = {
  async getIssues(simulationId) {
    if (SERVICE_CONFIG.useIssuesPreviewData) {
      return adaptIssuesResponseToViewModel(simulationId, issuesPreviewResponse)
    }

    try {
      const raw = await requestJsonWithFallback<SimulationIssuesApiResponseDto>([
        `/api/simulations/${simulationId}/issues`,
        `/api/simulations/${simulationId}/results/issues`,
        `/simulations/${simulationId}/issues`,
      ])

      if (!hasUsableIssuesPayload(raw)) {
        return adaptIssuesResponseToViewModel(simulationId, issuesPreviewResponse)
      }

      return adaptIssuesResponseToViewModel(simulationId, raw)
    } catch (error) {
      if (error instanceof ApiServiceError && error.status === 404) {
        return adaptIssuesResponseToViewModel(simulationId, issuesPreviewResponse)
      }

      throw error
    }
  },
}
