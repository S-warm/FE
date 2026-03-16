import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthUser {
  initials: string
  username: string
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (username: string, password: string) => boolean
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
      login: (username, password) => {
        const normalizedUsername = username.trim()
        if (
          normalizedUsername === DUMMY_CREDENTIALS.username &&
          password === DUMMY_CREDENTIALS.password
        ) {
          set({
            isAuthenticated: true,
            user: { initials: DUMMY_CREDENTIALS.initials, username: normalizedUsername },
          })
          return true
        }

        return false
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: "swarm-auth" }
  )
)

export type { AuthUser, AuthState }
