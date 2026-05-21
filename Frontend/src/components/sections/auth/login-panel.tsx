import { useEffect, useRef, useState } from "react"

import { CommonButton, PasswordField, TextField } from "@/components/atoms"
import routes from "@/constants/routes"

import { GoogleStartButton } from "@/components/sections/auth/branding-header"
import { useAuthStore } from "@/store/auth.store"
import { useNavigate } from "react-router-dom"

const LOGIN_TRANSITION_MS = 280

function LoginPanel({ onGoToSignUp }: { onGoToSignUp: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<number | null>(null)
  const canLogin = useAuthStore((state) => state.canLogin)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 민감한 정보 초기화
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
      setPassword("")
      setEmail("")
    }
  }, [])

  const resetErrors = () => {
    setEmailError("")
    setPasswordError("")
  }

  return (
    <form
      className="grid w-full gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (isTransitioning) return
        resetErrors()

        const trimmedEmail = email.trim()
        let hasError = false

        if (!trimmedEmail) {
          setEmailError("아이디를 입력해주세요.")
          hasError = true
        }

        if (!password) {
          setPasswordError("비밀번호를 입력해주세요.")
          hasError = true
        }

        if (hasError) return

        const ok = canLogin(trimmedEmail, password)
        if (!ok) {
          setEmailError("아이디를 확인해주세요. 테스트 계정은 admin 입니다.")
          setPasswordError("비밀번호를 확인해주세요. 테스트 비밀번호는 123 입니다.")
          return
        }

        setIsTransitioning(true)
        transitionTimeoutRef.current = window.setTimeout(() => {
          login(trimmedEmail)
          navigate(routes.generate)
        }, LOGIN_TRANSITION_MS)
      }}
    >
      <div className="grid gap-3">
        <TextField
          placeholder="아이디를 입력하세요"
          value={email}
          state={emailError ? "error" : "default"}
          errorMessage={emailError || undefined}
          onChange={(event) => {
            if (isTransitioning) return
            setEmail(event.target.value)
            setEmailError("")
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 text-sm placeholder:text-sm"
        />

        <PasswordField
          placeholder="비밀번호를 입력하세요"
          value={password}
          state={passwordError ? "error" : "default"}
          errorMessage={passwordError || undefined}
          onChange={(event) => {
            if (isTransitioning) return
            setPassword(event.target.value)
            setPasswordError("")
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 pr-11 text-sm placeholder:text-sm"
        />
      </div>

      <CommonButton
        type="submit"
        size="lg"
        variant="secondary"
        className="h-12 w-full rounded-xl bg-accent text-primary hover:bg-accent/80"
        state={isTransitioning ? "loading" : "default"}
        loadingText="로그인 중..."
      >
        <span className="underline underline-offset-4">로그인</span>
      </CommonButton>

      <CommonButton
        type="button"
        size="lg"
        variant="secondary"
        className="mx-auto h-11 rounded-xl bg-muted px-5 text-foreground hover:bg-muted/80"
        disabled={isTransitioning}
      >
        <GoogleStartButton />
      </CommonButton>

      <div className="grid justify-items-center gap-2 pt-1">
        <p className="text-body-14-regular text-muted-foreground">아직 계정이 없으신가요?</p>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-body-14-medium text-text-link underline-offset-4 transition-colors hover:text-[var(--color-primary-800)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => {
            if (isTransitioning) return
            onGoToSignUp()
          }}
          disabled={isTransitioning}
        >
          회원가입
        </button>
      </div>
    </form>
  )
}

export { LoginPanel, LOGIN_TRANSITION_MS }
