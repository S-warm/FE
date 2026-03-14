/**
 * HomePage.tsx (학습용 주석 버전)
 *
 * - 이 파일은 "React + TypeScript + JSX"로 화면을 만드는 예시입니다.
 * - 아래 주석은 "문법을 읽는 법" 위주로 달려있습니다(실무에선 주석을 이 정도로 많이 달진 않아요).
 */

// import: 다른 파일/라이브러리에서 값(함수/컴포넌트/이미지 등)을 가져옵니다.
// - Vite 환경에서는 svg 같은 정적 파일도 import하면 번들에 포함되고 "URL 문자열"로 들어옵니다.
import googleIconUrl from "@/assets/google-icon.svg"
import swarmIconUrl from "@/assets/swarm-icon.svg"

// { A, B, C } 형태: "named export"로 내보낸 것들을 이름 그대로 가져옵니다.
import { CommonButton, PasswordField, TextField } from "@/components/atoms"

// lucide-react에서 Menu 아이콘 컴포넌트를 가져옵니다. (이것도 React 컴포넌트)
import { Menu } from "lucide-react"

// useState: React Hook. 함수 컴포넌트에서 상태(state)를 저장할 때 사용합니다.
import { useState } from "react"

// const: 재할당 불가 상수 선언.
const APP_TITLE = "Swarm"
const APP_TAGLINE = "AI 에이전트 기반 사용자 경험 시뮬레이션"
const DUMMY_PROJECT = { title: "A - Mall 로그인 플로우", date: "2026-01-01" }

// function: 함수 선언. React에서 "컴포넌트"는 보통 이렇게 함수로 만듭니다.
// - 컴포넌트는 JSX(HTML 비슷한 문법)를 return합니다.
function BrandingHeader() {
  return (
    // JSX: <div>...</div> 처럼 생겼지만 실제로는 JS/TS에서 "요소 트리"를 만드는 문법입니다.
    <div className="text-center">
      {/* 로고 + 서비스명 */}
      <div className="flex items-center justify-center gap-3">
        {/* img src={...}: 중괄호 {} 안은 "JS 표현식" 자리입니다. */}
        <img src={swarmIconUrl} alt="" aria-hidden className="h-10 w-10 sm:h-12 sm:w-12" />
        {/* 반응형 클래스: sm: 는 작은 화면 이상에서만 적용 */}
        <h1 className="text-title-32 text-foreground sm:text-title-42">{APP_TITLE}</h1>
      </div>

      {/* 한 줄 소개(디자인 토큰 기반) */}
      <p className="mt-2 text-body-14-regular text-muted-foreground sm:mt-3 sm:text-body-16-regular">
        {APP_TAGLINE}
      </p>
    </div>
  )
}

function GoogleStartButton() {
  return (
    <CommonButton
      // JSX에서 prop=... 형태로 값을 전달합니다.
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

/**
 * LeftSidebar
 * - props(매개변수)로 open/onToggle을 받습니다.
 * - { open, onToggle }: 객체 구조분해 할당 문법
 * - : { open: boolean; onToggle: () => void }: TypeScript 타입 표기 (props 형태를 명확히 함)
 */
function LeftSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  // className을 조건에 따라 조합하려고 배열 + join(" ")을 사용합니다.
  // - open이 true/false냐에 따라 width 클래스를 바꿉니다.
  return (
    <aside
      className={[
        // width 변화로 같은 페이지에서 "패널이 열림"을 표현 (모달/오버레이 아님)
        "shrink-0 overflow-hidden border-r border-border bg-muted/40 transition-all duration-300",
        open ? "w-72 sm:w-80" : "w-14 sm:w-16",
      ].join(" ")}
    >
      {/* 상단: 햄버거 버튼 (사이드바 영역 안에서 토글) */}
      <div className="flex h-16 items-center px-3">
        <button
          type="button"
          // aria-label: 스크린리더 접근성 텍스트
          aria-label={open ? "사이드바 접기" : "사이드바 펼치기"}
          className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          // onClick={onToggle}: 클릭 시 onToggle 함수 실행
          onClick={onToggle}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* 본문: 닫힐 때도 DOM은 유지하고, 시각적으로만 숨겨서 "순간이동" 느낌을 줄임 */}
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
      {/* 우측 상단 프로필 배지(와이어프레임) */}
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

/**
 * export default:
 * - 이 파일에서 "대표로 내보내는 값"이 HomePage라는 뜻입니다.
 * - 다른 파일에서 `import HomePage from "@/pages/HomePage"` 처럼 중괄호 없이 가져옵니다.
 */
export default function HomePage() {
  /**
   * useState: React에서 "화면 상태(state)"를 저장하는 Hook
   * - email/password는 입력 폼과 연결된 값(= 제어 컴포넌트)
   * - setEmail/setPassword를 호출하면 상태가 바뀌고, 화면이 다시 렌더링됩니다.
   */
  // 배열 구조분해 할당:
  // - useState("")가 [현재값, 바꾸는함수] 형태의 배열을 반환하기 때문에 []로 받습니다.
  const [email, setEmail] = useState("") // email: 현재값, setEmail: email을 바꾸는 함수
  const [password, setPassword] = useState("") // password: 현재값, setPassword: password를 바꾸는 함수

  /**
   * 사진처럼 "같은 페이지 레이아웃"에서 좌측 패널이 열리고 닫히도록 상태를 둡니다.
   * - 모달/오버레이가 아니라, 좌측 영역의 width가 바뀌면서 메인 콘텐츠가 같이 배치됩니다.
   */
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* props 전달: open={sidebarOpen} 는 boolean 값을 넘김 */}
      <LeftSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="p-6">
          <RightTopProfile />
        </header>

        <main className="grid flex-1 place-items-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-xs text-center">
            <BrandingHeader />

            {/* 로그인 와이어프레임(기능 연결 전, UI 조합만) */}
            <form
              className="mt-8 grid w-full gap-5"
              onSubmit={(event) => {
                /**
                 * onSubmit: form 제출 시 실행되는 이벤트 핸들러
                 * preventDefault(): 브라우저 기본 제출(새로고침/이동)을 막습니다.
                 */
                // event: 브라우저가 넘겨주는 "이벤트 객체"
                event.preventDefault()
              }}
            >
              <div className="grid gap-3">
                <TextField
                  placeholder="아이디를 입력하세요"
                  // value={email}: input의 값은 email state와 항상 같게 유지됩니다(제어 컴포넌트).
                  value={email}
                  onChange={(event) => {
                    /**
                     * onChange: 사용자가 입력할 때마다 호출
                     * event.target.value: input의 현재 문자열
                     */
                    // setEmail(...)을 호출하면 email state가 바뀌고, 화면이 다시 렌더됩니다.
                    setEmail(event.target.value)
                  }}
                  variant="filled"
                  size="lg"
                  // className으로 높이/패딩/폰트 등을 조절합니다.
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
