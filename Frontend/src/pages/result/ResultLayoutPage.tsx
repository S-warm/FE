import type { CSSProperties, ReactNode } from "react"
import { NavLink, Outlet, useLocation, useParams } from "react-router-dom"

import {
  AlertTriangle,
  Download,
  LayoutDashboard,
  Map,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { CommonButton } from "@/components/atoms"
import { BrandingHeader } from "@/components/sections/auth/branding-header"
import { ErrorState, ResultPageSkeleton } from "@/components/states"
import { Card, CardContent } from "@/components/ui/card"
import { AuthLayout } from "@/layouts/AuthLayout"
import { motion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useSimulationHeaderQuery } from "@/queries"
import { useSimulationDraftStore } from "@/store/simulation-draft.store"
import { useSimulationListQuery } from "@/queries"
import { formatRelativeTime, formatDateTime } from "@/utils/format-relative-time"

const RESULT_TAB_HOVER_BG =
  "color-mix(in srgb, var(--brand-accent) 28%, transparent)"

const tabs = [
  {
    value: "overview",
    label: "개요",
    icon: LayoutDashboard,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "issues",
    label: "주요이슈",
    icon: AlertTriangle,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "heatmap",
    label: "히트맵",
    icon: Map,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "wcag",
    label: "WCAG 검사",
    icon: ShieldCheck,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
  {
    value: "ai",
    label: "AI 수정",
    icon: Sparkles,
    hoverBg: RESULT_TAB_HOVER_BG,
  },
] as const

function MetaRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-3">
      <p className="text-caption-12-regular text-text-body">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function ResultHeaderCard({
  title,
  createdAt,
  siteUrl,
}: {
  title: string
  createdAt: string
  siteUrl?: string
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-card shadow-none",
        motion.card,
      )}
    >
      <CardContent className="grid gap-4 px-6 py-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="grid gap-2">
            <MetaRow label="시뮬레이션">
              <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-subtle px-4 py-2">
                <p className="truncate text-body-16-medium text-foreground">
                  {title}
                </p>
              </div>
            </MetaRow>
            {siteUrl ? (
              <MetaRow label="테스트 사이트">
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-body-16-medium text-brand-accent hover:underline"
                >
                  <span className="truncate">{siteUrl}</span>
                  <span className="shrink-0">↗</span>
                </a>
              </MetaRow>
            ) : null}
            <MetaRow label="생성일">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-body-16-medium text-text-secondary">
                  {formatRelativeTime(createdAt)}
                </p>
                <span className="h-4 w-px bg-border-soft" aria-hidden="true" />
                <p className="text-body-16-regular text-text-muted">{formatDateTime(createdAt, 'ko')}</p>
              </div>
            </MetaRow>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <CommonButton
              size="sm"
              variant="secondary"
              className="group rounded-xl border border-border-soft bg-card/60 text-text-muted transition-colors hover:border-border-soft-2 hover:bg-surface-subtle hover:text-text-secondary"
            >
              <Download className="size-4 transition-transform group-hover:translate-x-0.5" />
              PDF 다운로드
            </CommonButton>
            <CommonButton
              size="sm"
              variant="secondary"
              className="group rounded-xl border border-border-soft bg-card/60 text-text-muted transition-colors hover:border-border-soft-2 hover:bg-surface-subtle hover:text-text-secondary"
            >
              <Share2 className="size-4 transition-transform group-hover:translate-x-0.5" />
              공유하기
            </CommonButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultLayoutPage() {
  const { simulationId } = useParams()
  const location = useLocation()
  const search = location.search
  const resolvedId = simulationId ?? "unknown"
  const draftProjectTitle = useSimulationDraftStore((state) => state.projectTitle)
  const draftStartedAt = useSimulationDraftStore((state) => state.startedAt)
  const fallbackTitle = draftProjectTitle.trim() || "A-Mall 회원가입 및 구매 플로우"
  const fallbackCreatedAt = draftStartedAt || ""
  const {
    data: simulationHeader,
    isLoading,
    isError,
    refetch,
  } = useSimulationHeaderQuery(resolvedId)
  const { data: simulations = [] } = useSimulationListQuery()
  const currentSimulation = simulations.find((sim) => sim.simulationId === resolvedId)
  const displayHeader = simulationHeader ?? {
    simulationId: resolvedId,
    title: fallbackTitle,
    createdAt: fallbackCreatedAt,
  }


  return (
    <AuthLayout
      mainClassName="items-start justify-start pb-0"
      headerLeft={
        <BrandingHeader
          compact
          showTagline={false}
          align="left"
          className=""
        />
      }
    >
      <section className={cn("grid w-full gap-4 pt-2", motion.page)}>
        {isLoading ? <ResultPageSkeleton className="lg:grid-cols-1" /> : null}

        {!isLoading && isError ? (
          <ErrorState
            title="결과 헤더를 불러오지 못했습니다"
            description="시뮬레이션 정보를 다시 확인하거나 잠시 후 재시도해주세요."
            actionLabel="다시 시도"
            onAction={() => {
              void refetch()
            }}
          />
        ) : null}

        {!isError && displayHeader ? (
          <ResultHeaderCard
            title={displayHeader.title}
            createdAt={displayHeader.createdAt}
            siteUrl={currentSimulation?.siteName}
          />
        ) : null}

        <Card
          className={cn(
            "rounded-2xl border border-border-strong bg-card shadow-none",
            motion.card,
          )}
        >
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
                          : "text-text-muted hover:bg-[var(--result-tab-hover-bg)] hover:text-text-strong hover:after:scale-x-100",
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
