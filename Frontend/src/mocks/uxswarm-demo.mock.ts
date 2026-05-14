/**
 * UX-Swarm Demo Mock Data v3 - 백엔드 폼 100% 준수
 * ================================================
 *
 * 백엔드 API 응답 스키마와 완전 일치하는 시연용 통합 Mock 데이터.
 *
 * v2 대비 변경점:
 *   - persona_ages: 숫자[] → 문자열[] ("50s", "60s", "70s")
 *   - affected_personas 신규 필드: [{session_id, persona_age}]
 *   - wcag.json에서 _summary 제거 (클라이언트 계산 - MOCK_WCAG_SUMMARY로 별도 export)
 *   - issue 객체 첫 필드를 url로 정렬 (백엔드 예시 순서)
 *
 * 시나리오 (v2 유지):
 *   - A-Mall 쇼핑몰 8페이지 구매 퍼널
 *   - 페르소나: 1,000명 (10s~70s 7그룹)
 *   - 전체 성공률: 28%
 *   - 이슈 42건, WCAG 위반 48건, 히트맵 168 포인트
 */

// ============================================================================
// 타입 정의 (백엔드 응답 스키마 기반)
// ============================================================================

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s' | '70s';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type HeatmapSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WcagSeverity = 'Critical' | 'Moderate' | 'Minor';
export type WcagLabel = 'AAA' | 'AA' | 'A' | '미달';

export interface SummaryAggregation {
  summary: {
    total_sessions: number;
    success_count: number;
    success_rate: number;
    avg_duration_ms: number;
  };
  overview: Array<{
    age_group: AgeGroup;
    total_sessions: number;
    success_count: number;
    success_rate: number;
    fail_rate: number;
    avg_duration_ms: number;
    avg_actions: number;
    avg_declare_failure: number;
  }>;
}

/** 백엔드 응답 스키마와 100% 일치 */
export interface AffectedPersona {
  session_id: string;
  persona_age: AgeGroup;
}

export interface IssueItem {
  url: string;
  category: string;
  subCategory: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  targetHtml: string;
  tags: string[];
  fail_count: number;
  fail_rate: number;
  session_ids: string[];
  persona_ages: AgeGroup[];
  affected_personas: AffectedPersona[];
}

export interface FinalIssues {
  total_issues: number;
  issues: IssueItem[];
}

export interface HeatmapPoint {
  issueId: string;
  url: string;
  x: number;
  y: number;
  ageBand: AgeGroup;
  count: number;
  severity: HeatmapSeverity;
  errorType: string;
}

export interface HeatmapAggregation {
  errorPoints: HeatmapPoint[];
}

export interface WcagViolation {
  wcagIssueId: string;
  title: string;
  severity: WcagSeverity;
  description: string;
  html: string;
  wcag_criteria: string;
}

export interface WcagUrlResult {
  score: number;
  wcagLabel: WcagLabel;
  distribution: {
    Critical: number;
    Moderate: number;
    Minor: number;
  };
  violations: WcagViolation[];
}

export interface WcagData {
  urls: Record<string, WcagUrlResult>;
}

export interface FixItem {
  issue_title: string;
  selector: string;
  before: string;
  after: string;
  description: string;
  impact: string;
}

export interface FixData {
  url: string;
  fixes: FixItem[];
}

// ============================================================================
// 시뮬레이션 메타
// ============================================================================

export const MOCK_SIMULATION_META = {
  id: "mock1778490365303",
  title: "A-Mall 회원가입 및 구매 플로우",
  siteName: "A-Mall",
  targetUrl: "https://a-mall.com/login",
  endUrl: "https://a-mall.com/payment/complete",
  personaCount: 1000,
  successCondition: "회원가입 후 첫 상품 결제 완료",
  device: "Mac",
  status: "완료",
  createdAt: "2026-04-07T14:30:00",
} as const;

// 최근 프로젝트 사이드바용
export const MOCK_RECENT_PROJECTS = [
  { id: 1, title: 'A - Mall', updatedAt: '2026-01-01', daysAgo: 130 },
  { id: 2, title: 'A - Mall', updatedAt: '2026-01-01', daysAgo: 130 },
  { id: 3, title: 'Fiora', updatedAt: '2026-01-01', daysAgo: 130 },
  { id: 4, title: 'Sample Shop', updatedAt: '2026-01-01', daysAgo: 130 },
  { id: 5, title: 'Demo Store', updatedAt: '2026-01-01', daysAgo: 130 },
] as const;

// 페이지 메타 (8페이지)
export const MOCK_PAGES = [
  {
    key: "login",
    label: "로그인 페이지",
    url: "https://a-mall.com/login",
    issueCount: 5,
  },
  {
    key: "signup",
    label: "회원가입 페이지",
    url: "https://a-mall.com/signup",
    issueCount: 6,
  },
  {
    key: "main",
    label: "메인 페이지",
    url: "https://a-mall.com/main",
    issueCount: 6,
  },
  {
    key: "product",
    label: "상품 상세 페이지",
    url: "https://a-mall.com/product/12847",
    issueCount: 5,
  },
  {
    key: "cart",
    label: "장바구니 페이지",
    url: "https://a-mall.com/cart",
    issueCount: 5,
  },
  {
    key: "checkout",
    label: "배송지 페이지",
    url: "https://a-mall.com/checkout",
    issueCount: 5,
  },
  {
    key: "payment",
    label: "결제 페이지",
    url: "https://a-mall.com/payment",
    issueCount: 6,
  },
  {
    key: "mypage",
    label: "마이페이지",
    url: "https://a-mall.com/mypage",
    issueCount: 4,
  },
] as const;

// ============================================================================
// 1. Overview (summary_aggregation.json)
// ============================================================================

export const MOCK_SUMMARY: SummaryAggregation = {
  summary: {
    total_sessions: 1000,
    success_count: 280,
    success_rate: 0.28,
    avg_duration_ms: 252000,
  },
  overview: [
    {
      age_group: "10s",
      total_sessions: 100,
      success_count: 62,
      success_rate: 0.62,
      fail_rate: 0.38,
      avg_duration_ms: 66000,
      avg_actions: 7.42,
      avg_declare_failure: 0.38,
    },
    {
      age_group: "20s",
      total_sessions: 200,
      success_count: 96,
      success_rate: 0.48,
      fail_rate: 0.52,
      avg_duration_ms: 78000,
      avg_actions: 8.31,
      avg_declare_failure: 0.52,
    },
    {
      age_group: "30s",
      total_sessions: 200,
      success_count: 76,
      success_rate: 0.38,
      fail_rate: 0.62,
      avg_duration_ms: 132000,
      avg_actions: 10.12,
      avg_declare_failure: 0.62,
    },
    {
      age_group: "40s",
      total_sessions: 200,
      success_count: 36,
      success_rate: 0.18,
      fail_rate: 0.82,
      avg_duration_ms: 234000,
      avg_actions: 12.84,
      avg_declare_failure: 0.82,
    },
    {
      age_group: "50s",
      total_sessions: 150,
      success_count: 8,
      success_rate: 0.0533,
      fail_rate: 0.9467,
      avg_duration_ms: 348000,
      avg_actions: 15.21,
      avg_declare_failure: 0.95,
    },
    {
      age_group: "60s",
      total_sessions: 100,
      success_count: 2,
      success_rate: 0.02,
      fail_rate: 0.98,
      avg_duration_ms: 462000,
      avg_actions: 17.63,
      avg_declare_failure: 0.98,
    },
    {
      age_group: "70s",
      total_sessions: 50,
      success_count: 0,
      success_rate: 0.0,
      fail_rate: 1.0,
      avg_duration_ms: 528000,
      avg_actions: 18.94,
      avg_declare_failure: 1.0,
    },
  ],
};

// ============================================================================
// 2. Final Issues (final_issues.json) - 42건, 백엔드 폼 100% 준수
// ============================================================================

