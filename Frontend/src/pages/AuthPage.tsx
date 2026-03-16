import { useEffect, useRef, useState } from "react"

import { LoginPanel, SignUpPanel } from "@/components/sections/auth"
import { AuthLayout } from "@/layouts/AuthLayout"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "signup"

const PANEL_FADE_MS = 280

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
    }, PANEL_FADE_MS)
  }

  return (
    <AuthLayout>
      <div
        className={cn(
          "w-full transition-[opacity,transform] ease-in-out",
          visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-1"
        )}
        style={{ transitionDuration: `${PANEL_FADE_MS}ms` }}
      >
        {mode === "login" ? (
          <LoginPanel onGoToSignUp={() => switchMode("signup")} />
        ) : (
          <SignUpPanel onGoToLogin={() => switchMode("login")} />
        )}
      </div>
    </AuthLayout>
  )
}

export default AuthPage
