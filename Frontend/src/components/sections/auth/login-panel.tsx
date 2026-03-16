import { useState } from "react"

import { CommonButton, PasswordField, TextField } from "@/components/atoms"
import routes from "@/constants/routes"

import { GoogleStartButton } from "@/components/sections/auth/branding-header"
import { useAuthStore } from "@/store/auth.store"
import { useNavigate } from "react-router-dom"

const LOGIN_TRANSITION_MS = 280

function LoginPanel({ onGoToSignUp }: { onGoToSignUp: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const canLogin = useAuthStore((state) => state.canLogin)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  return (
    <form
      className="grid w-full gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (isTransitioning) return
        setErrorMessage("")

        const ok = canLogin(email, password)
        if (!ok) {
          setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다. (admin / 123)")
          return
        }

        setIsTransitioning(true)
        window.setTimeout(() => {
          login(email)
          navigate(routes.generate)
        }, LOGIN_TRANSITION_MS)
      }}
    >
      <div className="grid gap-3">
        <TextField
          placeholder="아이디를 입력하세요"
          value={email}
          onChange={(event) => {
            if (isTransitioning) return
            setEmail(event.target.value)
            setErrorMessage("")
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 text-sm placeholder:text-sm"
        />

        <PasswordField
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(event) => {
            if (isTransitioning) return
            setPassword(event.target.value)
            setErrorMessage("")
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 pr-11 text-sm placeholder:text-sm"
        />
      </div>

      {errorMessage ? (
        <p className="text-left text-caption-12-regular text-destructive">{errorMessage}</p>
      ) : null}

      <CommonButton
        type="submit"
        size="lg"
        variant="secondary"
        className="h-12 w-full rounded-xl bg-accent text-primary hover:bg-accent/80"
        disabled={isTransitioning}
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

      <div className="grid gap-3 pt-1">
        <p className="text-body-14-regular text-muted-foreground">아직 계정이 없으신가요?</p>
        <CommonButton
          type="button"
          size="lg"
          variant="secondary"
          className="h-12 w-full rounded-xl bg-accent text-primary hover:bg-accent/80"
          onClick={() => {
            if (isTransitioning) return
            onGoToSignUp()
          }}
          disabled={isTransitioning}
        >
          회원가입
        </CommonButton>
      </div>
    </form>
  )
}

export { LoginPanel, LOGIN_TRANSITION_MS }
