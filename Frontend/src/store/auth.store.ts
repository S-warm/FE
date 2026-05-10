import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthUser {
  initials: string
  username: string
  /**
   * BE 인증 API 가 발급하는 access token.
   * 이번 단계에서는 자리만 마련하고 실제 토큰 발급/저장은 다음 단계에서 채운다.
   * http-client 가 매 요청마다 이 필드를 읽어 Authorization 헤더에 주입한다.
   */
  token: string | null
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  canLogin: (username: string, password: string) => boolean
  login: (username: string, token?: string | null) => void
  logout: () => void
}

const DUMMY_CREDENTIALS = {
  username: "admin",
  password: "123",
  initials: "CN",
} as const

const AUTH_STORAGE_KEY = "swarm-auth"
// persist 버전.
// v1: AuthUser 에 token 필드가 추가됨.
// 이전 v0 데이터에는 user.token 이 없으므로 migrate 에서 null 로 정규화한다.
const AUTH_STORAGE_VERSION = 1

interface PersistedAuthShape {
  isAuthenticated?: boolean
  user?: {
    initials?: string
    username?: string
    token?: string | null
  } | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      canLogin: (username, password) => {
        const normalizedUsername = username.trim()
        if (
          normalizedUsername === DUMMY_CREDENTIALS.username &&
          password === DUMMY_CREDENTIALS.password
        ) {
          return true
        }
        return false
      },
      login: (username, token = null) => {
        const normalizedUsername = username.trim()
        set({
          isAuthenticated: true,
          user: {
            initials: DUMMY_CREDENTIALS.initials,
            username: normalizedUsername,
            token: token ?? null,
          },
        })
      },
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      version: AUTH_STORAGE_VERSION,
      // 함수형 액션은 영속화하지 않고 상태 슬라이스만 저장한다.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      migrate: (persisted, version) => {
        const candidate = (persisted ?? {}) as PersistedAuthShape
        if (version < 1 && candidate.user) {
          candidate.user = {
            ...candidate.user,
            token: candidate.user.token ?? null,
          }
        }
        // 액션 함수는 zustand 가 재주입하므로 영속 슬라이스만 반환해도 안전하다.
        return candidate as unknown as AuthState
      },
    },
  ),
)

export type { AuthUser, AuthState }
