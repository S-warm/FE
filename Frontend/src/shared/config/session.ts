const FALLBACK_API_USER_ID = "550e8400-e29b-41d4-a716-446655440000"
const API_USER_ID_STORAGE_KEY = "swarm.apiUserId"

function normalizeUserId(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function getApiUserId() {
  const envUserId = normalizeUserId(import.meta.env.VITE_API_USER_ID)
  if (envUserId) return envUserId

  if (typeof window !== "undefined") {
    const storedUserId = normalizeUserId(window.localStorage.getItem(API_USER_ID_STORAGE_KEY))
    if (storedUserId) return storedUserId
  }

  return FALLBACK_API_USER_ID
}

export function setApiUserId(userId: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(API_USER_ID_STORAGE_KEY, userId)
}

export { API_USER_ID_STORAGE_KEY, FALLBACK_API_USER_ID }
