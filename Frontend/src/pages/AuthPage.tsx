import { useEffect, useRef, useState } from "react"

import { AuthBrandingShell, LoginPanel, SignUpPanel } from "@/components/sections/auth"
import { LOGIN_TRANSITION_MS } from "@/components/sections/auth/login-panel"
import { AuthLayout } from "@/layouts/AuthLayout"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "signup"

function AuthPage({
  initialMode = "login",
  onModeChange,
}: {
  initialMode?: AuthMode
  onModeChange?: (nextMode: AuthMode) => void
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [visible, setVisible] = useState(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setVisible(true)
    })

    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    setVisible(false)
    transitionTimeoutRef.current = window.setTimeout(() => {
      if (onModeChange) {
        onModeChange(nextMode)
        return
      }

      setMode(nextMode)
      window.requestAnimationFrame(() => setVisible(true))
    }, LOGIN_TRANSITION_MS)
  }

  return (
    <AuthLayout>
      <AuthBrandingShell>
        <div
          className={cn(
            "w-full transition-[opacity,transform] ease-in-out",
            visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-1"
          )}
          style={{ transitionDuration: `${LOGIN_TRANSITION_MS}ms` }}
        >
          {mode === "login" ? (
            <LoginPanel onGoToSignUp={() => switchMode("signup")} />
          ) : (
            <SignUpPanel onGoToLogin={() => switchMode("login")} />
          )}
        </div>
      </AuthBrandingShell>
    </AuthLayout>
  )
}

export default AuthPage