export const MOCK_FINAL_ISSUES: FinalIssues = {
  total_issues: 42,
  issues: [
    {
      url: "https://a-mall.com/login",
      category: "사용성",
      subCategory: "시인성 부족",
      severity: "high",
      title: "로그인 버튼이 배경과 구분되지 않음",
      description: "로그인 버튼 배경(#E8EEF7)이 페이지 배경(#FFFFFF)과 대비비 1.18:1로 WCAG AA 기준 4.5:1을 크게 미달합니다. 50대 이상 페르소나의 73%가 로그인 버튼을 인지하지 못하고 'Google로 시작하기' 버튼을 먼저 시도하는 패턴이 반복 관찰되었습니다.",
      targetHtml: "<button class=\"login-submit\">로그인</button>",
      tags: [
        "로그인",
        "버튼 시인성",
        "대비비",
      ],
      fail_count: 312,
      fail_rate: 0.312,
      session_ids: [
        "AI-sess_0001",
        "AI-sess_0002",
        "AI-sess_0003",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0001",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0002",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0003",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/login",
      category: "접근성",
      subCategory: "포커스 표시 부족",
      severity: "medium",
      title: "비밀번호 표시 토글 버튼이 너무 작음",
      description: "비밀번호 입력란 우측의 눈 아이콘이 16x16px로 60대 이상 페르소나의 시각 탐색 범위(중심 시야 50%) 밖에 위치합니다. 시뮬레이션 결과 60대+에서는 81%가 해당 버튼을 발견하지 못했습니다.",
      targetHtml: "<button aria-label=\"비밀번호 표시\" class=\"password-toggle\">",
      tags: [
        "비밀번호",
        "터치 영역",
        "아이콘 크기",
      ],
      fail_count: 124,
      fail_rate: 0.124,
      session_ids: [
        "AI-sess_0004",
        "AI-sess_0005",
        "AI-sess_0006",
      ],
      persona_ages: [
        "60s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0004",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0005",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0006",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/login",
      category: "시각요소",
      subCategory: "가독성",
      severity: "medium",
      title: "입력 필드 placeholder 텍스트 대비 부족",
      description: "아이디·비밀번호 입력 필드의 placeholder 텍스트(#CBD5E1)가 배경(#FFFFFF) 대비 2.1:1로 표기됩니다. 50대+ 페르소나의 38%가 첫 클릭 전 입력 안내를 인지하지 못했습니다.",
      targetHtml: "<input placeholder=\"아이디를 입력하세요\" />",
      tags: [
        "로그인",
        "placeholder",
        "대비비",
      ],
      fail_count: 156,
      fail_rate: 0.156,
      session_ids: [
        "AI-sess_0007",
        "AI-sess_0008",
        "AI-sess_0009",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0007",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0008",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0009",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/login",
      category: "사용성",
      subCategory: "오류 안내",
      severity: "high",
      title: "로그인 실패 메시지 위치가 입력 필드와 분리됨",
      description: "로그인 실패 시 오류 메시지가 폼 상단에만 표시되어 입력 필드와 시각적·구조적으로 분리되어 있습니다. 40대+ 페르소나의 52%가 두 번째 실패 시점까지 메시지를 인지하지 못했습니다.",
      targetHtml: "<div class=\"error-banner\" role=\"alert\">아이디 또는 비밀번호가 일치하지 않습니다</div>",
      tags: [
        "로그인",
        "오류 메시지",
        "위치",
      ],
      fail_count: 214,
      fail_rate: 0.214,
      session_ids: [
        "AI-sess_0010",
        "AI-sess_0011",
        "AI-sess_0012",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0010",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0011",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0012",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/login",
      category: "사용성",
      subCategory: "링크 시인성",
      severity: "low",
      title: "'회원가입' 링크가 본문과 같은 색상",
      description: "'아직 계정이 없으신가요? 회원가입' 영역에서 '회원가입' 링크가 본문과 동일한 #1F2937·14px로 표기되어 링크임을 알 수 없습니다. 신규 가입 의도 페르소나의 23%가 링크를 찾지 못했습니다.",
      targetHtml: "<a href=\"/signup\" class=\"signup-link\">회원가입</a>",
      tags: [
        "로그인",
        "링크",
        "신규 가입",
      ],
      fail_count: 68,
      fail_rate: 0.068,
      session_ids: [
        "AI-sess_0013",
        "AI-sess_0014",
        "AI-sess_0015",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0013",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0014",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0015",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/signup",
      category: "접근성",
      subCategory: "필수 정보 전달",
      severity: "high",
      title: "필수 입력 표시가 색상에만 의존함",
      description: "회원가입 폼의 필수 입력 항목이 빨간색 asterisk(*)로만 구분되며 텍스트 라벨이 없습니다. 색약·저시력 페르소나(전체의 8%)는 필수 여부를 인지하지 못하고 빈 칸 제출 후 오류를 만나는 패턴이 84% 반복되었습니다.",
      targetHtml: "<label class=\"required-asterisk\">이메일 <span style=\"color:red\">*</span></label>",
      tags: [
        "회원가입",
        "필수 항목",
        "색약",
      ],
      fail_count: 187,
      fail_rate: 0.187,
      session_ids: [
        "AI-sess_0016",
        "AI-sess_0017",
        "AI-sess_0018",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0016",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0017",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0018",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/signup",
      category: "사용성",
      subCategory: "안내 시점",
      severity: "medium",
      title: "비밀번호 규칙이 입력 후에만 표시됨",
      description: "비밀번호 규칙(8자 이상, 영문+숫자+특수문자)이 입력 필드 클릭 후 포커스 시에만 노출됩니다. Tier 2 작업 기억 제약(7±2)으로 인해 50대+ 페르소나의 68%가 규칙을 잊고 재입력을 반복(평균 2.4회)했습니다.",
      targetHtml: "<div class=\"password-hint\" data-show-on=\"focus\">",
      tags: [
        "회원가입",
        "비밀번호",
        "작업 기억",
      ],
      fail_count: 96,
      fail_rate: 0.096,
      session_ids: [
        "AI-sess_0019",
        "AI-sess_0020",
        "AI-sess_0021",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0019",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0020",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0021",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/signup",
      category: "사용성",
      subCategory: "포커스 흐름",
      severity: "high",
      title: "인증번호 입력 박스 포커스 자동 이동 실패",
      description: "휴대폰 인증번호 6자리 분할 입력 박스에서 한 자리 입력 후 다음 박스로 자동 포커스 이동이 일부 브라우저에서 작동하지 않습니다. 시뮬레이션 결과 240명(33%)이 인증 단계에서 이탈, 그 중 70대는 100%가 이탈했습니다.",
      targetHtml: "<input class=\"otp-digit\" maxlength=\"1\" />",
      tags: [
        "회원가입",
        "인증번호",
        "포커스",
      ],
      fail_count: 240,
      fail_rate: 0.24,
      session_ids: [
        "AI-sess_0022",
        "AI-sess_0023",
        "AI-sess_0024",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0022",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0023",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0024",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/signup",
      category: "접근성",
      subCategory: "터치 영역",
      severity: "medium",
      title: "약관 동의 체크박스의 클릭 영역이 좁음",
      description: "약관 동의 체크박스가 14x14px로 WCAG 권장 44x44px 미달이며 라벨 영역으로 클릭이 확장되지 않습니다. 모바일 페르소나의 47%가 다중 시도(평균 2.3회)로 체크에 성공했습니다.",
      targetHtml: "<input type=\"checkbox\" id=\"agree-marketing\" />",
      tags: [
        "회원가입",
        "약관",
        "터치 영역",
      ],
      fail_count: 142,
      fail_rate: 0.142,
      session_ids: [
        "AI-sess_0025",
        "AI-sess_0026",
        "AI-sess_0027",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0025",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0026",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0027",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/signup",
      category: "사용성",
      subCategory: "검증 안내",
      severity: "medium",
      title: "이메일 형식 오류 안내가 제출 후에만 표시",
      description: "이메일 입력 필드에서 형식 오류가 blur 시점이 아닌 제출 버튼 클릭 후에만 표시됩니다. 페르소나의 31%가 다른 필드를 모두 입력한 뒤 오류로 인해 첫 필드로 돌아가는 패턴이 관찰되었습니다.",
      targetHtml: "<input type=\"email\" name=\"email\" />",
      tags: [
        "회원가입",
        "이메일",
        "실시간 검증",
      ],
      fail_count: 108,
      fail_rate: 0.108,
      session_ids: [
        "AI-sess_0028",
        "AI-sess_0029",
        "AI-sess_0030",
      ],
      persona_ages: [
        "20s",
        "30s",
        "40s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0028",
          persona_age: "20s",
        },
        {
          session_id: "AI-sess_0029",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0030",
          persona_age: "40s",
        },
      ],
    },
    {
      url: "https://a-mall.com/signup",
      category: "시각요소",
      subCategory: "정보 위계",
      severity: "low",
      title: "생년월일 입력 형식 안내 부족",
      description: "생년월일 입력란에 '예: 1990-01-01' 형식 안내가 placeholder로만 짧게 노출되어 50대+ 페르소나의 28%가 'YYYY/MM/DD'·'1990.01.01' 등 다른 형식으로 입력 후 오류를 만났습니다.",
      targetHtml: "<input name=\"birth\" placeholder=\"1990-01-01\" />",
      tags: [
        "회원가입",
        "입력 형식",
        "안내",
      ],
      fail_count: 74,
      fail_rate: 0.074,
      session_ids: [
        "AI-sess_0031",
        "AI-sess_0032",
        "AI-sess_0033",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0031",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0032",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0033",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/main",
      category: "시각요소",
      subCategory: "CTA 가시성",
      severity: "high",
      title: "히어로 CTA 버튼이 배경 이미지에 묻힘",
      description: "메인 페이지 히어로 영역의 '쇼핑 시작하기' CTA가 배경 이미지 위 회색 텍스트(#475569)로 표기되어 대비비 3.2:1로 4.5:1 미달. 시뮬레이션 상 210명(21%)이 해당 CTA를 발견하지 못하고 하단 카테고리 메뉴로 이동했습니다.",
      targetHtml: "<a data-cta=\"primary\" class=\"hero-cta\">쇼핑 시작하기</a>",
      tags: [
        "메인",
        "CTA",
        "히어로",
      ],
      fail_count: 210,
      fail_rate: 0.21,
      session_ids: [
        "AI-sess_0034",
        "AI-sess_0035",
        "AI-sess_0036",
      ],
      persona_ages: [
        "20s",
        "30s",
        "40s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0034",
          persona_age: "20s",
        },
        {
          session_id: "AI-sess_0035",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0036",
          persona_age: "40s",
        },
      ],
    },
    {
      url: "https://a-mall.com/main",
      category: "사용성",
      subCategory: "정보 탐색",
      severity: "medium",
      title: "상단 검색창 위치 식별 어려움",
      description: "검색창이 헤더 우측 끝에 아이콘 형태로만 노출되어 F-Pattern 시선 흐름에서 벗어납니다. 30대+ 페르소나의 47%가 검색 작업 시 헤더 좌측-중앙을 먼저 스캔한 후 평균 3.2회 시선 이동 후에야 검색창을 발견했습니다.",
      targetHtml: "<button class=\"header-search-toggle\" aria-label=\"검색\">",
      tags: [
        "검색",
        "헤더",
        "F-Pattern",
      ],
      fail_count: 168,
      fail_rate: 0.168,
      session_ids: [
        "AI-sess_0037",
        "AI-sess_0038",
        "AI-sess_0039",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0037",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0038",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0039",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/main",
      category: "시각요소",
      subCategory: "가독성",
      severity: "medium",
      title: "상품 카드의 가격 표기가 14px로 작음",
      description: "상품 카드 가격이 14px 회색(#94A3B8)으로 표기되어 50대+ 페르소나의 최소 가독 기준(16px)을 미충족합니다. 가격을 인지하지 못한 페르소나는 '담기' 버튼을 누른 후 장바구니에서 가격을 확인하는 추가 단계를 거치며 평균 38초 지연이 발생했습니다.",
      targetHtml: "<span class=\"product-price\">29,800원</span>",
      tags: [
        "가격",
        "상품 카드",
        "폰트 크기",
      ],
      fail_count: 142,
      fail_rate: 0.142,
      session_ids: [
        "AI-sess_0040",
        "AI-sess_0041",
        "AI-sess_0042",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0040",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0041",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0042",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/main",
      category: "사용성",
      subCategory: "네비게이션",
      severity: "medium",
      title: "카테고리 메뉴가 호버에만 의존",
      description: "전체 카테고리 메뉴가 마우스 호버로만 열려 터치 디바이스 페르소나의 41%가 1차 시도에 메뉴를 열지 못했습니다. 모바일 사용자 시뮬레이션에서 평균 1분 24초의 탐색 지연이 발생했습니다.",
      targetHtml: "<nav class=\"category-menu\" data-trigger=\"hover\">",
      tags: [
        "메인",
        "카테고리",
        "호버",
      ],
      fail_count: 196,
      fail_rate: 0.196,
      session_ids: [
        "AI-sess_0043",
        "AI-sess_0044",
        "AI-sess_0045",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0043",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0044",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0045",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/main",
      category: "사용성",
      subCategory: "주의력",
      severity: "low",
      title: "배너 슬라이드 자동 전환 속도가 너무 빠름",
      description: "히어로 배너 슬라이드가 3초 간격으로 자동 전환되어 50대+ 페르소나가 콘텐츠를 읽기 전에 다음 슬라이드로 이동합니다. WCAG 2.2.2 시간 제한 일시 정지 권장 위반.",
      targetHtml: "<div class=\"hero-slider\" data-interval=\"3000\">",
      tags: [
        "메인",
        "슬라이드",
        "시간 제한",
      ],
      fail_count: 86,
      fail_rate: 0.086,
      session_ids: [
        "AI-sess_0046",
        "AI-sess_0047",
        "AI-sess_0048",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0046",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0047",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0048",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/main",
      category: "사용성",
      subCategory: "정보 종료",
      severity: "low",
      title: "무한 스크롤 끝점 안내 없음",
      description: "메인 페이지 상품 목록이 무한 스크롤로 로드되나 끝에 도달 시 안내가 없어 페르소나의 18%가 '계속 더 있다'고 오인하여 스크롤을 반복했습니다.",
      targetHtml: "<div class=\"infinite-scroll-container\">",
      tags: [
        "메인",
        "무한 스크롤",
        "안내",
      ],
      fail_count: 62,
      fail_rate: 0.062,
      session_ids: [
        "AI-sess_0049",
        "AI-sess_0050",
        "AI-sess_0051",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0049",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0050",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0051",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/product/12847",
      category: "사용성",
      subCategory: "버튼 위치",
      severity: "high",
      title: "'장바구니 담기' 버튼 위치가 비표준",
      description: "장바구니 담기 버튼이 페이지 하단 상품 설명 아래에 위치하여 페르소나의 38%가 발견하지 못하고 이탈했습니다. 일반적인 쇼핑몰 표준(상품 이미지 우측)을 벗어남.",
      targetHtml: "<button class=\"add-to-cart bottom-floating\">장바구니 담기</button>",
      tags: [
        "상품 상세",
        "장바구니",
        "버튼 위치",
      ],
      fail_count: 238,
      fail_rate: 0.238,
      session_ids: [
        "AI-sess_0052",
        "AI-sess_0053",
        "AI-sess_0054",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0052",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0053",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0054",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/product/12847",
      category: "접근성",
      subCategory: "터치 영역",
      severity: "medium",
      title: "옵션 선택 드롭다운이 너무 작음",
      description: "사이즈·색상 선택 드롭다운이 28x28px로 60대 이상 페르소나의 정밀 클릭이 어렵습니다. 시뮬레이션 결과 60대+ 페르소나의 평균 클릭 시도 횟수가 3.8회로 측정되었습니다.",
      targetHtml: "<select class=\"option-selector\" name=\"size\">",
      tags: [
        "상품 상세",
        "옵션 선택",
        "드롭다운",
      ],
      fail_count: 134,
      fail_rate: 0.134,
      session_ids: [
        "AI-sess_0055",
        "AI-sess_0056",
        "AI-sess_0057",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0055",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0056",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0057",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/product/12847",
      category: "시각요소",
      subCategory: "발견 가능성",
      severity: "medium",
      title: "상품 이미지 확대 버튼 발견 어려움",
      description: "상품 이미지 확대(돋보기) 아이콘이 이미지 우측 하단 모서리에 14x14px로 표시되어 페르소나의 64%가 발견하지 못했습니다. 이미지 클릭 시 확대 기능 안내가 없음.",
      targetHtml: "<button class=\"image-zoom\" aria-label=\"확대\">",
      tags: [
        "상품 상세",
        "이미지 확대",
        "발견 가능성",
      ],
      fail_count: 184,
      fail_rate: 0.184,
      session_ids: [
        "AI-sess_0058",
        "AI-sess_0059",
        "AI-sess_0060",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0058",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0059",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0060",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/product/12847",
      category: "접근성",
      subCategory: "색맹 대응",
      severity: "medium",
      title: "리뷰 별점이 색상에만 의존함",
      description: "리뷰 별점이 노란색·회색 별로만 구분되며 텍스트 점수가 인접 표기되지 않습니다. 적록 색맹 페르소나(전체의 8%)는 별점 인지에 평균 4.2초 추가 시간이 소요됩니다.",
      targetHtml: "<div class=\"star-rating\" data-score=\"4.2\">",
      tags: [
        "상품 상세",
        "리뷰",
        "색맹",
      ],
      fail_count: 78,
      fail_rate: 0.078,
      session_ids: [
        "AI-sess_0061",
        "AI-sess_0062",
        "AI-sess_0063",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0061",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0062",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0063",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/product/12847",
      category: "시각요소",
      subCategory: "가독성",
      severity: "low",
      title: "재고 표시가 12px로 매우 작음",
      description: "'재고 3개 남음' 문구가 12px 회색(#94A3B8)으로 표기되어 60대+ 페르소나의 93%가 인지하지 못했습니다. 긴급성 정보의 시각적 위계 부재.",
      targetHtml: "<span class=\"stock-warning\">재고 3개 남음</span>",
      tags: [
        "상품 상세",
        "재고",
        "긴급성",
      ],
      fail_count: 52,
      fail_rate: 0.052,
      session_ids: [
        "AI-sess_0064",
        "AI-sess_0065",
        "AI-sess_0066",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0064",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0065",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0066",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/cart",
      category: "접근성",
      subCategory: "터치 영역",
      severity: "high",
      title: "수량 변경 +/- 버튼이 너무 작음",
      description: "장바구니 수량 변경 +/- 버튼이 22x22px로 정확한 클릭이 어렵습니다. 시뮬레이션 결과 50대+ 페르소나의 43%가 의도하지 않은 수량으로 변경된 후 재조정하는 패턴을 보였습니다.",
      targetHtml: "<button class=\"qty-btn qty-decrease\">-</button>",
      tags: [
        "장바구니",
        "수량 변경",
        "터치 영역",
      ],
      fail_count: 218,
      fail_rate: 0.218,
      session_ids: [
        "AI-sess_0067",
        "AI-sess_0068",
        "AI-sess_0069",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0067",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0068",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0069",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/cart",
      category: "사용성",
      subCategory: "확인 부재",
      severity: "high",
      title: "삭제 버튼이 휴지통 아이콘만 사용하고 확인 모달 없음",
      description: "장바구니 항목 삭제 시 휴지통 아이콘 클릭만으로 즉시 삭제되어 확인 모달이 없습니다. 페르소나의 27%가 의도치 않은 삭제 후 상품을 다시 검색하여 추가하는 패턴이 관찰되었습니다.",
      targetHtml: "<button class=\"cart-item-delete\" aria-label=\"삭제\">",
      tags: [
        "장바구니",
        "삭제",
        "확인 모달",
      ],
      fail_count: 178,
      fail_rate: 0.178,
      session_ids: [
        "AI-sess_0070",
        "AI-sess_0071",
        "AI-sess_0072",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0070",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0071",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0072",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/cart",
      category: "사용성",
      subCategory: "기능 발견",
      severity: "medium",
      title: "쿠폰 적용 단계가 숨겨짐",
      description: "쿠폰 적용 메뉴가 '결제 정보 더보기' 아코디언 안에 숨겨져 있어 페르소나의 56%가 쿠폰 보유 시에도 적용하지 못한 채 결제로 진행했습니다.",
      targetHtml: "<details class=\"coupon-accordion\">",
      tags: [
        "장바구니",
        "쿠폰",
        "기능 발견",
      ],
      fail_count: 264,
      fail_rate: 0.264,
      session_ids: [
        "AI-sess_0073",
        "AI-sess_0074",
        "AI-sess_0075",
      ],
      persona_ages: [
        "20s",
        "30s",
        "40s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0073",
          persona_age: "20s",
        },
        {
          session_id: "AI-sess_0074",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0075",
          persona_age: "40s",
        },
      ],
    },
    {
      url: "https://a-mall.com/cart",
      category: "시각요소",
      subCategory: "정보 위계",
      severity: "medium",
      title: "총 금액 강조 부족",
      description: "장바구니 총 금액이 본문과 동일한 18px·#1F2937로 표기되어 시각적 위계가 없습니다. 결제 직전 금액 재확인을 위해 다시 장바구니로 돌아오는 페르소나가 31% 발생.",
      targetHtml: "<p class=\"cart-total\">총 금액: 89,400원</p>",
      tags: [
        "장바구니",
        "총 금액",
        "위계",
      ],
      fail_count: 156,
      fail_rate: 0.156,
      session_ids: [
        "AI-sess_0076",
        "AI-sess_0077",
        "AI-sess_0078",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0076",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0077",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0078",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/cart",
      category: "사용성",
      subCategory: "오류 안내",
      severity: "high",
      title: "'주문하기' 버튼 비활성 사유 미표시",
      description: "재고 부족·옵션 미선택 상품이 있을 때 '주문하기' 버튼이 비활성화되지만 사유 표시가 없어 페르소나의 38%가 버튼 반복 클릭 후 이탈했습니다.",
      targetHtml: "<button class=\"order-submit\" disabled>주문하기</button>",
      tags: [
        "장바구니",
        "비활성 버튼",
        "사유",
      ],
      fail_count: 192,
      fail_rate: 0.192,
      session_ids: [
        "AI-sess_0079",
        "AI-sess_0080",
        "AI-sess_0081",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0079",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0080",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0081",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/checkout",
      category: "사용성",
      subCategory: "모달 위치",
      severity: "high",
      title: "주소 검색 모달이 뷰포트를 벗어남",
      description: "다음 우편번호 검색 모달이 화면 우측 하단에 고정 위치로 표시되어 1280px 이하 뷰포트에서 일부 절단됩니다. 페르소나의 34%가 모달 내 검색창을 찾지 못했습니다.",
      targetHtml: "<div class=\"postal-search-modal\" style=\"right:0;bottom:0\">",
      tags: [
        "배송지",
        "주소 검색",
        "모달",
      ],
      fail_count: 198,
      fail_rate: 0.198,
      session_ids: [
        "AI-sess_0082",
        "AI-sess_0083",
        "AI-sess_0084",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0082",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0083",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0084",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/checkout",
      category: "접근성",
      subCategory: "터치 영역",
      severity: "medium",
      title: "배송 옵션 라디오 버튼이 작음",
      description: "일반 배송·당일 배송·픽업 라디오 버튼이 16x16px로 표시되어 정확한 선택이 어렵습니다. 페르소나의 28%가 의도하지 않은 옵션 선택 후 재조정하는 패턴.",
      targetHtml: "<input type=\"radio\" name=\"shipping-option\" />",
      tags: [
        "배송지",
        "배송 옵션",
        "라디오",
      ],
      fail_count: 144,
      fail_rate: 0.144,
      session_ids: [
        "AI-sess_0085",
        "AI-sess_0086",
        "AI-sess_0087",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0085",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0086",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0087",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/checkout",
      category: "시각요소",
      subCategory: "가독성",
      severity: "low",
      title: "배송 메모 placeholder가 너무 길어 잘림",
      description: "배송 메모 입력 필드의 placeholder가 '경비실에 맡겨주세요, 부재 시 문 앞에 두세요...' 등 한 줄 표시 기준을 초과하여 핵심 안내가 잘립니다.",
      targetHtml: "<input class=\"delivery-memo\" placeholder=\"경비실에 맡겨주세요, 부재 시 문 앞에 두세요. 도착 전 연락 부탁드립니다.\" />",
      tags: [
        "배송지",
        "메모",
        "placeholder",
      ],
      fail_count: 58,
      fail_rate: 0.058,
      session_ids: [
        "AI-sess_0088",
        "AI-sess_0089",
        "AI-sess_0090",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0088",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0089",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0090",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/checkout",
      category: "사용성",
      subCategory: "강제 선택",
      severity: "high",
      title: "주문자 정보 자동입력 동의가 사실상 강제됨",
      description: "'다음에도 사용' 체크박스가 기본 체크 상태로 표시되어 페르소나의 71%가 인지하지 못한 채 동의 상태로 진행했습니다. WCAG 3.3.4 권장 위반.",
      targetHtml: "<input type=\"checkbox\" id=\"auto-fill-save\" checked />",
      tags: [
        "배송지",
        "강제 동의",
        "기본값",
      ],
      fail_count: 174,
      fail_rate: 0.174,
      session_ids: [
        "AI-sess_0091",
        "AI-sess_0092",
        "AI-sess_0093",
      ],
      persona_ages: [
        "20s",
        "30s",
        "40s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0091",
          persona_age: "20s",
        },
        {
          session_id: "AI-sess_0092",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0093",
          persona_age: "40s",
        },
      ],
    },
    {
      url: "https://a-mall.com/checkout",
      category: "사용성",
      subCategory: "버튼 위치",
      severity: "medium",
      title: "다음 단계 버튼이 폼 하단에 숨겨짐",
      description: "주문자 정보·배송지 입력 후 '다음 단계' 버튼이 폼 최하단에 위치하나 화면 아래 영역에 위치해 페르소나의 32%가 추가 스크롤 후 발견했습니다.",
      targetHtml: "<button class=\"checkout-next\">다음 단계</button>",
      tags: [
        "배송지",
        "다음 단계",
        "위치",
      ],
      fail_count: 122,
      fail_rate: 0.122,
      session_ids: [
        "AI-sess_0094",
        "AI-sess_0095",
        "AI-sess_0096",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0094",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0095",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0096",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/payment",
      category: "시각요소",
      subCategory: "정보 위계",
      severity: "high",
      title: "최종 결제 금액 강조 부족",
      description: "결제 페이지 최종 금액이 본문 텍스트와 동일한 18px·#1F2937로 표기되어 시각적 위계가 부재합니다. 30대+의 52%가 결제 직전 금액을 재확인하기 위해 페이지를 위로 스크롤하는 패턴(평균 2.1회)이 관찰되었습니다.",
      targetHtml: "<p class=\"final-amount\">최종 결제 금액 29,800원</p>",
      tags: [
        "결제",
        "금액",
        "위계",
      ],
      fail_count: 264,
      fail_rate: 0.264,
      session_ids: [
        "AI-sess_0097",
        "AI-sess_0098",
        "AI-sess_0099",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0097",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0098",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0099",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/payment",
      category: "사용성",
      subCategory: "오류 안내",
      severity: "high",
      title: "비활성 결제 버튼 사유 미표시",
      description: "약관 미동의·필수 정보 미입력 시 결제 버튼이 회색으로 비활성화되지만 사유가 표시되지 않습니다. 페르소나의 41%가 버튼을 반복 클릭(평균 4.7회)하다 이탈했고, 60대 이상은 평균 1분 12초를 소요한 후 포기했습니다.",
      targetHtml: "<button class=\"payment-submit\" disabled>결제하기</button>",
      tags: [
        "결제",
        "비활성",
        "사유",
      ],
      fail_count: 295,
      fail_rate: 0.295,
      session_ids: [
        "AI-sess_0100",
        "AI-sess_0101",
        "AI-sess_0102",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0100",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0101",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0102",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/payment",
      category: "사용성",
      subCategory: "전환 안내",
      severity: "medium",
      title: "외부 결제창 전환 안내 부족",
      description: "PG사 결제창으로 이동 시 별도 안내 모달 없이 페이지가 즉시 전환됩니다. 페르소나의 28%가 갑작스러운 화면 변화에 놀라 뒤로가기를 누르는 패턴이 관찰되었고, 70대는 결제 재시도 성공률이 0%였습니다.",
      targetHtml: "<button data-action=\"open-pg\">신용카드 결제</button>",
      tags: [
        "결제",
        "외부 전환",
      ],
      fail_count: 178,
      fail_rate: 0.178,
      session_ids: [
        "AI-sess_0103",
        "AI-sess_0104",
        "AI-sess_0105",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0103",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0104",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0105",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/payment",
      category: "접근성",
      subCategory: "포커스 표시",
      severity: "medium",
      title: "약관 동의 체크박스 포커스 인디케이터 약함",
      description: "약관 동의 체크박스의 키보드 포커스 outline이 1px·#94A3B8로 표시되어 키보드 사용자 및 저시력 페르소나에게 인지되지 않습니다. WCAG 2.4.7 위반.",
      targetHtml: "<input type=\"checkbox\" id=\"agree-terms\" />",
      tags: [
        "결제",
        "약관",
        "포커스",
      ],
      fail_count: 88,
      fail_rate: 0.088,
      session_ids: [
        "AI-sess_0106",
        "AI-sess_0107",
        "AI-sess_0108",
      ],
      persona_ages: [
        "60s",
        "70s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0106",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0107",
          persona_age: "70s",
        },
        {
          session_id: "AI-sess_0108",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/payment",
      category: "사용성",
      subCategory: "포커스 흐름",
      severity: "high",
      title: "카드 번호 입력 자동 포커스 이동 실패",
      description: "신용카드 번호 4개 분할 입력 박스에서 자동 포커스 이동이 일부 환경에서 작동하지 않습니다. 40대+의 36%가 카드 번호 입력 단계에서 평균 2.1분을 소요한 후 이탈.",
      targetHtml: "<input class=\"card-digit\" maxlength=\"4\" />",
      tags: [
        "결제",
        "카드 입력",
        "포커스",
      ],
      fail_count: 167,
      fail_rate: 0.167,
      session_ids: [
        "AI-sess_0109",
        "AI-sess_0110",
        "AI-sess_0111",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0109",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0110",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0111",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/payment",
      category: "사용성",
      subCategory: "금액 변화 안내",
      severity: "medium",
      title: "할인 적용 후 금액 변화 안내 없음",
      description: "쿠폰·포인트 적용 시 최종 금액이 즉시 변경되지만 변화에 대한 시각적 피드백(애니메이션·하이라이트)이 없어 페르소나의 33%가 적용 여부를 확신하지 못하고 페이지를 새로고침했습니다.",
      targetHtml: "<span class=\"final-amount-value\">29,800원</span>",
      tags: [
        "결제",
        "할인",
        "피드백",
      ],
      fail_count: 132,
      fail_rate: 0.132,
      session_ids: [
        "AI-sess_0112",
        "AI-sess_0113",
        "AI-sess_0114",
      ],
      persona_ages: [
        "30s",
        "40s",
        "50s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0112",
          persona_age: "30s",
        },
        {
          session_id: "AI-sess_0113",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0114",
          persona_age: "50s",
        },
      ],
    },
    {
      url: "https://a-mall.com/mypage",
      category: "시각요소",
      subCategory: "가독성",
      severity: "medium",
      title: "메뉴 텍스트가 14px로 작음",
      description: "마이페이지 사이드 메뉴 텍스트가 14px로 표기되어 50대+ 페르소나의 가독 기준(16px)을 미충족. 메뉴 항목 탐색 시 평균 5.2초 추가 시선 이동.",
      targetHtml: "<a class=\"mypage-menu-item\">주문 내역</a>",
      tags: [
        "마이페이지",
        "메뉴",
        "폰트",
      ],
      fail_count: 128,
      fail_rate: 0.128,
      session_ids: [
        "AI-sess_0115",
        "AI-sess_0116",
        "AI-sess_0117",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0115",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0116",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0117",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/mypage",
      category: "사용성",
      subCategory: "버튼 위치",
      severity: "low",
      title: "로그아웃 버튼이 비표준 위치",
      description: "로그아웃 버튼이 마이페이지 최하단에 위치하여 페르소나의 47%가 위치를 찾지 못하고 헤더 영역을 먼저 탐색했습니다.",
      targetHtml: "<button class=\"logout-btn-bottom\">로그아웃</button>",
      tags: [
        "마이페이지",
        "로그아웃",
        "위치",
      ],
      fail_count: 68,
      fail_rate: 0.068,
      session_ids: [
        "AI-sess_0118",
        "AI-sess_0119",
        "AI-sess_0120",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0118",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0119",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0120",
          persona_age: "60s",
        },
      ],
    },
    {
      url: "https://a-mall.com/mypage",
      category: "사용성",
      subCategory: "페이지네이션",
      severity: "medium",
      title: "주문 내역 페이지네이션 버튼이 너무 작음",
      description: "주문 내역 페이지의 페이지네이션 숫자 버튼이 24x24px로 60대 이상 페르소나의 정밀 클릭이 어렵습니다. 평균 클릭 시도 횟수 2.7회.",
      targetHtml: "<button class=\"pagination-page\">2</button>",
      tags: [
        "마이페이지",
        "페이지네이션",
      ],
      fail_count: 96,
      fail_rate: 0.096,
      session_ids: [
        "AI-sess_0121",
        "AI-sess_0122",
        "AI-sess_0123",
      ],
      persona_ages: [
        "50s",
        "60s",
        "70s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0121",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0122",
          persona_age: "60s",
        },
        {
          session_id: "AI-sess_0123",
          persona_age: "70s",
        },
      ],
    },
    {
      url: "https://a-mall.com/mypage",
      category: "접근성",
      subCategory: "라벨 연결",
      severity: "low",
      title: "회원 정보 수정 폼 라벨이 입력 필드와 분리됨",
      description: "회원 정보 수정 폼의 라벨이 입력 필드 위가 아닌 좌측 별도 컬럼에 표시되어 좁은 화면에서 라벨-입력 매칭이 어렵습니다.",
      targetHtml: "<label class=\"floating-label\">이름</label>",
      tags: [
        "마이페이지",
        "폼",
        "라벨",
      ],
      fail_count: 58,
      fail_rate: 0.058,
      session_ids: [
        "AI-sess_0124",
        "AI-sess_0125",
        "AI-sess_0126",
      ],
      persona_ages: [
        "40s",
        "50s",
        "60s",
      ],
      affected_personas: [
        {
          session_id: "AI-sess_0124",
          persona_age: "40s",
        },
        {
          session_id: "AI-sess_0125",
          persona_age: "50s",
        },
        {
          session_id: "AI-sess_0126",
          persona_age: "60s",
        },
      ],
    },
  ],
};

// ============================================================================
// 3. Heatmap (heatmap_aggregation.json) - 168 포인트
// ============================================================================

export const MOCK_HEATMAP: HeatmapAggregation = {
  errorPoints: [
    {
      issueId: "issue_0",
      url: "https://a-mall.com/login",
      x: 0.483,
      y: 0.534,
      ageBand: "50s",
      count: 9,
      severity: "HIGH",
      errorType: "사용성/시인성 부족",
    },
    {
      issueId: "issue_0",
      url: "https://a-mall.com/login",
      x: 0.485,
      y: 0.534,
      ageBand: "60s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/시인성 부족",
    },
    {
      issueId: "issue_0",
      url: "https://a-mall.com/login",
      x: 0.494,
      y: 0.531,
      ageBand: "70s",
      count: 9,
      severity: "HIGH",
      errorType: "사용성/시인성 부족",
    },
    {
      issueId: "issue_0",
      url: "https://a-mall.com/login",
      x: 0.489,
      y: 0.522,
      ageBand: "40s",
      count: 8,
      severity: "HIGH",
      errorType: "사용성/시인성 부족",
    },
    {
      issueId: "issue_1",
      url: "https://a-mall.com/login",
      x: 0.675,
      y: 0.452,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/포커스 표시 부족",
    },
    {
      issueId: "issue_1",
      url: "https://a-mall.com/login",
      x: 0.675,
      y: 0.453,
      ageBand: "70s",
      count: 5,
      severity: "MEDIUM",
      errorType: "접근성/포커스 표시 부족",
    },
    {
      issueId: "issue_1",
      url: "https://a-mall.com/login",
      x: 0.679,
      y: 0.449,
      ageBand: "50s",
      count: 5,
      severity: "MEDIUM",
      errorType: "접근성/포커스 표시 부족",
    },
    {
      issueId: "issue_2",
      url: "https://a-mall.com/login",
      x: 0.426,
      y: 0.371,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_2",
      url: "https://a-mall.com/login",
      x: 0.414,
      y: 0.379,
      ageBand: "60s",
      count: 6,
      severity: "MEDIUM",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_2",
      url: "https://a-mall.com/login",
      x: 0.414,
      y: 0.388,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_2",
      url: "https://a-mall.com/login",
      x: 0.413,
      y: 0.378,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_3",
      url: "https://a-mall.com/login",
      x: 0.516,
      y: 0.412,
      ageBand: "40s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_3",
      url: "https://a-mall.com/login",
      x: 0.502,
      y: 0.409,
      ageBand: "50s",
      count: 8,
      severity: "HIGH",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_3",
      url: "https://a-mall.com/login",
      x: 0.519,
      y: 0.408,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_3",
      url: "https://a-mall.com/login",
      x: 0.506,
      y: 0.412,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_4",
      url: "https://a-mall.com/login",
      x: 0.448,
      y: 0.714,
      ageBand: "40s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/링크 시인성",
    },
    {
      issueId: "issue_4",
      url: "https://a-mall.com/login",
      x: 0.442,
      y: 0.715,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/링크 시인성",
    },
    {
      issueId: "issue_4",
      url: "https://a-mall.com/login",
      x: 0.459,
      y: 0.726,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/링크 시인성",
    },
    {
      issueId: "issue_4",
      url: "https://a-mall.com/login",
      x: 0.443,
      y: 0.716,
      ageBand: "70s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/링크 시인성",
    },
    {
      issueId: "issue_5",
      url: "https://a-mall.com/signup",
      x: 0.346,
      y: 0.224,
      ageBand: "50s",
      count: 6,
      severity: "MEDIUM",
      errorType: "접근성/필수 정보 전달",
    },
    {
      issueId: "issue_5",
      url: "https://a-mall.com/signup",
      x: 0.335,
      y: 0.226,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/필수 정보 전달",
    },
    {
      issueId: "issue_5",
      url: "https://a-mall.com/signup",
      x: 0.343,
      y: 0.232,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "접근성/필수 정보 전달",
    },
    {
      issueId: "issue_5",
      url: "https://a-mall.com/signup",
      x: 0.341,
      y: 0.225,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/필수 정보 전달",
    },
    {
      issueId: "issue_6",
      url: "https://a-mall.com/signup",
      x: 0.508,
      y: 0.419,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/안내 시점",
    },
    {
      issueId: "issue_6",
      url: "https://a-mall.com/signup",
      x: 0.513,
      y: 0.405,
      ageBand: "60s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/안내 시점",
    },
    {
      issueId: "issue_6",
      url: "https://a-mall.com/signup",
      x: 0.516,
      y: 0.415,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/안내 시점",
    },
    {
      issueId: "issue_7",
      url: "https://a-mall.com/signup",
      x: 0.496,
      y: 0.585,
      ageBand: "70s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_7",
      url: "https://a-mall.com/signup",
      x: 0.486,
      y: 0.575,
      ageBand: "50s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_7",
      url: "https://a-mall.com/signup",
      x: 0.497,
      y: 0.577,
      ageBand: "60s",
      count: 7,
      severity: "MEDIUM",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_7",
      url: "https://a-mall.com/signup",
      x: 0.49,
      y: 0.587,
      ageBand: "40s",
      count: 8,
      severity: "HIGH",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_8",
      url: "https://a-mall.com/signup",
      x: 0.419,
      y: 0.776,
      ageBand: "50s",
      count: 4,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_8",
      url: "https://a-mall.com/signup",
      x: 0.424,
      y: 0.781,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_8",
      url: "https://a-mall.com/signup",
      x: 0.422,
      y: 0.787,
      ageBand: "70s",
      count: 4,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_8",
      url: "https://a-mall.com/signup",
      x: 0.418,
      y: 0.789,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_8",
      url: "https://a-mall.com/signup",
      x: 0.42,
      y: 0.773,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_9",
      url: "https://a-mall.com/signup",
      x: 0.556,
      y: 0.314,
      ageBand: "20s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/검증 안내",
    },
    {
      issueId: "issue_9",
      url: "https://a-mall.com/signup",
      x: 0.555,
      y: 0.319,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/검증 안내",
    },
    {
      issueId: "issue_9",
      url: "https://a-mall.com/signup",
      x: 0.548,
      y: 0.322,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/검증 안내",
    },
    {
      issueId: "issue_9",
      url: "https://a-mall.com/signup",
      x: 0.551,
      y: 0.328,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/검증 안내",
    },
    {
      issueId: "issue_9",
      url: "https://a-mall.com/signup",
      x: 0.558,
      y: 0.323,
      ageBand: "60s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/검증 안내",
    },
    {
      issueId: "issue_10",
      url: "https://a-mall.com/signup",
      x: 0.403,
      y: 0.851,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_10",
      url: "https://a-mall.com/signup",
      x: 0.405,
      y: 0.847,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_10",
      url: "https://a-mall.com/signup",
      x: 0.399,
      y: 0.849,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_11",
      url: "https://a-mall.com/main",
      x: 0.397,
      y: 0.416,
      ageBand: "40s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/CTA 가시성",
    },
    {
      issueId: "issue_11",
      url: "https://a-mall.com/main",
      x: 0.395,
      y: 0.42,
      ageBand: "50s",
      count: 4,
      severity: "MEDIUM",
      errorType: "시각요소/CTA 가시성",
    },
    {
      issueId: "issue_11",
      url: "https://a-mall.com/main",
      x: 0.397,
      y: 0.416,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/CTA 가시성",
    },
    {
      issueId: "issue_11",
      url: "https://a-mall.com/main",
      x: 0.39,
      y: 0.415,
      ageBand: "20s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/CTA 가시성",
    },
    {
      issueId: "issue_11",
      url: "https://a-mall.com/main",
      x: 0.395,
      y: 0.421,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/CTA 가시성",
    },
    {
      issueId: "issue_11",
      url: "https://a-mall.com/main",
      x: 0.398,
      y: 0.428,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "시각요소/CTA 가시성",
    },
    {
      issueId: "issue_12",
      url: "https://a-mall.com/main",
      x: 0.907,
      y: 0.051,
      ageBand: "40s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/정보 탐색",
    },
    {
      issueId: "issue_12",
      url: "https://a-mall.com/main",
      x: 0.917,
      y: 0.066,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/정보 탐색",
    },
    {
      issueId: "issue_12",
      url: "https://a-mall.com/main",
      x: 0.905,
      y: 0.055,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/정보 탐색",
    },
    {
      issueId: "issue_12",
      url: "https://a-mall.com/main",
      x: 0.918,
      y: 0.053,
      ageBand: "60s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/정보 탐색",
    },
    {
      issueId: "issue_12",
      url: "https://a-mall.com/main",
      x: 0.916,
      y: 0.069,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/정보 탐색",
    },
    {
      issueId: "issue_13",
      url: "https://a-mall.com/main",
      x: 0.245,
      y: 0.683,
      ageBand: "50s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_13",
      url: "https://a-mall.com/main",
      x: 0.248,
      y: 0.684,
      ageBand: "60s",
      count: 4,
      severity: "MEDIUM",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_13",
      url: "https://a-mall.com/main",
      x: 0.247,
      y: 0.689,
      ageBand: "70s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_14",
      url: "https://a-mall.com/main",
      x: 0.128,
      y: 0.215,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/네비게이션",
    },
    {
      issueId: "issue_14",
      url: "https://a-mall.com/main",
      x: 0.115,
      y: 0.207,
      ageBand: "50s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/네비게이션",
    },
    {
      issueId: "issue_14",
      url: "https://a-mall.com/main",
      x: 0.123,
      y: 0.209,
      ageBand: "60s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/네비게이션",
    },
    {
      issueId: "issue_14",
      url: "https://a-mall.com/main",
      x: 0.119,
      y: 0.205,
      ageBand: "70s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/네비게이션",
    },
    {
      issueId: "issue_14",
      url: "https://a-mall.com/main",
      x: 0.117,
      y: 0.212,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/네비게이션",
    },
    {
      issueId: "issue_15",
      url: "https://a-mall.com/main",
      x: 0.502,
      y: 0.171,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/주의력",
    },
    {
      issueId: "issue_15",
      url: "https://a-mall.com/main",
      x: 0.502,
      y: 0.175,
      ageBand: "60s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/주의력",
    },
    {
      issueId: "issue_15",
      url: "https://a-mall.com/main",
      x: 0.506,
      y: 0.172,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/주의력",
    },
    {
      issueId: "issue_16",
      url: "https://a-mall.com/main",
      x: 0.496,
      y: 0.92,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/정보 종료",
    },
    {
      issueId: "issue_16",
      url: "https://a-mall.com/main",
      x: 0.493,
      y: 0.928,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/정보 종료",
    },
    {
      issueId: "issue_16",
      url: "https://a-mall.com/main",
      x: 0.501,
      y: 0.915,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/정보 종료",
    },
    {
      issueId: "issue_16",
      url: "https://a-mall.com/main",
      x: 0.506,
      y: 0.914,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/정보 종료",
    },
    {
      issueId: "issue_17",
      url: "https://a-mall.com/product/12847",
      x: 0.723,
      y: 0.777,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_17",
      url: "https://a-mall.com/product/12847",
      x: 0.719,
      y: 0.784,
      ageBand: "50s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_17",
      url: "https://a-mall.com/product/12847",
      x: 0.723,
      y: 0.783,
      ageBand: "60s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_17",
      url: "https://a-mall.com/product/12847",
      x: 0.718,
      y: 0.777,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_17",
      url: "https://a-mall.com/product/12847",
      x: 0.713,
      y: 0.774,
      ageBand: "30s",
      count: 7,
      severity: "MEDIUM",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_18",
      url: "https://a-mall.com/product/12847",
      x: 0.349,
      y: 0.449,
      ageBand: "60s",
      count: 5,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_18",
      url: "https://a-mall.com/product/12847",
      x: 0.349,
      y: 0.457,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_18",
      url: "https://a-mall.com/product/12847",
      x: 0.349,
      y: 0.457,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_19",
      url: "https://a-mall.com/product/12847",
      x: 0.173,
      y: 0.383,
      ageBand: "50s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/발견 가능성",
    },
    {
      issueId: "issue_19",
      url: "https://a-mall.com/product/12847",
      x: 0.186,
      y: 0.388,
      ageBand: "60s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/발견 가능성",
    },
    {
      issueId: "issue_19",
      url: "https://a-mall.com/product/12847",
      x: 0.186,
      y: 0.374,
      ageBand: "40s",
      count: 7,
      severity: "MEDIUM",
      errorType: "시각요소/발견 가능성",
    },
    {
      issueId: "issue_19",
      url: "https://a-mall.com/product/12847",
      x: 0.18,
      y: 0.387,
      ageBand: "70s",
      count: 4,
      severity: "MEDIUM",
      errorType: "시각요소/발견 가능성",
    },
    {
      issueId: "issue_20",
      url: "https://a-mall.com/product/12847",
      x: 0.444,
      y: 0.541,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/색맹 대응",
    },
    {
      issueId: "issue_20",
      url: "https://a-mall.com/product/12847",
      x: 0.446,
      y: 0.555,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/색맹 대응",
    },
    {
      issueId: "issue_20",
      url: "https://a-mall.com/product/12847",
      x: 0.446,
      y: 0.554,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/색맹 대응",
    },
    {
      issueId: "issue_20",
      url: "https://a-mall.com/product/12847",
      x: 0.459,
      y: 0.551,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/색맹 대응",
    },
    {
      issueId: "issue_21",
      url: "https://a-mall.com/product/12847",
      x: 0.62,
      y: 0.514,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_21",
      url: "https://a-mall.com/product/12847",
      x: 0.628,
      y: 0.521,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_21",
      url: "https://a-mall.com/product/12847",
      x: 0.612,
      y: 0.517,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_22",
      url: "https://a-mall.com/cart",
      x: 0.622,
      y: 0.42,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_22",
      url: "https://a-mall.com/cart",
      x: 0.621,
      y: 0.412,
      ageBand: "60s",
      count: 8,
      severity: "HIGH",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_22",
      url: "https://a-mall.com/cart",
      x: 0.612,
      y: 0.414,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_22",
      url: "https://a-mall.com/cart",
      x: 0.612,
      y: 0.427,
      ageBand: "40s",
      count: 6,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_23",
      url: "https://a-mall.com/cart",
      x: 0.843,
      y: 0.427,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/확인 부재",
    },
    {
      issueId: "issue_23",
      url: "https://a-mall.com/cart",
      x: 0.851,
      y: 0.412,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/확인 부재",
    },
    {
      issueId: "issue_23",
      url: "https://a-mall.com/cart",
      x: 0.849,
      y: 0.422,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/확인 부재",
    },
    {
      issueId: "issue_23",
      url: "https://a-mall.com/cart",
      x: 0.847,
      y: 0.416,
      ageBand: "70s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/확인 부재",
    },
    {
      issueId: "issue_23",
      url: "https://a-mall.com/cart",
      x: 0.854,
      y: 0.415,
      ageBand: "30s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/확인 부재",
    },
    {
      issueId: "issue_24",
      url: "https://a-mall.com/cart",
      x: 0.733,
      y: 0.743,
      ageBand: "20s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/기능 발견",
    },
    {
      issueId: "issue_24",
      url: "https://a-mall.com/cart",
      x: 0.737,
      y: 0.745,
      ageBand: "30s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/기능 발견",
    },
    {
      issueId: "issue_24",
      url: "https://a-mall.com/cart",
      x: 0.731,
      y: 0.742,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/기능 발견",
    },
    {
      issueId: "issue_24",
      url: "https://a-mall.com/cart",
      x: 0.749,
      y: 0.732,
      ageBand: "50s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/기능 발견",
    },
    {
      issueId: "issue_24",
      url: "https://a-mall.com/cart",
      x: 0.74,
      y: 0.733,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/기능 발견",
    },
    {
      issueId: "issue_24",
      url: "https://a-mall.com/cart",
      x: 0.747,
      y: 0.747,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/기능 발견",
    },
    {
      issueId: "issue_25",
      url: "https://a-mall.com/cart",
      x: 0.776,
      y: 0.849,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_25",
      url: "https://a-mall.com/cart",
      x: 0.784,
      y: 0.852,
      ageBand: "40s",
      count: 4,
      severity: "MEDIUM",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_25",
      url: "https://a-mall.com/cart",
      x: 0.783,
      y: 0.841,
      ageBand: "50s",
      count: 6,
      severity: "MEDIUM",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_25",
      url: "https://a-mall.com/cart",
      x: 0.781,
      y: 0.858,
      ageBand: "60s",
      count: 6,
      severity: "MEDIUM",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_25",
      url: "https://a-mall.com/cart",
      x: 0.788,
      y: 0.843,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_26",
      url: "https://a-mall.com/cart",
      x: 0.857,
      y: 0.924,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_26",
      url: "https://a-mall.com/cart",
      x: 0.846,
      y: 0.922,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_26",
      url: "https://a-mall.com/cart",
      x: 0.847,
      y: 0.923,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_26",
      url: "https://a-mall.com/cart",
      x: 0.846,
      y: 0.92,
      ageBand: "40s",
      count: 7,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_27",
      url: "https://a-mall.com/checkout",
      x: 0.772,
      y: 0.852,
      ageBand: "50s",
      count: 7,
      severity: "MEDIUM",
      errorType: "사용성/모달 위치",
    },
    {
      issueId: "issue_27",
      url: "https://a-mall.com/checkout",
      x: 0.776,
      y: 0.841,
      ageBand: "60s",
      count: 7,
      severity: "MEDIUM",
      errorType: "사용성/모달 위치",
    },
    {
      issueId: "issue_27",
      url: "https://a-mall.com/checkout",
      x: 0.773,
      y: 0.859,
      ageBand: "70s",
      count: 7,
      severity: "MEDIUM",
      errorType: "사용성/모달 위치",
    },
    {
      issueId: "issue_27",
      url: "https://a-mall.com/checkout",
      x: 0.784,
      y: 0.851,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/모달 위치",
    },
    {
      issueId: "issue_28",
      url: "https://a-mall.com/checkout",
      x: 0.321,
      y: 0.543,
      ageBand: "60s",
      count: 4,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_28",
      url: "https://a-mall.com/checkout",
      x: 0.327,
      y: 0.551,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_28",
      url: "https://a-mall.com/checkout",
      x: 0.318,
      y: 0.551,
      ageBand: "50s",
      count: 7,
      severity: "MEDIUM",
      errorType: "접근성/터치 영역",
    },
    {
      issueId: "issue_29",
      url: "https://a-mall.com/checkout",
      x: 0.413,
      y: 0.617,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_29",
      url: "https://a-mall.com/checkout",
      x: 0.428,
      y: 0.612,
      ageBand: "40s",
      count: 4,
      severity: "MEDIUM",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_29",
      url: "https://a-mall.com/checkout",
      x: 0.415,
      y: 0.615,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_29",
      url: "https://a-mall.com/checkout",
      x: 0.417,
      y: 0.621,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_30",
      url: "https://a-mall.com/checkout",
      x: 0.278,
      y: 0.322,
      ageBand: "20s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/강제 선택",
    },
    {
      issueId: "issue_30",
      url: "https://a-mall.com/checkout",
      x: 0.288,
      y: 0.315,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/강제 선택",
    },
    {
      issueId: "issue_30",
      url: "https://a-mall.com/checkout",
      x: 0.289,
      y: 0.326,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/강제 선택",
    },
    {
      issueId: "issue_30",
      url: "https://a-mall.com/checkout",
      x: 0.271,
      y: 0.324,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/강제 선택",
    },
    {
      issueId: "issue_30",
      url: "https://a-mall.com/checkout",
      x: 0.285,
      y: 0.318,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/강제 선택",
    },
    {
      issueId: "issue_31",
      url: "https://a-mall.com/checkout",
      x: 0.507,
      y: 0.956,
      ageBand: "50s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_31",
      url: "https://a-mall.com/checkout",
      x: 0.494,
      y: 0.954,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_31",
      url: "https://a-mall.com/checkout",
      x: 0.507,
      y: 0.956,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_31",
      url: "https://a-mall.com/checkout",
      x: 0.495,
      y: 0.958,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_32",
      url: "https://a-mall.com/payment",
      x: 0.736,
      y: 0.355,
      ageBand: "50s",
      count: 4,
      severity: "MEDIUM",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_32",
      url: "https://a-mall.com/payment",
      x: 0.735,
      y: 0.353,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_32",
      url: "https://a-mall.com/payment",
      x: 0.737,
      y: 0.357,
      ageBand: "70s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_32",
      url: "https://a-mall.com/payment",
      x: 0.736,
      y: 0.353,
      ageBand: "30s",
      count: 8,
      severity: "HIGH",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_32",
      url: "https://a-mall.com/payment",
      x: 0.743,
      y: 0.356,
      ageBand: "40s",
      count: 5,
      severity: "MEDIUM",
      errorType: "시각요소/정보 위계",
    },
    {
      issueId: "issue_33",
      url: "https://a-mall.com/payment",
      x: 0.508,
      y: 0.803,
      ageBand: "60s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_33",
      url: "https://a-mall.com/payment",
      x: 0.494,
      y: 0.818,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_33",
      url: "https://a-mall.com/payment",
      x: 0.492,
      y: 0.812,
      ageBand: "50s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_33",
      url: "https://a-mall.com/payment",
      x: 0.504,
      y: 0.807,
      ageBand: "40s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/오류 안내",
    },
    {
      issueId: "issue_34",
      url: "https://a-mall.com/payment",
      x: 0.399,
      y: 0.603,
      ageBand: "60s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/전환 안내",
    },
    {
      issueId: "issue_34",
      url: "https://a-mall.com/payment",
      x: 0.384,
      y: 0.602,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/전환 안내",
    },
    {
      issueId: "issue_34",
      url: "https://a-mall.com/payment",
      x: 0.381,
      y: 0.618,
      ageBand: "50s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/전환 안내",
    },
    {
      issueId: "issue_35",
      url: "https://a-mall.com/payment",
      x: 0.183,
      y: 0.768,
      ageBand: "70s",
      count: 5,
      severity: "MEDIUM",
      errorType: "접근성/포커스 표시",
    },
    {
      issueId: "issue_35",
      url: "https://a-mall.com/payment",
      x: 0.183,
      y: 0.758,
      ageBand: "60s",
      count: 6,
      severity: "MEDIUM",
      errorType: "접근성/포커스 표시",
    },
    {
      issueId: "issue_36",
      url: "https://a-mall.com/payment",
      x: 0.558,
      y: 0.428,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_36",
      url: "https://a-mall.com/payment",
      x: 0.547,
      y: 0.426,
      ageBand: "60s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_36",
      url: "https://a-mall.com/payment",
      x: 0.557,
      y: 0.42,
      ageBand: "40s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_36",
      url: "https://a-mall.com/payment",
      x: 0.548,
      y: 0.418,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "사용성/포커스 흐름",
    },
    {
      issueId: "issue_37",
      url: "https://a-mall.com/payment",
      x: 0.621,
      y: 0.544,
      ageBand: "30s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/금액 변화 안내",
    },
    {
      issueId: "issue_37",
      url: "https://a-mall.com/payment",
      x: 0.628,
      y: 0.553,
      ageBand: "40s",
      count: 5,
      severity: "MEDIUM",
      errorType: "사용성/금액 변화 안내",
    },
    {
      issueId: "issue_37",
      url: "https://a-mall.com/payment",
      x: 0.622,
      y: 0.546,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/금액 변화 안내",
    },
    {
      issueId: "issue_37",
      url: "https://a-mall.com/payment",
      x: 0.626,
      y: 0.546,
      ageBand: "60s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/금액 변화 안내",
    },
    {
      issueId: "issue_38",
      url: "https://a-mall.com/mypage",
      x: 0.149,
      y: 0.351,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_38",
      url: "https://a-mall.com/mypage",
      x: 0.147,
      y: 0.349,
      ageBand: "70s",
      count: 6,
      severity: "MEDIUM",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_38",
      url: "https://a-mall.com/mypage",
      x: 0.145,
      y: 0.35,
      ageBand: "50s",
      count: 6,
      severity: "MEDIUM",
      errorType: "시각요소/가독성",
    },
    {
      issueId: "issue_39",
      url: "https://a-mall.com/mypage",
      x: 0.924,
      y: 0.923,
      ageBand: "40s",
      count: 4,
      severity: "MEDIUM",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_39",
      url: "https://a-mall.com/mypage",
      x: 0.92,
      y: 0.922,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_39",
      url: "https://a-mall.com/mypage",
      x: 0.913,
      y: 0.928,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_39",
      url: "https://a-mall.com/mypage",
      x: 0.923,
      y: 0.915,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/버튼 위치",
    },
    {
      issueId: "issue_40",
      url: "https://a-mall.com/mypage",
      x: 0.674,
      y: 0.772,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/페이지네이션",
    },
    {
      issueId: "issue_40",
      url: "https://a-mall.com/mypage",
      x: 0.682,
      y: 0.785,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/페이지네이션",
    },
    {
      issueId: "issue_40",
      url: "https://a-mall.com/mypage",
      x: 0.678,
      y: 0.782,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "사용성/페이지네이션",
    },
    {
      issueId: "issue_41",
      url: "https://a-mall.com/mypage",
      x: 0.554,
      y: 0.548,
      ageBand: "40s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/라벨 연결",
    },
    {
      issueId: "issue_41",
      url: "https://a-mall.com/mypage",
      x: 0.545,
      y: 0.553,
      ageBand: "50s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/라벨 연결",
    },
    {
      issueId: "issue_41",
      url: "https://a-mall.com/mypage",
      x: 0.557,
      y: 0.556,
      ageBand: "60s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/라벨 연결",
    },
    {
      issueId: "issue_41",
      url: "https://a-mall.com/mypage",
      x: 0.555,
      y: 0.545,
      ageBand: "70s",
      count: 3,
      severity: "LOW",
      errorType: "접근성/라벨 연결",
    },
  ],
};

// ============================================================================
// 4. WCAG (wcag.json) - 48건 위반
//    백엔드 응답에는 urls 필드만 존재. _summary는 클라이언트에서 계산.
// ============================================================================

export const MOCK_WCAG: WcagData = { urls: {
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
        severity: "Critical",
        description: "로그인 버튼의 전경(#5B6B8A)과 배경(#E8EEF7) 대비비가 1.18:1로 WCAG 2.1 AA 정상 텍스트 기준 4.5:1을 미달합니다.",
        html: "<button class=\"login-submit\">로그인</button>",
        wcag_criteria: "1.4.3",
      },
      {
        wcagIssueId: "274d183c-7583-5ef5-5473-f6a8714e1353",
        title: "필수 입력 구조 전달 부족",
        severity: "Critical",
        description: "입력 필드에 aria-required 속성이 없어 스크린리더가 필수 여부를 안내하지 못합니다.",
        html: "<input type=\"text\" placeholder=\"아이디\" />",
        wcag_criteria: "1.3.1",
      },
      {
        wcagIssueId: "5e526b9b-994b-e1fe-03cb-d307dddc5860",
        title: "오류 메시지 위치 분리",
        severity: "Moderate",
        description: "로그인 실패 시 오류 메시지가 폼 상단에만 표시되어 입력 필드와 시각·구조적으로 분리되어 있습니다.",
        html: "<div class=\"error-banner\" role=\"alert\">아이디 또는 비밀번호가 일치하지 않습니다</div>",
        wcag_criteria: "3.3.1",
      },
      {
        wcagIssueId: "0fdf920d-4c12-b2d6-0d9e-beabeae2603d",
        title: "Placeholder 텍스트 대비 부족",
        severity: "Moderate",
        description: "Placeholder 텍스트(#CBD5E1)와 배경(#FFFFFF) 대비비가 2.1:1로 비텍스트 기준 3:1을 미달합니다.",
        html: "<input placeholder=\"아이디를 입력하세요\" />",
        wcag_criteria: "1.4.11",
      },
      {
        wcagIssueId: "684936b6-846c-5aae-23b1-6aeb6a5941f5",
        title: "비밀번호 보기 버튼 포커스 약함",
        severity: "Minor",
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
        severity: "Critical",
        description: "필수 항목이 빨간 asterisk만으로 구분되며 aria-required 및 텍스트 라벨이 없습니다.",
        html: "<label>이메일 <span style=\"color:red\">*</span></label>",
        wcag_criteria: "1.3.1, 1.4.1",
      },
      {
        wcagIssueId: "793121f2-82fd-04a3-0ccb-9a7b4b15f04c",
        title: "인증번호 흐름 포커스 이동 불안정",
        severity: "Critical",
        description: "분할된 인증번호 입력 박스에서 자동 포커스 이동이 일부 환경에서 동작하지 않습니다.",
        html: "<input class=\"otp-digit\" maxlength=\"1\" />",
        wcag_criteria: "2.4.3",
      },
      {
        wcagIssueId: "4a4e1bda-53f4-4a44-1c92-9f42c8d57666",
        title: "비밀번호 조건 안내 노출 지연",
        severity: "Moderate",
        description: "비밀번호 규칙이 포커스 시에만 표시되어 입력 전 사전 인지가 불가능합니다.",
        html: "<div class=\"password-hint\" data-show-on=\"focus\">",
        wcag_criteria: "3.3.2",
      },
      {
        wcagIssueId: "d9b19290-d4a7-7b6d-5f2a-cc2c8d0b6831",
        title: "약관 체크박스 라벨 클릭 영역 부재",
        severity: "Moderate",
        description: "체크박스와 인접 텍스트가 단일 클릭 영역으로 묶이지 않아 접근성이 저하됩니다.",
        html: "<input type=\"checkbox\" id=\"agree-marketing\" />",
        wcag_criteria: "2.5.5",
      },
      {
        wcagIssueId: "a3c0559e-b10b-8a6a-50c7-86d244a0157f",
        title: "실시간 검증 부재",
        severity: "Moderate",
        description: "이메일 형식 오류가 blur 시점이 아닌 제출 후에만 표시됩니다.",
        html: "<input type=\"email\" name=\"email\" />",
        wcag_criteria: "3.3.1",
      },
      {
        wcagIssueId: "f430c737-60b9-339d-4f43-29e4f8975080",
        title: "생년월일 형식 안내 부족",
        severity: "Minor",
        description: "Placeholder만으로 형식을 안내하여 화면 외부에서는 형식을 알 수 없습니다.",
        html: "<input name=\"birth\" placeholder=\"1990-01-01\" />",
        wcag_criteria: "3.3.2",
      },
      {
        wcagIssueId: "37996703-7b44-af3e-a134-46f42badc675",
        title: "기본 체크 옵션 명시성 부족",
        severity: "Minor",
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
        severity: "Critical",
        description: "히어로 영역 CTA 전경(#475569)과 배경(#E5E7EB) 대비비가 3.20:1로 텍스트 기준 4.5:1을 미달합니다.",
        html: "<a data-cta=\"primary\" class=\"hero-cta\">쇼핑 시작하기</a>",
        wcag_criteria: "1.4.3",
      },
      {
        wcagIssueId: "5dfb6b6d-d227-85d2-297e-b6b24e3f4f37",
        title: "카테고리 메뉴 호버 의존",
        severity: "Critical",
        description: "메인 카테고리 메뉴가 마우스 호버로만 열려 키보드·터치 사용자가 접근할 수 없습니다.",
        html: "<nav class=\"category-menu\" data-trigger=\"hover\">",
        wcag_criteria: "2.1.1",
      },
      {
        wcagIssueId: "250dd124-09e9-e094-e7a3-90ed86fb7c0f",
        title: "상품 카드 보조 정보 가독성 약함",
        severity: "Moderate",
        description: "상품 카드의 가격·리뷰가 14px·#94A3B8로 표기되어 가독 기준에 못 미칩니다.",
        html: "<span class=\"product-price\">29,800원</span>",
        wcag_criteria: "1.4.4",
      },
      {
        wcagIssueId: "039031ed-4fcc-6011-f562-609a1289a1a2",
        title: "배너 슬라이드 일시 정지 미지원",
        severity: "Moderate",
        description: "히어로 슬라이드가 3초 간격 자동 전환되며 일시 정지 컨트롤이 없습니다.",
        html: "<div class=\"hero-slider\" data-interval=\"3000\">",
        wcag_criteria: "2.2.2",
      },
      {
        wcagIssueId: "8ef176e6-84c2-579a-abb6-c1d35b4313ed",
        title: "검색창 접근 단계 다중화",
        severity: "Moderate",
        description: "검색이 아이콘 토글로만 노출되어 1차 시선에서 접근이 어렵습니다.",
        html: "<button class=\"header-search-toggle\">",
        wcag_criteria: "2.4.5",
      },
      {
        wcagIssueId: "e1962e1a-f757-4fb5-b18e-abba0bbc6877",
        title: "장식 이미지 대체 설명 불충분",
        severity: "Minor",
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
        severity: "Critical",
        description: "주요 행동 버튼이 페이지 하단에 위치하여 콘텐츠 순서·키보드 탐색 순서가 비논리적입니다.",
        html: "<button class=\"add-to-cart bottom-floating\">장바구니 담기</button>",
        wcag_criteria: "1.3.2",
      },
      {
        wcagIssueId: "b6a10c07-c682-80ca-f2bf-377db58a8446",
        title: "옵션 선택 드롭다운 터치 영역 부족",
        severity: "Moderate",
        description: "사이즈·색상 선택 드롭다운이 28x28px로 WCAG 권장 44x44px 미달입니다.",
        html: "<select class=\"option-selector\" name=\"size\">",
        wcag_criteria: "2.5.5",
      },
      {
        wcagIssueId: "dc4ee346-9aa7-735c-66e1-18f4f4e51947",
        title: "리뷰 별점 색상 의존",
        severity: "Moderate",
        description: "리뷰 별점이 노란·회색만으로 구분되며 텍스트 점수가 인접 표기되지 않습니다.",
        html: "<div class=\"star-rating\" data-score=\"4.2\">",
        wcag_criteria: "1.4.1",
      },
      {
        wcagIssueId: "79ddc719-cab1-d120-663b-4809756ae8c8",
        title: "이미지 확대 버튼 인지 어려움",
        severity: "Moderate",
        description: "확대 버튼이 14x14px 모서리 배치로 발견이 어렵고 키보드 포커스 표시도 약합니다.",
        html: "<button class=\"image-zoom\" aria-label=\"확대\">",
        wcag_criteria: "2.4.7",
      },
      {
        wcagIssueId: "6ad2ca96-64ff-cf66-5f75-d389782aa436",
        title: "재고 표시 가독성 부족",
        severity: "Minor",
        description: "'재고 N개 남음' 문구가 12px로 매우 작게 표기됩니다.",
        html: "<span class=\"stock-warning\">재고 3개 남음</span>",
        wcag_criteria: "1.4.4",
      },
      {
        wcagIssueId: "6b72db31-b65e-96dc-5e63-d740e7f9eeb1",
        title: "상품 정보 헤딩 위계 누락",
        severity: "Minor",
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
        severity: "Critical",
        description: "+/- 버튼이 22x22px로 WCAG 권장 44x44px를 크게 미달합니다.",
        html: "<button class=\"qty-btn qty-decrease\">-</button>",
        wcag_criteria: "2.5.5",
      },
      {
        wcagIssueId: "68c4b955-6fce-fe8b-5293-6ab95367f8ff",
        title: "삭제 동작 확인 단계 부재",
        severity: "Critical",
        description: "휴지통 아이콘 클릭만으로 즉시 삭제되어 의도치 않은 삭제 시 되돌릴 수 없습니다.",
        html: "<button class=\"cart-item-delete\" aria-label=\"삭제\">",
        wcag_criteria: "3.3.4",
      },
      {
        wcagIssueId: "804ba02f-861a-d1c7-e522-85b67bf30a49",
        title: "비활성 주문 버튼 사유 미표시",
        severity: "Moderate",
        description: "주문하기 버튼 비활성화 사유가 aria-describedby 등으로 안내되지 않습니다.",
        html: "<button class=\"order-submit\" disabled>주문하기</button>",
        wcag_criteria: "3.3.1",
      },
      {
        wcagIssueId: "755469cc-7494-1972-25e0-bc9abb83424c",
        title: "쿠폰 영역 발견 가능성 부족",
        severity: "Moderate",
        description: "쿠폰 적용 메뉴가 아코디언 내부에 숨겨져 시각·키보드 탐색에서 발견이 어렵습니다.",
        html: "<details class=\"coupon-accordion\">",
        wcag_criteria: "2.4.5",
      },
      {
        wcagIssueId: "f908a3d9-1060-0e58-a6b6-006da41c8af2",
        title: "총 금액 시각 위계 부재",
        severity: "Moderate",
        description: "총 금액이 다른 텍스트와 동일 크기·색상으로 표기됩니다.",
        html: "<p class=\"cart-total\">총 금액 89,400원</p>",
        wcag_criteria: "1.3.1",
      },
      {
        wcagIssueId: "2ffcd9ac-6455-e49c-41d3-189cdac97916",
        title: "삭제 아이콘 텍스트 라벨 부재",
        severity: "Minor",
        description: "휴지통 아이콘에 visible text 라벨이 없어 시각적 의미 전달이 부족합니다.",
        html: "<button class=\"cart-item-delete\" aria-label=\"삭제\">",
        wcag_criteria: "1.1.1",
      },
    ],
  },
  "https://a-mall.com/checkout": {
    score: 40,
    wcagLabel: "미달",
    distribution: {
      Critical: 2,
      Moderate: 2,
      Minor: 2,
    },
    violations: [
      {
        wcagIssueId: "b18d40ff-746c-5338-cd6c-da960bbaf635",
        title: "주소 검색 모달 뷰포트 이탈",
        severity: "Critical",
        description: "주소 검색 모달이 1280px 이하 환경에서 우측 하단 절단으로 핵심 입력 영역이 가려집니다.",
        html: "<div class=\"postal-search-modal\" style=\"right:0;bottom:0\">",
        wcag_criteria: "1.4.10",
      },
      {
        wcagIssueId: "53f7eb07-23a8-3a49-29bf-ef56554fb92d",
        title: "강제 자동입력 동의 기본값",
        severity: "Critical",
        description: "'다음에도 사용' 체크박스가 기본 체크 상태로 사용자의 명시적 동의 없이 데이터를 저장합니다.",
        html: "<input type=\"checkbox\" id=\"auto-fill-save\" checked />",
        wcag_criteria: "3.3.4",
      },
      {
        wcagIssueId: "628080ee-df6c-9a67-9f9f-b2f712ba2225",
        title: "배송 옵션 라디오 터치 영역 부족",
        severity: "Moderate",
        description: "라디오 버튼이 16x16px로 정밀 클릭이 어렵습니다.",
        html: "<input type=\"radio\" name=\"shipping-option\" />",
        wcag_criteria: "2.5.5",
      },
      {
        wcagIssueId: "6faa9032-7bcd-525f-7cde-d426206d50c4",
        title: "다음 단계 버튼 위치 비표준",
        severity: "Moderate",
        description: "주요 진행 버튼이 폼 하단 시야 외 영역에 위치합니다.",
        html: "<button class=\"checkout-next\">다음 단계</button>",
        wcag_criteria: "2.4.3",
      },
      {
        wcagIssueId: "d70c0e99-9517-2d92-5d00-04fb9568d775",
        title: "배송 메모 안내 잘림",
        severity: "Minor",
        description: "Placeholder가 길어 한 줄 표시 기준 초과 시 핵심 안내가 잘립니다.",
        html: "<input class=\"delivery-memo\" placeholder=\"경비실에 맡겨주세요...\" />",
        wcag_criteria: "3.3.2",
      },
      {
        wcagIssueId: "52520b47-5ae0-5de3-59f5-49f3e3f732a0",
        title: "배송지 라벨 시각 강조 부족",
        severity: "Minor",
        description: "필수 항목 라벨의 시각 강조가 약하여 입력 순서 인지가 어렵습니다.",
        html: "<label for=\"recipient-name\">받는 분</label>",
        wcag_criteria: "1.3.1",
      },
    ],
  },
  "https://a-mall.com/payment": {
    score: 30,
    wcagLabel: "미달",
    distribution: {
      Critical: 2,
      Moderate: 3,
      Minor: 2,
    },
    violations: [
      {
        wcagIssueId: "f3e8534c-2aa4-0570-8bac-92653cd39e5d",
        title: "비활성 결제 버튼 이유 미표시",
        severity: "Critical",
        description: "결제하기 버튼 disabled 사유가 aria-describedby 등으로 안내되지 않습니다.",
        html: "<button class=\"payment-submit\" disabled>결제하기</button>",
        wcag_criteria: "3.3.1",
      },
      {
        wcagIssueId: "217522c9-abe7-c0ea-2ed0-e500da98d81e",
        title: "카드 번호 입력 포커스 이동 불안정",
        severity: "Critical",
        description: "카드 4개 분할 입력 박스의 자동 포커스 이동이 일부 환경에서 동작하지 않습니다.",
        html: "<input class=\"card-digit\" maxlength=\"4\" />",
        wcag_criteria: "2.4.3",
      },
      {
        wcagIssueId: "f1c3ecf9-c768-8c0b-927d-03fefe0162a1",
        title: "최종 결제 금액 강조 약함",
        severity: "Moderate",
        description: "최종 금액이 본문과 동일한 크기·색상으로 표기되어 시각 위계가 부재합니다.",
        html: "<p class=\"final-amount\">최종 결제 금액 29,800원</p>",
        wcag_criteria: "1.3.1",
      },
      {
        wcagIssueId: "94fc6e1e-b8ed-25ab-c68b-c2887b80d3b2",
        title: "외부 결제창 이동 안내 부족",
        severity: "Moderate",
        description: "외부 PG 결제창 전환 시 사전 안내가 없어 사용자가 예상치 못한 화면 변경을 경험합니다.",
        html: "<button data-action=\"open-pg\">신용카드 결제</button>",
        wcag_criteria: "3.2.2",
      },
      {
        wcagIssueId: "74250672-1560-3429-c01b-c0de4eed5e0e",
        title: "할인 적용 피드백 부재",
        severity: "Moderate",
        description: "할인 적용 후 금액 변화가 시각적 피드백 없이 발생합니다.",
        html: "<span class=\"final-amount-value\">29,800원</span>",
        wcag_criteria: "4.1.3",
      },
      {
        wcagIssueId: "d21f82e1-3aee-e8d8-d14e-f38406268708",
        title: "약관 체크 포커스 표시 약함",
        severity: "Minor",
        description: "체크박스 키보드 포커스 outline이 1px·#94A3B8로 인지성이 낮습니다.",
        html: "<input type=\"checkbox\" id=\"agree-terms\" />",
        wcag_criteria: "2.4.7",
      },
      {
        wcagIssueId: "0409f7dd-94a9-ed71-a7bd-eb0dcac9f234",
        title: "결제 수단 아이콘 라벨 부재",
        severity: "Minor",
        description: "결제 수단 아이콘에 visible text가 없어 의미 전달이 부족합니다.",
        html: "<button class=\"pay-method-icon\" aria-label=\"카카오페이\">",
        wcag_criteria: "1.1.1",
      },
    ],
  },
  "https://a-mall.com/mypage": {
    score: 50,
    wcagLabel: "미달",
    distribution: {
      Critical: 1,
      Moderate: 2,
      Minor: 2,
    },
    violations: [
      {
        wcagIssueId: "672e1eba-6b77-96c5-7dd0-30378dd259d5",
        title: "메뉴 텍스트 가독성 미달",
        severity: "Critical",
        description: "사이드 메뉴 텍스트가 14px로 50대+ 가독 기준(16px) 미충족.",
        html: "<a class=\"mypage-menu-item\">주문 내역</a>",
        wcag_criteria: "1.4.4",
      },
      {
        wcagIssueId: "46a376cf-e975-0a79-aeeb-a356f518ac2e",
        title: "페이지네이션 터치 영역 부족",
        severity: "Moderate",
        description: "페이지 숫자 버튼이 24x24px로 권장 영역 미달.",
        html: "<button class=\"pagination-page\">2</button>",
        wcag_criteria: "2.5.5",
      },
      {
        wcagIssueId: "5a0faabd-c31a-6394-ed4b-54144b0d914c",
        title: "회원 정보 폼 라벨 분리",
        severity: "Moderate",
        description: "라벨이 입력 필드와 좌측 별도 컬럼에 위치하여 매칭이 어렵습니다.",
        html: "<label class=\"floating-label\">이름</label>",
        wcag_criteria: "1.3.1",
      },
      {
        wcagIssueId: "4f900627-dcb6-845a-4fb6-c71d4783c32f",
        title: "로그아웃 위치 비표준",
        severity: "Minor",
        description: "로그아웃 버튼이 페이지 최하단에 위치하여 일반적 사용자 기대와 다릅니다.",
        html: "<button class=\"logout-btn-bottom\">로그아웃</button>",
        wcag_criteria: "2.4.3",
      },
      {
        wcagIssueId: "2c18ab01-d0c2-44c9-c748-49cbeb74a629",
        title: "주문 내역 헤딩 위계 누락",
        severity: "Minor",
        description: "주문 내역 페이지에서 h2 헤딩이 누락되어 스크린리더 탐색이 어렵습니다.",
        html: "<div class=\"section-title\">주문 내역</div>",
        wcag_criteria: "1.3.1",
      },
    ],
  },
} };

/**
 * WCAG 합산 (백엔드 응답에는 없음 - 클라이언트 계산 결과)
 * 백엔드 미연동 시연용으로 별도 export. 실제 연동 시 아래 헬퍼 사용 가능.
 */
export const MOCK_WCAG_SUMMARY = {
  scorePercent: 40.0,
  totalTests: 80,
  passedTests: 32,
  totalViolations: 48,
  distribution: {
    Critical: 14,
    Moderate: 21,
    Minor: 13,
  },
} as const;

/** 백엔드 응답에서 합산값 계산하는 헬퍼 */
export function computeWcagSummary(wcag: WcagData) {
  const urls = Object.values(wcag.urls);
  const totalViolations = urls.reduce((s, u) => s + u.violations.length, 0);
  const dist = urls.reduce(
    (acc, u) => ({
      Critical: acc.Critical + u.distribution.Critical,
      Moderate: acc.Moderate + u.distribution.Moderate,
      Minor: acc.Minor + u.distribution.Minor,
    }),
    { Critical: 0, Moderate: 0, Minor: 0 }
  );
  const totalTests = urls.length * 10;
  const passedTests = totalTests - totalViolations;
  return {
    scorePercent: Math.round((passedTests / totalTests) * 1000) / 10,
    totalTests,
    passedTests,
    totalViolations,
    distribution: dist,
  };
}

// ============================================================================
// 5. AI Fix (fixes/*.json) - URL별 매핑, 총 42건
// ============================================================================

export const MOCK_FIXES: Record<string, FixData> = {
  "https://a-mall.com/cart": {
    url: "https://a-mall.com/cart",
    fixes: [
      {
        issue_title: "수량 변경 +/- 버튼이 너무 작음",
        selector: ".qty-btn",
        before: `.qty-btn {
  width: 22px;
  height: 22px;
  font-size: 12px;
}`,
        after: `.qty-btn {
  width: 44px;
  height: 44px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
}
.qty-btn:active {
  background: #F1F5F9;
}`,
        description: "수량 버튼을 WCAG 권장 44x44px로 확장하고 시각·터치 피드백을 추가합니다.",
        impact: "+218명의 사용자(50대+ 43%) 의도치 않은 수량 변경 43% → 추정 8%.",
      },
      {
        issue_title: "삭제 버튼이 휴지통 아이콘만 사용하고 확인 모달 없음",
        selector: ".cart-item-delete",
        before: "<button class=\"cart-item-delete\" aria-label=\"삭제\">",
        after: `<button className="cart-item-delete"
        onClick={() => setConfirmDelete(item.id)}>
  <TrashIcon /> 삭제
</button>

{confirmDelete && (
  <Modal>
    <p>{item.name}을(를) 삭제하시겠습니까?</p>
    <button onClick={cancel}>취소</button>
    <button onClick={confirm}>삭제</button>
  </Modal>
)}`,
        description: "즉시 삭제에서 확인 모달 단계를 추가하고 텍스트 라벨도 명시합니다.",
        impact: "+178명의 사용자의 의도치 않은 삭제 27% → 추정 4%.",
      },
      {
        issue_title: "쿠폰 적용 단계가 숨겨짐",
        selector: ".coupon-accordion",
        before: `<details class="coupon-accordion">
  <summary>쿠폰·할인</summary>
  ...
</details>`,
        after: `<section className="coupon-section">
  <h3>쿠폰 적용
    {availableCount > 0 && (
      <span className="badge">사용 가능 {availableCount}장</span>
    )}
  </h3>
  <CouponSelector />
</section>`,
        description: "아코디언 숨김 처리를 제거하고 사용 가능 쿠폰 수를 배지로 강조합니다.",
        impact: "+264명의 사용자가 쿠폰 적용 단계 인지, 적용률 44% → 추정 82%.",
      },
      {
        issue_title: "총 금액 강조 부족",
        selector: ".cart-total",
        before: `.cart-total {
  font-size: 18px;
  color: #1F2937;
}`,
        after: `.cart-total-row {
  padding: 20px 24px;
  background: #F0F4FF;
  border: 2px solid #2F5AE8;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.cart-total-amount {
  font-size: 28px;
  color: #2F5AE8;
  font-weight: 800;
}`,
        description: "총 금액 영역을 별도 카드로 분리하고 28px·브랜드 컬러로 강조합니다.",
        impact: "+156명의 사용자의 결제 직전 재확인 행동 31% → 추정 6%.",
      },
      {
        issue_title: "'주문하기' 버튼 비활성 사유 미표시",
        selector: ".order-submit",
        before: "<button class=\"order-submit\" disabled>주문하기</button>",
        after: `<button className="order-submit"
        disabled={!isReady}
        aria-describedby="order-blockers">
  주문하기
</button>
{!isReady && (
  <ul id="order-blockers" className="blockers">
    {hasOutOfStock && <li>재고 부족 상품이 있습니다</li>}
    {!hasOption && <li>옵션 미선택 상품이 있습니다</li>}
  </ul>
)}`,
        description: "비활성 사유를 실시간 리스트로 노출하고 aria-describedby로 연결합니다.",
        impact: "+192명의 사용자가 진행 차단 원인 즉시 파악, 반복 클릭 4.7회 → 1.1회.",
      },
    ],
  },
  "https://a-mall.com/main": {
    url: "https://a-mall.com/main",
    fixes: [
      {
        issue_title: "히어로 CTA 버튼이 배경 이미지에 묻힘",
        selector: ".hero-cta",
        before: `.hero-cta {
  background: #E5E7EB;
  color: #475569;
  padding: 12px 28px;
  font-size: 15px;
}`,
        after: `.hero-cta {
  background: #2F5AE8;
  color: #FFFFFF;
  padding: 16px 36px;
  font-size: 17px;
  font-weight: 700;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(47,90,232,0.32);
}`,
        description: "CTA 배경을 브랜드 컬러로 전환해 대비비 3.20:1 → 7.84:1, 글자 크기·두께를 키웠습니다.",
        impact: "+210명의 사용자가 CTA 1차 시선 인지, 클릭률 21% → 추정 58%.",
      },
      {
        issue_title: "상단 검색창 위치 식별 어려움",
        selector: ".header-search-toggle",
        before: `.header-search-toggle {
  position: absolute;
  right: 16px;
  width: 32px;
  height: 32px;
}`,
        after: `.header-search input {
  width: 100%;
  max-width: 480px;
  height: 44px;
  padding: 0 16px 0 44px;
  border-radius: 22px;
  background: #F8FAFC;
}`,
        description: "아이콘 토글에서 헤더 중앙의 가시 입력창으로 승격해 F-Pattern 1차 영역에 배치합니다.",
        impact: "+168명의 사용자가 검색창 발견 시간 4.2초 → 0.8초로 단축.",
      },
      {
        issue_title: "상품 카드의 가격 표기가 14px로 작음",
        selector: ".product-price",
        before: `.product-price {
  font-size: 14px;
  color: #94A3B8;
}`,
        after: `.product-price {
  font-size: 18px;
  color: #0F172A;
  font-weight: 700;
  letter-spacing: -0.01em;
}`,
        description: "가격 텍스트를 18px·진한 색·굵게로 변경해 50대+ 가독 기준을 충족합니다.",
        impact: "+142명의 사용자가 가격을 즉시 인지, 장바구니 재확인 행동 38초 단축.",
      },
      {
        issue_title: "카테고리 메뉴가 호버에만 의존",
        selector: ".category-menu",
        before: "<nav class=\"category-menu\" data-trigger=\"hover\">",
        after: `<nav class="category-menu">
  <button onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="cat-list">
    전체 카테고리
  </button>
  <ul id="cat-list" hidden={!isOpen}>...</ul>
</nav>`,
        description: "호버 의존에서 명시적 토글 버튼으로 변경하여 터치·키보드 사용자도 접근 가능합니다.",
        impact: "+196명의 모바일 사용자가 첫 시도에 메뉴 접근, 탐색 지연 1분 24초 단축.",
      },
      {
        issue_title: "배너 슬라이드 자동 전환 속도가 너무 빠름",
        selector: ".hero-slider",
        before: "<div class=\"hero-slider\" data-interval=\"3000\">",
        after: `<div class="hero-slider" data-interval="6000">
  <button className="pause-btn" onClick={togglePause}
          aria-label={isPaused ? "재생" : "일시 정지"}>
    {isPaused ? "▶" : "⏸"}
  </button>
</div>`,
        description: "전환 간격을 3초 → 6초로 늘리고 일시 정지 컨트롤을 제공합니다.",
        impact: "+86명의 사용자(50대+)가 콘텐츠를 완독 가능, WCAG 2.2.2 통과.",
      },
      {
        issue_title: "무한 스크롤 끝점 안내 없음",
        selector: ".infinite-scroll-container",
        before: "<div class=\"infinite-scroll-container\">...</div>",
        after: `<div class="infinite-scroll-container">
  {items.map(renderItem)}
  {isEnd && (
    <div className="end-marker">
      🎉 모든 상품을 둘러보셨습니다
      <button onClick={scrollTop}>맨 위로</button>
    </div>
  )}
</div>`,
        description: "끝점 도달 시 명시적 안내와 맨 위로 가기 버튼을 제공합니다.",
        impact: "+62명의 사용자가 끝점 인지, 무의미한 스크롤 반복 18% → 0%.",
      },
    ],
  },
  "https://a-mall.com/checkout": {
    url: "https://a-mall.com/checkout",
    fixes: [
      {
        issue_title: "주소 검색 모달이 뷰포트를 벗어남",
        selector: ".postal-search-modal",
        before: "<div class=\"postal-search-modal\" style=\"right:0;bottom:0\">",
        after: `.postal-search-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90vw, 480px);
  max-height: 90vh;
  overflow-y: auto;
}`,
        description: "고정 우측 하단 위치에서 중앙 정렬로 변경, 뷰포트 90% 제한으로 가독성 보장.",
        impact: "+198명의 사용자가 모달 내 검색창 즉시 발견, 입력 성공률 66% → 추정 96%.",
      },
      {
        issue_title: "배송 옵션 라디오 버튼이 작음",
        selector: "input[name=\"shipping-option\"]",
        before: "<input type=\"radio\" name=\"shipping-option\" />",
        after: `<label className="shipping-option-card">
  <input type="radio" name="shipping-option" />
  <div>
    <strong>일반 배송</strong>
    <span>2~3일 소요 · 무료</span>
  </div>
</label>

.shipping-option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  min-height: 56px;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  cursor: pointer;
}
.shipping-option-card:has(input:checked) {
  border-color: #2F5AE8;
  background: #F0F4FF;
}`,
        description: "라디오를 카드형 클릭 영역으로 확장하고 선택 상태를 시각적으로 명확히 합니다.",
        impact: "+144명의 사용자의 의도치 않은 선택 변경 28% → 추정 5%.",
      },
      {
        issue_title: "배송 메모 placeholder가 너무 길어 잘림",
        selector: ".delivery-memo",
        before: "<input class=\"delivery-memo\" placeholder=\"경비실에 맡겨주세요, 부재 시...\" />",
        after: `<select className="delivery-memo-preset">
  <option>배송 메모를 선택해주세요</option>
  <option>경비실에 맡겨주세요</option>
  <option>부재 시 문 앞에 두세요</option>
  <option>도착 전 연락 부탁드립니다</option>
  <option value="custom">직접 입력</option>
</select>`,
        description: "긴 placeholder 대신 드롭다운 프리셋으로 변경하여 입력 부담을 줄입니다.",
        impact: "+58명의 사용자가 메모 선택 시간 단축, 미입력으로 인한 배송 지연 25% → 4%.",
      },
      {
        issue_title: "주문자 정보 자동입력 동의가 사실상 강제됨",
        selector: "#auto-fill-save",
        before: "<input type=\"checkbox\" id=\"auto-fill-save\" checked />",
        after: `<input type="checkbox" id="auto-fill-save" />
<label htmlFor="auto-fill-save">
  다음 주문 시 자동 입력에 사용 
  <span className="optional-badge">선택</span>
</label>`,
        description: "기본 체크를 해제하고 선택 사항임을 명시하여 강제 동의를 방지합니다.",
        impact: "+174명의 사용자의 명시적 동의 비율 71% → 의도된 28%로 정상화.",
      },
      {
        issue_title: "다음 단계 버튼이 폼 하단에 숨겨짐",
        selector: ".checkout-next",
        before: `.checkout-next {
  margin-top: 80px;
}`,
        after: `.checkout-actions {
  position: sticky;
  bottom: 0;
  padding: 16px 24px;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
}
.checkout-next {
  min-width: 200px;
  height: 52px;
  background: #2F5AE8;
  color: #FFFFFF;
  font-weight: 700;
}`,
        description: "다음 단계 버튼을 화면 하단 sticky 위치로 이동하여 항상 보이게 합니다.",
        impact: "+122명의 사용자가 추가 스크롤 없이 버튼 즉시 접근.",
      },
    ],
  },
  "https://a-mall.com/payment": {
    url: "https://a-mall.com/payment",
    fixes: [
      {
        issue_title: "최종 결제 금액 강조 부족",
        selector: ".final-amount",
        before: `.final-amount {
  font-size: 18px;
  color: #1F2937;
}`,
        after: `.final-amount-wrapper {
  padding: 20px 24px;
  background: #F0F4FF;
  border: 2px solid #2F5AE8;
  border-radius: 12px;
}
.final-amount {
  font-size: 28px;
  color: #2F5AE8;
  font-weight: 800;
}`,
        description: "최종 금액을 별도 카드로 분리하고 28px·브랜드 컬러로 강조합니다.",
        impact: "+264명의 사용자가 금액 즉시 확인, 페이지 재스크롤 2.1회 → 0회.",
      },
      {
        issue_title: "비활성 결제 버튼 사유 미표시",
        selector: ".payment-submit",
        before: "<button class=\"payment-submit\" disabled>결제하기</button>",
        after: `<button className="payment-submit"
        disabled={!isReady}
        aria-describedby="payment-blockers">
  결제하기
</button>
{!isReady && (
  <ul id="payment-blockers">
    {!agreedTerms && <li>약관 동의가 필요합니다</li>}
    {!selectedPayment && <li>결제 수단을 선택해주세요</li>}
  </ul>
)}`,
        description: "비활성 사유를 실시간 리스트로 표시하고 aria-describedby로 연결합니다.",
        impact: "+295명의 사용자가 결제 중단 원인 즉시 파악, 반복 클릭 4.7회 → 1.1회.",
      },
      {
        issue_title: "외부 결제창 전환 안내 부족",
        selector: "[data-action=\"open-pg\"]",
        before: "onClick={() => window.location.href = pgUrl}",
        after: `<Modal title="외부 결제 페이지로 이동합니다">
  <p>안전한 결제를 위해 카드사 인증 페이지로 이동합니다.</p>
  <button onClick={cancel}>취소</button>
  <button onClick={proceed}>결제 진행</button>
</Modal>`,
        description: "즉시 외부 전환에서 사전 안내 모달 단계를 추가합니다.",
        impact: "+178명의 사용자(50대+) 외부 결제창 이탈률 28% → 추정 6%.",
      },
      {
        issue_title: "약관 동의 체크박스 포커스 인디케이터 약함",
        selector: "#agree-terms",
        before: `#agree-terms:focus {
  outline: 1px solid #94A3B8;
}`,
        after: `#agree-terms:focus-visible {
  outline: 3px solid #2F5AE8;
  outline-offset: 3px;
  box-shadow: 0 0 0 6px rgba(47,90,232,0.16);
}`,
        description: "포커스 outline을 3px 브랜드 컬러로 확장하고 글로우를 추가합니다.",
        impact: "+88명의 사용자(키보드·저시력)가 포커스 상태 인지, WCAG 2.4.7 통과.",
      },
      {
        issue_title: "카드 번호 입력 자동 포커스 이동 실패",
        selector: ".card-digit",
        before: "<input class=\"card-digit\" maxlength=\"4\" />",
        after: `const handleCardChange = (idx, value) => {
  if (value.length === 4 && idx < 3) {
    cardRefs.current[idx + 1]?.focus();
  }
};
<input ref={el => cardRefs.current[idx] = el}
       maxLength={4}
       inputMode="numeric"
       onChange={e => handleCardChange(idx, e.target.value)} />`,
        description: "ref 기반 포커스 제어로 카드 번호 자동 이동을 안정화합니다.",
        impact: "+167명의 사용자가 카드 입력 단계 완주, 평균 시간 2.1분 → 24초.",
      },
      {
        issue_title: "할인 적용 후 금액 변화 안내 없음",
        selector: ".final-amount-value",
        before: "<span class=\"final-amount-value\">29,800원</span>",
        after: `<span className="final-amount-value" key={amount}
      style={{animation: "highlight 0.6s"}}>
  {amount.toLocaleString()}원
</span>

@keyframes highlight {
  0% { background: #FEF3C7; }
  100% { background: transparent; }
}`,
        description: "금액 변경 시 노란색 하이라이트 애니메이션으로 변화를 명시합니다.",
        impact: "+132명의 사용자가 할인 적용 확신, 페이지 새로고침 33% → 4%.",
      },
    ],
  },
  "https://a-mall.com/product/12847": {
    url: "https://a-mall.com/product/12847",
    fixes: [
      {
        issue_title: "'장바구니 담기' 버튼 위치가 비표준",
        selector: ".add-to-cart",
        before: `.add-to-cart.bottom-floating {
  position: relative;
  bottom: 0;
}`,
        after: `.add-to-cart {
  position: sticky;
  top: 80px;
  width: 100%;
  background: #2F5AE8;
  color: #FFFFFF;
  padding: 16px;
  font-size: 17px;
  font-weight: 700;
}
@media (min-width: 768px) {
  .add-to-cart {
    position: relative;
    top: auto;
  }
}`,
        description: "장바구니 버튼을 상품 이미지 우측 sticky 위치로 이동, 모바일은 상단 고정.",
        impact: "+238명의 사용자가 버튼 발견, 상품 이탈률 38% → 추정 11%.",
      },
      {
        issue_title: "옵션 선택 드롭다운이 너무 작음",
        selector: ".option-selector",
        before: `.option-selector {
  width: 28px;
  height: 28px;
}`,
        after: `.option-selector {
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
}`,
        description: "드롭다운을 48px 높이로 확장하고 폭을 풀로 사용해 정밀 클릭이 쉽게 합니다.",
        impact: "+134명의 60대+ 사용자의 평균 클릭 시도 3.8회 → 1.2회.",
      },
      {
        issue_title: "상품 이미지 확대 버튼 발견 어려움",
        selector: ".image-zoom",
        before: `.image-zoom {
  width: 14px;
  height: 14px;
  position: absolute;
  bottom: 4px;
  right: 4px;
}`,
        after: `.image-zoom {
  width: 36px;
  height: 36px;
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
}
.image-zoom:focus-visible {
  outline: 2px solid #2F5AE8;
}`,
        description: "확대 버튼을 36x36px로 확대하고 반투명 배경으로 시인성을 높였습니다.",
        impact: "+184명의 사용자가 확대 기능 발견, 상품 정보 확인 완성도 +47%.",
      },
      {
        issue_title: "리뷰 별점이 색상에만 의존함",
        selector: ".star-rating",
        before: "<div class=\"star-rating\" data-score=\"4.2\">",
        after: `<div class="star-rating" data-score="4.2" aria-label="5점 만점 중 4.2점">
  {/* 별 아이콘 */}
  <span className="score-text">4.2 <span className="max">/ 5</span></span>
  <span className="review-count">(리뷰 1,247개)</span>
</div>`,
        description: "별 옆에 텍스트 점수와 리뷰 수를 명시하여 색맹 사용자도 인지 가능합니다.",
        impact: "+78명의 색맹 사용자가 별점 즉시 인지, 평균 인지 시간 4.2초 단축.",
      },
      {
        issue_title: "재고 표시가 12px로 매우 작음",
        selector: ".stock-warning",
        before: `.stock-warning {
  font-size: 12px;
  color: #94A3B8;
}`,
        after: `.stock-warning {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #DC2626;
  background: #FEF2F2;
  padding: 6px 12px;
  border-radius: 6px;
}
.stock-warning::before { content: '⚠'; }`,
        description: "재고 경고를 15px·빨간색 배경 강조로 변경하여 긴급성을 시각화합니다.",
        impact: "+52명의 사용자가 재고 부족 인지, 구매 결정 시간 평균 22초 단축.",
      },
    ],
  },
  "https://a-mall.com/mypage": {
    url: "https://a-mall.com/mypage",
    fixes: [
      {
        issue_title: "메뉴 텍스트가 14px로 작음",
        selector: ".mypage-menu-item",
        before: `.mypage-menu-item {
  font-size: 14px;
}`,
        after: `.mypage-menu-item {
  font-size: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
}
.mypage-menu-item:hover {
  background: #F1F5F9;
}`,
        description: "메뉴 텍스트를 16px로 확장하고 호버 피드백을 추가합니다.",
        impact: "+128명의 50대+ 사용자의 메뉴 탐색 시간 5.2초 단축.",
      },
      {
        issue_title: "로그아웃 버튼이 비표준 위치",
        selector: ".logout-btn-bottom",
        before: "<footer><button class=\"logout-btn-bottom\">로그아웃</button></footer>",
        after: `<header>
  <UserMenu>
    <button onClick={logout}>로그아웃</button>
    <button onClick={goSettings}>설정</button>
  </UserMenu>
</header>`,
        description: "로그아웃 버튼을 헤더 사용자 메뉴로 이동하여 표준 패턴을 따릅니다.",
        impact: "+68명의 사용자가 로그아웃 버튼 위치 즉시 인지.",
      },
      {
        issue_title: "주문 내역 페이지네이션 버튼이 너무 작음",
        selector: ".pagination-page",
        before: `.pagination-page {
  width: 24px;
  height: 24px;
  font-size: 12px;
}`,
        after: `.pagination-page {
  min-width: 44px;
  min-height: 44px;
  font-size: 15px;
  padding: 0 12px;
  border-radius: 8px;
}
.pagination-page[aria-current='page'] {
  background: #2F5AE8;
  color: #FFFFFF;
}`,
        description: "페이지네이션 버튼을 44px 영역으로 확장하고 현재 페이지를 명확히 표시합니다.",
        impact: "+96명의 사용자(60대+)의 평균 클릭 시도 2.7회 → 1.1회.",
      },
      {
        issue_title: "회원 정보 수정 폼 라벨이 입력 필드와 분리됨",
        selector: ".floating-label",
        before: `<div class="form-row">
  <label>이름</label>
  <input />
</div>`,
        after: `<div className="form-row">
  <label htmlFor="name" className="form-label">이름</label>
  <input id="name" className="form-input" />
</div>

@media (max-width: 768px) {
  .form-row { flex-direction: column; }
}`,
        description: "for/id 명시적 연결과 좁은 화면에서 라벨이 입력 위에 표시되도록 변경합니다.",
        impact: "+58명의 모바일 사용자의 폼 입력 오류 32% → 추정 11%.",
      },
    ],
  },
  "https://a-mall.com/signup": {
    url: "https://a-mall.com/signup",
    fixes: [
      {
        issue_title: "필수 입력 표시가 색상에만 의존함",
        selector: ".required-asterisk",
        before: "<label>이메일 <span style=\"color:red\">*</span></label>",
        after: `<label for="email">
  이메일 <span class="required-badge">필수</span>
</label>
<input id="email" aria-required="true" />

.required-badge {
  padding: 2px 8px;
  background: #FEE2E2;
  color: #B91C1C;
  font-size: 12px;
  border-radius: 4px;
}`,
        description: "asterisk 단독에서 '필수' 텍스트 배지로 변경하고 aria-required를 부여합니다.",
        impact: "+187명의 사용자(색약 8% 포함)가 필수 항목 사전 인지, 폼 오류율 84% → 추정 12%.",
      },
      {
        issue_title: "비밀번호 규칙이 입력 후에만 표시됨",
        selector: ".password-hint",
        before: ".password-hint { display: none; }",
        after: `.password-hint {
  display: block;
  margin-top: 8px;
  padding: 12px 14px;
  background: #F1F5F9;
  font-size: 13px;
}
.password-hint li.valid { color: #16A34A; }`,
        description: "비밀번호 규칙을 항상 노출하고 입력 진행 시 실시간으로 충족 항목을 녹색 표시합니다.",
        impact: "+96명의 사용자(50대+ 68%) 재입력 횟수 2.4회 → 0.6회로 감소.",
      },
      {
        issue_title: "인증번호 입력 박스 포커스 자동 이동 실패",
        selector: ".otp-digit",
        before: "<!-- onChange 핸들러에서 nextSibling.focus() 사용 -->",
        after: `const handleOtpChange = (idx, value) => {
  setOtp(prev => { const d = [...prev]; d[idx] = value; return d; });
  if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
};
<input ref={el => inputRefs.current[idx] = el}
       maxLength={1} inputMode="numeric"
       onChange={e => handleOtpChange(idx, e.target.value)} />`,
        description: "DOM nextSibling 의존에서 ref 배열 기반 포커스 제어로 전환하여 호환성 문제를 해결합니다.",
        impact: "+240명의 사용자가 인증 단계 완주, 70대 인증 성공률 0% → 추정 48%.",
      },
      {
        issue_title: "약관 동의 체크박스의 클릭 영역이 좁음",
        selector: "#agree-marketing",
        before: `<input type="checkbox" id="agree-marketing" />
<label for="agree-marketing">마케팅 동의</label>`,
        after: `<label class="checkbox-row" for="agree-marketing">
  <input type="checkbox" id="agree-marketing" />
  <span>마케팅 동의</span>
</label>

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 12px;
  cursor: pointer;
}`,
        description: "체크박스+라벨 전체를 클릭 영역으로 묶고 최소 44px 높이를 보장합니다.",
        impact: "+142명의 모바일 사용자가 1차 시도에 체크 성공, 평균 시도 2.3회 → 1.0회.",
      },
      {
        issue_title: "이메일 형식 오류 안내가 제출 후에만 표시",
        selector: "input[type=\"email\"]",
        before: "<input type=\"email\" name=\"email\" />",
        after: `<input type="email" name="email"
       onBlur={validateEmail}
       aria-invalid={!isValid}
       aria-describedby="email-feedback" />
<span id="email-feedback" className="field-feedback">
  {isValid ? "✓ 사용 가능한 이메일" : feedbackMessage}
</span>`,
        description: "blur 시점에 실시간 검증을 수행하고 시각·스크린리더에 즉시 피드백을 전달합니다.",
        impact: "+108명의 사용자가 제출 전 오류 인지, 폼 이탈률 31% → 추정 9%.",
      },
      {
        issue_title: "생년월일 입력 형식 안내 부족",
        selector: "input[name=\"birth\"]",
        before: "<input name=\"birth\" placeholder=\"1990-01-01\" />",
        after: `<label for="birth">생년월일 <span class="hint">(YYYY-MM-DD 형식, 예: 1990-01-01)</span></label>
<input id="birth" name="birth"
       placeholder="1990-01-01"
       pattern="\\\\d{4}-\\\\d{2}-\\\\d{2}" />`,
        description: "라벨 옆 가시적 형식 안내를 추가하고 pattern으로 자동 검증을 보조합니다.",
        impact: "+74명의 사용자(50대+ 28%)가 첫 시도에 올바른 형식으로 입력.",
      },
    ],
  },
  "https://a-mall.com/login": {
    url: "https://a-mall.com/login",
    fixes: [
      {
        issue_title: "로그인 버튼이 배경과 구분되지 않음",
        selector: ".login-submit",
        before: `.login-submit {
  background: #E8EEF7;
  color: #5B6B8A;
  padding: 14px 24px;
  border-radius: 12px;
}`,
        after: `.login-submit {
  background: #2F5AE8;
  color: #FFFFFF;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(47,90,232,0.18);
}`,
        description: "버튼 배경을 브랜드 컬러로 변경해 대비비 1.18:1 → 7.84:1로 끌어올립니다.",
        impact: "+312명의 사용자(50대~70대 73%)가 로그인 버튼을 즉시 식별 가능.",
      },
      {
        issue_title: "비밀번호 표시 토글 버튼이 너무 작음",
        selector: ".password-toggle",
        before: `.password-toggle {
  width: 16px;
  height: 16px;
}`,
        after: `.password-toggle {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.password-toggle svg { width: 24px; height: 24px; }
.password-toggle:focus-visible {
  outline: 2px solid #2F5AE8;
}`,
        description: "터치 영역을 WCAG 2.5.5 권장 44x44px로 확장하고 포커스 표시를 강화했습니다.",
        impact: "+124명의 사용자(60대 이상 81%)가 토글 발견, 평균 입력 시간 23초 단축.",
      },
      {
        issue_title: "입력 필드 placeholder 텍스트 대비 부족",
        selector: "input[placeholder]",
        before: `input::placeholder {
  color: #CBD5E1;
}`,
        after: `input::placeholder {
  color: #64748B;
  opacity: 1;
}`,
        description: "Placeholder 색상을 강화해 대비비를 2.1:1 → 4.6:1로 개선합니다.",
        impact: "+156명의 사용자가 입력 안내를 첫 시선에 인지 가능.",
      },
      {
        issue_title: "로그인 실패 메시지 위치가 입력 필드와 분리됨",
        selector: ".error-banner",
        before: "<div class=\"error-banner\">아이디 또는 비밀번호가 일치하지 않습니다</div>",
        after: `/* 인라인 오류로 변경 */
<div class="error-inline">
  <input aria-invalid="true" aria-describedby="email-error" />
  <span id="email-error" class="error-text">이메일 형식이 올바르지 않습니다</span>
</div>`,
        description: "전역 배너에서 인라인 오류 메시지로 변경하여 입력 필드와 직접 연관됩니다.",
        impact: "+214명의 사용자가 오류 원인을 즉시 인지, 평균 재시도 시간 1분 48초 단축.",
      },
      {
        issue_title: "'회원가입' 링크가 본문과 같은 색상",
        selector: ".signup-link",
        before: `.signup-link {
  color: #1F2937;
  font-size: 14px;
}`,
        after: `.signup-link {
  color: #2F5AE8;
  font-size: 15px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}`,
        description: "링크임을 시각적으로 명시하고 브랜드 컬러로 강조합니다.",
        impact: "+68명의 신규 가입 의도 사용자가 회원가입 경로를 즉시 발견.",
      },
    ],
  },
};

// ============================================================================
// 호환성 변환 (v2 형식)
// ============================================================================

/**
 * 기존 서비스들과의 호환성을 위해 v2 형식으로 변환
 */

// 기본 placeholder SVG (스크린샷 이미지 없을 때 표시)
const defaultPlaceholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%23f3f4f6' width='1920' height='1080'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='48' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EPage Screenshot%3C/text%3E%3C/svg%3E`;

// demoResultPages: 페이지 목록 (URL 맵핑용)
export const demoResultPages = [
  {
    id: "login",
    name: "로그인 페이지",
    url: "https://a-mall.com/login",
    screenshotUrl: "/mock-images/page-login.png",
  },
  {
    id: "signup",
    name: "회원가입 페이지",
    url: "https://a-mall.com/signup",
    screenshotUrl: "/mock-images/page-signup.png",
  },
  {
    id: "main",
    name: "메인 페이지",
    url: "https://a-mall.com/main",
    screenshotUrl: "/mock-images/page-main.png",
  },
  {
    id: "search",
    name: "검색 페이지",
    url: "https://a-mall.com/search",
    screenshotUrl: "/mock-images/page-search.png",
  },
  {
    id: "product",
    name: "상품 상세 페이지",
    url: "https://a-mall.com/product/12847",
    screenshotUrl: "/mock-images/page-product-detail.png",
  },
  {
    id: "cart",
    name: "장바구니 페이지",
    url: "https://a-mall.com/cart",
    screenshotUrl: "/mock-images/page-cart.png",
  },
] as const;

// demoIssues: 모든 이슈 목록
export const demoIssues = MOCK_FINAL_ISSUES.issues.map((issue, idx) => ({
  issueId: `issue_${idx}`,
  category: issue.category,
  severity: issue.severity === "critical" ? "CRITICAL" : issue.severity === "high" ? "HIGH" : issue.severity === "medium" ? "MEDIUM" : "LOW",
  title: issue.title,
  description: issue.description,
  targetHtml: issue.targetHtml,
  tags: issue.tags,
  url: issue.url,
  affectedUsersCount: issue.fail_count,
  affectedUsersPercent: Math.round(issue.fail_rate * 100 * 10) / 10,
}));

// demoHeatmapPoints: 모든 히트맵 포인트
export const demoHeatmapPoints = MOCK_HEATMAP.errorPoints.map((point) => ({
  issueId: point.issueId,
  url: point.url,
  x: point.x,
  y: point.y,
  ageBand: point.ageBand,
  count: point.count,
  severity: point.severity,
  errorType: point.errorType,
}));

// demoOverview: 개요 통계
export const demoOverview = {
  summary: {
    totalSessions: MOCK_SUMMARY.summary.total_sessions,
    successCount: MOCK_SUMMARY.summary.success_count,
    successRate: Math.round(MOCK_SUMMARY.summary.success_rate * 100 * 10) / 10,
    avgDurationSeconds: Math.round(MOCK_SUMMARY.summary.avg_duration_ms / 1000),
  },
  ageStats: MOCK_SUMMARY.overview.map((overview) => ({
    ageBand: {
      "10s": "10대",
      "20s": "20대",
      "30s": "30대",
      "40s": "40대",
      "50s": "50대",
      "60s": "60대",
      "70s": "70대",
    }[overview.age_group] || overview.age_group,
    entered: overview.total_sessions,
    passed: overview.success_count,
    dropOff: overview.total_sessions - overview.success_count,
    successRate: Math.round(overview.success_rate * 100 * 10) / 10,
    failureRate: Math.round(overview.fail_rate * 100 * 10) / 10,
    avgDurationMinutes: Math.round((overview.avg_duration_ms / 60000) * 10) / 10,
    avgActions: overview.avg_actions,
  })),
};

// demoFixesByUrl: URL별 수정안 (result-ai-fix.mock.service 호환성)
export const demoFixesByUrl: Record<string, Array<{
  title: string;
  severity: string;
  affectedUsersCount: number;
  beforeCode: string;
  afterCode: string;
  impactDescription: string;
  changeDescription: string;
}>> = (() => {
  const result: Record<string, Array<{
    title: string;
    severity: string;
    affectedUsersCount: number;
    beforeCode: string;
    afterCode: string;
    impactDescription: string;
    changeDescription: string;
  }>> = {};

  // MOCK_FIXES의 각 URL별 데이터 변환
  for (const [url, fixData] of Object.entries(MOCK_FIXES)) {
    if (fixData && Array.isArray(fixData.fixes)) {
      result[url] = fixData.fixes.map((fix: any) => {
        // impact 문자열에서 숫자 추출 (예: "+312명" -> 312)
        const affectedMatch = fix.impact?.match(/\+?(\d+)/);
        const affectedCount = affectedMatch ? parseInt(affectedMatch[1]) : 100;

        return {
          title: fix.issue_title || "미정의 제목",
          severity: "medium",
          affectedUsersCount: affectedCount,
          beforeCode: fix.before || "",
          afterCode: fix.after || "",
          impactDescription: fix.impact || "",
          changeDescription: fix.description || "",
        };
      });
    } else {
      result[url] = [];
    }
  }

  return result;
})();

// ============================================================================
// 통합 export
// ============================================================================

export const MOCK_REPORT = {
  meta: MOCK_SIMULATION_META,
  pages: MOCK_PAGES,
  summary: MOCK_SUMMARY,
  issues: MOCK_FINAL_ISSUES,
  heatmap: MOCK_HEATMAP,
  wcag: MOCK_WCAG,
  wcagSummary: MOCK_WCAG_SUMMARY,
  fixes: MOCK_FIXES,
} as const;

export default MOCK_REPORT;
