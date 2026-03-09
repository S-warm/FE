import { useMemo, useState } from "react"

import { CommonButton, IssueBadge, PasswordField, TextField } from "@/components/atoms"
import { SelectionCheckbox } from "@/components/forms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AuthMode = "login" | "signup"

interface AuthFormData {
  email: string
  password: string
  confirmPassword: string
  nickname: string
  agreeTerms: boolean
}

const initialForm: AuthFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  nickname: "",
  agreeTerms: false,
}

function LoginSignUpForm() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [form, setForm] = useState<AuthFormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const validationMessage = useMemo(() => {
    if (!form.email || !form.password) {
      return "이메일과 비밀번호를 입력해주세요."
    }

    if (mode === "signup") {
      if (!form.nickname) {
        return "닉네임을 입력해주세요."
      }
      if (form.password !== form.confirmPassword) {
        return "비밀번호 확인이 일치하지 않습니다."
      }
      if (!form.agreeTerms) {
        return "회원가입을 위해 약관 동의가 필요합니다."
      }
    }

    return ""
  }, [form, mode])

  const isValid = validationMessage.length === 0

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="gap-3">
        <CardTitle>{mode === "login" ? "로그인" : "회원가입"}</CardTitle>
        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (value === "login" || value === "signup") {
              setMode(value)
              setSubmitted(false)
            }
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="grid gap-3">
        <TextField
          label="이메일"
          placeholder="name@example.com"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          state={submitted && !form.email ? "error" : "default"}
        />

        <PasswordField
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          state={submitted && !form.password ? "error" : "default"}
        />

        {mode === "signup" ? (
          <>
            <PasswordField
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              state={submitted && form.password !== form.confirmPassword ? "error" : "default"}
            />
            <TextField
              label="닉네임"
              placeholder="닉네임을 입력하세요"
              value={form.nickname}
              onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
              state={submitted && !form.nickname ? "error" : "default"}
            />
            <SelectionCheckbox
              label="서비스 이용 약관에 동의합니다."
              checked={form.agreeTerms}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, agreeTerms: checked }))}
            />
          </>
        ) : null}

        {submitted ? (
          isValid ? (
            <IssueBadge variant="info">완료: {mode === "login" ? "로그인 성공" : "회원가입 완료"}</IssueBadge>
          ) : (
            <IssueBadge variant="warning">{validationMessage}</IssueBadge>
          )
        ) : null}

        <CommonButton
          onClick={() => setSubmitted(true)}
          state={submitted && !isValid ? "error" : "default"}
        >
          {mode === "login" ? "로그인" : "회원가입"}
        </CommonButton>
      </CardContent>
    </Card>
  )
}

export { LoginSignUpForm }
