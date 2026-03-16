import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { DigitalLiteracyLevel } from "@/components/sections/simulation-setup/digital-literacy-selector"

const literacyLabelMap: Record<DigitalLiteracyLevel, string> = {
  high: "시력 저하 70% 적용 (최소 폰트 16px 인식)",
  medium: "기본 정보 처리와 비교 탐색에 익숙함",
  low: "핵심 행동 유도 중심의 단순한 인터페이스 선호",
}

function SummaryRow({
  title,
  value,
  scrollable = false,
}: {
  title: string
  value: string
  scrollable?: boolean
}) {
  return (
    <div className="grid gap-2 text-left">
      <p className="text-body-14-medium font-semibold text-[#2f3950]">{title}</p>
      <p
        className={cn(
          "rounded-lg bg-[#f1f3f9] px-4 py-3 text-caption-12-regular leading-5 text-[#33415e]",
          scrollable && "h-[76px] overflow-y-auto overscroll-contain"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function SimulationSummaryCard({
  personaCount,
  digitalLiteracy,
  ageRatios,
  successCondition,
  className,
}: {
  personaCount: number
  digitalLiteracy: DigitalLiteracyLevel
  ageRatios: Array<{ label: string; value: number }>
  successCondition: string
  className?: string
}) {
  return (
    <Card className={cn("rounded-2xl border border-[#c7d2ea] bg-[#f8faff] shadow-none", className)}>
      <CardContent className="flex flex-col gap-6 px-6 py-6 text-left">
        <SummaryRow title="페르소나 횟수" value={`총 ${personaCount.toLocaleString()}회 시뮬레이션`} />
        <div className="h-px bg-[#eef0f5]" />
        <SummaryRow title="디지털 리터러시" value={literacyLabelMap[digitalLiteracy]} />
        <div className="h-px bg-[#eef0f5]" />
        <SummaryRow
          title="연령별 투입 비율"
          value={ageRatios.map((item) => `${item.label} ${item.value}%`).join("  ")}
        />
        <div className="h-px bg-[#eef0f5]" />
        <SummaryRow
          title="성공조건"
          value={successCondition.trim() || "가입 완료 또는 구매 완료를 목표로 설정합니다."}
          scrollable
        />
        <div className="h-px bg-[#eef0f5]" />
        <div className="grid gap-2 text-left">
          <p className="text-body-14-medium font-semibold text-[#2f3950]">소요 시간 / 소요 토큰</p>
          <p className="text-caption-12-regular leading-5 text-[#33415e]">약 1시간 소요 / 100 Token 예상</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { SimulationSummaryCard }
