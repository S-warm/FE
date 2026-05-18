import routes from "@/constants/routes"
import { queryClient } from "@/lib/query-client"
import { useAuthStore } from "@/store/auth.store"

function buildLoginRedirectUrl() {
  if (typeof window === "undefined") {
    return routes.login
  }

  const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return `${routes.login}?reason=token-expired&returnUrl=${encodeURIComponent(returnUrl)}`
}

export function clearClientSession() {
  useAuthStore.getState().logout()
  queryClient.clear()
}

export function redirectToExpiredSessionLogin() {
  if (typeof window === "undefined") return
  window.location.assign(buildLoginRedirectUrl())
}
