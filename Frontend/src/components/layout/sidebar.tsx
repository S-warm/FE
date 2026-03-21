import { BarChart3, FileSearch, LayoutDashboard, Route, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  activeItem?: string
}

const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "개요", icon: LayoutDashboard },
  { id: "issues", label: "주요 이슈", icon: FileSearch },
  { id: "heatmap", label: "히트맵", icon: Route },
  { id: "wcag", label: "WCAG 검사", icon: ShieldCheck },
  { id: "reports", label: "리포트", icon: BarChart3 },
]

function Sidebar({ activeItem = "overview" }: SidebarProps) {
  return (
    <aside className="h-full rounded-xl border border-border bg-card p-3">
      <div className="mb-4 px-2">
        <p className="text-subtitle-18-semibold text-foreground">UX-Swarm</p>
      </div>
      <nav className="grid gap-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeItem

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "flex h-10 items-center gap-2 rounded-lg px-3 text-body-14-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export { Sidebar }
