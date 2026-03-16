import AuthPage from "@/pages/AuthPage"
import { useNavigate } from "react-router-dom"

import routes from "@/constants/routes"

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthPage
      initialMode="login"
      onModeChange={(nextMode) => {
        navigate(nextMode === "login" ? routes.login : routes.signup)
      }}
    />
  )
}
