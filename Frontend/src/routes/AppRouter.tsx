import type { ReactNode } from "react"
import { Suspense, lazy } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import HomePage from "@/pages/HomePage"
import GeneratePage from "@/pages/GeneratePage"
import LoginPage from "@/pages/LoginPage"
import SimulationProcessPage from "@/pages/SimulationProcessPage"
import SimulationSetupPage from "@/pages/SimulationSetupPage"
import SignUpPage from "@/pages/SignUpPage"
import ResultLayoutPage from "@/pages/result/ResultLayoutPage"
import ResultOverviewPage from "@/pages/result/ResultOverviewPage"
import routes from "@/constants/routes"
import { useAuthStore } from "@/store/auth.store"

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
        <Route path={routes.home} element={<HomePage />} />
        <Route
          path={routes.login}
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path={routes.signup}
          element={
            <PublicOnly>
              <SignUpPage />
            </PublicOnly>
          }
        />
        <Route
          path={routes.generate}
          element={
            <RequireAuth>
              <GeneratePage />
            </RequireAuth>
          }
        />
        <Route
          path={routes.simulationSetup}
          element={
            <RequireAuth>
              <SimulationSetupPage />
            </RequireAuth>
          }
        />
        <Route
          path={routes.simulationProcess}
          element={
            <RequireAuth>
              <SimulationProcessPage />
            </RequireAuth>
          }
        />
        <Route
          path={routes.result}
          element={
            <RequireAuth>
              <ResultLayoutPage />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ResultOverviewPage />} />
          <Route
            path="issues"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ResultIssuesPage />
              </Suspense>
            }
          />
          <Route
            path="heatmap"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ResultHeatmapPage />
              </Suspense>
            }
          />
          <Route
            path="wcag"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ResultWcagPage />
              </Suspense>
            }
          />
          <Route
            path="ai"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ResultAiFixPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path={routes.error}
          element={<Navigate to={routes.login} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
