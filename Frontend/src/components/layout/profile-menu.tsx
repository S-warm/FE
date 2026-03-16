import { useEffect, useId, useRef, useState } from "react"

import { CreditCard, LogOut, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"

type MenuTone = "primary" | "muted"

function MenuItem({
  icon,
  label,
  tone = "primary",
  onClick,
}: {
  icon: React.ReactNode
  label: string
  tone?: MenuTone
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        tone === "primary"
          ? "text-primary hover:bg-muted"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      onClick={onClick}
    >
      <span className="grid size-6 place-items-center">{icon}</span>
      <span className="text-body-16-medium">{label}</span>
    </button>
  )
}

function ProfileMenu({ initials = "CN" }: { initials?: string }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const logout = useAuthStore((state) => state.logout)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (buttonRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("pointerdown", handlePointerDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [open])

  const closeMenu = () => {
    setOpen(false)
  }

  return (
    <div className="relative flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        className="grid size-10 place-items-center rounded-full bg-muted text-subtitle-16-semibold text-foreground ring-1 ring-border"
        aria-label="프로필 메뉴"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {initials}
      </button>

      {open ? (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label="프로필 메뉴"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-sm ring-1 ring-border/70"
        >
          <MenuItem icon={<User className="size-5" />} label="마이페이지" onClick={closeMenu} />
          <MenuItem icon={<CreditCard className="size-5" />} label="결제버튼" onClick={closeMenu} />

          <div className="my-1.5 h-px bg-border" />

          <MenuItem icon={<Settings className="size-5" />} label="설정" onClick={closeMenu} />

          <div className="my-1.5 h-px bg-border" />

          <MenuItem
            icon={<LogOut className="size-5" />}
            label="로그아웃"
            tone="muted"
            onClick={() => {
              logout()
              closeMenu()
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

export { ProfileMenu }
