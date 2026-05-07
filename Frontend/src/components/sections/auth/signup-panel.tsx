import { useState } from "react"

import { CommonButton, PasswordField, TextField } from "@/components/atoms"

function SignUpPanel({ onGoToLogin }: { onGoToLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <form
      className="grid w-full gap-5"
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <div className="grid gap-3">
        <TextField
          placeholder="아이디 (영문,숫자 6~20자)"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 text-sm placeholder:text-sm"
        />

        <PasswordField
          placeholder="비밀번호 (영문, 숫자, 특수문자 8~20자)"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
          }}
          variant="filled"
          size="lg"
          className="h-12 rounded-xl px-4 pr-11 text-sm placeholder:text-sm"
        />

        <PasswordField
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value)
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
      >
        회원가입
      </CommonButton>

      <div className="grid justify-items-center gap-2 pt-1">
        <p className="text-body-14-regular text-muted-foreground">이미 계정이 있으신가요?</p>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-body-14-medium text-text-link underline-offset-4 transition-colors hover:text-[var(--color-primary-800)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={onGoToLogin}
        >
          로그인 하러 가기
        </button>
      </div>
    </form>
  )
}

export { SignUpPanel }
