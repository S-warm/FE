import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { matchPath, useLocation, useNavigate } from "react-router-dom"

import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { ProfileMenu } from "@/components/layout/profile-menu"
import { useAuthStore } from "@/store/auth.store"
import { buildResultOverviewPath } from "@/constants/routes"
import { recentSimulations } from "@/mocks/simulation.mock"

function AuthSidebar({
  open,
  activeSimulationId,
  onToggle,
  onSelectSimulation,
}: {
  open: boolean
  activeSimulationId?: string
  onToggle: () => void
  onSelectSimulation: (simulationId: string) => void
}) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-30 overflow-hidden border-r border-border-strong bg-surface-app transition-all duration-300",
        open ? "w-72 sm:w-80" : "w-16 sm:w-[4.5rem]",
      ].join(" ")}
    >
      <div className="flex h-16 items-center gap-2 px-3">
        <button
          type="button"
          aria-label={open ? "사이드바 접기" : "사이드바 펼치기"}
          className="grid size-8 place-items-center rounded-full bg-surface-control text-text-secondary-2 transition-colors hover:bg-surface-control-hover hover:text-text-secondary-3"
          onClick={onToggle}
        >
          <Menu className="size-4" />
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
          {recentSimulations.map((item) => {
            const isActive = item.id === activeSimulationId
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-surface-hover-2",
                  isActive
                    ? "border-border-focus ring-2 ring-border-focus/40"
                    : "border-border-soft-3"
                )}
                onClick={() => onSelectSimulation(item.id)}
              >
                <p className="text-body-14-medium text-foreground">{item.siteName}</p>
                <p className="mt-1 text-caption-12-regular text-muted-foreground">{item.createdAt}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-8 border-t border-border pt-6" />
      </div>
    </aside>
  )
}

function AuthLayout({
  children,
  mainClassName,
  headerLeft,
}: {
  children: ReactNode
  mainClassName?: string
  headerLeft?: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const initials = useAuthStore((state) => state.user?.initials ?? "CN")
  const navigate = useNavigate()
  const location = useLocation()
  const resultMatch = matchPath("/result/:simulationId/*", location.pathname)
  const activeSimulationId = resultMatch?.params?.simulationId

  useEffect(() => {
    setSidebarOpen(false)
  }, [isAuthenticated])

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AuthSidebar
        open={sidebarOpen}
        activeSimulationId={activeSimulationId}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onSelectSimulation={(simulationId) => navigate(buildResultOverviewPath(simulationId))}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-300",
          sidebarOpen ? "pl-72 sm:pl-80" : "pl-16 sm:pl-[4.5rem]"
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 pb-3 pt-6">
          <div className="min-w-0">{headerLeft}</div>
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

        <main className={cn("flex flex-1 justify-center px-4 pb-12 sm:px-6", mainClassName ?? "items-center")}>
          <div className="w-full max-w-[1560px] 2xl:max-w-[1760px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export { AuthLayout }
