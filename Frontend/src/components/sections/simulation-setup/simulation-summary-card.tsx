import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "@/lib/motion"

import type { DigitalLiteracyLevel } from "@/components/sections/simulation-setup/digital-literacy-selector"
import { personaDeviceLabelMap, type PersonaDevice } from "@/constants/persona-device"

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
    <div className="grid gap-1.5 text-left">
      <p className="text-body-14-medium font-semibold text-text-body">{title}</p>
      <p
        className={cn(
          "rounded-xl bg-surface-muted px-3 py-1.5 text-caption-12-regular leading-5 text-text-secondary",
          scrollable && "h-[44px] overflow-y-auto overscroll-contain"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function SimulationSummaryCard({
  projectTitle,
  targetUrl,
  endUrl,
  urlParams,
  personaCount,
  ageGroupSummary,
  personaDevice,
  digitalLiteracy,
  successCondition,
  className,
}: {
  projectTitle: string
  targetUrl: string
  endUrl: string
  urlParams: string
  personaCount: number
  ageGroupSummary: string
  personaDevice: PersonaDevice
  digitalLiteracy: DigitalLiteracyLevel
  successCondition: string
  className?: string
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border-strong bg-surface-subtle py-3 shadow-none",
        motion.card,
        className
      )}
    >
      <CardContent className="flex flex-col gap-2.5 py-0 text-left">
        <SummaryRow title="프로젝트 제목" value={projectTitle.trim() || "네이버 장바구니 시나리오"} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="시작 URL" value={targetUrl.trim() || "타겟 URL을 입력하세요"} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="종료 URL" value={endUrl.trim() || "종료 URL을 입력하세요"} />
        <SummaryRow title="URL 파라미터" value={urlParams.trim() || "파라미터 없음"} />
        <SummaryRow title="페르소나 횟수" value={`총 ${personaCount.toLocaleString()}회 시뮬레이션`} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="연령대별 횟수" value={ageGroupSummary} scrollable />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="디바이스" value={personaDeviceLabelMap[personaDevice]} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow title="디지털 리터러시" value={literacyLabelMap[digitalLiteracy]} />
        <div className="h-px bg-border-subtle" />
        <SummaryRow
          title="성공조건"
          value={successCondition.trim() || "가입 완료 또는 구매 완료를 목표로 설정합니다."}
          scrollable
        />
        <div className="h-px bg-border-subtle" />
        <div className="grid gap-2 text-left">
          <p className="text-body-14-medium font-semibold text-text-body">소요 시간 / 소요 토큰</p>
          <p className="text-caption-12-regular leading-5 text-text-secondary">약 1시간 소요 / 100 Token 예상</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { SimulationSummaryCard }
