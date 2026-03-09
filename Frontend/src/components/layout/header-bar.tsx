import { Bell, CreditCard, LogOut } from "lucide-react"

import { CommonButton, IconButton } from "@/components/atoms"

function HeaderBar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div>
        <p className="text-subtitle-20-bold text-foreground">A-Mall 로그인 플로우</p>
        <p className="text-caption-12-regular text-muted-foreground">
          최근 분석: 2026-03-09 17:20
        </p>
      </div>

      <div className="flex items-center gap-2">
        <IconButton icon={<Bell />} label="알림" variant="ghost" />
        <CommonButton size="sm" variant="secondary">
          <CreditCard className="size-4" />
          결제 관리
        </CommonButton>
        <CommonButton size="sm" variant="ghost">
          <LogOut className="size-4" />
          로그아웃
        </CommonButton>
      </div>
    </header>
  )
}

export { HeaderBar }
