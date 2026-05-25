import AuthPage from "@/pages/AuthPage"
import { useNavigate } from "react-router-dom"

import routes from "@/constants/routes"

export default function SignUpPage() {
  const navigate = useNavigate()

  return (
    <AuthPage
      initialMode="signup"
      onModeChange={(nextMode) => {
        navigate(nextMode === "login" ? routes.login : routes.signup)
      }}
    />
  )
}
