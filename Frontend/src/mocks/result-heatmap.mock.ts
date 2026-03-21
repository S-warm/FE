import mockScreenshot from "@/assets/mocks/mock-page-screenshot.svg"

export type HeatmapMode = "click" | "move" | "scroll" | "attention"

export type HeatmapAgeBand = "10대" | "20대" | "30대" | "40대" | "50대" | "60대" | "70대" | "80대"

export interface HeatmapPoint {
  id: string
  x: number
  y: number
  intensity: number
}

export interface HeatmapMarker {
  id: string
  x: number
  y: number
  label: string
  severity: "critical" | "warning"
}

export interface HeatmapDefect {
  id: string
  code: string
  title: string
  description: string
  impactedUsers: number
}

export interface HeatmapPageMock {
  id: string
  name: string
  screenshotUrl: string
  pointsByMode: Record<HeatmapMode, HeatmapPoint[]>
  markers: HeatmapMarker[]
  defects: HeatmapDefect[]
}

export const heatmapAgeBands: HeatmapAgeBand[] = ["10대", "20대", "30대", "40대", "50대", "60대", "70대", "80대"]

function points(seed: number): HeatmapPoint[] {
  const base: Array<[number, number, number]> = [
    [18, 18, 0.65],
    [34, 22, 0.55],
    [60, 18, 0.35],
    [72, 32, 0.45],
    [50, 44, 0.6],
    [28, 58, 0.35],
    [62, 62, 0.52],
    [84, 46, 0.25],
  ]

  return base.map(([x, y, intensity], index) => ({
    id: `p-${seed}-${index}`,
    x,
    y,
    intensity: Math.min(1, Math.max(0.1, intensity + (seed % 5) * 0.03)),
  }))
}

export const heatmapPagesMock: HeatmapPageMock[] = [
  {
    id: "login",
    name: "로그인 페이지",
    screenshotUrl: mockScreenshot,
    pointsByMode: {
      click: points(1),
      move: points(2),
      scroll: points(3),
      attention: points(4),
    },
    markers: [
      { id: "m-1", x: 48, y: 28, label: "1", severity: "critical" },
      { id: "m-2", x: 74, y: 62, label: "2", severity: "warning" },
      { id: "m-3", x: 36, y: 48, label: "3", severity: "warning" },
    ],
    defects: [
      {
        id: "d-1",
        code: "\"1\"",
        title: "에러 복구 불가",
        description: "폼 입력 오류 후 메시지가 불분명함",
        impactedUsers: 3200,
      },
      {
        id: "d-2",
        code: "\"2\"",
        title: "시각적 제약",
        description: "CTA 버튼의 대비가 낮아 인지하기 어려움",
        impactedUsers: 2800,
      },
      {
        id: "d-3",
        code: "\"3\"",
        title: "인지 과부하",
        description: "복잡한 네비게이션 구조로 인한 혼란",
        impactedUsers: 1600,
      },
    ],
  },
  {
    id: "main",
    name: "메인 페이지",
    screenshotUrl: mockScreenshot,
    pointsByMode: {
      click: points(6),
      move: points(7),
      scroll: points(8),
      attention: points(9),
    },
    markers: [{ id: "m-4", x: 22, y: 30, label: "1", severity: "warning" }],
    defects: [
      {
        id: "d-4",
        code: "\"1\"",
        title: "CTA 인지 어려움",
        description: "주요 CTA가 콘텐츠 대비 약함",
        impactedUsers: 2100,
      },
    ],
  },
  {
    id: "signup",
    name: "회원가입 페이지",
    screenshotUrl: mockScreenshot,
    pointsByMode: {
      click: points(11),
      move: points(12),
      scroll: points(13),
      attention: points(14),
    },
    markers: [{ id: "m-5", x: 58, y: 34, label: "1", severity: "critical" }],
    defects: [
      {
        id: "d-5",
        code: "\"1\"",
        title: "필수 입력 안내 부족",
        description: "필수 항목이 시각적으로만 표시됨",
        impactedUsers: 1900,
      },
    ],
  },
  {
    id: "payment",
    name: "결제 페이지",
    screenshotUrl: mockScreenshot,
    pointsByMode: {
      click: points(16),
      move: points(17),
      scroll: points(18),
      attention: points(19),
    },
    markers: [{ id: "m-6", x: 70, y: 56, label: "1", severity: "warning" }],
    defects: [
      {
        id: "d-6",
        code: "\"1\"",
        title: "금액 정보 강조 약함",
        description: "최종 결제 금액이 눈에 띄지 않음",
        impactedUsers: 1750,
      },
    ],
  },
]

export const defaultHeatmapPageId = heatmapPagesMock[0]?.id ?? "login"
