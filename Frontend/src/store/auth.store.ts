import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { AuthUserDto } from "@/types/api/auth"

interface AuthUser {
  id?: string
  initials: string
  username: string
  displayName?: string
  token: string | null
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  canLogin: (username: string, password: string) => boolean
  login: (
    user: Pick<AuthUserDto, "username"> & Partial<Omit<AuthUserDto, "username">>,
    token?: string | null,
  ) => void
  logout: () => void
}

const DUMMY_CREDENTIALS = {
  username: "admin",
  password: "123",
  initials: "CN",
} as const

const AUTH_STORAGE_KEY = "swarm-auth"
// v1: token persisted
// v2: backend profile fields(id/displayName) persisted
const AUTH_STORAGE_VERSION = 2

interface PersistedAuthShape {
  isAuthenticated?: boolean
  user?: {
    id?: string
    initials?: string
    username?: string
    displayName?: string
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
        return (
          normalizedUsername === DUMMY_CREDENTIALS.username &&
          password === DUMMY_CREDENTIALS.password
        )
      },
      login: (user, token = null) => {
        const normalizedUsername = user.username.trim()
        set({
          isAuthenticated: true,
          user: {
            id: user.id,
            initials: user.initials ?? DUMMY_CREDENTIALS.initials,
            username: normalizedUsername,
            displayName: user.displayName ?? normalizedUsername,
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

        if (version < 2 && candidate.user) {
          candidate.user = {
            ...candidate.user,
            id: candidate.user.id,
            displayName: candidate.user.displayName ?? candidate.user.username,
          }
        }

        return candidate as unknown as AuthState
      },
    },
  ),
)

export type { AuthUser, AuthState }
