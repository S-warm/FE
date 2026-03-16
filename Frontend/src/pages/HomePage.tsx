import { Navigate } from "react-router-dom"

import routes from "@/constants/routes"
import { useAuthStore } from "@/store/auth.store"

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return <Navigate to={isAuthenticated ? routes.generate : routes.login} replace />
}
