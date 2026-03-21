import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import HomePage from "@/pages/HomePage"
import GeneratePage from "@/pages/GeneratePage"
import LoginPage from "@/pages/LoginPage"
import SimulationProcessPage from "@/pages/SimulationProcessPage"
import SimulationSetupPage from "@/pages/SimulationSetupPage"
import SignUpPage from "@/pages/SignUpPage"
import ResultLayoutPage from "@/pages/result/ResultLayoutPage"
import ResultOverviewPage from "@/pages/result/ResultOverviewPage"
import ResultPlaceholderPage from "@/pages/result/ResultPlaceholderPage"
import routes from "@/constants/routes"
import { useAuthStore } from "@/store/auth.store"

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
          <Route path="issues" element={<ResultPlaceholderPage title="주요이슈" />} />
          <Route path="heatmap" element={<ResultPlaceholderPage title="히트맵 & 여정" />} />
          <Route path="wcag" element={<ResultPlaceholderPage title="WCAG 검사" />} />
          <Route path="ai" element={<ResultPlaceholderPage title="AI 수정" />} />
        </Route>
        <Route
          path={routes.error}
          element={<Navigate to={routes.login} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
