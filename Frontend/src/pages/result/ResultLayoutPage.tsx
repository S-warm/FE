import type { ReactNode } from "react"
import { NavLink, Outlet, useLocation, useParams } from "react-router-dom"

import { AlertTriangle, Download, LayoutDashboard, Map, Pencil, Share2, ShieldCheck, Sparkles } from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { Card, CardContent } from "@/components/ui/card"
import { BrandingHeader } from "@/components/sections/auth/branding-header"
import { AuthLayout } from "@/layouts/AuthLayout"
import { cn } from "@/lib/utils"
import { recentSimulations } from "@/mocks/simulation.mock"

const tabs = [
  { value: "overview", label: "개요", icon: LayoutDashboard },
  { value: "issues", label: "주요이슈", icon: AlertTriangle },
  { value: "heatmap", label: "히트맵", icon: Map },
  { value: "wcag", label: "WCAG 검사", icon: ShieldCheck },
  { value: "ai", label: "AI 수정", icon: Sparkles },
] as const

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-3">
      <p className="text-caption-12-regular text-text-subtle">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function ResultLayoutPage() {
  const { simulationId } = useParams()
  const simulation = recentSimulations.find((item) => item.id === simulationId) ?? recentSimulations[0]
  const resolvedId = simulation?.id ?? "unknown"
  const location = useLocation()

  return (
    <AuthLayout
      mainClassName="items-start justify-start overflow-hidden pb-0"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section className="grid w-full max-w-[1320px] gap-4 pt-2 animate-in fade-in-0 duration-300 ease-out">
        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="grid gap-2">
                <MetaRow label="시뮬레이션">
                  <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-subtle px-4 py-2">
                    <p className="truncate text-body-16-medium text-foreground">{simulation?.title ?? "-"}</p>
                    <button
                      type="button"
                      className="grid size-7 shrink-0 place-items-center rounded-lg text-text-subtle hover:bg-surface-hover hover:text-text-secondary"
                      aria-label="시뮬레이션 이름 수정"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                </MetaRow>
                <MetaRow label="생성일">
                  <p className="text-body-16-regular text-text-muted">{simulation?.createdAt ?? "-"}</p>
                </MetaRow>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="group rounded-xl border border-border-soft-2 bg-surface-muted transition-colors hover:bg-surface-muted-hover"
                >
                  <Download className="size-4 transition-transform group-hover:translate-x-0.5" />
                  PDF 다운로드
                </CommonButton>
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="group rounded-xl border border-border-soft-2 bg-surface-muted transition-colors hover:bg-surface-muted-hover"
                >
                  <Share2 className="size-4 transition-transform group-hover:translate-x-0.5" />
                  공유하기
                </CommonButton>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border-strong bg-card shadow-none">
          <CardContent className="px-6 py-2">
            <nav className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <NavLink
                    key={tab.value}
                    to={`/result/${resolvedId}/${tab.value}`}
                    className={({ isActive }) =>
                      cn(
                        "relative flex h-11 items-center justify-center gap-2 rounded-xl border border-transparent px-4 text-body-14-medium text-text-subtle transition-colors after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:rounded-full after:bg-border-focus after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100",
                        isActive
                          ? "bg-card text-text-strong after:scale-x-100 md:rounded-none"
                          : "hover:bg-surface-hover-2 hover:text-text-secondary"
                      )
                    }
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {tab.label}
                  </NavLink>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="min-h-0 pb-12">
          <div key={location.pathname} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out">
            <Outlet />
          </div>
        </div>
      </section>
    </AuthLayout>
  )
}

export default ResultLayoutPage
