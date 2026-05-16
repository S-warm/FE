import type { AgeGroup as HeatmapAgeBand } from "@/mocks/result-heatmap.mock"

export type HeatmapLogEventType = "click" | "step"

export type HeatmapErrorKind = "timeout" | "console" | "network"

export interface HeatmapLogEvent {
  tMs: number
  type: HeatmapLogEventType
  x: number
  y: number
  dwellMs: number
  retries: number
  block: boolean
  errorKind?: HeatmapErrorKind
  httpStatus?: number
}

export interface HeatmapAgentSession {
  agentId: string
  ageBand: HeatmapAgeBand
  durationMs: number
  events: HeatmapLogEvent[]
}

export interface HeatmapPageLogMock {
  pageId: string
  pageName: string
  screenshotUrl: string
  viewport: { width: number; height: number; dpr: number }
  sessions: HeatmapAgentSession[]
}

const timelineMaxMs = 10 * 60 * 1000

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (1664525 * s + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function pickAgeBand(random: () => number): HeatmapAgeBand {
  const bands: HeatmapAgeBand[] = ["10s", "20s", "30s", "40s", "50s", "60s", "70s"]
  const index = Math.floor(random() * bands.length)
  return bands[index] ?? "30s"
}

function jitter(random: () => number, value: number, amount: number) {
  return clamp(value + (random() - 0.5) * amount, 0.02, 0.98)
}

function generateSessions(seed: number, sessionCount: number) {
  const random = createRng(seed)
  const sessions: HeatmapAgentSession[] = []

  for (let index = 0; index < sessionCount; index += 1) {
    const agentId = `agent-${seed}-${index}`
    const ageBand = pickAgeBand(random)
    const durationMs = timelineMaxMs

    const hasBlock = random() < 0.28
    const blockTime = hasBlock ? Math.floor(timelineMaxMs * (0.3 + random() * 0.55)) : null

    const baseHotspot =
      ageBand === "10s" || ageBand === "20s"
        ? { x: 0.72, y: 0.26 }
        : ageBand === "30s" || ageBand === "40s"
          ? { x: 0.52, y: 0.42 }
          : ageBand === "50s" || ageBand === "60s"
            ? { x: 0.32, y: 0.58 }
            : { x: 0.26, y: 0.34 }

    const hotspotA = baseHotspot
    const hotspotB = { x: clamp(baseHotspot.x - 0.22, 0.06, 0.94), y: clamp(baseHotspot.y + 0.18, 0.06, 0.94) }
    const hotspotC = { x: clamp(baseHotspot.x + 0.18, 0.06, 0.94), y: clamp(baseHotspot.y - 0.16, 0.06, 0.94) }

    const events: HeatmapLogEvent[] = []
    const eventCount = 28 + Math.floor(random() * 18)
    let tMs = Math.floor(random() * 15000)

    for (let e = 0; e < eventCount; e += 1) {
      const bias = random()
      const base =
        bias < 0.55 ? hotspotA : bias < 0.78 ? hotspotB : hotspotC

      const x = jitter(random, base.x, 0.18)
      const y = jitter(random, base.y, 0.18)

      const dwellMultiplier = ageBand === "70s" ? 1.35 : ageBand === "60s" ? 1.2 : 1
      const dwellMs = Math.floor((120 + Math.floor(random() * 2200)) * dwellMultiplier)
      const retryBoost = ageBand === "70s" ? 2 : ageBand === "60s" ? 1 : 0
      const retries = Math.floor(random() * (bias < 0.6 ? 4 + retryBoost : 2 + retryBoost))
      const isNearBlock = blockTime !== null && tMs >= blockTime - 4000 && tMs <= blockTime + 1500
      const block = Boolean(blockTime !== null && tMs >= blockTime && isNearBlock && random() < 0.65)

      const errorKind: HeatmapErrorKind | undefined = block
        ? random() < 0.55
          ? "timeout"
          : random() < 0.8
            ? "network"
            : "console"
        : undefined

      const httpStatus = errorKind === "network" ? (random() < 0.5 ? 500 : 404) : undefined

      events.push({
        tMs,
        type: e % 7 === 0 ? "step" : "click",
        x,
        y,
        dwellMs,
        retries,
        block,
        errorKind,
        httpStatus,
      })

      tMs += dwellMs + 600 + Math.floor(random() * 1400)
      tMs = Math.min(timelineMaxMs, tMs)
    }

    if (hasBlock && blockTime !== null) {
      const errorKind: HeatmapErrorKind =
        random() < 0.55 ? "timeout" : random() < 0.82 ? "network" : "console"
      const httpStatus = errorKind === "network" ? (random() < 0.5 ? 500 : 404) : undefined
      events.push({
        tMs: blockTime,
        type: "step",
        x: jitter(random, hotspotA.x, 0.08),
        y: jitter(random, hotspotA.y, 0.08),
        dwellMs: Math.floor(2200 + random() * 4800),
        retries: 3 + Math.floor(random() * 4),
        block: true,
        errorKind,
        httpStatus,
      })
    }

    sessions.push({ agentId, ageBand, durationMs, events })
  }

  return sessions
}

export const heatmapTimelineMaxMsMock = timelineMaxMs

export const heatmapPageLogsMock: HeatmapPageLogMock[] = [
  {
    pageId: "login",
    pageName: "로그인 페이지",
    screenshotUrl: "/mock-images/page-login.png",
    viewport: { width: 1440, height: 900, dpr: 2 },
    sessions: generateSessions(11, 120),
  },
  {
    pageId: "main",
    pageName: "메인 페이지",
    screenshotUrl: "/mock-images/page-main.png",
    viewport: { width: 1440, height: 900, dpr: 2 },
    sessions: generateSessions(22, 140),
  },
  {
    pageId: "signup",
    pageName: "회원가입 페이지",
    screenshotUrl: "/mock-images/page-signup.png",
    viewport: { width: 1440, height: 900, dpr: 2 },
    sessions: generateSessions(33, 110),
  },
  {
    pageId: "search",
    pageName: "검색 페이지",
    screenshotUrl: "/mock-images/page-search.png",
    viewport: { width: 1440, height: 900, dpr: 2 },
    sessions: generateSessions(44, 115),
  },
  {
    pageId: "product",
    pageName: "상품 상세 페이지",
    screenshotUrl: "/mock-images/page-product-detail.png",
    viewport: { width: 1440, height: 900, dpr: 2 },
    sessions: generateSessions(55, 135),
  },
  {
    pageId: "cart",
    pageName: "장바구니 페이지",
    screenshotUrl: "/mock-images/page-cart.png",
    viewport: { width: 1440, height: 900, dpr: 2 },
    sessions: generateSessions(66, 125),
  },
]
