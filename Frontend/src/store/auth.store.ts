import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthUser {
  initials: string
  username: string
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  accessToken: string | null
  canLogin: (username: string, password: string) => boolean
  login: (username: string, accessToken?: string | null) => void
  logout: () => void
}

const DUMMY_CREDENTIALS = {
  username: "admin",
  password: "123",
  initials: "CN",
} as const

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
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
      login: (username, accessToken = null) => {
        const normalizedUsername = username.trim()
        set({
          isAuthenticated: true,
          user: { initials: DUMMY_CREDENTIALS.initials, username: normalizedUsername },
          accessToken,
        })
      },
      logout: () => set({ isAuthenticated: false, user: null, accessToken: null }),
    }),
    { name: "swarm-auth" }
  )
)

export type { AuthUser, AuthState }
