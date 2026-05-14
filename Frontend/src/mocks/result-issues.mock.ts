/**
 * Result Issues Mock - 백엔드 final_issues.json 데이터 기반
 * v3: 42개 이슈, 8페이지, 페르소나별 영향도 포함
 */

export type IssueCategory = "접근성" | "사용성" | "시각요소" | "기타"
export type IssueSeverity = "low" | "medium" | "high" | "critical"
export type BackendIssueSeverity = "low" | "medium" | "high" | "critical"

export interface AffectedPersona {
  session_id: string
  persona_age: "10s" | "20s" | "30s" | "40s" | "50s" | "60s" | "70s"
}

export interface ResultIssue {
  id: string
  url: string
  category: IssueCategory
  subCategory: string
  severity: IssueSeverity
  title: string
  description: string
  targetHtml: string
  tags: string[]
  failCount: number
  failRate: number
  affectedUsers: {
    count: number
    percent: number
  }
  affectedPersonas: AffectedPersona[]
  sessionIds: string[]
  personaAges: string[]
}

export interface ResultIssuePage {
  id: string
  name: string
  url: string
  issues: ResultIssue[]
  highlights: IssueCategory[]
}

// 원본 데이터 (final_issues.json 기반)
const backendIssuesData = [
  {
    url: "https://a-mall.com/login",
    category: "사용성",
    subCategory: "시인성 부족",
    severity: "high" as const,
    title: "로그인 버튼이 배경과 구분되지 않음",
    description:
      "로그인 버튼 배경(#E8EEF7)이 페이지 배경(#FFFFFF)과 대비비 1.18:1로 WCAG AA 기준 4.5:1을 크게 미달합니다. 50대 이상 페르소나의 73%가 로그인 버튼을 인지하지 못하고 'Google로 시작하기' 버튼을 먼저 시도하는 패턴이 반복 관찰되었습니다.",
    targetHtml: '<button class="login-submit">로그인</button>',
    tags: ["로그인", "버튼 시인성", "대비비"],
    fail_count: 312,
    fail_rate: 0.312,
    session_ids: ["AI-sess_0001", "AI-sess_0002", "AI-sess_0003"],
    persona_ages: ["50s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0001", persona_age: "50s" as const },
      { session_id: "AI-sess_0002", persona_age: "60s" as const },
      { session_id: "AI-sess_0003", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/login",
    category: "접근성",
    subCategory: "포커스 표시 부족",
    severity: "medium" as const,
    title: "비밀번호 표시 토글 버튼이 너무 작음",
    description:
      "비밀번호 입력란 우측의 눈 아이콘이 16x16px로 60대 이상 페르소나의 시각 탐색 범위(중심 시야 50%) 밖에 위치합니다. 시뮬레이션 결과 60대+에서는 81%가 해당 버튼을 발견하지 못했습니다.",
    targetHtml: '<button aria-label="비밀번호 표시" class="password-toggle">',
    tags: ["비밀번호", "터치 영역", "아이콘 크기"],
    fail_count: 124,
    fail_rate: 0.124,
    session_ids: ["AI-sess_0004", "AI-sess_0005", "AI-sess_0006"],
    persona_ages: ["60s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0004", persona_age: "60s" as const },
      { session_id: "AI-sess_0005", persona_age: "60s" as const },
      { session_id: "AI-sess_0006", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/login",
    category: "시각요소",
    subCategory: "가독성",
    severity: "medium" as const,
    title: "입력 필드 placeholder 텍스트 대비 부족",
    description:
      "아이디·비밀번호 입력 필드의 placeholder 텍스트(#CBD5E1)가 배경(#FFFFFF) 대비 2.1:1로 표기됩니다. 50대+ 페르소나의 38%가 첫 클릭 전 입력 안내를 인지하지 못했습니다.",
    targetHtml: '<input placeholder="아이디를 입력하세요" />',
    tags: ["로그인", "placeholder", "대비비"],
    fail_count: 156,
    fail_rate: 0.156,
    session_ids: ["AI-sess_0007", "AI-sess_0008", "AI-sess_0009"],
    persona_ages: ["50s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0007", persona_age: "50s" as const },
      { session_id: "AI-sess_0008", persona_age: "60s" as const },
      { session_id: "AI-sess_0009", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/login",
    category: "사용성",
    subCategory: "피드백 부재",
    severity: "high" as const,
    title: "로그인 실패 후 오류 메시지 위치가 먼 곳에 표시됨",
    description:
      "로그인 실패 시 페이지 상단의 알림 영역에만 오류가 표시되고, 입력 필드 근처에 인라인 오류 표시가 없습니다. 40대+ 페르소나의 64%가 오류를 인지하지 못하고 같은 정보로 재시도했습니다.",
    targetHtml: '<div id="error-alert" role="alert">비정상 계정</div>',
    tags: ["로그인", "오류 처리", "피드백"],
    fail_count: 287,
    fail_rate: 0.287,
    session_ids: ["AI-sess_0010", "AI-sess_0011", "AI-sess_0012"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0010", persona_age: "40s" as const },
      { session_id: "AI-sess_0011", persona_age: "50s" as const },
      { session_id: "AI-sess_0012", persona_age: "60s" as const },
    ],
  },
  {
    url: "https://a-mall.com/login",
    category: "접근성",
    subCategory: "키보드 네비게이션",
    severity: "critical" as const,
    title: "소셜 로그인 버튼이 탭 네비게이션에 포함되지 않음",
    description:
      "Google, Naver 로그인 버튼이 tabindex='-1'로 설정되어 키보드 사용자는 이 옵션들에 접근할 수 없습니다. 20대+ 페르소나 중 키보드/화면 읽기 사용자 약 87명이 로그인 경로를 제한당했습니다.",
    targetHtml: '<button tabindex="-1" class="social-login-google">Google</button>',
    tags: ["소셜 로그인", "키보드", "탭 네비게이션"],
    fail_count: 87,
    fail_rate: 0.087,
    session_ids: ["AI-sess_0013", "AI-sess_0014", "AI-sess_0015"],
    persona_ages: ["20s", "30s", "40s"],
    affected_personas: [
      { session_id: "AI-sess_0013", persona_age: "20s" as const },
      { session_id: "AI-sess_0014", persona_age: "30s" as const },
      { session_id: "AI-sess_0015", persona_age: "40s" as const },
    ],
  },
  {
    url: "https://a-mall.com/signup",
    category: "사용성",
    subCategory: "입력 검증 피드백",
    severity: "high" as const,
    title: "비밀번호 규칙이 정적 텍스트로만 표시되어 변경 추적 불가",
    description:
      "비밀번호 규칙(대문자, 숫자 포함 등)이 정적 텍스트로만 표시되고, 입력 중 실시간으로 충족 여부를 보여주지 않습니다. 50대 이상 페르소나의 68%가 규칙을 충족했는지 확인하지 못하고 재입력을 반복했습니다.",
    targetHtml: '<p class="password-rules">비밀번호는 대문자, 숫자를 포함해야 합니다</p>',
    tags: ["회원가입", "비밀번호", "검증 피드백"],
    fail_count: 289,
    fail_rate: 0.289,
    session_ids: ["AI-sess_0016", "AI-sess_0017", "AI-sess_0018"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0016", persona_age: "40s" as const },
      { session_id: "AI-sess_0017", persona_age: "50s" as const },
      { session_id: "AI-sess_0018", persona_age: "60s" as const },
    ],
  },
  {
    url: "https://a-mall.com/signup",
    category: "접근성",
    subCategory: "필수 항목 표시",
    severity: "high" as const,
    title: "필수 입력 필드 표시가 색상에만 의존함",
    description:
      "회원가입 폼에서 필수 입력 필드가 빨간색 별표로만 표시되고, 'aria-required' 속성이나 텍스트 라벨('필수')이 없습니다. 색약 사용자 약 150명이 필수 여부를 인지하지 못하고 잘못 진행했습니다.",
    targetHtml: '<label>이메일 <span style="color:red">*</span></label>',
    tags: ["회원가입", "필수 항목", "색약"],
    fail_count: 150,
    fail_rate: 0.15,
    session_ids: ["AI-sess_0019", "AI-sess_0020", "AI-sess_0021"],
    persona_ages: ["20s", "30s", "40s"],
    affected_personas: [
      { session_id: "AI-sess_0019", persona_age: "20s" as const },
      { session_id: "AI-sess_0020", persona_age: "30s" as const },
      { session_id: "AI-sess_0021", persona_age: "40s" as const },
    ],
  },
  {
    url: "https://a-mall.com/signup",
    category: "사용성",
    subCategory: "오류 메시지 명확성",
    severity: "medium" as const,
    title: "이메일 중복 오류 시 기존 가입 경로 가이드 부재",
    description:
      "이미 가입된 이메일로 시도할 때 '이미 등록된 이메일입니다'라는 메시지만 표시되고, 로그인 페이지 바로가기나 비밀번호 찾기 옵션이 없습니다. 30대 이상 페르소나의 45%가 페이지 구석구석을 찾아 로그인 페이지를 발견했습니다.",
    targetHtml: '<p class="error">이미 등록된 이메일입니다</p>',
    tags: ["회원가입", "오류 메시지", "가이드"],
    fail_count: 198,
    fail_rate: 0.198,
    session_ids: ["AI-sess_0022", "AI-sess_0023", "AI-sess_0024"],
    persona_ages: ["30s", "40s", "50s"],
    affected_personas: [
      { session_id: "AI-sess_0022", persona_age: "30s" as const },
      { session_id: "AI-sess_0023", persona_age: "40s" as const },
      { session_id: "AI-sess_0024", persona_age: "50s" as const },
    ],
  },
  {
    url: "https://a-mall.com/signup",
    category: "시각요소",
    subCategory: "텍스트 명확성",
    severity: "medium" as const,
    title: "약관 동의 텍스트가 너무 작음 (10px)",
    description:
      "약관 동의 항목의 텍스트가 10px로 표기되어 50대 이상 페르소나의 최소 가독 기준을 충족하지 못합니다. 무분별한 클릭으로 이어져 약관 이해도가 현저히 낮았습니다.",
    targetHtml: '<span class="terms-text" style="font-size:10px;">...</span>',
    tags: ["약관", "폰트 크기", "가독성"],
    fail_count: 167,
    fail_rate: 0.167,
    session_ids: ["AI-sess_0025", "AI-sess_0026", "AI-sess_0027"],
    persona_ages: ["50s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0025", persona_age: "50s" as const },
      { session_id: "AI-sess_0026", persona_age: "60s" as const },
      { session_id: "AI-sess_0027", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/main",
    category: "사용성",
    subCategory: "시각 계층",
    severity: "high" as const,
    title: "히어로 배너 CTA가 배경에 묻혀 식별 어려움",
    description:
      "메인 페이지 상단 히어로 영역의 주요 CTA('지금 쇼핑하기')가 배경 이미지 위 회색 텍스트(#808080)로 대비비 1.8:1입니다. 30대+ 페르소나의 52%가 이 CTA를 인식하지 못하고 하단 상품 카테고리로 직접 이동했습니다.",
    targetHtml: '<a class="hero-cta">지금 쇼핑하기</a>',
    tags: ["메인", "CTA", "대비비"],
    fail_count: 289,
    fail_rate: 0.289,
    session_ids: ["AI-sess_0028", "AI-sess_0029", "AI-sess_0030"],
    persona_ages: ["30s", "40s", "50s"],
    affected_personas: [
      { session_id: "AI-sess_0028", persona_age: "30s" as const },
      { session_id: "AI-sess_0029", persona_age: "40s" as const },
      { session_id: "AI-sess_0030", persona_age: "50s" as const },
    ],
  },
  {
    url: "https://a-mall.com/main",
    category: "접근성",
    subCategory: "이미지 대체 텍스트",
    severity: "high" as const,
    title: "상품 이미지에 alt 텍스트 없음",
    description:
      "모든 상품 카드 이미지에 alt 속성이 없거나 빈 값('')으로 설정되어 있습니다. 화면 읽기 프로그램 사용자 약 98명이 상품을 식별할 수 없어 클릭을 포기했습니다.",
    targetHtml: '<img src="product.jpg" alt="" />',
    tags: ["이미지", "alt 텍스트", "접근성"],
    fail_count: 98,
    fail_rate: 0.098,
    session_ids: ["AI-sess_0031", "AI-sess_0032", "AI-sess_0033"],
    persona_ages: ["10s", "20s", "30s"],
    affected_personas: [
      { session_id: "AI-sess_0031", persona_age: "10s" as const },
      { session_id: "AI-sess_0032", persona_age: "20s" as const },
      { session_id: "AI-sess_0033", persona_age: "30s" as const },
    ],
  },
  {
    url: "https://a-mall.com/main",
    category: "사용성",
    subCategory: "검색 기능",
    severity: "medium" as const,
    title: "상단 검색창이 아이콘으로만 표시되어 식별 어려움",
    description:
      "헤더 우측 끝 검색 아이콘만 표시되고 '검색' 텍스트 라벨이 없습니다. 30대+ 페르소나의 47%가 F-패턴 시선 흐름 내에서 검색창을 인식하지 못하고 평균 3.2회의 시선 이동으로 발견했습니다.",
    targetHtml: '<button class="header-search" aria-label="검색"></button>',
    tags: ["검색", "헤더", "시선 흐름"],
    fail_count: 206,
    fail_rate: 0.206,
    session_ids: ["AI-sess_0034", "AI-sess_0035", "AI-sess_0036"],
    persona_ages: ["30s", "40s", "50s"],
    affected_personas: [
      { session_id: "AI-sess_0034", persona_age: "30s" as const },
      { session_id: "AI-sess_0035", persona_age: "40s" as const },
      { session_id: "AI-sess_0036", persona_age: "50s" as const },
    ],
  },
  {
    url: "https://a-mall.com/product/12847",
    category: "시각요소",
    subCategory: "가격 가독성",
    severity: "medium" as const,
    title: "상품 상세 페이지 가격이 14px로 표기됨",
    description:
      "상품 상세 페이지의 가격(할인가 & 정가)이 14px 회색으로 표기되어 50대 이상 페르소나의 기본 가독성 기준을 충족하지 못합니다. 이 정보를 놓친 사용자는 카트에 추가 후 가격 재확인으로 38초 추가 지연이 발생했습니다.",
    targetHtml: '<span class="product-price" style="font-size:14px;">29,800원</span>',
    tags: ["가격", "폰트 크기", "상품 상세"],
    fail_count: 167,
    fail_rate: 0.167,
    session_ids: ["AI-sess_0037", "AI-sess_0038", "AI-sess_0039"],
    persona_ages: ["50s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0037", persona_age: "50s" as const },
      { session_id: "AI-sess_0038", persona_age: "60s" as const },
      { session_id: "AI-sess_0039", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/product/12847",
    category: "사용성",
    subCategory: "색상 선택",
    severity: "medium" as const,
    title: "색상 옵션이 색상 칩으로만 표시됨",
    description:
      "상품의 색상 선택 옵션이 색상 칩(동그란 원) 형태로만 표시되고, 색상명 텍스트 라벨이 없습니다. 색약 페르소나 약 78명이 원하는 색상을 식별하지 못하고 임의로 선택했습니다.",
    targetHtml: '<button class="color-chip" style="background-color:#FF0000;"></button>',
    tags: ["색상", "색약", "라벨"],
    fail_count: 78,
    fail_rate: 0.078,
    session_ids: ["AI-sess_0040", "AI-sess_0041", "AI-sess_0042"],
    persona_ages: ["20s", "30s", "40s"],
    affected_personas: [
      { session_id: "AI-sess_0040", persona_age: "20s" as const },
      { session_id: "AI-sess_0041", persona_age: "30s" as const },
      { session_id: "AI-sess_0042", persona_age: "40s" as const },
    ],
  },
  {
    url: "https://a-mall.com/product/12847",
    category: "접근성",
    subCategory: "주문 정보",
    severity: "high" as const,
    title: "수량 조절 버튼의 접근성 레이블 부재",
    description:
      "'수량' 증가/감소 버튼에 aria-label이 없어 화면 읽기 사용자가 버튼의 목적을 알 수 없습니다. 화면 읽기 사용자 약 45명이 수량 조절 시 혼란을 겪었습니다.",
    targetHtml: '<button class="qty-increase">+</button>',
    tags: ["수량", "아리아 레이블", "접근성"],
    fail_count: 45,
    fail_rate: 0.045,
    session_ids: ["AI-sess_0043", "AI-sess_0044", "AI-sess_0045"],
    persona_ages: ["10s", "20s", "30s"],
    affected_personas: [
      { session_id: "AI-sess_0043", persona_age: "10s" as const },
      { session_id: "AI-sess_0044", persona_age: "20s" as const },
      { session_id: "AI-sess_0045", persona_age: "30s" as const },
    ],
  },
  {
    url: "https://a-mall.com/product/12847",
    category: "사용성",
    subCategory: "리뷰 정렬",
    severity: "medium" as const,
    title: "리뷰 정렬 옵션이 숨겨져 있어 발견 어려움",
    description:
      "상품 리뷰 섹션의 정렬 옵션(최신순, 평점순 등)이 작은 드롭다운으로만 표시되고 강조되지 않아, 30대+ 페르소나의 39%가 발견하지 못했습니다.",
    targetHtml: '<select class="review-sort" style="font-size:12px;"></select>',
    tags: ["리뷰", "정렬", "드롭다운"],
    fail_count: 174,
    fail_rate: 0.174,
    session_ids: ["AI-sess_0046", "AI-sess_0047", "AI-sess_0048"],
    persona_ages: ["30s", "40s", "50s"],
    affected_personas: [
      { session_id: "AI-sess_0046", persona_age: "30s" as const },
      { session_id: "AI-sess_0047", persona_age: "40s" as const },
      { session_id: "AI-sess_0048", persona_age: "50s" as const },
    ],
  },
  {
    url: "https://a-mall.com/cart",
    category: "사용성",
    subCategory: "수량 입력",
    severity: "medium" as const,
    title: "장바구니 수량 직접 입력 필드가 숨겨져 있음",
    description:
      "장바구니 각 상품의 수량을 +/- 버튼으로만 조절 가능하고, 직접 숫자를 입력하는 필드가 없어 대량 구매 시 50대 이상 페르소나의 59%가 불편을 느껴 포기했습니다.",
    targetHtml: '<div class="qty-control"><button>-</button><button>+</button></div>',
    tags: ["장바구니", "수량", "입력 방식"],
    fail_count: 264,
    fail_rate: 0.264,
    session_ids: ["AI-sess_0049", "AI-sess_0050", "AI-sess_0051"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0049", persona_age: "40s" as const },
      { session_id: "AI-sess_0050", persona_age: "50s" as const },
      { session_id: "AI-sess_0051", persona_age: "60s" as const },
    ],
  },
  {
    url: "https://a-mall.com/cart",
    category: "접근성",
    subCategory: "테이블 구조",
    severity: "high" as const,
    title: "장바구니 상품 목록이 의미론적 테이블로 마크업되지 않음",
    description:
      "장바구니의 상품 목록이 div와 span의 조합으로만 구성되고 <table>, <thead>, <tbody> 등 의미론적 마크업이 없어 화면 읽기 사용자가 행과 열의 관계를 이해할 수 없습니다.",
    targetHtml: '<div class="cart-item"><span>상품명</span><span>가격</span></div>',
    tags: ["테이블", "의미론적 마크업", "접근성"],
    fail_count: 112,
    fail_rate: 0.112,
    session_ids: ["AI-sess_0052", "AI-sess_0053", "AI-sess_0054"],
    persona_ages: ["10s", "20s", "30s"],
    affected_personas: [
      { session_id: "AI-sess_0052", persona_age: "10s" as const },
      { session_id: "AI-sess_0053", persona_age: "20s" as const },
      { session_id: "AI-sess_0054", persona_age: "30s" as const },
    ],
  },
  {
    url: "https://a-mall.com/cart",
    category: "사용성",
    subCategory: "쿠폰 적용",
    severity: "medium" as const,
    title: "쿠폰 입력 필드가 스크롤 없이는 보이지 않음",
    description:
      "페이지 로드 시 결제 예상액은 보이지만 쿠폰 입력 필드는 스크롤 아래에 숨겨져 있어, 40대 이상 페르소나의 54%가 쿠폰 적용 기능을 발견하지 못했습니다.",
    targetHtml: '<div class="coupon-section" style="margin-top:1000px;"></div>',
    tags: ["쿠폰", "레이아웃", "발견성"],
    fail_count: 241,
    fail_rate: 0.241,
    session_ids: ["AI-sess_0055", "AI-sess_0056", "AI-sess_0057"],
    persona_ages: ["30s", "40s", "50s"],
    affected_personas: [
      { session_id: "AI-sess_0055", persona_age: "30s" as const },
      { session_id: "AI-sess_0056", persona_age: "40s" as const },
      { session_id: "AI-sess_0057", persona_age: "50s" as const },
    ],
  },
  {
    url: "https://a-mall.com/cart",
    category: "시각요소",
    subCategory: "총액 강조",
    severity: "high" as const,
    title: "최종 총액이 강조되지 않아 최종 결제액을 계산해야 함",
    description:
      "할인 적용 후 최종 결제액이 일반 텍스트 크기(16px, #666)로 표기되어 중요도가 떨어져 보입니다. 50대+ 페르소나의 48%가 최종액을 확인하지 않고 결제 진행 중 가격 재확인으로 돌아왔습니다.",
    targetHtml: '<p class="total-amount">45,600원</p>',
    tags: ["결제액", "시각 강조", "폰트"],
    fail_count: 215,
    fail_rate: 0.215,
    session_ids: ["AI-sess_0058", "AI-sess_0059", "AI-sess_0060"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0058", persona_age: "40s" as const },
      { session_id: "AI-sess_0059", persona_age: "50s" as const },
      { session_id: "AI-sess_0060", persona_age: "60s" as const },
    ],
  },
  {
    url: "https://a-mall.com/checkout",
    category: "사용성",
    subCategory: "주소 입력",
    severity: "high" as const,
    title: "우편번호 검색 기능이 명확하지 않음",
    description:
      "배송지 입력 페이지에서 우편번호 검색 버튼이 일반 버튼처럼 표기되고, 클릭 후 팝업 동작이 즉시 명확하지 않아 40대+ 페르소나의 52%가 올바른 주소 입력에 실패했습니다.",
    targetHtml: '<button>검색</button>',
    tags: ["배송지", "우편번호", "사용성"],
    fail_count: 232,
    fail_rate: 0.232,
    session_ids: ["AI-sess_0061", "AI-sess_0062", "AI-sess_0063"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0061", persona_age: "40s" as const },
      { session_id: "AI-sess_0062", persona_age: "50s" as const },
      { session_id: "AI-sess_0063", persona_age: "60s" as const },
    ],
  },
  {
    url: "https://a-mall.com/checkout",
    category: "접근성",
    subCategory: "배송 옵션",
    severity: "medium" as const,
    title: "배송 방식 선택 라디오 버튼이 너무 작음",
    description:
      "배송 옵션 선택(택배/직배송 등) 라디오 버튼이 16x16px로 표기되어 50대 이상 페르소나의 30%가 클릭 어려움을 겪었습니다.",
    targetHtml: '<input type="radio" name="shipping" /> 택배배송',
    tags: ["배송", "라디오 버튼", "터치 영역"],
    fail_count: 134,
    fail_rate: 0.134,
    session_ids: ["AI-sess_0064", "AI-sess_0065", "AI-sess_0066"],
    persona_ages: ["50s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0064", persona_age: "50s" as const },
      { session_id: "AI-sess_0065", persona_age: "60s" as const },
      { session_id: "AI-sess_0066", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/checkout",
    category: "사용성",
    subCategory: "배송 일정",
    severity: "medium" as const,
    title: "배송 가능 날짜가 달력 위젯으로만 선택 가능",
    description:
      "배송 일정이 달력 위젯으로만 표시되고 텍스트 입력이 불가능해, 40대 이상 페르소나의 31%가 특정 날짜 입력에 어려움을 겪었습니다.",
    targetHtml: '<input type="date" placeholder="YYYY-MM-DD" />',
    tags: ["배송 날짜", "달력", "입력 방식"],
    fail_count: 139,
    fail_rate: 0.139,
    session_ids: ["AI-sess_0067", "AI-sess_0068", "AI-sess_0069"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0067", persona_age: "40s" as const },
      { session_id: "AI-sess_0068", persona_age: "50s" as const },
      { session_id: "AI-sess_0069", persona_age: "60s" as const },
    ],
  },
  {
    url: "https://a-mall.com/checkout",
    category: "시각요소",
    subCategory: "주소 입력 필드",
    severity: "medium" as const,
    title: "주소 입력 필드 라벨이 부분 가려짐",
    description:
      "배송지 상세주소 입력 필드의 라벨이 입력 필드 위가 아닌 내부(placeholder)에만 표시되어 입력 중에 라벨을 볼 수 없습니다.",
    targetHtml: '<input placeholder="상세주소를 입력하세요" />',
    tags: ["주소", "라벨", "가독성"],
    fail_count: 89,
    fail_rate: 0.089,
    session_ids: ["AI-sess_0070", "AI-sess_0071", "AI-sess_0072"],
    persona_ages: ["30s", "40s", "50s"],
    affected_personas: [
      { session_id: "AI-sess_0070", persona_age: "30s" as const },
      { session_id: "AI-sess_0071", persona_age: "40s" as const },
      { session_id: "AI-sess_0072", persona_age: "50s" as const },
    ],
  },
  {
    url: "https://a-mall.com/payment",
    category: "사용성",
    subCategory: "결제 수단",
    severity: "high" as const,
    title: "결제 수단 선택 후 입력 필드 자동 표시 안 됨",
    description:
      "신용카드/계좌이체 등 결제 수단 선택 후 해당 입력 필드가 자동으로 나타나지 않아 사용자가 다음 액션을 찾아야 합니다. 50대+ 페르소나의 67%가 결제 절차를 이해하지 못해 진행을 멈췄습니다.",
    targetHtml: '<div class="payment-fields" style="display:none;"></div>',
    tags: ["결제", "동적 폼", "UI 피드백"],
    fail_count: 300,
    fail_rate: 0.3,
    session_ids: ["AI-sess_0073", "AI-sess_0074", "AI-sess_0075"],
    persona_ages: ["50s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0073", persona_age: "50s" as const },
      { session_id: "AI-sess_0074", persona_age: "60s" as const },
      { session_id: "AI-sess_0075", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/payment",
    category: "접근성",
    subCategory: "카드 입력",
    severity: "high" as const,
    title: "신용카드 번호 입력 필드가 읽기 전용 및 스크립팅 제어됨",
    description:
      "신용카드 번호 입력 필드가 자동 서식 관리로만 제어되고, 백스페이스나 드래그 선택 등 표준 입력 동작이 제한되어 키보드/화면 읽기 사용자의 접근성이 심각하게 제한됩니다.",
    targetHtml: '<input type="text" name="card-number" value="" data-masked="true" />',
    tags: ["결제", "카드", "키보드 접근성"],
    fail_count: 156,
    fail_rate: 0.156,
    session_ids: ["AI-sess_0076", "AI-sess_0077", "AI-sess_0078"],
    persona_ages: ["20s", "30s", "40s"],
    affected_personas: [
      { session_id: "AI-sess_0076", persona_age: "20s" as const },
      { session_id: "AI-sess_0077", persona_age: "30s" as const },
      { session_id: "AI-sess_0078", persona_age: "40s" as const },
    ],
  },
  {
    url: "https://a-mall.com/payment",
    category: "사용성",
    subCategory: "오류 메시지",
    severity: "medium" as const,
    title: "결제 실패 오류 메시지가 모호함",
    description:
      "결제 실패 시 '결제에 실패했습니다'라는 일반적인 오류만 표시되고, 실패 원인(카드 한도 초과, 입력 오류 등)을 명시하지 않아 40대+ 페르소나의 58%가 같은 정보로 재시도했습니다.",
    targetHtml: '<p class="error">결제에 실패했습니다</p>',
    tags: ["결제", "오류 메시지", "명확성"],
    fail_count: 260,
    fail_rate: 0.26,
    session_ids: ["AI-sess_0079", "AI-sess_0080", "AI-sess_0081"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0079", persona_age: "40s" as const },
      { session_id: "AI-sess_0080", persona_age: "50s" as const },
      { session_id: "AI-sess_0081", persona_age: "60s" as const },
    ],
  },
  {
    url: "https://a-mall.com/payment",
    category: "시각요소",
    subCategory: "확인 버튼",
    severity: "medium" as const,
    title: "결제 확인 버튼이 비활성화 상태에서 시각적 차이 불명확",
    description:
      "필수 입력 필드를 모두 채우지 않았을 때 '결제하기' 버튼의 비활성화 상태(흐린 회색)와 활성화 상태(파란색)의 대비가 낮아 50대+ 페르소나의 32%가 버튼 상태를 인식하지 못했습니다.",
    targetHtml: '<button disabled class="pay-button">결제하기</button>',
    tags: ["버튼", "상태 표시", "대비비"],
    fail_count: 143,
    fail_rate: 0.143,
    session_ids: ["AI-sess_0082", "AI-sess_0083", "AI-sess_0084"],
    persona_ages: ["50s", "60s", "70s"],
    affected_personas: [
      { session_id: "AI-sess_0082", persona_age: "50s" as const },
      { session_id: "AI-sess_0083", persona_age: "60s" as const },
      { session_id: "AI-sess_0084", persona_age: "70s" as const },
    ],
  },
  {
    url: "https://a-mall.com/mypage",
    category: "사용성",
    subCategory: "주문 내역",
    severity: "medium" as const,
    title: "주문 상태가 아이콘으로만 표시됨",
    description:
      "마이페이지 주문 목록에서 '배송중', '배송완료', '반품대기' 등의 상태가 색상이 다른 아이콘으로만 표시되고 텍스트 라벨이 없어 색약 페르소나 약 89명이 주문 상태를 인식하지 못했습니다.",
    targetHtml: '<span class="status-icon" style="background-color:#FFA500;"></span>',
    tags: ["주문", "상태", "색약"],
    fail_count: 89,
    fail_rate: 0.089,
    session_ids: ["AI-sess_0085", "AI-sess_0086", "AI-sess_0087"],
    persona_ages: ["20s", "30s", "40s"],
    affected_personas: [
      { session_id: "AI-sess_0085", persona_age: "20s" as const },
      { session_id: "AI-sess_0086", persona_age: "30s" as const },
      { session_id: "AI-sess_0087", persona_age: "40s" as const },
    ],
  },
  {
    url: "https://a-mall.com/mypage",
    category: "접근성",
    subCategory: "반품 요청",
    severity: "high" as const,
    title: "반품/교환 요청 폼의 필수 필드가 명시되지 않음",
    description:
      "반품 요청 폼에서 필수 입력 필드가 시각적으로 강조되지 않아 화면 읽기 사용자가 필수 여부를 알 수 없습니다. 약 76명이 필수 필드를 빠뜨리고 제출 실패를 반복했습니다.",
    targetHtml: '<input type="text" name="reason" aria-required="true" />',
    tags: ["반품", "필수 필드", "접근성"],
    fail_count: 76,
    fail_rate: 0.076,
    session_ids: ["AI-sess_0088", "AI-sess_0089", "AI-sess_0090"],
    persona_ages: ["10s", "20s", "30s"],
    affected_personas: [
      { session_id: "AI-sess_0088", persona_age: "10s" as const },
      { session_id: "AI-sess_0089", persona_age: "20s" as const },
      { session_id: "AI-sess_0090", persona_age: "30s" as const },
    ],
  },
  {
    url: "https://a-mall.com/mypage",
    category: "사용성",
    subCategory: "후기 작성",
    severity: "medium" as const,
    title: "상품 후기 작성 버튼이 발견하기 어려움",
    description:
      "주문 상품별 후기 작성 버튼이 작은 텍스트 링크(#0066CC, 12px) 형태로 표기되어 40대+ 페르소나의 51%가 발견하지 못했습니다.",
    targetHtml: '<a class="review-link" href="#">후기 쓰기</a>',
    tags: ["후기", "링크", "발견성"],
    fail_count: 228,
    fail_rate: 0.228,
    session_ids: ["AI-sess_0091", "AI-sess_0092", "AI-sess_0093"],
    persona_ages: ["30s", "40s", "50s"],
    affected_personas: [
      { session_id: "AI-sess_0091", persona_age: "30s" as const },
      { session_id: "AI-sess_0092", persona_age: "40s" as const },
      { session_id: "AI-sess_0093", persona_age: "50s" as const },
    ],
  },
  {
    url: "https://a-mall.com/mypage",
    category: "시각요소",
    subCategory: "포인트 잔액",
    severity: "low" as const,
    title: "포인트 잔액이 강조되지 않아 우선순위가 낮아 보임",
    description:
      "마이페이지 상단의 포인트 잔액이 일반 텍스트로만 표기되어 중요도가 떨어져 보여, 포인트를 적립할 수 있음을 모르는 사용자가 다수 발생했습니다.",
    targetHtml: '<p class="points">보유 포인트: 15,430P</p>',
    tags: ["포인트", "시각 강조", "정보 계층"],
    fail_count: 156,
    fail_rate: 0.156,
    session_ids: ["AI-sess_0094", "AI-sess_0095", "AI-sess_0096"],
    persona_ages: ["40s", "50s", "60s"],
    affected_personas: [
      { session_id: "AI-sess_0094", persona_age: "40s" as const },
      { session_id: "AI-sess_0095", persona_age: "50s" as const },
      { session_id: "AI-sess_0096", persona_age: "60s" as const },
    ],
  },
]

// 프론트엔드 형식으로 변환
const convertToFrontendIssue = (backendIssue: (typeof backendIssuesData)[0], id: string): ResultIssue => {
  const severityMap: Record<string, IssueSeverity> = {
    critical: "critical",
    high: "high",
    medium: "medium",
    low: "low",
  }

  return {
    id,
    url: backendIssue.url,
    category: (backendIssue.category as IssueCategory) || "기타",
    subCategory: backendIssue.subCategory,
    severity: severityMap[backendIssue.severity],
    title: backendIssue.title,
    description: backendIssue.description,
    targetHtml: backendIssue.targetHtml,
    tags: backendIssue.tags,
    failCount: backendIssue.fail_count,
    failRate: backendIssue.fail_rate,
    affectedUsers: {
      count: backendIssue.fail_count,
      percent: Math.round(backendIssue.fail_rate * 100 * 10) / 10,
    },
    affectedPersonas: backendIssue.affected_personas,
    sessionIds: backendIssue.session_ids,
    personaAges: backendIssue.persona_ages,
  }
}

// 페이지별 필터링
const pageUrlMap: Record<string, string> = {
  login: "https://a-mall.com/login",
  signup: "https://a-mall.com/signup",
  main: "https://a-mall.com/main",
  product: "https://a-mall.com/product/12847",
  cart: "https://a-mall.com/cart",
  checkout: "https://a-mall.com/checkout",
  payment: "https://a-mall.com/payment",
  mypage: "https://a-mall.com/mypage",
}

export const resultIssuePages: ResultIssuePage[] = Object.entries(pageUrlMap).map(([pageId, pageUrl]) => {
  const pageIssues = backendIssuesData
    .filter((issue) => issue.url === pageUrl)
    .map((issue, index) => convertToFrontendIssue(issue, `${pageId}-issue-${index + 1}`))

  const highlightCategories = Array.from(new Set(pageIssues.map((i) => i.category))) as IssueCategory[]

  const pageNameMap: Record<string, string> = {
    login: "로그인 페이지",
    signup: "회원가입 페이지",
    main: "메인 페이지",
    product: "상품 상세 페이지",
    cart: "장바구니 페이지",
    checkout: "배송지 페이지",
    payment: "결제 페이지",
    mypage: "마이페이지",
  }

  return {
    id: pageId,
    name: pageNameMap[pageId],
    url: pageUrl,
    issues: pageIssues,
    highlights: highlightCategories,
  }
})

// 전체 이슈 목록
export const allResultIssues = backendIssuesData.map((issue, index) =>
  convertToFrontendIssue(issue, `issue-${index + 1}`)
)
