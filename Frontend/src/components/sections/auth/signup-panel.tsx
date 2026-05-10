import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { CommonButton, PasswordField, TextField } from "@/components/atoms"
import routes from "@/constants/routes"
import { useSignupMutation } from "@/queries/auth"
import { ApiServiceError } from "@/services"

function SignUpPanel({ onGoToLogin }: { onGoToLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const navigate = useNavigate()
  const signupMutation = useSignupMutation()
  const isSubmitting = signupMutation.isPending

  const resetErrors = () => {
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")
  }

  return (
    <form
      className="grid w-full gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (isSubmitting) return
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
        if (!confirmPassword) {
          setConfirmPasswordError("비밀번호 확인을 입력해주세요.")
          hasError = true
        } else if (password !== confirmPassword) {
          setConfirmPasswordError("비밀번호가 일치하지 않습니다.")
          hasError = true
        }

        if (hasError) return

        signupMutation.mutate(
          { username: trimmedEmail, password },
          {
            onSuccess: (response) => {
              // signup 응답이 token 을 포함하면 mutation 이 이미 auth.store.login 처리 완료 → 홈으로.
              // 그렇지 않다면 BE 가 별도 로그인 단계를 요구하는 것이므로 로그인 화면으로 보낸다.
              if (response.accessToken) {
                navigate(routes.generate)
                return
              }
              onGoToLogin()
            },
            onError: (error) => {
              const fallback = "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요."
              const message =
                error instanceof ApiServiceError ? error.message : fallback
              const status =
                error instanceof ApiServiceError ? error.status : undefined

              if (status === 409) {
                setEmailError("이미 사용 중인 아이디입니다.")
                return
              }
              if (status === 400) {
                setEmailError(message || "입력값을 다시 확인해주세요.")
                return
              }
              setEmailError(" ")
              setPasswordError(message || fallback)
            },
          },
        )
      }}
    >
      <div className="grid gap-3">
        <TextField
          placeholder="아이디 (영문,숫자 6~20자)"
          value={email}
          state={emailError ? "error" : "default"}
          errorMessage={emailError || undefined}
          onChange={(event) => {
            if (isSubmitting) return
            setEmail(event.target.value)
            setEmailError("")
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 text-sm placeholder:text-sm"
        />

        <PasswordField
          placeholder="비밀번호 (영문, 숫자, 특수문자 8~20자)"
          value={password}
          state={passwordError ? "error" : "default"}
          errorMessage={passwordError || undefined}
          onChange={(event) => {
            if (isSubmitting) return
            setPassword(event.target.value)
            setPasswordError("")
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 pr-11 text-sm placeholder:text-sm"
        />

        <PasswordField
          placeholder="비밀번호 확인"
          value={confirmPassword}
          state={confirmPasswordError ? "error" : "default"}
          errorMessage={confirmPasswordError || undefined}
          onChange={(event) => {
            if (isSubmitting) return
            setConfirmPassword(event.target.value)
            setConfirmPasswordError("")
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
        state={isSubmitting ? "loading" : "default"}
        loadingText="회원가입 중..."
      >
        회원가입
      </CommonButton>

      <div className="grid justify-items-center gap-2 pt-1">
        <p className="text-body-14-regular text-muted-foreground">이미 계정이 있으신가요?</p>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-body-14-medium text-text-link underline-offset-4 transition-colors hover:text-[var(--color-primary-800)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={onGoToLogin}
          disabled={isSubmitting}
        >
          로그인 하러 가기
        </button>
      </div>
    </form>
  )
}

export { SignUpPanel }
