import type { ReactNode } from "react"
import { Suspense, lazy } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import routes from "@/constants/routes"
import { useAuthStore } from "@/store/auth.store"

const HomePage = lazy(() => import("@/pages/HomePage"))
const GeneratePage = lazy(() => import("@/pages/GeneratePage"))
const LoginPage = lazy(() => import("@/pages/LoginPage"))
const SimulationProcessPage = lazy(() => import("@/pages/SimulationProcessPage"))
const SimulationSetupPage = lazy(() => import("@/pages/SimulationSetupPage"))
const SignUpPage = lazy(() => import("@/pages/SignUpPage"))
const ResultLayoutPage = lazy(() => import("@/pages/result/ResultLayoutPage"))
const ResultOverviewPage = lazy(() => import("@/pages/result/ResultOverviewPage"))
const ResultIssuesPage = lazy(() => import("@/pages/result/ResultIssuesPage"))
const ResultWcagPage = lazy(() => import("@/pages/result/ResultWcagPage"))
const ResultAiFixPage = lazy(() => import("@/pages/result/ResultAiFixPage"))
const ResultHeatmapPage = lazy(() => import("@/pages/result/ResultHeatmapPage"))

function RouteFallback() {
  return (
    <div className="grid min-h-[240px] place-items-center text-caption-12-regular text-text-muted">
      로딩 중...
    </div>
  )
}

function RouteScreen({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />
  }

  return children
}

function PublicOnly({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (isAuthenticated) {
    return <Navigate to={routes.generate} replace />
  }

  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={routes.home}
          element={
            <RouteScreen>
              <HomePage />
            </RouteScreen>
          }
        />
        <Route
          path={routes.login}
          element={
            <PublicOnly>
              <RouteScreen>
                <LoginPage />
              </RouteScreen>
            </PublicOnly>
          }
        />
        <Route
          path={routes.signup}
          element={
            <PublicOnly>
              <RouteScreen>
                <SignUpPage />
              </RouteScreen>
            </PublicOnly>
          }
        />
        <Route
          path={routes.generate}
          element={
            <RequireAuth>
              <RouteScreen>
                <GeneratePage />
              </RouteScreen>
            </RequireAuth>
          }
        />
        <Route
          path={routes.simulationSetup}
          element={
            <RequireAuth>
              <RouteScreen>
                <SimulationSetupPage />
              </RouteScreen>
            </RequireAuth>
          }
        />
        <Route
          path={routes.simulationProcess}
          element={
            <RequireAuth>
              <RouteScreen>
                <SimulationProcessPage />
              </RouteScreen>
            </RequireAuth>
          }
        />
        <Route
          path={routes.result}
          element={
            <RequireAuth>
              <RouteScreen>
                <ResultLayoutPage />
              </RouteScreen>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route
            path="overview"
            element={
              <RouteScreen>
                <ResultOverviewPage />
              </RouteScreen>
            }
          />
          <Route
            path="issues"
            element={
              <RouteScreen>
                <ResultIssuesPage />
              </RouteScreen>
            }
          />
          <Route
            path="heatmap"
            element={
              <RouteScreen>
                <ResultHeatmapPage />
              </RouteScreen>
            }
          />
          <Route
            path="wcag"
            element={
              <RouteScreen>
                <ResultWcagPage />
              </RouteScreen>
            }
          />
          <Route
            path="ai"
            element={
              <RouteScreen>
                <ResultAiFixPage />
              </RouteScreen>
            }
          />
        </Route>
        <Route path={routes.error} element={<Navigate to={routes.login} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
