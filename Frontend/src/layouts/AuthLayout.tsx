import type { ReactNode } from "react"
import { useState } from "react"

import { Menu } from "lucide-react"

import { ProfileMenu } from "@/components/layout/profile-menu"
import { useAuthStore } from "@/store/auth.store"

const DUMMY_PROJECT = { title: "A - Mall 로그인 플로우", date: "2026-01-01" }

function AuthSidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-30 overflow-hidden border-r border-border bg-muted/40 transition-all duration-300",
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

function AuthLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const initials = useAuthStore((state) => state.user?.initials ?? "CN")

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AuthSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex min-h-screen flex-col">
        <header className="p-6">
          {isAuthenticated ? (
            <ProfileMenu initials={initials} />
          ) : (
            <div className="flex justify-end">
              <div
                className="grid size-10 place-items-center rounded-full bg-muted text-subtitle-16-semibold text-foreground ring-1 ring-border"
                aria-hidden
              >
                {initials}
              </div>
            </div>
          )}
        </header>

        <main className="grid flex-1 place-items-center px-4 pb-12 sm:px-6">{children}</main>
      </div>
    </div>
  )
}

export { AuthLayout }
