export const SEARCH_RESULT_PAGE = {
  id: "search",
  name: "검색 페이지",
  url: "https://a-mall.com/search",
  screenshotUrl: "/mock-images/page-search.png",
} as const

export const searchResultIssuesMock = [
  {
    issueId: "search-issue-1",
    url: SEARCH_RESULT_PAGE.url,
    category: "접근성",
    severity: "critical",
    title: "검색 입력창 포커스 표시가 약함",
    description:
      "검색창에 포커스가 와도 외곽선 변화가 미세해서 키보드 사용자와 저시력 사용자가 현재 위치를 바로 인지하기 어렵습니다.",
    targetHtml:
      '<input type="search" class="search-input" placeholder="상품명 입력" aria-label="상품 검색" />',
    tags: ["검색", "포커스", "입력창"],
    affectedUsersCount: 184,
    affectedUsersPercent: 18.4,
  },
  {
    issueId: "search-issue-2",
    url: SEARCH_RESULT_PAGE.url,
    category: "시각요소",
    severity: "high",
    title: "검색 결과 카드 경계가 약해 항목 구분이 어려움",
    description:
      "결과 카드 사이의 구분선과 배경 대비가 약해 한 번에 여러 상품을 훑을 때 개별 카드 단위가 쉽게 섞여 보입니다.",
    targetHtml: '<div class="search-result-card" role="article">',
    tags: ["검색결과", "카드", "대비"],
    affectedUsersCount: 152,
    affectedUsersPercent: 15.2,
  },
  {
    issueId: "search-issue-3",
    url: SEARCH_RESULT_PAGE.url,
    category: "사용성",
    severity: "high",
    title: "정렬 버튼이 아이콘 중심이라 기능 파악이 느림",
    description:
      "정렬 토글이 아이콘 위주로 표현되어 있어 사용자가 '인기순/최신순' 정렬 기능을 즉시 파악하지 못합니다.",
    targetHtml: '<button class="sort-toggle" aria-label="정렬">',
    tags: ["정렬", "버튼", "탐색"],
    affectedUsersCount: 129,
    affectedUsersPercent: 12.9,
  },
  {
    issueId: "search-issue-4",
    url: SEARCH_RESULT_PAGE.url,
    category: "접근성",
    severity: "medium",
    title: "필터 체크박스 선택 상태가 색상에 지나치게 의존함",
    description:
      "필터 선택 여부가 색상 차이 중심으로만 표현되어 색각 이상 사용자와 고대비 환경에서 상태 인지가 불안정합니다.",
    targetHtml:
      '<input type="checkbox" class="filter-checkbox" id="category-filter-1" />',
    tags: ["필터", "체크박스", "상태표시"],
    affectedUsersCount: 118,
    affectedUsersPercent: 11.8,
  },
  {
    issueId: "search-issue-5",
    url: SEARCH_RESULT_PAGE.url,
    category: "사용성",
    severity: "medium",
    title: "페이지네이션 버튼 터치 영역이 작음",
    description:
      "페이지 번호 버튼이 작아 모바일과 고령층 사용자에게 오탭이 자주 발생하고 다음 결과 페이지로 이동하기 어렵습니다.",
    targetHtml:
      '<button class="pagination-btn" aria-label="2페이지">2</button>',
    tags: ["페이지네이션", "터치영역", "모바일"],
    affectedUsersCount: 101,
    affectedUsersPercent: 10.1,
  },
  {
    issueId: "search-issue-6",
    url: SEARCH_RESULT_PAGE.url,
    category: "시각요소",
    severity: "medium",
    title: "가격과 할인 정보 위계가 약함",
    description:
      "검색 결과 카드 안에서 현재 가격, 정가, 할인율의 시각적 위계가 약해 구매 판단에 필요한 핵심 정보가 한눈에 들어오지 않습니다.",
    targetHtml: '<p class="result-price"><strong>29,800원</strong></p>',
    tags: ["가격", "정보위계", "카드"],
    affectedUsersCount: 94,
    affectedUsersPercent: 9.4,
  },
  {
    issueId: "search-issue-7",
    url: SEARCH_RESULT_PAGE.url,
    category: "기타",
    severity: "low",
    title: "검색 결과 없음 메시지의 위치가 늦게 인지됨",
    description:
      "결과 없음 안내가 리스트 중앙 아래쪽에 배치되어 사용자가 여러 번 스크롤한 뒤에야 상황을 파악하는 경우가 있습니다.",
    targetHtml:
      '<div class="no-results-message" role="status" aria-live="polite">검색 결과가 없습니다</div>',
    tags: ["빈상태", "메시지", "스크롤"],
    affectedUsersCount: 58,
    affectedUsersPercent: 5.8,
  },
  {
    issueId: "search-issue-8",
    url: SEARCH_RESULT_PAGE.url,
    category: "접근성",
    severity: "low",
    title: "필터 아코디언 펼침 상태가 시각적으로 불명확함",
    description:
      "필터 그룹의 열림/닫힘 상태가 화살표 회전만으로 전달되어 상태 변화를 놓치기 쉽습니다.",
    targetHtml:
      '<button class="filter-toggle" aria-expanded="false">카테고리</button>',
    tags: ["필터", "아코디언", "상태"],
    affectedUsersCount: 41,
    affectedUsersPercent: 4.1,
  },
] as const

