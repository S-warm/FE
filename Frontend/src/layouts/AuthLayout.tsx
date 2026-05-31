import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { matchPath, useLocation, useNavigate } from "react-router-dom"

import { Menu, Trash2 } from "lucide-react"

import { ProfileMenu } from "@/components/layout/profile-menu"
import { EmptyState } from "@/components/sections"
import { ErrorState } from "@/components/states"
import { buildResultOverviewPath } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { useSimulationListQuery } from "@/queries"
import { useAuthStore } from "@/store/auth.store"
import { useLayoutStore } from "@/store/layout.store"
import type { SimulationListItemViewModel } from "@/types/view-model/simulation/simulation-list"

const HIDDEN_SIMULATION_IDS_STORAGE_KEY = "swarm:hidden-simulation-ids"

function readHiddenSimulationIds() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(HIDDEN_SIMULATION_IDS_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : []
  } catch {
    return []
  }
}

function writeHiddenSimulationIds(ids: string[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    HIDDEN_SIMULATION_IDS_STORAGE_KEY,
    JSON.stringify(ids),
  )
}

function AuthSidebar({
  open,
  activeSimulationId,
  simulations,
  isLoading,
  isError,
  onRetry,
  onToggle,
  onSelectSimulation,
  onHideSimulation,
}: {
  open: boolean
  activeSimulationId?: string
  simulations: SimulationListItemViewModel[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onToggle: () => void
  onSelectSimulation: (simulationId: string) => void
  onHideSimulation: (simulationId: string) => void
}) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-30 overflow-hidden border-r border-border-strong bg-[#fafafa] transition-all duration-300",
        open ? "w-72 sm:w-80" : "w-16 sm:w-[4.5rem]",
      ].join(" ")}
    >
      <div
        className={cn(
          "flex h-16 items-center",
          open ? "justify-start px-3" : "justify-center px-0",
        )}
      >
        <button
          type="button"
          aria-label={open ? "사이드바 닫기" : "사이드바 펼치기"}
          className="grid size-8 place-items-center rounded-full bg-surface-control text-text-secondary-2 transition-colors hover:bg-surface-control-hover hover:text-text-secondary-3"
          onClick={onToggle}
        >
          <Menu className="size-4" />
        </button>
      </div>

      <div
        className={[
          "flex h-[calc(100%-4rem)] flex-col px-4 pb-6 transition-[opacity,transform] duration-200",
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-2 opacity-0",
        ].join(" ")}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="text-caption-12-regular text-text-muted">최근 프로젝트</p>
          <div className="mt-2 border-b border-border-strong" />
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[72px] animate-pulse rounded-xl border border-border-soft-3 bg-surface-subtle"
                      aria-hidden="true"
                    />
                  ))
                : null}

              {!isLoading && isError ? (
                <ErrorState
                  title="목록을 불러오지 못했습니다"
                  description="잠시 후 다시 시도해 주세요"
                  actionLabel="다시 시도"
                  onAction={onRetry}
                  className="px-4 py-6"
                />
              ) : null}

              {!isLoading && !isError && simulations.length === 0 ? (
                <EmptyState
                  title="최근 프로젝트가 없습니다"
                  description="시뮬레이션을 시작하면 목록이 표시됩니다"
                  className="px-4 py-6"
                />
              ) : null}

              {!isLoading && !isError
                ? simulations.map((item) => {
                    const isActive = item.simulationId === activeSimulationId

                    return (
                      <button
                        key={item.simulationId}
                        type="button"
                        className={cn(
                          "relative rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-surface-hover-2 overflow-visible",
                          isActive
                            ? "border-border-focus ring-2 ring-border-focus/40"
                            : "border-border-soft-3",
                        )}
                        onClick={() => onSelectSimulation(item.simulationId)}
                      >
                        <button
                          type="button"
                          aria-label="최근 프로젝트 숨기기"
                          className="absolute right-3 top-3 grid size-7 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-body"
                          onClick={(event) => {
                            event.stopPropagation()
                            if (window.confirm(`"${item.title}" 프로젝트를 목록에서 제거하시겠습니까?`)) {
                              onHideSimulation(item.simulationId)
                            }
                          }}
                        >
                          <Trash2 className="size-3.5 opacity-50" />
                        </button>
                        <p className="pr-16 text-body-14-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-caption-12-regular text-text-muted">
                          {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          }).replaceAll('. ', '.')}{' '}
                          {new Date(item.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </p>
                      </button>
                    )
                  })
                : null}
            </div>
          </div>
        </div>
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
  const sidebarOpen = useLayoutStore((state) => state.sidebarOpen)
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const initials = useAuthStore((state) => state.user?.initials ?? "CN")
  const navigate = useNavigate()
  const location = useLocation()
  const {
    data: simulations = [],
    isLoading: isSimulationListLoading,
    isError: isSimulationListError,
    refetch: refetchSimulationList,
  } = useSimulationListQuery()
  const [hiddenSimulationIds, setHiddenSimulationIds] = useState<string[]>(
    () => readHiddenSimulationIds(),
  )
  const resultMatch = matchPath("/result/:simulationId/*", location.pathname)
  const overviewMatch = matchPath("/result/:simulationId/overview", location.pathname)
  const activeSimulationId = resultMatch?.params?.simulationId
  const disablePaddingTransition = Boolean(overviewMatch)
  const visibleSimulations = useMemo(
    () =>
      simulations.filter(
        (simulation) => !hiddenSimulationIds.includes(simulation.simulationId),
      ),
    [hiddenSimulationIds, simulations],
  )

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AuthSidebar
        open={sidebarOpen}
        activeSimulationId={activeSimulationId}
        simulations={visibleSimulations}
        isLoading={isSimulationListLoading}
        isError={isSimulationListError}
        onRetry={() => {
          void refetchSimulationList()
        }}
        onToggle={toggleSidebar}
        onHideSimulation={(simulationId) => {
          setHiddenSimulationIds((prev) => {
            if (prev.includes(simulationId)) {
              return prev
            }

            const next = [...prev, simulationId]
            writeHiddenSimulationIds(next)
            return next
          })
        }}
        onSelectSimulation={(simulationId) =>
          navigate(buildResultOverviewPath(simulationId))
        }
      />

      <div
        className={cn(
          "flex min-h-screen flex-col",
          disablePaddingTransition ? "" : "transition-[padding-left] duration-300",
          sidebarOpen ? "pl-72 sm:pl-80" : "pl-16 sm:pl-[4.5rem]",
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

        <main
          className={cn(
            "flex flex-1 justify-center px-4 pb-12 sm:px-6",
            mainClassName ?? "items-center",
          )}
        >
          <div className="w-full max-w-[1560px] 2xl:max-w-[1760px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

export { AuthLayout }
