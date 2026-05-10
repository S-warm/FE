// 정합화 정책: VITE_DEFAULT_USER_ID 를 정식 키로 사용한다.
// 다만 .env.local 에 남아 있는 레거시 키 (VITE_API_USER_ID, VITE_USER_ID_SEED) 도
// 함께 읽어서 배포 환경별 .env 가 어떤 키를 쓰더라도 userId 가 silently
// "mock-user" 로 떨어지는 회귀가 일어나지 않도록 막는다.
// (백엔드 통합 직전 점검 리포트 B-2 대응)
const resolvedDefaultUserId =
  import.meta.env.VITE_DEFAULT_USER_ID ??
  import.meta.env.VITE_API_USER_ID ??
  import.meta.env.VITE_USER_ID_SEED ??
  "mock-user"

export const SERVICE_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api",
  useMockServices: import.meta.env.VITE_USE_MOCK_SERVICES !== "false",
  defaultUserId: resolvedDefaultUserId,
} as const