export const searchHeatmapPointsMock = [
  {
    issueId: "search-issue-1",
    url: SEARCH_RESULT_PAGE.url,
    x: 50,
    y: 9,
    ageBand: "50s",
    count: 8,
    severity: "HIGH",
    errorType: "접근성/포커스 표시",
  },
  {
    issueId: "search-issue-2",
    url: SEARCH_RESULT_PAGE.url,
    x: 55,
    y: 42,
    ageBand: "40s",
    count: 7,
    severity: "MEDIUM",
    errorType: "시각요소/카드 구분",
  },
  {
    issueId: "search-issue-3",
    url: SEARCH_RESULT_PAGE.url,
    x: 82,
    y: 9,
    ageBand: "30s",
    count: 5,
    severity: "MEDIUM",
    errorType: "사용성/정렬 버튼",
  },
  {
    issueId: "search-issue-4",
    url: SEARCH_RESULT_PAGE.url,
    x: 14,
    y: 34,
    ageBand: "30s",
    count: 4,
    severity: "MEDIUM",
    errorType: "접근성/체크박스 상태",
  },
  {
    issueId: "search-issue-5",
    url: SEARCH_RESULT_PAGE.url,
    x: 51,
    y: 92,
    ageBand: "50s",
    count: 6,
    severity: "MEDIUM",
    errorType: "사용성/페이지네이션",
  },
  {
    issueId: "search-issue-6",
    url: SEARCH_RESULT_PAGE.url,
    x: 57,
    y: 55,
    ageBand: "60s",
    count: 5,
    severity: "LOW",
    errorType: "시각요소/가격 위계",
  },
] as const

export const searchAiFixesMock = [
  {
    title: "검색 입력창 포커스 링 강화",
    severity: "high",
    affectedUsersCount: 184,
    beforeCode:
      ".search-input {\n  border: 1px solid #d7dce5;\n}\n.search-input:focus {\n  outline: none;\n  border-color: #94a3b8;\n}",
    afterCode:
      ".search-input {\n  border: 1px solid #cbd5e1;\n  min-height: 48px;\n}\n.search-input:focus-visible {\n  outline: 3px solid #2f5ae8;\n  outline-offset: 2px;\n  border-color: #2f5ae8;\n  box-shadow: 0 0 0 6px rgba(47, 90, 232, 0.14);\n}",
    impactDescription:
      "+184명의 사용자가 현재 포커스 위치를 바로 인지하고 검색 입력을 안정적으로 이어갈 수 있습니다.",
    changeDescription:
      "포커스 상태를 색상 한 단계 변경에서 두꺼운 링과 그림자 강조로 바꿔 키보드 탐색 가시성을 높입니다.",
  },
  {
    title: "검색 결과 카드 시각적 경계 재정의",
    severity: "high",
    affectedUsersCount: 152,
    beforeCode:
      ".search-result-card {\n  border: 1px solid #e5e7eb;\n  background: #ffffff;\n}",
    afterCode:
      ".search-result-card {\n  border: 1px solid #cbd5e1;\n  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);\n  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);\n}\n.search-result-card + .search-result-card {\n  margin-top: 14px;\n}",
    impactDescription:
      "+152명의 사용자가 카드 단위 정보를 더 빠르게 스캔하고 상품 간 혼동을 줄일 수 있습니다.",
    changeDescription:
      "카드 경계를 더 분명히 하고 세로 간격과 그림자를 추가해 결과 리스트가 한 장씩 읽히도록 정리합니다.",
  },
  {
    title: "정렬 버튼을 라벨형 컨트롤로 개편",
    severity: "medium",
    affectedUsersCount: 129,
    beforeCode:
      "<button class=\"sort-toggle\" aria-label=\"정렬\">\n  <SortIcon />\n</button>",
    afterCode:
      "<button className=\"sort-toggle\" aria-label=\"정렬 기준 변경\">\n  <SortIcon />\n  <span>인기순</span>\n  <ChevronDownIcon />\n</button>",
    impactDescription:
      "+129명의 사용자가 정렬 기능을 첫 시선에서 인식하고 원하는 기준으로 결과를 바꾸기 쉬워집니다.",
    changeDescription:
      "아이콘-only 정렬 버튼을 텍스트 라벨 포함 컨트롤로 바꿔 기능 의미를 즉시 드러냅니다.",
  },
  {
    title: "페이지네이션 터치 영역 확대",
    severity: "medium",
    affectedUsersCount: 101,
    beforeCode:
      ".pagination-btn {\n  width: 20px;\n  height: 20px;\n  font-size: 12px;\n}",
    afterCode:
      ".pagination-btn {\n  min-width: 44px;\n  min-height: 44px;\n  padding: 0 10px;\n  border-radius: 10px;\n  font-size: 14px;\n}\n.pagination-btn[aria-current='page'] {\n  background: #2f5ae8;\n  color: #ffffff;\n}",
    impactDescription:
      "+101명의 사용자가 페이지 이동 버튼을 더 정확하게 누르고 현재 위치도 쉽게 파악할 수 있습니다.",
    changeDescription:
      "페이지 번호를 WCAG 권장 크기 이상으로 키우고 현재 페이지 스타일을 분명하게 구분합니다.",
  },
] as const
