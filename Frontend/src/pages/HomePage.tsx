/**
 * HomePage
 * - 모듈 시스템: import로 자산/컴포넌트 로드
 * - 상태관리: useState로 입력값/사이드바 상태 관리
 * - 데이터 전달: props로 상태/핸들러 전달
 * - 조건부 스타일링: className 조합으로 UI 전환
 * - 이벤트 객체: onSubmit/onChange에서 event 사용
 */

// 모듈 시스템: Vite에서 svg 같은 정적 자산 import는 URL 문자열로 번들링됩니다.
import googleIconUrl from "@/assets/google-icon.svg"
import swarmIconUrl from "@/assets/swarm-icon.svg"

// 모듈 시스템: named import (중괄호)로 컴포넌트를 가져옵니다.
import { CommonButton, PasswordField, TextField } from "@/components/atoms"

import { Menu } from "lucide-react"

import { useState } from "react"

const APP_TITLE = "Swarm"
const APP_TAGLINE = "AI 에이전트 기반 사용자 경험 시뮬레이션"
const DUMMY_PROJECT = { title: "A - Mall 로그인 플로우", date: "2026-01-01" }

function BrandingHeader() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3">
        <img src={swarmIconUrl} alt="" aria-hidden className="h-10 w-10 sm:h-12 sm:w-12" />
        <h1 className="text-title-32 text-foreground sm:text-title-42">{APP_TITLE}</h1>
      </div>

      <p className="mt-2 text-body-14-regular text-muted-foreground sm:mt-3 sm:text-body-16-regular">
        {APP_TAGLINE}
      </p>
    </div>
  )
}

function GoogleStartButton() {
  return (
    <CommonButton
      type="button"
      size="lg"
      variant="secondary"
      className="mx-auto h-11 rounded-xl bg-muted px-5 text-foreground hover:bg-muted/80"
    >
      <span className="inline-flex items-center gap-2">
        <img src={googleIconUrl} alt="" aria-hidden className="h-4 w-4" />
        Google로 시작하기
      </span>
    </CommonButton>
  )
}

function LeftSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  // 조건부 스타일링: open 값에 따라 width/가시성 클래스를 조합합니다.
  return (
    <aside
      className={[
        "shrink-0 overflow-hidden border-r border-border bg-muted/40 transition-all duration-300",
        open ? "w-72 sm:w-80" : "w-14 sm:w-16",
      ].join(" ")}
    >
      <div className="flex h-16 items-center px-3">
        <button
          type="button"
          aria-label={open ? "사이드바 접기" : "사이드바 펼치기"}
          className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onToggle}
        >
          <Menu className="size-5" />
        </button>
      </div>

      <div
        className={[
          "px-4 pb-6 transition-[opacity,transform] duration-200",
          open ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 -translate-x-2",
        ].join(" ")}
      >
        <p className="text-caption-12-regular text-muted-foreground">최근 프로젝트</p>
        <div className="mt-3 grid gap-3">
          <button
            type="button"
            className="rounded-xl border border-ring/60 bg-background px-4 py-3 text-left transition-colors ring-1 ring-ring/50"
          >
            <p className="text-body-14-medium text-foreground">{DUMMY_PROJECT.title}</p>
            <p className="mt-1 text-caption-12-regular text-muted-foreground">{DUMMY_PROJECT.date}</p>
          </button>
        </div>

        <div className="mt-8 border-t border-border pt-6" />
      </div>
    </aside>
  )
}

function RightTopProfile() {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        className="grid size-12 place-items-center rounded-full bg-muted text-subtitle-18-semibold text-foreground ring-1 ring-border"
        aria-label="프로필 메뉴"
      >
        CN
      </button>
    </div>
  )
}

// 모듈 시스템: 이 파일의 기본(default) export는 HomePage 컴포넌트입니다.
export default function HomePage() {
  // 상태관리: 입력값(제어 컴포넌트) + 사이드바 열림/닫힘 상태를 useState로 관리합니다.
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* 데이터 전달(props): 상태값(open)과 토글 핸들러(onToggle)를 자식 컴포넌트에 전달 */}
      <LeftSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="p-6">
          <RightTopProfile />
        </header>

        <main className="grid flex-1 place-items-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-xs text-center">
            <BrandingHeader />

            <form
              className="mt-8 grid w-full gap-5"
              onSubmit={(event) => {
                // 이벤트 객체: 기본 submit 동작(페이지 이동/새로고침)을 막기 위해 preventDefault() 사용
                event.preventDefault()
              }}
            >
              <div className="grid gap-3">
                <TextField
                  placeholder="아이디를 입력하세요"
                  value={email}
                  onChange={(event) => {
                    // 이벤트 객체: event.target.value로 입력값을 읽어 state에 반영
                    setEmail(event.target.value)
                  }}
                  variant="filled"
                  size="lg"
                  className="h-12 rounded-xl px-4 text-sm placeholder:text-sm"
                />

                <PasswordField
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
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
                <span className="underline underline-offset-4">로그인</span>
              </CommonButton>

              <GoogleStartButton />

              <div className="grid gap-3 pt-1">
                <p className="text-body-14-regular text-muted-foreground">아직 계정이 없으신가요?</p>
                <CommonButton
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="h-12 w-full rounded-xl bg-accent text-primary hover:bg-accent/80"
                >
                  회원가입
                </CommonButton>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
