import { useEffect, useState } from "react"

import { SimulationButton } from "@/components/atoms"
import { AuthBrandingShell } from "@/components/sections/auth"
import { LOGIN_TRANSITION_MS } from "@/components/sections/auth/login-panel"
import { AuthLayout } from "@/layouts/AuthLayout"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import routes from "@/constants/routes"

function GeneratePage() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setVisible(true)
    })
  }, [])

  return (
    <AuthLayout>
      <AuthBrandingShell
        className="min-h-full justify-center"
        contentClassName="items-center"
      >
        <div
          className={cn(
            "w-full transition-[opacity,transform] ease-in-out",
            visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-1"
          )}
          style={{ transitionDuration: `${LOGIN_TRANSITION_MS}ms` }}
        >
          <SimulationButton
            className="w-full rounded-xl bg-accent text-primary hover:bg-accent/80"
            onClick={() => navigate(routes.simulationSetup)}
          />
        </div>
      </AuthBrandingShell>
    </AuthLayout>
  )
}

export default GeneratePage
