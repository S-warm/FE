import { ApiServiceError } from "@/services/core/api-service-error"
import { mockDelay } from "@/services/core/mock-delay"
import { useAuthStore } from "@/store/auth.store"
import type {
  AuthLoginResponseDto,
  AuthMeResponseDto,
  AuthRefreshResponseDto,
  AuthSignupRequestDto,
  AuthSignupResponseDto,
  AuthUserDto,
} from "@/types/api/auth"
import type { AuthService } from "@/services/auth/auth.service"

const DUMMY_CREDENTIALS = {
  username: "admin",
  password: "123",
} as const

const MOCK_TOKEN_PREFIX = "mock-token"
const MOCK_EXPIRES_IN_SECONDS = 60 * 60

function buildMockUser(username: string): AuthUserDto {
  const trimmed = username.trim()
  return {
    id: `mock-user-${trimmed}`,
    username: trimmed,
    displayName: trimmed,
    initials: "CN",
  }
}

function buildMockToken(scope: "login" | "signup" | "refresh", username: string) {
  return `${MOCK_TOKEN_PREFIX}-${scope}-${username}-${Date.now()}`
}

function buildLoginResponse(username: string): AuthLoginResponseDto {
  return {
    accessToken: buildMockToken("login", username),
    tokenType: "Bearer",
    expiresIn: MOCK_EXPIRES_IN_SECONDS,
    user: buildMockUser(username),
  }
}

function readPersistedUsername(): string {
  return useAuthStore.getState().user?.username ?? DUMMY_CREDENTIALS.username
}

export const authMockService: AuthService = {
  async login(input) {
    await mockDelay()
    const username = input.username.trim()
    if (
      username !== DUMMY_CREDENTIALS.username ||
      input.password !== DUMMY_CREDENTIALS.password
    ) {
      throw new ApiServiceError({
        status: 401,
        error: "Unauthorized",
        message:
          "아이디 또는 비밀번호가 올바르지 않습니다. 테스트 계정은 admin / 123 입니다.",
        path: "service://auth/mock/login",
      })
    }
    return buildLoginResponse(username)
  },

  async signup(input: AuthSignupRequestDto): Promise<AuthSignupResponseDto> {
    await mockDelay()
    const username = input.username.trim()
    if (!username || !input.password) {
      throw new ApiServiceError({
        status: 400,
        error: "Bad Request",
        message: "아이디와 비밀번호를 입력해주세요.",
        path: "service://auth/mock/signup",
      })
    }
    return {
      ...buildLoginResponse(username),
      accessToken: buildMockToken("signup", username),
    }
  },

  async refresh(): Promise<AuthRefreshResponseDto> {
    await mockDelay()
    const username = readPersistedUsername()
    return {
      accessToken: buildMockToken("refresh", username),
      tokenType: "Bearer",
      expiresIn: MOCK_EXPIRES_IN_SECONDS,
    }
  },

  async me(): Promise<AuthMeResponseDto> {
    await mockDelay()
    const username = readPersistedUsername()
    return {
      user: buildMockUser(username),
    }
  },
}
