import type { ReactNode } from "react"

import { BrandingHeader } from "@/components/sections/auth/branding-header"
import { cn } from "@/lib/utils"

function AuthBrandingShell({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn("mx-auto flex w-full max-w-xs flex-col text-center", className)}>
      <BrandingHeader />
      <div className={cn("mt-8 flex flex-col", contentClassName)}>{children}</div>
    </section>
  )
}

export { AuthBrandingShell }
