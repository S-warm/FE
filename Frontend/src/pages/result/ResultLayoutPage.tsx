import type { CSSProperties, ReactNode } from "react"
import { NavLink, Outlet, useLocation, useParams } from "react-router-dom"

import { AlertTriangle, Download, LayoutDashboard, Map, Share2, ShieldCheck, Sparkles } from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { BrandingHeader } from "@/components/sections/auth/branding-header"
import { Card, CardContent } from "@/components/ui/card"
import { useSimulationList } from "@/features/result/shared/use-simulation-list"
import { AuthLayout } from "@/layouts/AuthLayout"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { BackendSimulationStatus } from "@/shared/types/backend-api"
import { formatRelativeTime } from "@/utils/format-relative-time"

const RESULT_TAB_HOVER_BG = "color-mix(in srgb, var(--brand-accent) 28%, transparent)"

const tabs = [
  {
    value: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "issues",
    label: "Issues",
    icon: AlertTriangle,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "heatmap",
    label: "Heatmap",
    icon: Map,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "wcag",
    label: "WCAG",
    icon: ShieldCheck,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "ai",
    label: "AI Fix",
    icon: Sparkles,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
] as const

function formatSimulationStatus(status: BackendSimulationStatus | undefined) {
  if (status === "completed") {
    return {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    }
  }

  if (status === "running") {
    return {
      label: "Running",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    }
  }

  if (status === "failed") {
    return {
      label: "Failed",
      className: "border-critical-accent/40 bg-danger-surface text-critical-text",
    }
  }

  return {
    label: "Pending",
    className: "border-border-soft bg-surface-muted text-text-secondary",
  }
}

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
  const { simulations, isLoading } = useSimulationList()
  const simulation = simulations.find((item) => item.id === simulationId) ?? simulations[0] ?? null
  const resolvedId = simulation?.id ?? simulationId ?? "unknown"
  const status = formatSimulationStatus(simulation?.status)
  const location = useLocation()
  const search = location.search

  return (
    <AuthLayout
      mainClassName="items-start justify-start pb-0"
      headerLeft={<BrandingHeader compact showTagline={false} align="left" className="origin-left scale-150" />}
    >
      <section className={cn("grid w-full gap-4 pt-2", motion.page)}>
        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="grid gap-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="grid gap-2">
                <MetaRow label="Simulation">
                  <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-subtle px-4 py-2">
                    <p className="truncate text-body-16-medium text-foreground">
                      {isLoading ? "Loading simulation..." : simulation?.title ?? "Simulation not found"}
                    </p>
                  </div>
                </MetaRow>
                <MetaRow label="Created">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body-16-medium text-text-secondary">
                      {simulation?.createdAt ? formatRelativeTime(simulation.createdAt) : "-"}
                    </p>
                    <span className="h-4 w-px bg-border-soft" aria-hidden="true" />
                    <p className="text-body-16-regular text-text-muted">{simulation?.createdAt ?? "-"}</p>
                  </div>
                </MetaRow>
                <MetaRow label="Status">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-6 items-center rounded-full border px-2.5 text-caption-12-medium",
                        status.className
                      )}
                    >
                      {isLoading ? "Loading" : status.label}
                    </span>
                  </div>
                </MetaRow>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="group rounded-xl border border-border-soft-2 bg-surface-muted transition-colors hover:bg-surface-muted-hover"
                >
                  <Download className="size-4 transition-transform group-hover:translate-x-0.5" />
                  Export PDF
                </CommonButton>
                <CommonButton
                  size="sm"
                  variant="secondary"
                  className="group rounded-xl border border-border-soft-2 bg-surface-muted transition-colors hover:bg-surface-muted-hover"
                >
                  <Share2 className="size-4 transition-transform group-hover:translate-x-0.5" />
                  Share
                </CommonButton>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("rounded-2xl border border-border-strong bg-card shadow-none", motion.card)}>
          <CardContent className="px-6 py-2">
            <nav className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <NavLink
                    key={tab.value}
                    to={{ pathname: `/result/${resolvedId}/${tab.value}`, search }}
                    style={
                      {
                        "--result-tab-hover-bg": tab.hoverBg,
                      } as CSSProperties
                    }
                    className={({ isActive }) =>
                      cn(
                        "relative flex h-11 items-center justify-center gap-2 rounded-xl border border-transparent px-4 text-body-14-medium transition-colors after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:rounded-full after:bg-border-focus after:origin-left after:scale-x-0 after:transition-transform after:duration-200",
                        isActive
                          ? "text-text-strong after:scale-x-100 hover:bg-[var(--result-tab-hover-bg)]"
                          : "text-text-muted hover:bg-[var(--result-tab-hover-bg)] hover:text-text-strong hover:after:scale-x-100"
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
          <div key={location.pathname} className={motion.page}>
            <Outlet />
          </div>
        </div>
      </section>
    </AuthLayout>
  )
}

export default ResultLayoutPage
